<!DOCTYPE html>
<html>
<head>
    <title>Test Map</title>
    <style>
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
        }

        #map {
            height: 100%;
        }
        #modalpane {
            position: absolute;
            top: 0px;
            left: 0px;
            height: 100%;
            width: 100%;
            opacity: 0.7;
            background-color: grey;
            display: none;
            z-index: 1;
        }
        #photodiv {
            position: absolute;
            top: 50%;
            left: 50%;
            margin-right: -50%;
            transform: translate(-50%, -50%);
            z-index: 2;
        }
    </style>
    <link rel="stylesheet" href="style/PhotoViewer.css" />
    <script src="script/Photo.js"></script>
    <script src="script/LoadPhotosControl.js"></script>
    <script src="script/PhotoManager.js"></script>
    <script src="script/PhotoViewer.js"></script>
    <script src="script/jquery/jquery-3.0.0.js"></script>
    <script src="script/jquery/jquery-ui.js"></script>
</head>
<body>
    <div id="map"></div>
    <script>
        var photos = new Array();
        var markers = new Array();
        var photoManager = new PhotoManager();
        
        var map;
        function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 43.6775533333333, lng: 4.62713833333333 },
                zoom: 3,
                scaleControl: true
            });

            var loadPhotosControlDiv = document.createElement('div');
            var loadPhotosControl = new LoadPhotosControl(loadPhotosControlDiv, map);
            
            loadPhotosControlDiv.index = 1;
            map.controls[google.maps.ControlPosition.TOP_CENTER].push(loadPhotosControlDiv);
        }

        $(window).resize(function () {
            //TODO: Fix this so that it works again
            // Resize any photoviewer
            if (photoManager.PhotoViewer != null) {
                photoManager.PhotoViewer.LoadPhoto();
                photoManager.PhotoViewer.ShowPhoto(false);
            }
        });
    </script>
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD1vK0IbVjCnwIH-Qjnb6deC6EDktJPrWI&callback=initMap"
            async defer>

    </script>
    <div id="modalpane"></div>
    <div id="photodiv"></div>
</body>
</html>