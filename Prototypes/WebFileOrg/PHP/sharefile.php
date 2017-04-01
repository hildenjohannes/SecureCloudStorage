<!DOCTYPE html>
<body>
<pre>
<?php

 // Login Credentials as Admin
 $ownAdminname = 'owncloud';
 $ownAdminpassword = 'owncloud';

// Add data, to owncloud post array and then Send the http request for creating a new user
$url = 'http://' . $ownAdminname . ':' . $ownAdminpassword . '@localhost/owncloud/ocs/v1.php/cloud/shares';

$owncloudShareArr = array('path' => $userName, 'shareType' => $RRpassword, 'shareWith' => $RRpassword,
  'publicUpload' => $RRpassword, 'password' => $RRpassword, 'permissions' => $RRpassword);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $owncloudShareArr);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$data = curl_exec($ch);
curl_close($ch);

echo "Response from curl :" . $data
?>
</pre>
</body>
</html>
