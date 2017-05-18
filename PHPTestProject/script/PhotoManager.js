var photoManager = function () {
    // Private members

    // Constants
    var PHOTOPATH = 'photos/';
    var R = 6371e3;
    var MAXZOOMLEVEL = 25;
    var MINZOOMLEVEL = 0;
    var MAXCIRCLESCALE = 24;
    var MINCIRCLESCALE = 8;
    var CIRCLESCALERANGE = 16;

    // Variables
    var photoDistances = [];
    var clusters = [];
    var photos = [];
    var markers = [];
    var viewedPhotos = [];

    // Functions
    // Clustering Functions
    var copyDistanceMatrix = function () {
        var newDistanceMatrix = [];

        for (var i = 0; i < photoDistances.length; i++) {
            if (!photos[i].IsVisible()) continue;
            newDistanceMatrix.push([]);

            for (var j = 0; j < photoDistances.length; j++) {
                if (!photos[j].IsVisible()) continue;
                newDistanceMatrix[newDistanceMatrix.length - 1].push(photoDistances[i][j]);
            }
        }

        return newDistanceMatrix;
    };

    var copyClusterArray = function (srcArray) {
        var dstArray = new Array(srcArray.length);

        for (var i = 0; i < srcArray.length; i++) {
            dstArray[i] = srcArray[i].Clone();
        }

        return dstArray;
    };

    var getClosestCluster = function (distanceMatrix) {
        var minDistance = Number.MAX_VALUE;
        var c1 = -1;
        var c2 = -1;

        for (var i = 0; i < distanceMatrix.length; i++) {
            for (var j = i + 1; j < distanceMatrix.length; j++) {
                var distance = distanceMatrix[i][j];

                if (distance < minDistance) {
                    minDistance = distance;
                    c1 = i;
                    c2 = j;
                }
            }
        }

        return { distance: minDistance, cluster1: c1, cluster2: c2 }
    };

    var mergeClusters = function (cluster1, cluster2) {
        var newCluster = new Cluster();

        newCluster.AddPhotos(cluster1.GetPhotos());
        newCluster.AddPhotos(cluster2.GetPhotos());

        return newCluster;
    };

    var getClusterThreshold = function (zoomLevel) {
        var mapScale = 591657550.500000 / Math.pow(2, (zoomLevel - 1));
        return (mapScale / 100.0) / 2.0;
    };

    var createIcon = function (numPhotos, notViewedPhotos) {
        var totalVisiblePhotos = tagManager.GetVisiblePhotosCount();
        var extraScale = (numPhotos / totalVisiblePhotos) * CIRCLESCALERANGE;
        var scale = MINCIRCLESCALE + extraScale;

        return {
            fillColor: notViewedPhotos === true ? 'red' : 'green',
            fillOpacity: 0.5,
            strokeColor: 'white',
            strokeWeight: 0.5,
            path: google.maps.SymbolPath.CIRCLE,
            scale: scale
        };
    };

    var cluster = function (zoomLevel, distanceMatrix) {
        if (zoomLevel >= MINZOOMLEVEL) {
            var clusterThreshold = getClusterThreshold(zoomLevel);

            while (distanceMatrix.length > 1) {
                // Determine which two clusters to merge, and their distance
                var nextCluster = getClosestCluster(distanceMatrix);

                // If the smallest distance between clusters is greater than the threshold, then break
                if (nextCluster.distance > clusterThreshold) break;

                // Add a new row and column for the new cluster
                distanceMatrix.push(new Array(distanceMatrix.length + 1));

                // Populate the distances of every existing cluster that will remain to our new cluster
                for (var i = 0; i < distanceMatrix.length - 1; i++) {
                    // Skip the ones that will be removed
                    if (i == nextCluster.cluster1 || i == nextCluster.cluster2) continue;

                    // Determine the distance between this cluster and our new cluster by using max d[this, c1], d[this, c2]
                    var newDistance = Math.max(distanceMatrix[i][nextCluster.cluster1], distanceMatrix[i][nextCluster.cluster2]);
                    distanceMatrix[i].push(newDistance);
                }

                // Populate the distance array of the new cluster
                for (var i = 0; i < distanceMatrix[distanceMatrix.length - 1].length; i++) {
                    // Skip the ones that will be removed
                    if (i == nextCluster.cluster1 || i == nextCluster.cluster2) continue;

                    // Determine the distance between this cluster and our new cluster by using max d[c1, this], d[c2, this]
                    var newDistance = Math.max(distanceMatrix[nextCluster.cluster1][i], distanceMatrix[nextCluster.cluster2][i]);
                    distanceMatrix[distanceMatrix.length - 1][i] = newDistance;
                }

                // Set the distance between the cluster to itself to 0
                distanceMatrix[distanceMatrix.length - 1][distanceMatrix.length - 1] = 0;

                // Delete the old rows and columns
                // Ensure we get the delete ordering right
                var deleteFirst = Math.min(nextCluster.cluster1, nextCluster.cluster2);
                var deleteLast = Math.max(nextCluster.cluster1, nextCluster.cluster2);
                distanceMatrix.splice(deleteFirst, 1);
                distanceMatrix.splice(deleteLast - 1, 1);

                for (var i = 0; i < distanceMatrix.length; i++) {
                    distanceMatrix[i].splice(deleteFirst, 1);
                    distanceMatrix[i].splice(deleteLast - 1, 1);
                }

                // Delete the old clusters and add the new one to our clusters array
                clusters[zoomLevel].push(mergeClusters(clusters[zoomLevel][nextCluster.cluster1], clusters[zoomLevel][nextCluster.cluster2]));
                clusters[zoomLevel].splice(deleteFirst, 1);
                clusters[zoomLevel].splice(deleteLast - 1, 1);
            }

            // As long as we aren't processing the minimum zoom level, we need to copy the clusters array into the next level to be processed
            if (zoomLevel != MINZOOMLEVEL) {
                clusters[zoomLevel - 1] = copyClusterArray(clusters[zoomLevel]);
            }

            // Recurse
            cluster(zoomLevel - 1, distanceMatrix);
        }
        // Base case
        else {
            // We are done!
        }
    };

    var clusterHasNotViewedPhotos = function (clusterIndex) {
        var clusterPhotos = clusters[map.zoom][clusterIndex].GetPhotos();
        for (var i = 0; i < clusterPhotos.length; i++) {
            var keyName = "photo_" + clusterPhotos[i].GetFilename();

            if (viewedPhotos[keyName] === undefined || viewedPhotos[keyName] === false) {
                return true;
            }
        }

        return false;
    };

    // Public members
    return {
        loadViewedPhotosFromCookie: function () {
            // Performance marker
            window.performance.mark("mark_start_loadViewedPhotosFromCookie");

            // If there is a cookie saved, it will contain the viewed photo data like so:
            // "1234.jpg=true;"
            if (document.cookie !== "") {
                var photoArray = document.cookie.split(";");

                for (var i = 0; i < photoArray.length; i++) {
                    var parts = photoArray[i].split("=");

                    if (parts[0].search("photo_") !== -1) {
                        viewedPhotos[parts[0].trim()] =  parts[1].trim() == "true";
                    }
                }
            }

            // Performance marker
            window.performance.mark("mark_end_loadViewedPhotosFromCookie");
        },
        markPhotoAsViewed: function (photoName) {
            viewedPhotos["photo_" + photoName] = true;

            var date = new Date();
            date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
            var expires = "expires=" + date.toGMTString();
            document.cookie = "photo_" + photoName + "=true;" + expires + "; path=/";
        },
        markPhotoAsNotViewed: function (photoName) {
            viewedPhotos["photo_" + photoName] = false;

            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "expires=" + date.toGMTString();
            document.cookie = "photo_" + photoName + "=false;" + expires + "; path=/";
        },
        loadPhotos: function (testMode) {
            // Performance marker
            window.performance.mark("mark_start_loadPhotos");

            // If testMode is true, pull photos from a smaller test database
            var args = testMode === true ? "?testMode=true" : "";

            return $.getJSON('../dataaccess/getphotos.php' + args, function (data) {
                $.each(data, function (key, val) {
                    var newPhoto = new Photo(val.filename, parseFloat(val.latitude), parseFloat(val.longitude), val.locationstring, val.tagsstring, val.datetaken);
                    photos.push(newPhoto);
                    tagManager.RegisterPhoto(newPhoto, photos.length - 1);
                });
            });
        },
        createMarkers: function () {
            // Performance marker
            window.performance.mark("mark_start_createMarkers");

            for (var i = 0; i < clusters[map.zoom].length; i++) {
                var position = { lat: clusters[map.zoom][i].GetLatitude(), lng: clusters[map.zoom][i].GetLongitude() };
                var name = "Cluster " + i;

                var marker = new google.maps.Marker({
                    position: position,
                    map: map
                });

                var clusterPhotos = clusters[map.zoom][i].GetPhotos();
                var notViewedPhotos = clusterHasNotViewedPhotos(i);
                marker.setIcon(createIcon(clusterPhotos.length, notViewedPhotos));

                // Single photo case
                if (clusterPhotos.length == 1) {
                    marker.type = 'photo';
                    marker.setTitle("1 photo");
                    marker.id = i

                    marker.addListener('click', function () {
                        photoViewer.showCollection(new PhotoCollection(PhotoCollection.Type.SINGLE, photoManager.clusterAt(map.zoom)[this.id].GetPhotos()));
                    });
                }

                else {
                    marker.type = 'cluster';
                    marker.setTitle(clusterPhotos.length + " photos");
                    marker.id = i;

                    marker.addListener('click', function () {
                        photoViewer.showCollection(new PhotoCollection(PhotoCollection.Type.CLUSTER, photoManager.clusterAt(map.zoom)[this.id].GetPhotos()));
                    });
                }

                markers.push(marker);
            }

            // Performance marker
            window.performance.mark("mark_end_createMarkers");
        },
        clearAllMarkers: function (deletemarkers) {
            // Performance marker
            window.performance.mark("mark_start_clearAllMarkers");

            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }

            if (deletemarkers) {
                markers = [];
            }

            // Performance marker
            window.performance.mark("mark_end_clearAllMarkers");
        },
        getRelativePathToPhoto: function (filename) {
            return PHOTOPATH + filename;
        },
        calculatePhotoDistances: function () {
            // Performance marker
            window.performance.mark("mark_start_calculatePhotoDistances");

            // Create 2D array to store distances
            photoDistances = new Array(photos.length);
            for (var i = 0; i < photos.length; i++) {
                photoDistances[i] = new Array(photos.length);
            }

            // Iterate over photos and compare distances
            for (var i = 0; i < photoDistances.length; i++) {
                for (var j = 0; j < photoDistances[i].length; j++) {
                    // handle the case where i == j
                    if (i == j) {
                        photoDistances[i][j] = 0;
                        continue;
                    }

                    // Compute the distance between coordinates using the haversine method
                    // http://www.movable-type.co.uk/scripts/latlong.html
                    var lat1rad = photos[i].GetLatitude().toRadians();
                    var lat2rad = photos[j].GetLatitude().toRadians();
                    var deltalatrad = (photos[i].GetLatitude() - photos[j].GetLatitude()).toRadians();
                    var deltalongrad = (photos[i].GetLongitude() - photos[j].GetLongitude()).toRadians();

                    var a = Math.sin(deltalatrad / 2) * Math.sin(deltalatrad / 2) +
                        Math.cos(lat1rad) * Math.cos(lat2rad) *
                        Math.sin(deltalongrad / 2) * Math.sin(deltalongrad / 2);

                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                    var d = R * c;

                    photoDistances[i][j] = d;
                }
            }

            // Performance marker
            window.performance.mark("mark_end_calculatePhotoDistances");
        },
        setupForCluster: function () {
            // Create the clusters data structure
            clusters = new Array(MAXZOOMLEVEL + 1); // Need to have max level + 1 elements since 0 is a valid zoom level

            for (var i = 0; i < clusters.length; i++) {
                clusters[i] = new Array();
            }

            // Initially populate the highest zoom level with each photo as its own cluster (only if the photo is visible)
            for (var i = 0; i < photos.length; i++) {
                if (photos[i].IsVisible()) {
                    clusters[MAXZOOMLEVEL].push(new Cluster(photos[i]));
                }
            }
        },
        doCluster: function () {
            // Performance marker
            window.performance.mark("mark_start_doCluster");

            var newDistanceMatrix = copyDistanceMatrix();
            cluster(MAXZOOMLEVEL, newDistanceMatrix);

            // Performance marker
            window.performance.mark("mark_end_doCluster");
        },
        clusterAt: function (index) {
            return clusters[index];
        },
        onVisiblePhotosUpdated: function () {
            // First update the status of each photo object
            var visiblePhotoset = tagManager.GetVisiblePhotos();

            for (var i = 0; i < photos.length; i++) {
                if (visiblePhotoset.has(i)) {
                    photos[i].SetIsVisible(true);
                }
                else {
                    photos[i].SetIsVisible(false);
                }
            }

            // Now recalculate the clusters and redraw the markers
            photoManager.setupForCluster();
            photoManager.doCluster();
            photoManager.clearAllMarkers(true);
            photoManager.createMarkers();
        }
    };
}();

//TODO: Move this to a util script or something
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function () {
        return this * Math.PI / 180;
    };
}