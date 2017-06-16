<?php

$startDate = strtotime( $_GET["start"] );
$endDate = strtotime( $_GET["end"] );

$stringStart = date( "d-M-Y", $startDate );
$stringEnd = date( "d-M-Y", $endDate );

$json = shell_exec( "java -jar blobwebhelper.jar -st $stringStart -en $stringEnd" );

$sessionID = uniqid($more_entropy = true);
echo $sessionID . " ";

echo $json;
?>
