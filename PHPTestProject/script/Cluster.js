function Cluster(photo) {
    this.Photos = [];

    if (photo !== undefined) {
        this.Photos.push(photo);
    }
}

Cluster.prototype.AddPhoto = function (photo) {
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