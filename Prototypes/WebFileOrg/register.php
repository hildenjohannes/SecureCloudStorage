<!DOCTYPE html>

<body>
<pre>
<?php
//echo "Begun processing credentials , first it will be stored in local variables" . "<br/>";

// Loading into local variables
$userName = $_POST['username'];
$RRpassword = $_POST['password'];

echo "Hello " . $userName . "<br/>";
echo "Your password is " . $RRpassword . "<br/>";

 // Login Credentials as Admin
 $ownAdminname = 'owncloud';
 $ownAdminpassword = 'owncloud';

// Add data, to owncloud post array and then Send the http request for creating a new user
$url = 'http://' . $ownAdminname . ':' . $ownAdminpassword . '@localhost/owncloud/ocs/v1.php/cloud/users';

$ownCloudPOSTArray = array('userid' => $userName, 'password' => $RRpassword );
/*
$options = array(
    'http' => array(
      //  'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($ownCloudPOSTArray)
    )
);
$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
if ($result === FALSE) {  }

var_dump($result);
*/

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $ownCloudPOSTArray);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
echo "Response from curl :" . $response;
echo "<br/>Created a new user in owncloud<br/>";

?>
</pre>
</body>
</html>
