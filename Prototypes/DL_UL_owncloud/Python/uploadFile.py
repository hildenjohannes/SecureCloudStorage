import owncloud

#Takes file source as input
file_source = raw_input("Please enter the file source of the file you want to upload: ")

#The targeted owncloud client
oc = owncloud.Client('http://localhost/owncloud')

#The tageted accounts username and password
oc.login('user1','password1')

#Sets the target remote directory
remote_target = 'testdir/'
#Takes file name out of the file_source variable
_, file_name = file_source.rsplit('/', 1)
#Appends the file name to the target dir
remote_target += file_name

#Upload file
oc.put_file(remote_target, file_source)
