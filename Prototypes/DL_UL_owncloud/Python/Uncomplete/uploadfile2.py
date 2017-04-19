
#Upload file
payload = {'file':'~/Documents/SecureCloudStorage/Prototypes/WebFileOrg/Python/text.txt'}
r = requests.put('http://owncloud:owncloud@localhost/owncloud/remote.php/webdav/testdir/text.txt', data = payload)
print(r.text)

print("done")

#test
#r = requests.put('http://owncloud:owncloud@localhost/owncloud/remote.php/webdav/testdir/text.txt', data = {'myfile':'testdir/remotefile.txt'})


#r = requests.get('http://owncloud:owncloud@localhost/owncloud/remote.php/webdav/testdir', data = {'myfile':'testdir/remotefile.txt'})

#print(r.text)
