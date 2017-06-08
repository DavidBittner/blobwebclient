<?php
$file = fopen("../out.json", "r" ) or die("Unable to open file");
echo fread($file,filesize("../out.json"));
fclose();
?>
