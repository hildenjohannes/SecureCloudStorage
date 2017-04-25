port module Ports exposing (..)

port encrypt : String -> Cmd msg
port decrypt : String -> Cmd msg

port encrypted : (String -> msg) -> Sub msg
port decrypted : (String -> msg) -> Sub msg
