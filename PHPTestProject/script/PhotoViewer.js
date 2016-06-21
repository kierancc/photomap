/// <reference path="jquery/jquery-3.0.0.js" />
function PhotoViewer(filename) {
    // Save variables
    this.filename = filename;
}

PhotoViewer.prototype.LoadPhoto = function () {
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

    // Set up the photo control
    var controlDiv = document.createElement('div');
    controlDiv.id = "PhotoViewer";

    // Add the control to the parent div
    $(containerDiv).append($(controlDiv));

    var viewWidth = $(window).width();
    var viewHeight = $(window).height();

    var relativeFile = photoManager.GetRelativePathToPhoto(this.filename);
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
    }
    photo.onerror = function () {
        $(controlDiv).empty().html('Photo failed to load');
    }

    $(controlDiv).empty().html('Loading photo...');
}

PhotoViewer.prototype.ShowPhoto = function (animate) {
    // Show the parent div
    if (animate) {
        $('#photodiv').fadeIn(3000);
    }
    else {
        $('#photodiv').show();
    }
}

PhotoViewer.prototype.ClosePhoto = function () {
    $('#photodiv').hide();
    $('#photodiv').empty();
    photoManager.PhotoViewer = null;
}