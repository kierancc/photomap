// Constructor
function PhotoCollection(type, photos) {
    this.type = type;
    this.photos = photos;
    this.index = 0;
    this.images = new Array(this.photos.length);
}

// Members
PhotoCollection.Type = { SINGLE: 1, CLUSTER: 2 };

// Functions

PhotoCollection.prototype.getType = function () {
    return this.type;
}