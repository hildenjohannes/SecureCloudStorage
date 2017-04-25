module State exposing (init, update, subscriptions)

import Types exposing (..)
import Ports exposing (..)

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
    --Encryption
    , encrypted = ""
    , decrypted = ""
    --Login
    , email = ""
    , password = ""
    , loginMsg = ""
    , showFeedback = False
    --listFiles
    --, files = []
    , files = ""

    }, Cmd.none
    )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    ShowLogin ->
      {model | view = LoginView} ! []

    ShowUpload ->
      ({model | view = TeamView}, WebSocket.send "ws://localhost:5000/ws"
      ("listFiles|"))

    --Upload+
    Upload ->
      model ! List.map sendFileToServer model.selected

    FilesSelect fileInstances ->
      { model
      | selected = fileInstances
      , uploadMsg = "Something selected" } ! []

    PostResult (Ok msg) ->
      ({ model | uploadMsg = toString msg, view = TeamView}, WebSocket.send "ws://localhost:5000/ws"
      ("listFiles|")) --! []

    PostResult (Err err) ->
      ({ model | uploadMsg =  "Ok",  view = TeamView}, WebSocket.send "ws://localhost:5000/ws"
      ("listFiles|")) --toString err } ! []

    --Encryption
    Encrypt ->
      model ! [ encrypt model.encrypted ]

    Encrypted encryptedWord ->
      {model | encrypted = encryptedWord} ! []

    Decrypt ->
      model ! [ decrypt model.encrypted ]

    Decrypted decryptedWord ->
      {model | decrypted = decryptedWord} ! []

    --Login
    Email email ->
      {model | email = email, showFeedback = False} ! []

    Password password ->
      {model | password = password, showFeedback = False} ! []

    Login ->
      {model | showFeedback = True} !
      [ WebSocket.send "ws://localhost:5000/ws"
      ("login|" ++ model.email ++ "|" ++ model.password)
      ]

    Message message ->
      case message of
        "True" ->
          ({model | loginMsg = message, view = TeamView}, Cmd.none)
        "False"->
          ({model | loginMsg = message}, Cmd.none)
        _ ->
          ({model | files = (parseFiles message)}, Cmd.none) --message}, Cmd.none)



    --Download

--decoder for json parser
--string : Decoder String

parseFiles : String -> {-List-} String
parseFiles s =  -- TODO result can retunera "error" och har nått gått fel... vi kompenserar inte för detta just nu
  let files = (decodeString ({-list-} string) s) in --(field "name" list string) s) in
  getStringList files
  --let files = decodeString (field "name" list string) s in
  --createList files

getStringList : (Result {-List-} String) -> ({-List-} String)
getStringList (Ok ls) = ls
getSrtingList (Err ls) = "Error in the decoder/parser"

{- exemple json
- {
-   "name" = ["name1", "name2", "name3"],
-   "size" = [1, 3, 6]
- }
-}

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.batch
    [ WebSocket.listen "ws://localhost:5000/ws" Message
    , encrypted Encrypted
    , decrypted Decrypted]

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

--listFiles
--listFiles :
