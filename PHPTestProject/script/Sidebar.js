var sidebar = function () {
    // Privagte members

    // Container
    var containerElement;

    // Parent reference
    var parentElement;

    // Controls
    var controls = [];

    // "Constructor"
    containerElement = document.createElement("div");
    containerElement.id = "sidebarContainer";

    return {
        createWidget: function () {
            var widget = document.createElement("div");
            widget.id = "sidebarWidget";
            var widgetIcon = document.createElement("span");
            widgetIcon.classList.add("ui-icon");
            widgetIcon.classList.add("ui-icon-triangle-1-n");
            widget.appendChild(widgetIcon);

            $(widget).click(function () {
                if ($(parentElement).is(':visible')) {
                    $(widgetIcon).switchClass("ui-icon-triangle-1-n", "ui-icon-triangle-1-s");
                }
                else {
                    $(widgetIcon).switchClass("ui-icon-triangle-1-s", "ui-icon-triangle-1-n");
                }

                $(parentElement).slideToggle(300);
            });

            topToolbar.registerControl(widget);
        },
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