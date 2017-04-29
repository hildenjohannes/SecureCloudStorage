from database import Usermeta, Filemeta
try:
    Usermeta.create_table()
    user = Usermeta(fnamn='Test', enamn='Testsson', email='test@chalmers.se', pw='testpw')
    user.save()
    print("Table usermeta has been created and a test user has been inserted!(fnamn=Test enamn=Testsson email=test@chalmers.se)")
except:
    print("Something went wrong, check that the database exists: database = scsdb, user = scs, password = scs123")


try:
    Filemeta.create_table()
    Filemeta.addFile(["testfile",'100',Usermeta.filter(email="test@chalmers.se")])
    print("The filemeta table was successfully created! And a file was added, owned by Test Testsson")
except:
    print("Nope, did not work. Already created? Does the database exist?")
