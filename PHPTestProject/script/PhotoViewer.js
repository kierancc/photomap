var photoViewer = function () {
    // Private members
    var currentCollection;
    var parentElement;
    var containerElement;
    var viewerElement;
    var carouselElement;

    // Functions
    var doDestroyCollection = function () {
        disableKeyListeners();
        sidebar.showControl(tagMenuControl.getFriendlyName());

        $('#modalpane').fadeOut(1500);
        $(parentElement).fadeOut(1500, function () {
            $(viewerElement).empty();
            currentCollection = null;
        });            
    };

    var showNextPhoto = function () {
        if ((currentCollection.index + 1 < currentCollection.photos.length) && (currentCollection.images[currentCollection.index + 1] !== undefined)) {
            currentCollection.index++;

            $(viewerElement).hide();
            $(viewerElement).empty();
            $(viewerElement).append(currentCollection.images[currentCollection.index]);
            $(viewerElement).fadeIn(100);

            // Update the sidebar
            photoDetailControl.showPhotoDetails(currentCollection.photos[currentCollection.index]);
        }
        else if (currentCollection.index === (currentCollection.photos.length - 1)) {
            alert("You are viewing the last photo in this collection");
        }
        else {
            alert("Next photo is not loaded yet");
        }
    };

    var showPrevPhoto = function () {
        if (currentCollection.index - 1 >= 0) {
            currentCollection.index--;

            $(viewerElement).hide();
            $(viewerElement).empty();
            $(viewerElement).append(currentCollection.images[currentCollection.index]);
            $(viewerElement).fadeIn(100);

            // Update the sidebar
            photoDetailControl.showPhotoDetails(currentCollection.photos[currentCollection.index]);
        }
        else {
            alert("You are viewing the first photo in this collection");
        }
    };

    var createPrevNextButtons = function () {
        var prevButton = document.createElement('div');
        prevButton.id = "PhotoViewerPrevButton";
        prevButton.innerText = "<";
        $(prevButton).click(function () {
            showPrevPhoto();
        });
        $(prevButton).hover(
            function () {
                $(this).fadeTo(150, 1);
            },
            function () {
                $(this).fadeTo(150, 0);
            });
        $(containerElement).append(prevButton);

        var nextButton = document.createElement('div');
        nextButton.id = "PhotoViewerNextButton";
        nextButton.innerText = ">";
        $(nextButton).click(function () {
            showNextPhoto();
        });
        $(nextButton).hover(
            function () {
                $(this).fadeTo(150, 1);
            },
            function () {
                $(this).fadeTo(150, 0);
            });
        $(containerElement).append(nextButton);
    };

    var showPrevNextButtons = function () {
        $('#PhotoViewerPrevButton').fadeTo(100, 1);
        $('#PhotoViewerNextButton').fadeTo(100, 1);
    };

    var hidePrevNextButtons = function () {
        $('#PhotoViewerPrevButton').fadeTo(100, 0);
        $('#PhotoViewerNextButton').fadeTo(100, 0);
    };

    var disableKeyListeners = function () {
        $('#PhotoViewerContainer').off("keydown");
    };

    var enableKeyListeners = function () {
        // If this viewer is for a cluster of photos we need to add and wire up the next/prev buttons
        if (currentCollection.getType() === PhotoCollection.Type.CLUSTER) {
            // Wire up keyboard event listener for left and right arrow keys and the escape key
            $('#PhotoViewerContainer').keydown(function (event) {
                if (event.which == 37 || event.which == 39 || event.which == 27) {
                    event.preventDefault();
                    event.stopImmediatePropagation();

                    if (event.which == 37) {
                        showPrevPhoto();
                    }
                    else if (event.which == 39) {
                        showNextPhoto();
                    }
                    else if (event.which == 27) {
                        doDestroyCollection();
                    }
                }
            });

        }
        // Otherwise we only wire up the escape key listener to close the viewer
        else {
            // Wire up keyboard event listener for the escape key
            $('#PhotoViewerContainer').keydown(function (event) {
                if (event.which == 27) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    doDestroyCollection();
                }
            });
        }
    };

    var onFirstImageLoaded = function (e) {
        viewerElement.appendChild(currentCollection.images[0]);
        sidebar.showControl(photoDetailControl.getFriendlyName());
        photoDetailControl.showPhotoDetails(currentCollection.photos[0]);
    };

    var loadPhotos = function () {
        return $.each(currentCollection.photos, function (key, val) {
            var fullRelPath = photoManager.getRelativePathToPhoto(val.GetFilename());
            var image = new Image();

            image.onload = function () {
                currentCollection.images[key] = this;

                // If the image loaded is the first image, trigger an event for this
                // so that the loading gif will be removed and the image shown
                if (key === 0) {
                    $(document).trigger("photoViewer:firstImageLoaded");
                }
            };

            image.onerror = function (error) {
                alert("Failed to load photo " + key + " : " + error);
            };

            image.src = fullRelPath;
        });
    };

    // "Constructor"
    // Build the container element
    containerElement = document.createElement("div");
    containerElement.id = "PhotoViewerContainer";
    containerElement.tabIndex = 1;

    // Build the close button
    var closeButton = document.createElement('a');
    closeButton.id = "PhotoViewerCloseButton";
    closeButton.href = "#";
    closeButton.innerText = "X";

    $(closeButton).click(function () {
        doDestroyCollection();
    });

    $(containerElement).append($(closeButton));

    // Build the viewer element
    viewerElement = document.createElement("div");
    viewerElement.id = "PhotoViewer";

    $(containerElement).append(viewerElement);

    // Create the prev and next buttons
    createPrevNextButtons();

    // Bind events
    $(document).on("photoViewer:firstImageLoaded", onFirstImageLoaded);

    // Public members
    return {
        setParent: function (parent) {
            parentElement = parent;
            $(parentElement).append(containerElement);
        },
        hideCollection: function () {
            doDestroyCollection();
        },
        showCollection: function (newCollection) {
            currentCollection = newCollection;
            loadPhotos();
            
            $('#modalpane').fadeIn(1500);
            $(parentElement).fadeIn(1500, function () {
                // Set focus on the photo viewer
                $('#PhotoViewerContainer').focus();
                enableKeyListeners();
            });
            
        }
    };
}();