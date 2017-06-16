<?php

function recursiveRemoveDirectory($directory)
{
    foreach(glob("{$directory}/*") as $file)
    {
        if(is_dir($file)) { 
            recursiveRemoveDirectory($file);
        } else {
            unlink($file);
        }
    }
    rmdir($directory);
}

$seshID = $_GET["sessionid"];
$keys = $_GET["keylist"];

shell_exec("java -jar blobwebhelper.jar -keys $keys -sessionid $seshID");

$zipName = $seshID . ".zip";
shell_exec("zip -r $zipName $seshID/*");

header('Content-Type: application/zip');
header("Content-Disposition: attachment; filename = exports.zip");
header('Content-Length: ' . filesize($zipName));
header('Content-Transfer-Encoding: binary');

$handle = fopen($zipName, 'rb'); 
$buffer = ''; 
while (!feof($handle)) { 
    $buffer = fread($handle, 4096); 
    echo $buffer; 
    ob_flush(); 
    flush(); 
} 
fclose($handle); 

unlink($zipName);
recursiveRemoveDirectory($seshID);
?>
