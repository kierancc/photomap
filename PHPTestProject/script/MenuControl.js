/// <reference path="jquery/jquery-3.0.0.js" />
function MenuControl() {
    // Declare the container div for the control
    var containerDiv = document.createElement('div');
    containerDiv.classList.add('MenuControlContainer');

    // Declare the menu div
    var menuDiv = document.createElement('div');
    menuDiv.classList.add('MenuControlExpandedMenu');
    $(menuDiv).hide();
    containerDiv.appendChild(menuDiv);

    // Declare the button for expanding/hiding the menu
    var expandButton = document.createElement('div');
    expandButton.classList.add('MenuControlExpandButton');
    expandButton.innerText = "<";

    // Wire up listener to toggle the expand button
    $(expandButton).click(function () {
        if ($(menuDiv).is(':visible')) {
            $.when($(menuDiv).hide("slide", { direction: "right" }, 200));
            $(expandButton).text("<")
        }
        else {
            $(menuDiv).show("slide", { direction: "right" }, 200);
            $(expandButton).text(">")
        }
        
    });

    containerDiv.appendChild(expandButton);

    return containerDiv;
}