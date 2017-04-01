import requests

#Get all users
r = requests.get('http://owncloud:owncloud@localhost/owncloud/ocs/v1.php/cloud/users')
