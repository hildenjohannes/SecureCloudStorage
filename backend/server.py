from tornado import httpserver, websocket, web, ioloop

json = '["fakeFile0", "fakeFile1"]'
class SocketHandler(websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        self.authenticated = False

    def on_message(self, message):
        params = message.split("|")
        method = params.pop(0)

        if self.authenticated:
            self.handleCall(method, params)
        elif method == "login":
            self.write_message("login|" + str(self.login(params)))
        else:
            self.write_message("error|notAuthenticated")

    def on_close(self):
        self.authenticated = False

    def handleCall(self, method, params):
        if method == "upload":
            print(params[0])
            print(params[1])
        elif method == "listFiles":
            self.write_message("listFiles|" + json) # TODO: get actual files
        else:
            self.write_message("Invalid argument")

    def login(self, params):
        if params[0] != "test@chalmers.se":
            return False
        if params[1] != "qwerty":
            return False
        self.authenticated = True
        return True

app = web.Application([
    (r'/ws', SocketHandler),
])

if __name__ == '__main__':
    http_server = httpserver.HTTPServer(app)
    http_server.listen(5000)
    ioloop.IOLoop.instance().start()
