from tornado import httpserver, websocket, web, ioloop
import cgi
#from requests_toolbelt.multipart import decoder

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
        form = cgi.FieldStorage()
        value1 = form.getfirst("qwe", "")
        data = self.request.body
        print(value1)
        #multipart_data = decoder.MultipartDecoder.from_response(self)

        #self.flush()
        # for part in multipart_data.parts:
        #     print(part.content)  # Alternatively, part.text if you want unicode
        #     print(part.headers)
        #self.write("Ok")





app = web.Application([
    (r'/ws', SocketHandler),
    (r'/upload', UploadHandler),
])

if __name__ == '__main__':
    http_server = httpserver.HTTPServer(app)
    http_server.listen(5000)
    ioloop.IOLoop.instance().start()
