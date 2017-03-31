var topToolbar = function () {
    // Private members

    // Container
    var containerElement;

    // Parent reference
    var parentElement;

    // Controls
    var controls = [];

    // "Constructor"
    containerElement = document.createElement("div");
    containerElement.id = "topToolbarContainer";

    // Public members
    return {
        setParent: function (parent) {
            parentElement = parent;
            $(parentElement).append(containerElement);
        },
        show: function () {
            $(parentElement).show();
        },
        hide: function () {
            $(parentElement).hide();
        },
        registerControl: function (control) {
            // Save a reference to the control
            controls.push(control);

            // Add the control to the DOM
            containerElement.appendChild(control);
        }
    };
}();