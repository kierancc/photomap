﻿/// <reference path="jquery/jquery-3.0.0.js" />
function PhotoViewer(type, photos) {
    // Save variables
    this.type = type;
    this.photos = photos;
    this.index = 0;
    this.images = [];

    this.SetupViewer();
    sidebar.showControl(photoDetailControl.getFriendlyName());
}

PhotoViewer.prototype.GetType = function () {
    return this.type;
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
    toolbarDiv.classList.add("PhotoViewerToolbar");
    toolbarDiv.classList.add("PhotoViewerTopToolbar");
    var toolbarTable = document.createElement('table');
    toolbarTable.className = "PhotoViewerToolbarTable";
    var toolbarTableRow = document.createElement('tr');

    // Add an empty first cell
    var toolbarTableFirstCell = document.createElement('td');
    toolbarTableFirstCell.style.width = "33%";
    toolbarTableRow.appendChild(toolbarTableFirstCell);

    // Second cell has the current photo number and count
    var toolbarTableTitleCell = document.createElement('td');
    toolbarTableTitleCell.id = "PhotoViewerTitleCell";
    toolbarTableTitleCell.innerText = this.index + 1 + " / " + this.photos.length;
    toolbarTableRow.appendChild(toolbarTableTitleCell);
    
    var closeButton = document.createElement('a');
    closeButton.className = "PhotoViewerToolbarLink";
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

        // Wire up keyboard event listener for left and right arrow keys and the escape key
        $('#photodiv').keydown(function (event) {
            if (event.which == 37 || event.which == 39|| event.which == 27) {
                event.preventDefault();
                event.stopImmediatePropagation();
                
                if (event.which == 37) {
                    photoManager.PhotoViewer.ShowPrevPhoto();
                }
                else if (event.which == 39) {
                    photoManager.PhotoViewer.ShowNextPhoto();
                }
                else if (event.which == 27) {
                    photoManager.PhotoViewer.ClosePhoto();
                }
            }
        });

    }
    // Otherwise we only wire up the escape key listener to close the viewer
    else {
        // Wire up keyboard event listener for left and right arrow keys and the escape key
        $('#photodiv').keydown(function (event) {
            if (event.which == 27) {
                event.preventDefault();
                event.stopImmediatePropagation();
                photoManager.PhotoViewer.ClosePhoto();
            }
        });
    }

    // Set up the photo control
    var controlDiv = document.createElement('div');
    controlDiv.id = "PhotoViewer";

    // Add the control to the parent div
    $(containerDiv).append($(controlDiv));

    // Create the bottom toolbar div
    var bottomToolbarDiv = document.createElement('div');
    bottomToolbarDiv.id = "PhotoViewerBottomToolbar";
    bottomToolbarDiv.classList.add("PhotoViewerToolbar");
    bottomToolbarDiv.classList.add("PhotoViewerBottomToolbar");
    var bottomToolbarTable = document.createElement('table');
    bottomToolbarTable.className = "PhotoViewerToolbarTable";
    var bottomToolbarTableRow = document.createElement('tr');

    // Add the first cell, this will contain the file name of the photo
    var bottomToolbarTableNameCell = document.createElement('td');
    bottomToolbarTableNameCell.id = "PhotoViewerNameCell";
    bottomToolbarTableNameCell.innerText = "Name: " + this.photos[this.index].GetFilename();
    bottomToolbarTableRow.appendChild(bottomToolbarTableNameCell);

    // Add the second cell, this will contain the location of the photo (if it has been specified)
    var bottomToolbarTableLocationCell = document.createElement('td');
    bottomToolbarTableLocationCell.id = "PhotoViewerLocationCell";
    bottomToolbarTableLocationCell.innerText = "Location: " + this.photos[this.index].GetLocationString();
    bottomToolbarTableRow.appendChild(bottomToolbarTableLocationCell);

    bottomToolbarTable.appendChild(bottomToolbarTableRow);

    // Add the table
    bottomToolbarDiv.appendChild(bottomToolbarTable);

    // Add the second table (for tags)
    var bottomToolbarTable2 = document.createElement('table');
    bottomToolbarTable2.className = "PhotoViewerToolbarTable";
    var bottomToolbarTableRow2 = document.createElement('tr');
    var bottomToolbarTableTagsCell = document.createElement('td');
    bottomToolbarTableTagsCell.id = "PhotoViewerTagsCell";
    bottomToolbarTableTagsCell.innerText = "Tags: " + this.photos[this.index].GetTagsString();
    bottomToolbarTableRow2.appendChild(bottomToolbarTableTagsCell);

    bottomToolbarTable2.appendChild(bottomToolbarTableRow2);
    // Add the table
    bottomToolbarDiv.appendChild(bottomToolbarTable2);
        

    $(containerDiv).append($(bottomToolbarDiv));
}

PhotoViewer.prototype.ShowPrevNextButtons = function () {
    $('#PhotoViewerPrevButton').fadeTo(100, 1);
    $('#PhotoViewerNextButton').fadeTo(100, 1);
}

PhotoViewer.prototype.HidePrevNextButtons = function () {
    $('#PhotoViewerPrevButton').fadeTo(100, 0);
    $('#PhotoViewerNextButton').fadeTo(100, 0);
}

PhotoViewer.prototype.LoadFirstPhoto = function () {
    var viewWidth = $(window).width();
    var viewHeight = $(window).height();

    var relativeFile = photoManager.GetRelativePathToPhoto(this.photos[0].GetFilename());
    var photo = new Image();
    photo.src = relativeFile;
    photo.onload = function () {
        $('#PhotoViewer').empty().append(photo);

        photoManager.PhotoViewer.images.push(photo);

        // If this viewer is for a cluster, first show the prev/next buttons and then set a timer to fade out the prev/next buttons after a few seconds
        if (photoManager.PhotoViewer.GetType() === PhotoViewer.Type.CLUSTER) {
            photoManager.PhotoViewer.ShowPrevNextButtons();
            window.setTimeout(function () {
                if (photoManager.PhotoViewer !== null)
                    photoManager.PhotoViewer.HidePrevNextButtons();
            }, 3000);

            // Special case: Load the next photo in the sequence.  We need to prevent a race condition when loading photos to ensure the order is preserved
            // so we will wait to load the second photo until the first has been loaded.  Since the subsequent photos are loaded one by one as the user clicks
            // through them, we only need to take care here
            photoManager.PhotoViewer.LoadNextPhoto();
        }
    }
    photo.onerror = function () {
        $('#PhotoViewer').empty().html('Photo failed to load');
    }

    $('#PhotoViewer').empty().html('<img src=\"../images/loader.gif\">');
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
    // Show the parent div
    if (animate) {
        $('#photodiv').fadeIn(1500, function () {
            // Set focus on the photo viewer
            $('#photodiv').focus();
        });
        $('#modalpane').show().fadeIn(1500);
    }
    else {
        $('#photodiv').show();
        // Set focus on the photo viewer
        $('#photodiv').focus();
    }

    // Update the sidebar
    photoDetailControl.showPhotoDetails(this.photos[this.index]);
}

PhotoViewer.prototype.ShowNextPhoto = function () {
    if ((this.index + 1 < this.photos.length) && (this.images[this.index + 1] !== undefined)) {
        this.index++;

        $('#PhotoViewerTitleCell').empty().text(this.index + 1 + " / " + this.photos.length);
        $('#PhotoViewerNameCell').empty().text("Name: " + this.photos[this.index].GetFilename());
        $('#PhotoViewerLocationCell').empty().text("Location: " + this.photos[this.index].GetLocationString());
        $('#PhotoViewerTagsCell').empty().text("Tags: " + this.photos[this.index].GetTagsString());

        $('#PhotoViewer').hide();
        $('#PhotoViewer').empty();
        $('#PhotoViewer').append(this.images[this.index]);
        $('#PhotoViewer').fadeIn(100);

        // Update the sidebar
        photoDetailControl.showPhotoDetails(this.photos[this.index]);

        if (this.images[this.index + 1] === undefined) {
            this.LoadNextPhoto();
        }
    }
}

PhotoViewer.prototype.ShowPrevPhoto = function () {
    if (this.index - 1 >= 0) {
        this.index--;

        $('#PhotoViewerTitleCell').empty().text(this.index + 1 + " / " + this.photos.length);
        $('#PhotoViewerNameCell').empty().text("Name: " + this.photos[this.index].GetFilename());
        $('#PhotoViewerLocationCell').empty().text("Location: " + this.photos[this.index].GetLocationString());
        $('#PhotoViewerTagsCell').empty().text("Tags: " + this.photos[this.index].GetTagsString());

        $('#PhotoViewer').hide();
        $('#PhotoViewer').empty();
        $('#PhotoViewer').append(this.images[this.index]);
        $('#PhotoViewer').fadeIn(100);

        // Update the sidebar
        photoDetailControl.showPhotoDetails(this.photos[this.index]);
    }
}

PhotoViewer.prototype.ClosePhoto = function () {
    $('#photodiv').fadeOut(1500, function () {
        $('#photodiv').empty();
    });
    $('#modalpane').fadeOut(1500);
    
    photoManager.PhotoViewer = null;

    // Unwire keyboard event listener
    $('#photodiv').off("keydown");

    sidebar.showControl(tagMenuControl.getFriendlyName());
}