/// <reference path="jquery/jquery-3.0.0.js" />

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

        $.getJSON('../dataaccess/getphotos.php', function (data) {
            $.each(data, function (key, val) {
                photos.push(new Photo(val.filename, parseFloat(val.latitude), parseFloat(val.longitude)));
            });

            photoManager.CalculatePhotoDistances();
            photoManager.Clusters = photoManager.Cluster();

            // Clear any markers
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }

            markers = [];

            for (var i = 0; i < photoManager.Clusters.length; i++) {
                var position = { lat: photoManager.Clusters[i].GetLatitude(), lng: photoManager.Clusters[i].GetLongitude() };
                var name = "Cluster " + i;

                var marker = new google.maps.Marker({
                    position: position,
                    map: map,
                });

                var clusterPhotos = photoManager.Clusters[i].GetPhotos();

                // Single photo case
                if (clusterPhotos.length == 1) {
                    marker.type = 'photo';
                    marker.setTitle(clusterPhotos[0].GetFilename());
                    marker.id = i

                    marker.addListener('click', function () {
                        var photoViewer = new PhotoViewer(PhotoViewer.Type.SINGLE, photoManager.Clusters[this.id].GetPhotos());
                        photoViewer.LoadFirstPhoto();
                        photoViewer.ShowPhoto(true);
                        photoManager.PhotoViewer = photoViewer;
                    });
                }

                else {
                    marker.type = 'cluster';
                    marker.id = i;

                    marker.addListener('click', function () {
                        var photoViewer = new PhotoViewer(PhotoViewer.Type.CLUSTER, photoManager.Clusters[this.id].GetPhotos());
                        photoViewer.LoadFirstPhoto();
                        photoViewer.ShowPhoto(true);
                        photoManager.PhotoViewer = photoViewer;
                    });
                }

                markers.push(marker);
            }

            //for (var i = 0; i < photos.length; i++) {
            //    var position = {};
            //    position['lat'] = photos[i].GetLatitude();
            //    position['lng'] = photos[i].GetLongitude();
            //    var fileName = photos[i].GetFilename();

            //    var marker = new google.maps.Marker({
            //        position: position,
            //        map: map,
            //        title: fileName
            //    });

            //    marker.addListener('click', function () {
            //        var photoViewer = new PhotoViewer(this.title);
            //        photoViewer.LoadPhoto();
            //        photoViewer.ShowPhoto(true);
            //        photoManager.PhotoViewer = photoViewer;
            //    });

            //    markers.push(marker);
            //}
        });

        
    });
}