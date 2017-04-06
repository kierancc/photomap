<!DOCTYPE html>
<html>
<head>
    <title>Photo Map</title>
    <style>
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }

        #pageContainer {
            height: 100%;
            display: flex;
            flex-flow: column;
        }

        #toolbar {
            flex: 0 0 40px;
        }

        #mainContainer {
            flex: 1 1 auto;
            height: 100%;
            display: flex;
            flex-flow: row;
        }

        #map {
            flex: 1 1 auto;
        }

        #sidebar {
            flex: 0 1 200px;
        }

        #modalpane {
            height: 100%;
            width: 100%;
            opacity: 0.7;
            background-color: black;
            display: none;
            z-index: 1;
        }

        #loadingpane {
            height: 100%;
            width: 100%;
            opacity: 0.7;
            background-color: black;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            z-index: 2;
        }

        #loadingpane img {
            
        }

        #photodiv {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2;
            display: none;
        }
    </style>
    <link rel="stylesheet" href="style/jquery-ui.min.css" />
    <link rel="stylesheet" href="style/TagMenuControl.css" />
    <link rel="stylesheet" href="style/PhotoDetailControl.css" />
    <link rel="stylesheet" href="style/PhotoViewer.css" />
    <link rel="stylesheet" href="style/Sidebar.css" />
    <link rel="stylesheet" href="style/TopToolbar.css" />
    <script src="script/jquery/jquery-3.0.0.js"></script>
    <script src="script/jquery/jquery-ui.js"></script>
    <script src="script/TagMenuControl.js"></script>
    <script src="script/Photo.js"></script>
    <script src="script/PhotoDetailControl.js"></script>
    <script src="script/PhotoManager.js"></script>
    <script src="script/PhotoViewer.js"></script>
    <script src="script/Sidebar.js"></script>
    <script src="script/TagManager.js"></script>
    <script src="script/TopToolbar.js"></script>
</head>
<body>
    <div id="pageContainer">
        <div id="toolbar"></div>
        <div id="mainContainer">
            <div id="map"></div>
            <div id="sidebar"></div>
        </div>       
    </div>
    <?php
    if(array_key_exists("testMode", $_GET) && $_GET["testMode"] == "true")
    {
        echo "<script>var testMode = true;</script>";
    }
    else
    {
        echo "<script>var testMode = false;</script>";
    }
    ?>
    <script language="javascript">
        var photoManager = new PhotoManager();
        var tagManager = new TagManager();
        
        var map; // The global map object
        function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 43.6775533333333, lng: 4.62713833333333 },
                zoom: 3,
                scaleControl: true,
                minZoom: 3,
                streetViewControl: false
            });

            map.addListener('zoom_changed', function () {
                photoManager.ClearAllMarkers(true);
                photoManager.CreateMarkers();
            });

            // Append the modal pane on top of the map so that it will block interaction when shown
            var modalPane = document.createElement("div");
            modalPane.id = "modalpane";
            document.getElementById('map').appendChild(modalPane);

            // Append the photo viewer div on top of the modal pane so that it will show over it
            var photoDiv = document.createElement("div");
            photoDiv.id = "photodiv";
            photoDiv.tabindex = 1;
            document.getElementById('map').appendChild(photoDiv);

            // Append the loading div on top of everything
            var loadingPane = document.createElement("div");
            loadingPane.id = "loadingpane";
            $(loadingPane).html("<img src=\"images/circle_loader.gif\">");
            document.getElementById('map').appendChild(loadingPane);
            $(loadingPane).show();
        }

        $(document).ready(function () {
            // Initialize and show the top toolbar
            topToolbar.setParent(document.getElementById('toolbar'));
            topToolbar.show();

            // Initialize and show the sidebar
            sidebar.setParent(document.getElementById('sidebar'));
            sidebar.createWidget();
            sidebar.show();

            $.when(photoManager.LoadPhotos(testMode))
                .done(function () {
                    // Performance marker
                    window.performance.mark("mark_end_LoadPhotos");

                    // Initialize and register the tagMenuControl
                    tagMenuControl.initialize();
                    sidebar.registerControl(tagMenuControl);

                    // Register the photoDetailControl
                    sidebar.registerControl(photoDetailControl);

                    $.when(photoManager.CalculatePhotoDistances())
                        .done(function () {
                            photoManager.SetupForCluster();

                            $.when(photoManager.DoCluster())
                                .done(function () {
                                    photoManager.CreateMarkers();

                                    $('#loadingpane').remove();
                                });
                        });
                })
                .fail(function() {
                    alert('Failed to load photos!');
                });

            // Bind custom event handlers
            $(document).on("TagManager:VisiblePhotosUpdated", photoManager.OnVisiblePhotosUpdated);
        });
    </script>
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD1vK0IbVjCnwIH-Qjnb6deC6EDktJPrWI&callback=initMap"
            async defer>

    </script>
</body>
</html>