function PhotoManager() {
}

// Constants
PhotoManager.prototype.PhotoPath = 'photos/';

// Functions
PhotoManager.prototype.GetRelativePathToPhoto = function(filename) {
    return this.PhotoPath + filename;
}