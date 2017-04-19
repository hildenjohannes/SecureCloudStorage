import requests

#Add user
r = requests.post('http://owncloud:owncloud@localhost/owncloud/ocs/v1.php/cloud/users', data = {'userid':'hej', 'password':'hej2'})
