<?php

require_once("../config/database_write.php");

$targetDirectory = "../photos/";
$targetFile = $targetDirectory . basename($_FILES["file"]["name"]);
$imageType = pathinfo($targetFile, PATHINFO_EXTENSION);

// Check if the uploaded file is actually an image
$imageSize = getimagesize($_FILES["file"]["tmp_name"]);

if ($imageSize == false) {
    die("Provided file not an image");
}

// Check if file already exists
if (file_exists($targetFile)) {
    die("File already exists");
}

if (!move_uploaded_file($_FILES["file"]["tmp_name"], $targetFile)) {
    die("Failed to copy uploaded file");
}

// Update the database
mysql_select_db('kieran8_photos', $link) or die('Cannot select the DB');

$updateQuery = "INSERT INTO photos (filename, datetaken, latitude, longitude, locationstring, tagsstring, public)";
$updateQuery = $updateQuery . " VALUES ('" . $_POST["filename"] . "','" . $_POST["datetime"] . "'," . $_POST["lat"] . "," . $_POST["lng"] . ",'" . $_POST["locationstring"] ."','" . $_POST["tags"] . "',1)";
$updateQuery = stripslashes($updateQuery);

$result = mysql_query($updateQuery, $link) or die ("Could not update database: " . mysql_error());

echo "success";

?>