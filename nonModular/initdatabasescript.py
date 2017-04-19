from database import Usermeta

try:
    Usermeta.create_table()
    user = Usermeta(fnamn='Test', enamn='Testsson', email='test@chalmers.se', pw='testpw')
    user.save()
    print("Table usermeta has been created and a test row has been inserted!")
except:
    print("Something went wrong, check that the database exists: database = scsdb, user = scs, password = scs123")
