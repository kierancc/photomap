<?php

require_once("../config/database.php");

mysql_select_db('kieran8_photos', $link) or die('Cannot select the DB');

$query = "SELECT * FROM photos";
$result = mysql_query($query, $link) or die('Query failed');
$photos = array();

if(mysql_num_rows($result)) {
	while($photo = mysql_fetch_assoc($result)) {
        array_push($photos, $photo);
	}
}

header('Content-type: application/json');
echo json_encode($photos);
@mysql_close($link);
?>