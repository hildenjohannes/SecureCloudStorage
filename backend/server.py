from tornado import httpserver, websocket, web, ioloop
from database import Usermeta, Filemeta

class SocketHandler(websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        self.authenticated = False
        self.user = ""

    def on_message(self, message):
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
        self.user = ""

    def handleCall(self, method, params):
        if method == "upload":
            if self.writeFile(params[0], params[1]):
                self.write_message("listFiles|" + self.listFiles())
            else:
                self.write_message("error|fileNotSaved")
        elif method == "download":
            a = self.readFile(params[0])
            self.write_message("download|" + params[0] + "|" + a)
        elif method == "listFiles":
            self.write_message("listFiles|" + self.listFiles())
        elif method == "logout":
            self.write_message("logout|" + self.logout())
        else:
            self.write_message("Invalid argument")

    def writeFile(self, filename, content):
        filee = open(filename, 'w+')
        filee.write(content)
        return Filemeta.addFile([filename, '100', Usermeta.filter(email = self.user)])
    def readFile(self, filename):
        print("hallo eller")
        with open(filename) as f: s = f.read()
        print(str(s))
        print(filename)
        return s
    def listFiles(self):
        mes='['
        for userr in Usermeta.filter(email = self.user):
            for filee in userr.files:
                mes = mes + '"' + str(filee.name) + '",'
        if len(mes)>1:
            mes = mes[:-1]
        mes = mes + ']'
        return mes

    def login(self, params):
        if Usermeta.userLogin(params):
            self.authenticated = True
            self.user = params[0]
        return self.authenticated
    def logout(self):
        self.authenticated = False
        self.user = ""
        return "True"
    def register(self, params):
        if Usermeta.userRegister(params):
            self.authenticated = True
            self.user=params[2]
        return self.authenticated

app = web.Application([
    (r'/ws', SocketHandler),
])

if __name__ == '__main__':
    http_server = httpserver.HTTPServer(app)
    http_server.listen(5000)
    ioloop.IOLoop.instance().start()
