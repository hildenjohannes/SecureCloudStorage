port module Ports exposing (..)

import Types exposing (..)

port encrypt : String -> Cmd msg
port encrypted : (String -> msg) -> Sub msg
port decrypt : String -> Cmd msg
port decrypted : (String -> msg) -> Sub msg
port fileSelected : String -> Cmd msg
port fileRead : (FileData -> msg) -> Sub msg
