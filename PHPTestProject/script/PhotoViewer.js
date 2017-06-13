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

        $(carouselElement).empty();
    };

    var showSpecificPhoto = function (photoID) {
        if (photoID < 0 || photoID >= currentCollection.photos.length) {
            return;
        }
        else {
            currentCollection.index = photoID;
            $(viewerElement).hide();
            $(viewerElement).empty();
            $(viewerElement).append(currentCollection.images[currentCollection.index]);
            $(viewerElement).fadeIn(100);

            // Update the sidebar
            photoDetailControl.showPhotoDetails(currentCollection.photos[currentCollection.index], currentCollection.index, currentCollection.photos.length);
            photoManager.markPhotoAsViewed(currentCollection.photos[currentCollection.index].GetFilename());
        }
    };

    var showNextPhoto = function () {
        if ((currentCollection.index + 1 < currentCollection.photos.length) && (currentCollection.images[currentCollection.index + 1] !== undefined)) {
            currentCollection.index++;

            $(viewerElement).hide();
            $(viewerElement).empty();
            $(viewerElement).append(currentCollection.images[currentCollection.index]);
            $(viewerElement).fadeIn(100);

            // Update the sidebar
            photoDetailControl.showPhotoDetails(currentCollection.photos[currentCollection.index], currentCollection.index, currentCollection.photos.length);
            photoManager.markPhotoAsViewed(currentCollection.photos[currentCollection.index].GetFilename());
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
            photoDetailControl.showPhotoDetails(currentCollection.photos[currentCollection.index], currentCollection.index, currentCollection.photos.length);
            photoManager.markPhotoAsViewed(currentCollection.photos[currentCollection.index].GetFilename());
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

    var enablePrevNextButtons = function () {
        $('#PhotoViewerPrevButton').show();
        $('#PhotoViewerNextButton').show();
    };

    var disablePrevNextButtons = function () {
        $('#PhotoViewerPrevButton').hide();
        $('#PhotoViewerNextButton').hide();
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
        photoDetailControl.showPhotoDetails(currentCollection.photos[0], 0, currentCollection.photos.length);
        photoManager.markPhotoAsViewed(currentCollection.photos[0].GetFilename());
    };

    var loadPhotos = function () {
        return $.each(currentCollection.photos, function (key, val) {
            var fullRelPath = photoManager.getRelativePathToPhoto(val.GetFilename());
            var image = new Image();

            image.onload = function () {
                currentCollection.images[key] = this;
                currentCollection.loadedImages++;

                // If the image loaded is the first image, trigger an event for this
                // so that the loading gif will be removed and the image shown
                if (key === 0) {
                    $(document).trigger("photoViewer:firstImageLoaded");
                }

                // If this is the last image to be loaded, trigger an evevnt for this
                if (currentCollection.loadedImages === currentCollection.photos.length) {
                    $(document).trigger("photoViewer:allPhotosLoaded");
                }
            };

            image.onerror = function (error) {
                alert("Failed to load photo " + key + " : " + error);
            };

            image.src = fullRelPath;
        });
    };

    var onAllPhotosLoaded = function (e) {
        buildCarousel();
    };

    var buildCarousel = function () {
        for (var i = 0; i < currentCollection.images.length; i++) {
            var img = new Image();
            img = currentCollection.images[i].cloneNode(true);
            $(img).data("id", i);
            $(img).click(function () {
                showSpecificPhoto($(this).data("id"));
            });

            $(carouselElement).append(img);
        }
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

    // Build the carousel
    carouselElement = document.createElement("div");
    carouselElement.id = "ThumbnailCarousel";

    // Create prev/next buttons
    createPrevNextButtons();

    $(containerElement).append(viewerElement);
    $(containerElement).append(carouselElement);

    // Bind events
    $(document).on("photoViewer:firstImageLoaded", onFirstImageLoaded);
    $(document).on("photoViewer:allPhotosLoaded", onAllPhotosLoaded);

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
            $.when(loadPhotos())
                .done(function () {
                    $('#modalpane').fadeIn(1500);
                    $(parentElement).fadeIn(1500, function () {
                        // Enable prev/next buttons if more than one picture to show
                        if (currentCollection.getType() === PhotoCollection.Type.CLUSTER) {
                            enablePrevNextButtons();

                            showPrevNextButtons();
                            window.setTimeout(function () {
                                hidePrevNextButtons();
                            }, 1000);
                        }
                        else {
                            disablePrevNextButtons();
                        }

                        // Set focus on the photo viewer
                        $('#PhotoViewerContainer').focus();
                        enableKeyListeners();
                    });
                });
        }
    };
}();