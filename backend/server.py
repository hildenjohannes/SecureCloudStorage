from tornado import httpserver, websocket, web, ioloop

class SocketHandler(websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        pass

    def on_message(self, message):
        params = message.split("|")
        method = params.pop(0)
        if method == "login":
            self.write_message(str(self.login(params)))
        elif method == "upload":
            print(params[0])
            print(params[1])
        elif method == "listFiles":
            self.write_message(json) # TODO: get actual files
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
