/// <reference path="jquery/jquery-3.0.0.js" />
var currFile;
var map;
var marker;

// Document loaded
$(document).ready(function () {
    
});

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 43.6775533333333, lng: 4.62713833333333 },
        zoom: 3,
        scaleControl: true,
        minZoom: 3,
        streetViewControl: false
    });

    // Wire up click listener to add a marker where the user clicks on the map
    map.addListener('click', function (e) {
        // Delete any old marker
        if (marker !== undefined) {
            marker.setMap(null);
        }

        marker = new google.maps.Marker({
            position: e.latLng,
            map: map
        });
    });
}

function popupMap() {
    // Only initialize the map once
    if (map === undefined) {
        initMap();
    }

    $('#mapholder').fadeIn(300);
}

function closeMap() {
    $('#mapholder').fadeOut(300);
}

function onDragOver(e) {
    // Prevent default handling
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

function onDrop(e) {
    // Prevent default handling
    e.stopPropagation();
    e.preventDefault();

    // For now, we will only use the first provided file
    // TODO: Support dropping of multiple files
    var file = e.dataTransfer.files[0];
    
    // Ensure that the provided file is an image
    if (!file.type.match('image.*')) {
        return;
    }

    // Read the file as a data URL
    var fileReader = new FileReader();

    // Define what happens when the file is read
    fileReader.onload = (function (f) {
        return function (e) {
            $('#photoholder').empty().html(['<img class="centered" src="' + e.target.result + '"/>']);
            currFile = file;
        };
    })(file);

    fileReader.readAsDataURL(file);

    // Now that a photo has been loaded, populate the details div with default values and show it
    $('#filename').val(file.name);
    $('#datetimetaken').val(new Date().toJSON().slice(0, 19));
    $('#photodetails').fadeIn(300);
}

function doValidation() {
    return $('#filename').val() != "" &&
           $('#tags').val() != "" &&
           $('#datetimetaken').val() != "" &&
           $('#locationstring').val() != "" &&
           marker !== undefined &&
           currFile !== undefined;
}

function doUpload() {
    // Validate input
    if (!doValidation()) {
        alert('Input invalid');
        return;
    }

    // Create a FormData object and fill it with provided values
    var formData = new FormData();
    formData.append('filename', $('#filename').val());
    formData.append('tags', $('#tags').val());
    formData.append('datetime', $('#datetimetaken').val());
    formData.append('locationstring', $('#locationstring').val());
    formData.append('lat', marker.position.lat());
    formData.append('lng', marker.position.lng());
    formData.append('file', currFile);

    jQuery.ajax({
        url: 'dataaccess/uploadphoto.php',
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function (data) {
            if (data == "success") {
                alert('Upload succeeded');
            }
            else {
                alert('Upload failed: ' + data);
            }
        }
    });
}

function clearForm() {
    // Clear all data (except the google map instance)
    $('#filename').val("");
    $('#tags').val("");
    $('#datetimetaken').val("");
    $('#locationstring').val("");

    if (marker !== undefined) {
        marker.setMap(null);
    }
}