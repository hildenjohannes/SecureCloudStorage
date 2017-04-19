import owncloud

oc = owncloud.Client('http://localhost/owncloud')

oc.login('user1','user1')

oc.put_file('testdir/remotefile.txt', 'text.txt')
#oc.list_files('testdir')
#oc.get_dir('testdir')
