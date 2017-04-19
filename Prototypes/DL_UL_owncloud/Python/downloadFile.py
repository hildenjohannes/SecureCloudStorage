import owncloud

#Takes file name as input
#Currently targeted at the testdir remote directory on owncloud
file_name = raw_input("Please enter the name of the file you want to download: ")

#The tageted owncloud client
oc = owncloud.Client('http://localhost/owncloud')

#The targeted accounts username and password
oc.login('user1','password1')

#Appends filename to remote file and target dir
remote_file = 'testdir/'
remote_file += file_name

target_dir = '/home/johannes/Downloads/'
target_dir += file_name

#Download file
oc.get_file(remote_file, target_dir)
