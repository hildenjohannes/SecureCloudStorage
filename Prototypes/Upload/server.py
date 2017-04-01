from tornado import httpserver, websocket, web, ioloop

class SocketHandler(websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        pass

    def on_message(self, message):
        if message == "test@chalmers.se|qwerty":
            self.write_message("ok")
        else:
            self.write_message("wrong")

    def on_close(self):
        pass


class UploadHandler(web.RequestHandler):
    def post(self):
        data = self.request.body
        self.write("ok")
        self.flush()
        #self.write_message("tjillevippen")
        print(data)




app = web.Application([
    (r'/ws', SocketHandler),
    (r'/upload', UploadHandler),
])

if __name__ == '__main__':
    http_server = httpserver.HTTPServer(app)
    http_server.listen(5000)
    ioloop.IOLoop.instance().start()
