var photoDetailControl = function () {
    // Private members
    var containerElement;
    var friendlyName = "PhotoDetail";

    // "Constructor"
    containerElement = document.createElement("div");
    containerElement.id = "PhotoDetailControlContainer";

    // Filename
    var filenameLabel = document.createElement("span");
    filenameLabel.className = "PhotoDetailBigLabel";
    $(filenameLabel).text("Filename");
    containerElement.appendChild(filenameLabel);

    var filenameSpan = document.createElement("span");
    filenameSpan.id = "filenameSpan";
    filenameSpan.className = "PhotoDetailValue";
    containerElement.appendChild(filenameSpan);

    containerElement.appendChild(document.createElement("br"));

    // Date Taken
    var dateTakenLabel = document.createElement("span");
    dateTakenLabel.className = "PhotoDetailBigLabel";
    $(dateTakenLabel).text("Date Taken");
    containerElement.appendChild(dateTakenLabel);

    var dateTakenSpan = document.createElement("span");
    dateTakenSpan.id = "dateTakenSpan";
    dateTakenSpan.className = "PhotoDetailValue";
    containerElement.appendChild(dateTakenSpan);

    containerElement.appendChild(document.createElement("br"));

    // Location
    var locationLabel = document.createElement("span");
    locationLabel.className = "PhotoDetailBigLabel";
    $(locationLabel).text("Location");
    containerElement.appendChild(locationLabel);

    var locationStringSpan = document.createElement("span");
    locationStringSpan.id = "locationStringSpan";
    locationStringSpan.className = "PhotoDetailValue";
    containerElement.appendChild(locationStringSpan);

    containerElement.appendChild(document.createElement("br"));

    var gpsLabel = document.createElement("span");
    gpsLabel.className = "PhotoDetailSubLabel";
    $(gpsLabel).text("GPS Coordinates");
    containerElement.appendChild(gpsLabel);

    var latSpan = document.createElement("span");
    latSpan.id = "latSpan";
    latSpan.className = "PhotoDetailSubValue";
    containerElement.appendChild(latSpan);

    var lngSpan = document.createElement("span");
    lngSpan.id = "lngSpan";
    lngSpan.className = "PhotoDetailSubValue";
    containerElement.appendChild(lngSpan);

    containerElement.appendChild(document.createElement("br"));

    // Tags
    var tagsLabel = document.createElement("span");
    tagsLabel.className = "PhotoDetailBigLabel";
    $(tagsLabel).text("Tags");
    containerElement.appendChild(tagsLabel);

    var tagsSpan = document.createElement("span");
    tagsSpan.id = "tagsSpan";
    tagsSpan.className = "PhotoDetailValue";
    containerElement.appendChild(tagsSpan);

    // Hide the element by default
    $(containerElement).hide();

    // Public members
    return {
        getFriendlyName: function () {
            return friendlyName;
        },
        getContainerElement: function () {
            return containerElement;
        },
        showPhotoDetails: function (photo) {
            $(filenameSpan).text(photo.GetFilename());
            $(dateTakenSpan).text(photo.GetDateTaken());
            $(locationStringSpan).text(photo.GetLocationString());
            $(latSpan).text("LAT: " + photo.GetLatitude());
            $(lngSpan).text("LNG: " + photo.GetLongitude());
            $(tagsSpan).text(photo.GetTagsString());
        }
    };
}();