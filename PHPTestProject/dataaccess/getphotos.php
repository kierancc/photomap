<?php

require_once("../config/database.php");

mysql_select_db('kieran8_photos', $link) or die('Cannot select the DB');

$query = "";
if (array_key_exists("testMode", $_GET) && $_GET["testMode"] == true)
{
    $query = "SELECT * FROM photos_TEST";
}
else
{
    $query = "SELECT * FROM photos";
}

$result = mysql_query($query, $link) or die('Query failed');
$photos = array();

if(mysql_num_rows($result)) {
	while($photo = mysql_fetch_assoc($result)) {

        // Clean any invalid characters from the location string
        // TODO: Figure out why we sometimes get invalid characters here
        $photo["locationstring"] = iconv('ASCII', 'UTF-8//IGNORE', $photo["locationstring"]);
        array_push($photos, $photo);
	}
}

header('Content-type: application/json');
echo json_encode($photos);
@mysql_close($link);
?>