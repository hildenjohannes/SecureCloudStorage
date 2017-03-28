import owncloud

#Takes dir name as input
#Targeted at the toplevel dir in owncloud
dir_name = raw_input("Please enter a directory name: ")


#The targeted owncloud client
oc = owncloud.Client('http://localhost/owncloud')

#The tageted accounts username and password
oc.login('user1','password1')

#Create new dir with given name
oc.mkdir(dir_name)
