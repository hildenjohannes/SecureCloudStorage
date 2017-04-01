from peewee import *

db = MySQLDatabase('scsdb', user='scs',passwd='scs123')

class BaseModel(Model):
    class Meta:
        database=db

class Usermeta(BaseModel):
    fnamn = CharField(max_length=20)
    enamn = CharField(max_length=20)
    email = CharField(unique=True, max_length=50)
    pw    = CharField(max_length=50)

    def userLogin(u_email,u_pw):
        for auth in Usermeta.filter(email=u_email):
            if auth.pw == u_pw:
                return True
            else:
                return False
    def userRegister(fn, en, em, lo):
        #todo: check so that email isn't already taken.
        user=Usermeta(fnamn=fn, enamn=en, email=em, pw=lo)
        user.save()

#Usermeta.create_table()
#user = Usermeta(fnamn='Test', enamn='Testsson', email='test@chalmers.se', pw='testpw')
#user.save()

for user in Usermeta.filter(email="test@chalmers.se"):
    print (user.fnamn)

#Usermeta.userRegister("Rasmus","Johansson","rasmus@chalmers.se", "rasmus")
a = Usermeta.userLogin("rasmus@chalmers.se","rasmus")
print (a)

#class Userfiles(BaseModel)
#
# class Teams(BaseModel):
#
#
# class Filemeta(BaseModel):
#     name=CharField(max_length=50)
#     owner=ForeignKeyField(Usermeta)
#     sharedWith=ForeignKeyField(Usermeta, related_name='sharedwith')
