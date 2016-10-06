function Photo(filename, latitude, longitude, locationString, tagsString) {
    this.fileName = filename;
    this.latitude = latitude;
    this.longitude = longitude;
    this.locationString = locationString;
    this.tagsString = tagsString;
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

Photo.prototype.GetLocationString = function () {
    return this.locationString;
}

Photo.prototype.GetTagsString = function () {
    return this.tagsString;
}