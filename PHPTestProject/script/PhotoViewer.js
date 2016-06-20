/// <reference path="jquery/jquery-3.0.0.js" />
function PhotoViewer(controlDiv, filename) {
    // Set up the control
    controlDiv.id = "PhotoViewer";

    // Add the control to the parent div
    $('#photodiv').append($(controlDiv));
    $('#photodiv').hide();

    var relativeFile = photoManager.GetRelativePathToPhoto(filename);
    var photo = new Image();
    photo.src = relativeFile;
    photo.onload = function () {
        // Set the viewer dimensions
        $('#photodiv').width = photo.width;
        $('#photodiv').height = photo.height;
        $(controlDiv).empty().append(photo);
    }
    photo.onerror = function () {
        $(controlDiv).empty().html('Photo failed to load');
    }

    $(controlDiv).empty().html('Loading photo...');

    // Show the parent div
    $('#photodiv').fadeIn(3000);
}