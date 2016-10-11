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

    // Process the photo tags
    var tagsAndCounts = tagManager.GetTagAndPhotoCountSorted();

    // Build up the tag list
    var tagListContainerDiv = document.createElement('div');
    tagListContainerDiv.classList.add("MenuControlTagListContainer");
    menuDiv.appendChild(tagListContainerDiv);

    // Add tags to the list
    for (var i = 0; i < tagsAndCounts.length; i++) {
        var listElement = document.createElement('div');
        listElement.classList.add("MenuControlTagListItem");
        listElement.id = "TagListItem" + tagsAndCounts[i].GetTag();
        
        // Build up a table for the contents
        var table = document.createElement('table');
        table.classList.add("MenuControlTagListTable");

        var tableRow = document.createElement('tr');
        var tableCell1 = document.createElement('td');
        tableCell1.classList.add("MenuControlTagListTableLeftCell");
        tableCell1.innerText = tagsAndCounts[i].GetTag();

        var tableCell2 = document.createElement('td');
        tableCell2.classList.add("MenuControlTagListTableRightCell");
        tableCell2.innerText = tagsAndCounts[i].GetCount();

        tableRow.appendChild(tableCell1);
        tableRow.appendChild(tableCell2);
        table.appendChild(tableRow)
        listElement.appendChild(table);

        tagListContainerDiv.appendChild(listElement);
    }

    return containerDiv;
}