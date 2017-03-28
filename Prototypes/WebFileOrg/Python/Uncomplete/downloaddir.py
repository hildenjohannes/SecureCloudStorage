import owncloud

#NOT WORKING

oc = owncloud.Client('http://localhost/owncloud')

oc.login('owncloud','owncloud')

#Download file
oc.get_directory_as_zip('testdir/dir', 'directory')
