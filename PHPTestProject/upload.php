<!doctype HTML>
<html>
<head>
    <title>Upload a Photo</title>
    <link rel="stylesheet" href="style/upload.css" />
</head>
<body>
    <div id="photoholder" ondrop="onDrop(event)" ondragover="onDragOver(event)"><p class="centered">Drag a photo here!</p></div>
    <div id="photodetails">
        <form>
            <input type="text" class="textbox" id="filename" name="filename" placeholder="filename.jpg" /><br />
            <input type="text" class="textbox" id="tags" name="tags" placeholder="tag1;tag2;tag3" /><br />
            <input type="datetime-local" class="textbox" id="datetimetaken" name="datetimetaken"/><br />
            <div id="locationbar">
                <input type="text" id="locationstring" name="locationstring" placeholder="Location Description" />
                <div id="locationbutton" onclick="popupMap()"></div>
            </div>
            <div id="buttons">
                <input type="button" id="upload" value="Upload" onclick="doUpload()"/>
                <input type="button" id="clear" value="Clear" onclick="clearForm()" />
            </div>
        </form>
    </div>
    <div id="mapholder">
        <div id="maptoolbar"><span id="maptoolbarclose" onclick="closeMap()">X</span></div>
        <div id="map"></div>
    </div>
    <script src="script/jquery/jquery-3.0.0.js"></script>
    <script src="script/upload.js"></script>
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD1vK0IbVjCnwIH-Qjnb6deC6EDktJPrWI" async defer></script>
</body>
</html>