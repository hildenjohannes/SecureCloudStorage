from tornado import httpserver, websocket, web, ioloop
import json

class UploadHandler(web.RequestHandler):
    def post(self):
        data = self.request.body
        #self.set_status(200)
        self.write(json.dumps(default=json_util.default))
        #self.flush()
        self.finish()

        # data = self.get_argument("body")
        # data = tornado.escape.json_decode(self.request.body)
        print(data)

app = web.Application([
    (r'/upload', UploadHandler),
])

if __name__ == '__main__':
    http_server = httpserver.HTTPServer(app)
    http_server.listen(8001)
    ioloop.IOLoop.instance().start()
