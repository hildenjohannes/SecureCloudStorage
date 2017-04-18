from database import Usermeta
Usermeta.create_table()
user = Usermeta(fnamn='Test', enamn='Testsson', email='test@chalmers.se', pw='testpw')
user.save()
