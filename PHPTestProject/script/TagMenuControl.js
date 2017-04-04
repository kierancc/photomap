/// <reference path="jquery/jquery-3.0.0.js" />
function TagMenuControl() {
    // Declare the container div for the control
    var containerDiv = document.createElement('div');
    containerDiv.classList.add('TagMenuControlContainer');

    // Add the header to the menu
    var menuHeaderDiv = document.createElement('div');
    menuHeaderDiv.classList.add('TagMenuControlExpandedMenuHeader');
    containerDiv.appendChild(menuHeaderDiv);

    // Add the tag selector bar to the menu
    var tagSelectorDiv = document.createElement('div');
    tagSelectorDiv.classList.add('TagMenuControlTagSelectors');
    var tagSelectorTable = document.createElement('table');
    tagSelectorTable.style.width = "100%";
    var tagSelectorTableRow = document.createElement('tr');

    // Build the select all link
    var tagSelectorTableAllCell = document.createElement('td');
    tagSelectorTableAllCell.style.textAlign = "left";
    var tagSelectorSelectAllLink = document.createElement('span');
    tagSelectorSelectAllLink.innerText = "Select All";
    tagSelectorSelectAllLink.style.cursor = "pointer";
    tagSelectorTableAllCell.appendChild(tagSelectorSelectAllLink);
    tagSelectorTableRow.appendChild(tagSelectorTableAllCell);

    $(tagSelectorSelectAllLink).click(function () {
        tagManager.SetAllPhotosVisible();
        $(".TagMenuControlTagListItemDisabled").switchClass("TagMenuControlTagListItemDisabled", "TagMenuControlTagListItemEnabled", 300);
    });

    // Build the select none link
    var tagSelectorTableNoneCell = document.createElement('td');
    tagSelectorTableNoneCell.style.textAlign = "right";
    var tagSelectorSelectNoneLink = document.createElement('span');
    tagSelectorSelectNoneLink.innerText = "Select None";
    tagSelectorSelectNoneLink.style.cursor = "pointer";
    tagSelectorTableNoneCell.appendChild(tagSelectorSelectNoneLink);
    tagSelectorTableRow.appendChild(tagSelectorTableNoneCell);

    $(tagSelectorSelectNoneLink).click(function () {
        tagManager.SetAllPhotosNotVisible();
        $(".TagMenuControlTagListItemEnabled").switchClass("TagMenuControlTagListItemEnabled", "TagMenuControlTagListItemDisabled", 300);
    });

    // Add the table
    tagSelectorTable.appendChild(tagSelectorTableRow);
    tagSelectorDiv.appendChild(tagSelectorTable);
    containerDiv.appendChild(tagSelectorDiv);

    // Process the photo tags
    var tagsAndCounts = tagManager.GetTagAndPhotoCountSorted();

    // Build up the tag list
    var tagListContainerDiv = document.createElement('div');
    tagListContainerDiv.classList.add("TagMenuControlTagListContainer");
    containerDiv.appendChild(tagListContainerDiv);

    // Add tags to the list
    for (var i = 0; i < tagsAndCounts.length; i++) {
        var listElement = document.createElement('div');
        listElement.classList.add("TagMenuControlTagListItem");
        listElement.classList.add("TagMenuControlTagListItemEnabled");
        listElement.id = "TagListItem" + tagsAndCounts[i].GetTag();
        
        // Build up a table for the contents
        var table = document.createElement('table');
        table.classList.add("TagMenuControlTagListTable");

        var tableRow = document.createElement('tr');
        var tableCell1 = document.createElement('td');
        tableCell1.classList.add("TagMenuControlTagListTableLeftCell");
        tableCell1.innerText = tagsAndCounts[i].GetTag();

        var tableCell2 = document.createElement('td');
        tableCell2.classList.add("TagMenuControlTagListTableRightCell");
        tableCell2.innerText = tagsAndCounts[i].GetCount();

        // Wire up click
        $(listElement).click(this.TagListItemClicked);

        // Store the tag in the div for future use
        $(listElement).data("tagName", tagsAndCounts[i].GetTag());

        tableRow.appendChild(tableCell1);
        tableRow.appendChild(tableCell2);
        table.appendChild(tableRow)
        listElement.appendChild(table);

        tagListContainerDiv.appendChild(listElement);
    }

    return containerDiv;
}

TagMenuControl.prototype.TagListItemClicked = function () {
    // Disable a tag
    if ($(this).hasClass("TagMenuControlTagListItemEnabled")) {
        $(this).switchClass("TagMenuControlTagListItemEnabled", "TagMenuControlTagListItemDisabled", 300);
        tagManager.FilterTag($(this).data("tagName"), false);
    }
    // Enable a tag
    else {
        $(this).switchClass("TagMenuControlTagListItemDisabled", "TagMenuControlTagListItemEnabled", 300);
        tagManager.FilterTag($(this).data("tagName"), true);
    }
}