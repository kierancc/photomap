function Photo(filename, latitude, longitude) {
    this.fileName = filename;
    this.latitude = latitude;
    this.longitude = longitude;
}

Photo.prototype.GetFilename = function () {
    return this.fileName;
}

Photo.prototype.GetLatitude = function () {
    return this.latitude;
}

Photo.prototype.GetLongitude = function () {
    return this.longitude;
}