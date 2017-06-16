<?php

$seshID = $_GET["sessionid"];
$keys = $_GET["keylist"];

echo shell_exec("java -jar blobwebhelper.jar -keys $keys -sessionid $seshID");

$zipName = $seshID . ".zip";
echo shell_exec("zip -r $zipName $seshID/*");

header("Content-type: application/zip"); 
header("Content-Disposition: attachment; filename=exports.zip");
header("Content-length: " . filesize($zipName));
header("Pragma: no-cache"); 
header("Expires: 0"); 
readfile("$zipName");
?>
