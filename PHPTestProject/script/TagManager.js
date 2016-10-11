/// <reference path="jquery/jquery-3.0.0.js" />

// TagManager Class
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

TagManager.prototype.GetPhotoCountForTag = function (tagName) {
    if (undefined !== this.TagPhotoDictionary[tagName]) {
        return this.TagPhotoDictionary[tagName].length;
    }
    else {
        return 0;
    }
}

TagManager.prototype.GetTagAndPhotoCountSorted = function () {
    var results = [];

    // Populate the results array
    var keys = Object.keys(this.TagPhotoDictionary);

    for (var i = 0; i < keys.length; i++) {
        results.push(new TagCountPair(keys[i], this.TagPhotoDictionary[keys[i]].length));
    }

    // Sort the array
    results.sort(function (a, b) {
        var valA = a.GetCount();
        var valB = b.GetCount();

        if (valA < valB) {
            return 1;  
        }
        else if (valA > valB) {
            return -1;
        }
        else {
            return 0;
        }
    });

    return results;
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

// TagCountPair Class
function TagCountPair(tag, count) {
    this.tag = tag;
    this.count = count;
}

TagCountPair.prototype.GetTag = function () {
    return this.tag;
}

TagCountPair.prototype.GetCount = function () {
    return this.count;
}