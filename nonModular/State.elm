module State exposing (init, update, subscriptions)

import Types exposing (..)

import FileReader exposing (..)
import Http exposing (..)
import Json.Decode as Json exposing (..)
import WebSocket

init : (Model, Cmd Msg)
init =
  (
    { view = LoginView
    --Upload
    , uploadMsg = "Waiting..."
    , selected = []
    , contents = []
    --Login
    , email = ""
    , password = ""
    , loginMsg = ""
    , showFeedback = False
    --listFiles
    , files = []

    }, Cmd.none
    )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    ShowLogin ->
      ({model | view = LoginView}, Cmd.none)

    ShowUpload -> -- also lists files
      ({model | view = UploadView}, WebSocket.send "ws://localhost:5000/ws"
      ("listFiles|" ++ model.email))

    --Upload+
    Upload ->
      model ! List.map sendFileToServer model.selected

    FilesSelect fileInstances ->
      { model
      | selected = fileInstances
      , uploadMsg = "Something selected" } ! []

    PostResult (Ok msg) ->
      { model | uploadMsg = toString msg } ! []

    PostResult (Err err) ->
      { model | uploadMsg =  "Ok" } ! [] --toString err } ! []

    --Login
    Email email ->
      ({model | email = email, showFeedback = False}, Cmd.none)

    Password password ->
      ({model | password = password, showFeedback = False}, Cmd.none)

    Login ->
      ({model | showFeedback = True}, WebSocket.send "ws://localhost:5000/ws"
      ("login|" ++ model.email ++ "|" ++ model.password))

    Message message ->
      case message of
        "True" ->
          ({model | loginMsg = message, view = UploadView}, Cmd.none)
        "False"->
          ({model | loginMsg = message}, Cmd.none)
        _ ->
          (({model | files = (parseFiles message)}, Cmd.none))


    --Download

--decoder for json parser
--string : Decoder String

parseFiles : String -> List String
parseFiles s =  -- TODO result can retunera "error" och har nått gått fel... vi kompenserar inte för detta just nu
  let files = (decodeString (field "name" list string) s) in
  getStringList files
  --let files = decodeString (field "name" list string) s in
  --createList files

getStringList : (Result List String) -> (List String)
getStringList  = 

{- exemple json
- {
-   "name" = ["name1", "name2", "name3"],
-   "size" = [1, 3, 6]
- }
-}

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.batch
    [ WebSocket.listen "ws://localhost:5000/ws" Message ]

--Upload
sendFileToServer : NativeFile -> Cmd Msg
sendFileToServer buf =
  let
    body =
      Http.multipartBody
        [ FileReader.filePart "simtest" buf ]
  in
    Http.post "http://localhost:5000/upload" body Json.value
      |> Http.send PostResult
