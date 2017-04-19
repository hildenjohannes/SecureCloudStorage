import requests

#Get all shares
r = requests.get('http://owncloud:owncloud@localhost/owncloud/ocs/v1.php/apps/files_sharing/api/v1/shares')
