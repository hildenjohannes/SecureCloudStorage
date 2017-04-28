from tornado import httpserver, websocket, web, ioloop
from database import Usermeta, Filemeta
json='["fakeFile0", "fakeFile1"]'
class SocketHandler(websocket.WebSocketHandler):
    user = ""
    def check_origin(self, origin):
        return True

    def open(self):
        pass

    def on_message(self, message):
        global user
        params = message.split("|")
        method = params.pop(0)
        if method == "login":
            #self.write_message(str(self.login(params)))
            if (Usermeta.userLogin(params)):
                user = params[0]
                print(user)
                self.write_message('True')

        elif method == "upload":
            print("wooohoo UPLOAD")
            filee = open(params[0], 'w+')
            filee.write(params[1])
            if Filemeta.addFile([params[0],'100',Usermeta.filter(email=user)]):
                print("filemeta added!")
            #print(params[0])
            #print(params[1])
        elif method == "register":
            self.write_message(str(Usermeta.userRegister(params)))
        elif method == "listFiles":
            mes='['
            for userr in Usermeta.filter(email=user):
                for filee in userr.files:
                    mes = mes + '"' + str(filee.name) + '",'

            mes = mes[:-1] + ']'
            print(mes)
            self.write_message(mes) # TODO: get actual files
            mes=''
        else:
            self.write_message("Invalid argument")

    def on_close(self):
        pass

    def login(self, params):
        if params[0] != "test@chalmers.se":
            return False
        if params[1] != "qwerty":
            return False
        return True

app = web.Application([
    (r'/ws', SocketHandler),
])

if __name__ == '__main__':
    http_server = httpserver.HTTPServer(app)
    http_server.listen(5000)
    ioloop.IOLoop.instance().start()
