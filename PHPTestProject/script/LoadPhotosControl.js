function LoadPhotosControl(controlDiv, map) {
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to load photos';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Load Photos';
    controlUI.appendChild(controlText);

    // Setup the click event listener
    controlUI.addEventListener('click', function () {
        photos = [];
        photos.push(new Photo("P3142088.jpg", 43.6775533333333, 4.62713833333333));
        photos.push(new Photo("P3142126.jpg", 43.106345, 2.97561666666667));
        photos.push(new Photo("P3172228.jpg", 41.3850533333333, 2.17288833333333));
        photos.push(new Photo("P3222334.jpg", 37.1773466666667, -3.59853666666667));

        for (var i = 0; i < photos.length; i++) {
            var position = {};
            position['lat'] = photos[i].GetLatitude();
            position['lng'] = photos[i].GetLongitude();
            var fileName = photos[i].GetFilename();

            var marker = new google.maps.Marker({
                position: position,
                map: map,
                title: fileName
            });

            marker.addListener('click', function () {
                var photoViewerDiv = document.createElement('div');
                var photoViewer = new PhotoViewer(photoViewerDiv, this.title);
            });

            markers.push(marker);
        }
    });
}