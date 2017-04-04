var photoDetailControl = function () {
    // Private members
    var containerElement;
    var friendlyName = "PhotoDetail";

    // "Constructor"
    containerElement = document.createElement("div");
    containerElement.id = "PhotoDetailControlContainer";
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
            $(containerElement).empty().append(photo.GetFilename());
        }
    };
}();