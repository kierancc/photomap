/// <reference path="jquery/jquery-3.0.0.js" />
function PhotoViewer(type, photos) {
    // Save variables
    this.type = type;
    this.photos = photos;
    this.index = 0;
    this.images = [];

    this.SetupViewer();
}

PhotoViewer.prototype.SetupViewer = function () {
    // Delete any old viewer control
    $('#photodiv').empty();
    $('#photodiv').hide();

    // Create the containing div
    var containerDiv = document.createElement('div');
    containerDiv.id = "PhotoViewerContainer";
    $('#photodiv').append(containerDiv);

    // Create the "toolbar" div
    var toolbarDiv = document.createElement('div');
    toolbarDiv.id = "PhotoViewerToolbar";
    var closeButton = document.createElement('a');
    closeButton.href = "#";
    closeButton.innerText = "X";
    $(toolbarDiv).append($(closeButton));

    $(closeButton).click(function () {
        photoManager.PhotoViewer.ClosePhoto();
    });

    $(containerDiv).append($(toolbarDiv));

    //TODO: Fix bug where making the parent container draggable causes the CSS transformation to happen after clicking on it, making the dragging weird 
    $(containerDiv).draggable({
        handle: "#PhotoViewerToolbar",
        cursor: "pointer"
    });

    // If this viewer is for a cluster of photos we need to add and wire up the next/prev buttons
    if (this.type === PhotoViewer.Type.CLUSTER) {
        var prevButton = document.createElement('div');
        prevButton.id = "PhotoViewerPrevButton";
        prevButton.innerText = "<";
        $(prevButton).click(function () {
            photoManager.PhotoViewer.ShowPrevPhoto();
        });
        $(containerDiv).append(prevButton);

        var nextButton = document.createElement('div');
        nextButton.id = "PhotoViewerNextButton";
        nextButton.innerText = ">";
        $(nextButton).click(function () {
            photoManager.PhotoViewer.ShowNextPhoto();
        });
        $(containerDiv).append(nextButton);
    }
}

PhotoViewer.prototype.LoadFirstPhoto = function () {
    // Set up the photo control
    var controlDiv = document.createElement('div');
    controlDiv.id = "PhotoViewer";

    // Add the control to the parent div
    $('#PhotoViewerContainer').append($(controlDiv));

    var viewWidth = $(window).width();
    var viewHeight = $(window).height();

    var relativeFile = photoManager.GetRelativePathToPhoto(this.photos[0].GetFilename());
    var photo = new Image();
    photo.src = relativeFile;
    photo.onload = function () {
        // Set the viewer dimensions
        // If the image width is > 75% of the vievwport, scale it to 75%
        if (photo.width > viewWidth * 0.75) {
            var ratio = viewWidth * 0.75 / photo.width;
            photo.width = viewWidth * 0.75;
            photo.height *= ratio;
        }
        // If the image height is > 75% of the viewport, scale it to 75%
        if (photo.height > viewHeight * 0.75) {
            var ratio = viewHeight * 0.75 / photo.height;
            photo.height = viewHeight * 0.75;
            photo.width *= ratio;
        }

        $(controlDiv).empty().append(photo);

        photoManager.PhotoViewer.images.push(photo);
    }
    photo.onerror = function () {
        $(controlDiv).empty().html('Photo failed to load');
    }

    $(controlDiv).empty().html('Loading photo...');
}

PhotoViewer.prototype.LoadNextPhoto = function () {
    if (this.index + 1 < this.photos.length) {
        var viewWidth = $(window).width();
        var viewHeight = $(window).height();

        var relativeFile = photoManager.GetRelativePathToPhoto(this.photos[this.index + 1].GetFilename());
        var photo = new Image();
        photo.src = relativeFile;
        photo.onload = function () {
            // Set the viewer dimensions
            // If the image width is > 75% of the vievwport, scale it to 75%
            if (photo.width > viewWidth * 0.75) {
                var ratio = viewWidth * 0.75 / photo.width;
                photo.width = viewWidth * 0.75;
                photo.height *= ratio;
            }
            // If the image height is > 75% of the viewport, scale it to 75%
            if (photo.height > viewHeight * 0.75) {
                var ratio = viewHeight * 0.75 / photo.height;
                photo.height = viewHeight * 0.75;
                photo.width *= ratio;
            }

            photoManager.PhotoViewer.images.push(photo);
        }
        photo.onerror = function () {
            alert('Failed to load next photo');
        }
    }
}

PhotoViewer.Type = { SINGLE: 1, CLUSTER: 2 }

PhotoViewer.prototype.ShowPhoto = function (animate) {
    if (this.type === PhotoViewer.Type.CLUSTER) {
        this.LoadNextPhoto(); // Preload the next photo
    }

    // Show the parent div
    if (animate) {
        $('#photodiv').fadeIn(1500);
    }
    else {
        $('#photodiv').show();
    }
}

PhotoViewer.prototype.ShowNextPhoto = function () {
    if (this.index + 1 < this.photos.length) {
        this.index++;

        $('#PhotoViewer').hide();
        $('#PhotoViewer').empty();
        $('#PhotoViewer').append(this.images[this.index]);
        $('#PhotoViewer').fadeIn(100);

        this.LoadNextPhoto();
    }
}

PhotoViewer.prototype.ShowPrevPhoto = function () {
    if (this.index - 1 >= 0) {
        this.index--;

        $('#PhotoViewer').hide();
        $('#PhotoViewer').empty();
        $('#PhotoViewer').append(this.images[this.index]);
        $('#PhotoViewer').fadeIn(100);
    }
}

PhotoViewer.prototype.ClosePhoto = function () {
    $('#photodiv').fadeOut(1500);
    $('#photodiv').empty();
    photoManager.PhotoViewer = null;
}