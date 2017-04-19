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

    def userLogin(params):
        for auth in Usermeta.filter(email=params[0]):
            if auth.pw == params[1]:
                return True
            else:
                return False
        return False
    def userRegister(params):
        #todo: check so that email isn't already taken.
        try:
            with db.atomic():
                Usermeta.create(fnamn=params[0], enamn=params[1], email=params[2], pw=params[3])
        except peewee.IntegrityError:
                return False
        return True



#Usermeta.create_table()
#user = Usermeta(fnamn='Test', enamn='Testsson', email='test@chalmers.se', pw='testpw')
#user.save()

# for user in Usermeta.filter(email="test@chalmers.se"):
#     print (user.fnamn)
#
# #Usermeta.userRegister("Rasmus","Johansson","rasmus@chalmers.se", "rasmus")
# a = Usermeta.userLogin("rasmus@chalmers.se","rasmus")
# print (a)

#class Userfiles(BaseModel)
#
# class Teams(BaseModel):
#
#
class Filemeta(BaseModel):
    name=CharField(max_length=50)
    size=CharField(max_length=20)
    owner=ForeignKeyField(Usermeta, related_name='files')

    def addFile(params):
        try:
            with db.atomic():
                Filemeta.create(name=params[0],size=params[1],owner=params[2])
                return True
        except peewee.IntegrityError:
            return False
        return False
