from tornado import httpserver, websocket, web, ioloop
from tornadostreamform.multipart_streamer import MultiPartStreamer, StreamedPart, TemporaryFileStreamedPart
#import cgi
import json
#from requests_toolbelt.multipart import decoder

MB = 1024*1024
GB = 1024*MB
TB=1024*GB

MAX_BUFFER_SIZE = 1 * MB  # Max. size loaded into memory!
MAX_BODY_SIZE = 1 * MB  # Max. size loaded into memory!
MAX_STREAMED_SIZE = 1*GB # Max. size to be streamed

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

@web.stream_request_body
class StreamHandler(web.RequestHandler):
    def prepare(self):
        """Prepare is called after headers become available for the request."""
        global MAX_STREAMED_SIZE
        # If the request is authorized, then you can increase the default max_body_size by this call.
        if self.request.method.lower() == "post":
            self.request.connection.set_max_body_size(MAX_STREAMED_SIZE)
        # You can get the total request size from the headers.
        try:
            total = int(self.request.headers.get("Content-Length", "0"))
        except KeyError:
            total = 0  # For any well formed browser request, Content-Length should have a value.
        # And here you create a streamer that will accept incoming data
        self.ps = MultiPartStreamer(total)

    def data_received(self, chunk):
        """When a chunk of data is received, we forward it to the multipart streamer."""
        self.ps.data_received(chunk)

    def post(self):
        """post() or put() is called when all of the data has already arrived."""
        try:
            self.ps.data_complete() # You MUST call this to close the incoming stream.
            # Here can use self.ps to access the fields and the corresponding ``StreamedPart`` objects.
            for part in self.ps.parts:
                filepart = open(part.get_filename(), 'bw+')
                # Todo: get_payload() cant load more than the size of the ram...
                filepart.write(part.get_payload())
                filepart.close()
                #to examine the part:
                print("PART name=%s, filename=%s, size=%s" % (part.get_name(), part.get_filename(), part.get_size()))
                print("Data = %s" % (part.get_payload()))
                for hdr in part.headers:
                    print("\tHEADER name=%s" % hdr.get("name", "???"))
                    for key in sorted(hdr.keys()):
                        if key.lower() != "name":
                            print("\t\t\t%s=%s" % (key, hdr[key]))


        finally:
            # When ready, don't forget to release resources.
            self.ps.release_parts()
            self.finish() # And of course, you MUST call finish()

app = web.Application([
    (r'/ws', SocketHandler),
    (r'/upload', StreamHandler),
])

if __name__ == '__main__':
    http_server = httpserver.HTTPServer(app, max_body_size=MAX_BODY_SIZE, max_buffer_size=MAX_BUFFER_SIZE)
    http_server.listen(5000)
    ioloop.IOLoop.instance().start()
