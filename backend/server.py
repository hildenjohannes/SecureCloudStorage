from tornado import httpserver, websocket, web, ioloop

from database import Usermeta, Filemeta
json='["fakeFile0", "fakeFile1"]'
class SocketHandler(websocket.WebSocketHandler):
    user = ""
    def check_origin(self, origin):
        return True

    def open(self):
        self.authenticated = False

    def on_message(self, message):
        global user
        params = message.split("|")
        method = params.pop(0)

        if self.authenticated:
            self.handleCall(method, params)
        elif method == "login":
            self.write_message("login|" + str(self.login(params)))
        elif method == "register":
            self.write_message("register|" + str(self.register(params)))
        else:
            self.write_message("error|notAuthenticated")

    def on_close(self):
        self.authenticated = False

    def handleCall(self, method, params):
        global user
        if method == "upload":
            print("wooohoo UPLOAD")
            filee = open(params[0], 'w+')
            filee.write(params[1])
            if Filemeta.addFile([params[0],'100',Usermeta.filter(email=user)]):
                print("filemeta added!")
            print(params[0])
            print(params[1])
            self.handleCall("listFiles", [])
        elif method == "listFiles":
            mes='['
            for userr in Usermeta.filter(email=user):
                for filee in userr.files:
                    mes = mes + '"' + str(filee.name) + '",'
            if len(mes)>1:
                mes = mes[:-1]
            mes = mes + ']'
            print(mes)
            self.write_message("listFiles|" + mes)
        else:
            self.write_message("Invalid argument")

    def login(self, params):
        if Usermeta.userLogin(params):
            self.authenticated = True
            global user
            user=params[0]
            return True
        else:
            return False
    def register(self, params):
        if Usermeta.userRegister(params):
            self.authenticated = True
            global user
            self.user=params[2]
            return True
        else:
            return False

app = web.Application([
    (r'/ws', SocketHandler),
])

if __name__ == '__main__':
    http_server = httpserver.HTTPServer(app)
    http_server.listen(5000)
    ioloop.IOLoop.instance().start()
