function PhotoManager() {
    this.PhotoDistances = [];
    this.Clusters = [];
    this.Photos = [];
    this.Markers = [];
}

PhotoManager.prototype.LoadPhotos = function () {
    // Performance marker
    window.performance.mark("mark_start_LoadPhotos");

    var context = this;
    return $.getJSON('../dataaccess/getphotos.php', function (data) {
        $.each(data, function (key, val) {
            var newPhoto = new Photo(val.filename, parseFloat(val.latitude), parseFloat(val.longitude), val.locationstring, val.tagsstring);
            context.Photos.push(newPhoto);
            tagManager.RegisterPhoto(newPhoto, context.Photos.length - 1);
        });
    });
}

PhotoManager.prototype.CreateMarkers = function () {
    for (var i = 0; i < this.Clusters[map.zoom].length; i++) {
        var position = { lat: this.Clusters[map.zoom][i].GetLatitude(), lng: this.Clusters[map.zoom][i].GetLongitude() };
        var name = "Cluster " + i;

        var marker = new google.maps.Marker({
            position: position,
            map: map
        });

        var clusterPhotos = this.Clusters[map.zoom][i].GetPhotos();
        marker.setIcon(this.CreateIcon(clusterPhotos.length));

        // Single photo case
        if (clusterPhotos.length == 1) {
            marker.type = 'photo';
            marker.setTitle("1 photo");
            marker.id = i

            marker.addListener('click', function () {
                var photoViewer = new PhotoViewer(PhotoViewer.Type.SINGLE, photoManager.Clusters[map.zoom][this.id].GetPhotos());
                photoViewer.LoadFirstPhoto();
                photoViewer.ShowPhoto(true);
                photoManager.PhotoViewer = photoViewer;
            });
        }

        else {
            marker.type = 'cluster';
            marker.setTitle(clusterPhotos.length + " photos");
            marker.id = i;

            marker.addListener('click', function () {
                var photoViewer = new PhotoViewer(PhotoViewer.Type.CLUSTER, photoManager.Clusters[map.zoom][this.id].GetPhotos());
                photoViewer.LoadFirstPhoto();
                photoViewer.ShowPhoto(true);
                photoManager.PhotoViewer = photoViewer;
            });
        }

        this.Markers.push(marker);
    }

}

PhotoManager.prototype.CreateIcon = function (numPhotos) {
    var totalVisiblePhotos = tagManager.GetVisiblePhotosCount();
    var extraScale = (numPhotos / totalVisiblePhotos) * this.CIRCLESCALERANGE;
    var scale = this.MINCIRCLESCALE + extraScale;

    return {
        fillColor: 'red',
        fillOpacity: 0.5,
        strokeColor: 'white',
        strokeWeight: 0.5,
        path: google.maps.SymbolPath.CIRCLE,
        scale: scale
    };
}

PhotoManager.prototype.ClearAllMarkers = function (deleteMarkers) {
    for (var i = 0; i < this.Markers.length; i++) {
        this.Markers[i].setMap(null);
    }

    if (deleteMarkers) {
        this.Markers = [];
    }
}

// Constants
PhotoManager.prototype.PhotoPath = 'photos/';
PhotoManager.prototype.R = 6371e3;
PhotoManager.prototype.MAXZOOMLEVEL = 25;
PhotoManager.prototype.MINZOOMLEVEL = 0;
PhotoManager.prototype.MAXCIRCLESCALE = 24;
PhotoManager.prototype.MINCIRCLESCALE = 8;
PhotoManager.prototype.CIRCLESCALERANGE = 16;

// Functions
PhotoManager.prototype.GetRelativePathToPhoto = function(filename) {
    return this.PhotoPath + filename;
}

PhotoManager.prototype.CalculatePhotoDistances = function () {
    // Performance marker
    window.performance.mark("mark_start_CalculatePhotoDistances");

    // Create 2D array to store distances
    this.PhotoDistances = new Array(this.Photos.length);
    for (var i = 0; i < this.Photos.length; i++) {
        this.PhotoDistances[i] = new Array(this.Photos.length);
    }

    // Iterate over photos and compare distances
    for (var i = 0; i < this.PhotoDistances.length; i++) {
        for (var j = 0; j < this.PhotoDistances[i].length; j++) {
            // handle the case where i == j
            if (i == j) {
                this.PhotoDistances[i][j] = 0;
                continue;
            }

            // Compute the distance between coordinates using the haversine method
            // http://www.movable-type.co.uk/scripts/latlong.html
            var lat1rad = this.Photos[i].GetLatitude().toRadians();
            var lat2rad = this.Photos[j].GetLatitude().toRadians();
            var deltalatrad = (this.Photos[i].GetLatitude() - this.Photos[j].GetLatitude()).toRadians();
            var deltalongrad = (this.Photos[i].GetLongitude() - this.Photos[j].GetLongitude()).toRadians();

            var a = Math.sin(deltalatrad / 2) * Math.sin(deltalatrad / 2) +
                    Math.cos(lat1rad) * Math.cos(lat2rad) *
                    Math.sin(deltalongrad / 2) * Math.sin(deltalongrad / 2);

            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            var d = this.R * c;

            this.PhotoDistances[i][j] = d;
        }
    }

    // Performance marker
    window.performance.mark("mark_end_CalculatePhotoDistances");
}

// Clustering Functions
PhotoManager.prototype.CopyDistanceMatrix = function () {
    var newDistanceMatrix = [];

    for (var i = 0; i < this.PhotoDistances.length; i++) {
        if (!this.Photos[i].IsVisible()) continue;
        newDistanceMatrix.push([]);

        for (var j = 0; j < this.PhotoDistances.length; j++) {
            if (!this.Photos[j].IsVisible()) continue;
            newDistanceMatrix[newDistanceMatrix.length-1].push(this.PhotoDistances[i][j]);
        }
    }

    return newDistanceMatrix;
}

PhotoManager.prototype.CopyClusterArray = function (srcArray) {
    var dstArray = new Array(srcArray.length);

    for (var i = 0; i < srcArray.length; i++) {
        dstArray[i] = srcArray[i].Clone();
    }
    
    return dstArray;
}

PhotoManager.prototype.GetClosestCluster = function (distanceMatrix) {
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

    return { distance: minDistance, cluster1: c1, cluster2: c2}
}

PhotoManager.prototype.SetupForCluster = function () {
    // Create the clusters data structure
    this.Clusters = new Array(this.MAXZOOMLEVEL + 1); // Need to have max level + 1 elements since 0 is a valid zoom level

    for (var i = 0 ; i < this.Clusters.length; i++) {
        this.Clusters[i] = new Array();
    }

    // Initially populate the highest zoom level with each photo as its own cluster (only if the photo is visible)
    for (var i = 0; i < this.Photos.length; i++) {
        if (this.Photos[i].IsVisible()) {
            this.Clusters[this.MAXZOOMLEVEL].push(new Cluster(this.Photos[i]));
        }
    }
}

PhotoManager.prototype.DoCluster = function () {
    // Performance marker
    window.performance.mark("mark_start_DoCluster");

    var newDistanceMatrix = this.CopyDistanceMatrix();
    this.Cluster(this.MAXZOOMLEVEL, newDistanceMatrix);

    // Performance marker
    window.performance.mark("mark_end_DoCluster");
}

PhotoManager.prototype.Cluster = function (zoomLevel, distanceMatrix) {
    if (zoomLevel >= this.MINZOOMLEVEL) {
        var clusterThreshold = GetClusterThreshold(zoomLevel);

        while (distanceMatrix.length > 1) {
            // Determine which two clusters to merge, and their distance
            var nextCluster = this.GetClosestCluster(distanceMatrix);

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
            this.Clusters[zoomLevel].push(MergeClusters(this.Clusters[zoomLevel][nextCluster.cluster1], this.Clusters[zoomLevel][nextCluster.cluster2]));
            this.Clusters[zoomLevel].splice(deleteFirst, 1);
            this.Clusters[zoomLevel].splice(deleteLast - 1, 1);
        }

        // As long as we aren't processing the minimum zoom level, we need to copy the clusters array into the next level to be processed
        if (zoomLevel != this.MINZOOMLEVEL) {
            this.Clusters[zoomLevel - 1] = this.CopyClusterArray(this.Clusters[zoomLevel]);
        }

        // Recurse
        this.Cluster(zoomLevel - 1, distanceMatrix);
    }
    // Base case
    else {
        // We are done!
    }
}

PhotoManager.prototype.OnVisiblePhotosUpdated = function () {
    // First update the status of each photo object
    var visiblePhotoSet = tagManager.GetVisiblePhotos();

    for (var i = 0; i < photoManager.Photos.length; i++) {
        if (visiblePhotoSet.has(i)) {
            photoManager.Photos[i].SetIsVisible(true);
        }
        else {
            photoManager.Photos[i].SetIsVisible(false);
        }
    }

    // Now recalculate the clusters and redraw the markers
    photoManager.SetupForCluster();
    photoManager.DoCluster();
    photoManager.ClearAllMarkers(true);
    photoManager.CreateMarkers();
}

// Variables
PhotoManager.prototype.PhotoViewer = null;
PhotoManager.prototype.PhotoDistances = null;
PhotoManager.prototype.Clusters = null;
PhotoManager.prototype.Photos = null;
PhotoManager.prototype.Markers = null;

function Cluster(photo) {
    this.Photos = [];

    if (photo !== undefined) {
        this.Photos.push(photo);
    }
}

Cluster.prototype.AddPhoto = function(photo) {
    this.Photos.push(photo);
}

Cluster.prototype.AddPhotos = function (photos) {
    this.Photos = this.Photos.concat(photos);
}

Cluster.prototype.GetPhotos = function () {
    return this.Photos;
}

Cluster.prototype.GetLatitude = function () {
    var latAgg = 0;

    for (var i = 0; i < this.Photos.length; i++) {
        latAgg += this.Photos[i].GetLatitude();
    }

    latAgg /= parseFloat(this.Photos.length);

    return latAgg;
}

Cluster.prototype.GetLongitude = function () {
    var longAgg = 0;

    for (var i = 0; i < this.Photos.length; i++) {
        longAgg += this.Photos[i].GetLongitude();
    }

    longAgg /= parseFloat(this.Photos.length);

    return longAgg;
}

Cluster.prototype.Clone = function () {
    var copy = new Cluster();

    copy.AddPhotos(this.Photos);

    return copy;
}

function MergeClusters(cluster1, cluster2) {
    var newCluster = new Cluster();

    newCluster.AddPhotos(cluster1.GetPhotos());
    newCluster.AddPhotos(cluster2.GetPhotos());
    
    return newCluster;
}

//TODO: Move this function
// Returns the (approximate) distance in meters per centimeter of map
function GetClusterThreshold(zoomLevel) {
    var mapScale = 591657550.500000 / Math.pow(2, (zoomLevel - 1));
    return (mapScale / 100.0) / 2.0;
}

//TODO: Move this to a util script or something
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function () { return this * Math.PI / 180; };
}