/// <reference path="jquery/jquery-3.0.0.js" />
function TagManager() {
    this.TagPhotoDictionary = [];
}

TagManager.prototype.RegisterPhoto = function (photo, index) {
    // Parse the tag list
    var tags = this.ParseTagList(photo.GetTagsString());

    // Iterate over the tags
    for (var i = 0; i < tags.length; i++) {
        this.TryAddTagAndPhoto(tags[i], index);
    }
}

// Adding functions
TagManager.prototype.TryAddTagAndPhoto = function (tag, index) {
    // Determine if the tag already exists in the dictionary
    // If it doesn't already exist, then add a new array for it
    if (undefined === this.TagPhotoDictionary[tag]) {
        this.TagPhotoDictionary[tag] = [];
    }

    // Now that the tag exists in the dictionary, add the index of the current photo
    this.TagPhotoDictionary[tag].push(index);
}

TagManager.prototype.ParseTagList = function (tagString) {
    return tagString.split(this.Delimiter);
}

// Accessing functions
TagManager.prototype.GetCompleteTagsList = function () {
    return Object.keys(this.TagPhotoDictionary);
}

TagManager.prototype.GetPhotoIndicesForTag = function (tag) {
    if (undefined === this.TagPhotoDictionary[tag]) {
        return [];
    }
    else {
        return this.TagPhotoDictionary[tag];
    }
}

// Constants
TagManager.prototype.Delimiter = ';';