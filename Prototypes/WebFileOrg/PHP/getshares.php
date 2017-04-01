<!DOCTYPE html>
<body>
<pre>
<?php

 // Login Credentials as Admin
 $ownAdminname = 'owncloud';
 $ownAdminpassword = 'owncloud';

// Add data, to owncloud post array and then Send the http request for creating a new user
$url = 'http://' . $ownAdminname . ':' . $ownAdminpassword . '@localhost/owncloud/ocs/v1.php/cloud/shares';
//echo "Created URL is " . $url . "<br/>";
//$ownCloudPOSTArray = array('userid' => $userName, 'password' => $RRpassword );

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$data = curl_exec($ch);
curl_close($ch);

echo "Response from curl :" . $data
?>
</pre>
</body>
</html>
