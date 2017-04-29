to get the database to work you need to first install mysql-server:
sudo apt-get install mysql-server
if any packages are missing just install whateever is missing.

give a password to root user as prompted during installation. remember this.

When insalled, enter mysql with command:
mysql -u root -p
then enter password for root when prompted.

now create a new user with commands:

CREATE USER 'scs'@'localhost' IDENTIFIED BY 'scs123';

GRANT ALL PRIVILEGES ON *.* TO 'scs'@'localhost' WITH GRANT OPTION;

Now a user, scs, with password scs123 is created.
 
Now install PyMySQL which is a interface between python and mysql:
sudo pip3 install PyMySQL

now install peewee which is a pythonpackage for controlling mysql queries:
sudo pip3 install peewee

Run the initdatabasescript.py script. If everything works it should say that a usermeta table and a filemeta table is created.
