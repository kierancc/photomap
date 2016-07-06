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
    var toolbarTable = document.createElement('table');
    var toolbarTableRow = document.createElement('tr');

    // Add an empty first cell
    var toolbarTableFirstCell = document.createElement('td');
    toolbarTableFirstCell.style.width = "33%";
    toolbarTableRow.appendChild(toolbarTableFirstCell);

    // Second cell has the current photo number and count
    var toolbarTableTitleCell = document.createElement('td');
    toolbarTableTitleCell.id = "PhotoViewerTitleCell";
    toolbarTableTitleCell.style.width = "34%";
    toolbarTableTitleCell.style.textAlign = "center";
    toolbarTableTitleCell.style.fontWeight = "bolder";
    toolbarTableTitleCell.innerText = this.index + 1 + " / " + this.photos.length;
    toolbarTableRow.appendChild(toolbarTableTitleCell);
    
    var closeButton = document.createElement('a');
    closeButton.href = "#";
    closeButton.innerText = "X";
    $(toolbarDiv).append($(closeButton));
    
    $(closeButton).click(function () {
        photoManager.PhotoViewer.ClosePhoto();
    });

    // Last cell has the close button
    var toolbarTableLastCell = document.createElement('td');
    toolbarTableLastCell.style.width = "33%";
    toolbarTableLastCell.style.textAlign = "right";
    toolbarTableLastCell.appendChild(closeButton);
    toolbarTableRow.appendChild(toolbarTableLastCell);

    toolbarTable.appendChild(toolbarTableRow);
    toolbarDiv.appendChild(toolbarTable);

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
        $(prevButton).hover(
            function () {
                $(this).fadeTo(150, 1);
            },
            function () {
                $(this).fadeTo(150, 0);
        });
        $(containerDiv).append(prevButton);

        var nextButton = document.createElement('div');
        nextButton.id = "PhotoViewerNextButton";
        nextButton.innerText = ">";
        $(nextButton).click(function () {
            photoManager.PhotoViewer.ShowNextPhoto();
        });
        $(nextButton).hover(
            function () {
                $(this).fadeTo(150, 1);
            },
            function () {
                $(this).fadeTo(150, 0);
        })
        $(containerDiv).append(nextButton);
    }
}

PhotoViewer.prototype.HidePrevNextButtons = function () {
    $('#PhotoViewerPrevButton').fadeTo(100, 0);
    $('#PhotoViewerNextButton').fadeTo(100, 0);
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
        $('#modalpane').show().fadeIn(1500);
    }
    else {
        $('#photodiv').show();
    }

    // If this viewer is for a cluster, set a timer to fade out the prev/next buttons after a few seconds
    if (this.type === PhotoViewer.Type.CLUSTER) {
        window.setTimeout(function () {
            if (photoManager.PhotoViewer !== null)
            photoManager.PhotoViewer.HidePrevNextButtons();
        }, 3000);
    }
}

PhotoViewer.prototype.ShowNextPhoto = function () {
    if (this.index + 1 < this.photos.length) {
        this.index++;

        $('#PhotoViewerTitleCell').empty().text(this.index + 1 + " / " + this.photos.length);

        $('#PhotoViewer').hide();
        $('#PhotoViewer').empty();
        $('#PhotoViewer').append(this.images[this.index]);
        $('#PhotoViewer').fadeIn(100);

        if (this.images[this.index + 1] === undefined) {
            this.LoadNextPhoto();
        }
    }
}

PhotoViewer.prototype.ShowPrevPhoto = function () {
    if (this.index - 1 >= 0) {
        this.index--;

        $('#PhotoViewerTitleCell').empty().text(this.index + 1 + " / " + this.photos.length);

        $('#PhotoViewer').hide();
        $('#PhotoViewer').empty();
        $('#PhotoViewer').append(this.images[this.index]);
        $('#PhotoViewer').fadeIn(100);
    }
}

PhotoViewer.prototype.ClosePhoto = function () {
    $('#photodiv').fadeOut(1500);
    $('#modalpane').fadeOut(1500);
    $('#photodiv').empty();
    photoManager.PhotoViewer = null;
}