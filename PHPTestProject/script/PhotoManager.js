function PhotoManager() {
    this.PhotoDistances = [];
    this.Clusters = [];
}

// Constants
PhotoManager.prototype.PhotoPath = 'photos/';
PhotoManager.prototype.R = 6371e3;

// Functions
PhotoManager.prototype.GetRelativePathToPhoto = function(filename) {
    return this.PhotoPath + filename;
}

PhotoManager.prototype.CalculatePhotoDistances = function () {
    // Create 2D array to store distances
    this.PhotoDistances = new Array(photos.length);
    for (var i = 0; i < photos.length; i++) {
        this.PhotoDistances[i] = new Array(photos.length);
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
            var lat1rad = photos[i].GetLatitude().toRadians();
            var lat2rad = photos[j].GetLatitude().toRadians();
            var deltalatrad = (photos[i].GetLatitude() - photos[j].GetLatitude()).toRadians();
            var deltalongrad = (photos[i].GetLongitude() - photos[j].GetLongitude()).toRadians();

            var a = Math.sin(deltalatrad / 2) * Math.sin(deltalatrad / 2) +
                    Math.cos(lat1rad) * Math.cos(lat2rad) *
                    Math.sin(deltalongrad / 2) * Math.sin(deltalongrad / 2);

            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            var d = this.R * c;

            this.PhotoDistances[i][j] = d;
        }
    }
}

// Clustering Functions
PhotoManager.prototype.CopyDistanceMatrix = function () {
    var newDistanceMatrix = new Array(this.PhotoDistances.length);

    for (var i = 0; i < newDistanceMatrix.length; i++) {
        newDistanceMatrix[i] = new Array(this.PhotoDistances.length);

        for (var j = 0; j < newDistanceMatrix[i].length; j++) {
            newDistanceMatrix[i][j] = this.PhotoDistances[i][j];
        }
    }

    return newDistanceMatrix;
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

PhotoManager.prototype.Cluster = function () {
    var clusters = new Array();

    for (var i = 0; i < photos.length; i++) {
        clusters.push(new Cluster(photos[i]));
    }

    var newDistanceMatrix = this.CopyDistanceMatrix();

    var clusterThreshold = GetClusterThreshold();

    while (newDistanceMatrix.length > 1) {
        // Determine which two clusters to merge, and their distance
        var nextCluster = this.GetClosestCluster(newDistanceMatrix);

        // If the smallest distance between clusters is greater than the threshold, then break
        if (nextCluster.distance > clusterThreshold) break;

        // Add a new row and column for the new cluster
        newDistanceMatrix.push(new Array(newDistanceMatrix.length + 1));

        // Populate the distances of every existing cluster that will remain to our new cluster
        for (var i = 0; i < newDistanceMatrix.length - 1; i++) {
            // Skip the ones that will be removed
            if (i == nextCluster.cluster1 || i == nextCluster.cluster2) continue;

            // Determine the distance between this cluster and our new cluster by using max d[this, c1], d[this, c2]
            var newDistance = Math.max(newDistanceMatrix[i][nextCluster.cluster1], newDistanceMatrix[i][nextCluster.cluster2]);
            newDistanceMatrix[i].push(newDistance);
        }

        // Populate the distance array of the new cluster
        for (var i = 0; i < newDistanceMatrix[newDistanceMatrix.length - 1].length; i++) {
            // Skip the ones that will be removed
            if (i == nextCluster.cluster1 || i == nextCluster.cluster2) continue;

            // Determine the distance between this cluster and our new cluster by using max d[c1, this], d[c2, this]
            var newDistance = Math.max(newDistanceMatrix[nextCluster.cluster1][i], newDistanceMatrix[nextCluster.cluster2][i]);
            newDistanceMatrix[newDistanceMatrix.length - 1][i] = newDistance;
        }

        // Set the distance between the cluster to itself to 0
        newDistanceMatrix[newDistanceMatrix.length - 1][newDistanceMatrix.length - 1] = 0;

        // Delete the old rows and columns
        // Ensure we get the delete ordering right
        var deleteFirst = Math.min(nextCluster.cluster1, nextCluster.cluster2);
        var deleteLast = Math.max(nextCluster.cluster1, nextCluster.cluster2);
        newDistanceMatrix.splice(deleteFirst, 1);
        newDistanceMatrix.splice(deleteLast - 1, 1);

        for (var i = 0; i < newDistanceMatrix.length; i++) {
            newDistanceMatrix[i].splice(deleteFirst, 1);
            newDistanceMatrix[i].splice(deleteLast - 1, 1);
        }

        // Delete the old clusters and add the new one to our clusters array
        clusters.push(MergeClusters(clusters[nextCluster.cluster1], clusters[nextCluster.cluster2]));
        clusters.splice(deleteFirst, 1);
        clusters.splice(deleteLast - 1, 1);
    }

    return clusters;
}

// Variables
PhotoManager.prototype.PhotoViewer = null;
PhotoManager.prototype.PhotoDistances = null;
PhotoManager.prototype.Clusters = null;

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

function MergeClusters(cluster1, cluster2) {
    var newCluster = new Cluster();

    newCluster.AddPhotos(cluster1.GetPhotos());
    newCluster.AddPhotos(cluster2.GetPhotos());
    
    return newCluster;
}

//TODO: Move this function
// Returns the (approximate) distance in meters per centimeter of map
function GetClusterThreshold() {
    var zoomLevel = map.zoom;
    var mapScale = 591657550.500000 / Math.pow(2, (zoomLevel - 1));
    return (mapScale / 100.0) / 2.0;
}

//TODO: Move this to a util script or something
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function () { return this * Math.PI / 180; };
}