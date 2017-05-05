module State exposing (init, update, subscriptions)

import Types exposing (..)
import Ports exposing (..)

import Json.Decode as Json exposing (..)
import WebSocket

init : (Model, Cmd Msg)
init =
  (
    { view = LoginView
    --Upload
    , inputId = "FileInputId"
    , filename = ""
    , content = ""
    --Encryption
    , encrypted = ""
    , decrypted = ""
    --Login
    , email = ""
    , password = ""
    , firstname = ""
    , lastname = ""
    , showFeedback = False
    , files = []
    , chosenFile = ""
    , rowActive = "info"
    , rowInactive = ""
    }, Cmd.none
  )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    ShowLogin ->
      {model | view = LoginView} ! []

    ShowTeam ->
      {model | view = TeamView} ! []

    ShowRegister ->
      {model | view = RegisterView} ! []

    --Upload
    FileSelected ->
      model ! [fileSelected model.inputId]

    Upload ->
      model ! [ WebSocket.send "ws://localhost:5000/ws"
      ("upload|" ++ model.filename ++ "|" ++ model.encrypted) ]

    FileRead data ->
      {model | filename = data.filename, content = data.content} !
      [ encrypt data.content ]

    --Download
    Download filename ->
      model ! [ WebSocket.send "ws://localhost:5000/ws"
      ("download|" ++ filename) ]

    --Encryption
    Encrypted encryptedWord ->
      {model | encrypted = encryptedWord} ! []

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
      ("login|" ++ model.email ++ "|" ++ model.password) ]

    --Register
    FirstName firstname ->
      {model | firstname = firstname} ! []
    LastName lastname ->
      {model | lastname = lastname} ! []
    Register ->
      (model, WebSocket.send "ws://localhost:5000/ws"
      ("register|" ++ model.firstname ++ "|" ++ model.lastname ++
      "|" ++ model.email ++ "|" ++ model.password))

    --websocket
    Message message ->
      let
        temp = String.split "|" message
        params = List.drop 1 temp
        method = List.head temp
      in
        websocketMessage model method params

    UpdateChosenFile file ->
      ({model | chosenFile = file}, Cmd.none)

websocketMessage : Model -> Maybe String -> List String -> (Model, Cmd Msg)
websocketMessage model method params =
  case extract method of
    "login" ->
      case extract (List.head params) of
        "True" ->
          {model | showFeedback = False, view = TeamView} !
          [ WebSocket.send "ws://localhost:5000/ws" "listFiles|" ]
        _ ->
          {model | showFeedback = True} ! [ Cmd.none ]
    "listFiles" ->
      {model | files = (parseJsonFiles (extract (List.head params))), view = TeamView} !
      [ Cmd.none ]
    "register" ->
      {model | view = TeamView} ! [Cmd.none]
    "download" ->
      model ! [ download [extract (List.head params), extract (List.head (List.drop 1 params)) ] ]
    _ ->
      model ! [ Cmd.none ]

extract : Maybe String -> String
extract x =
  case x of
    Just x -> x
    Nothing -> "Nothing"

--decoder for json parser
stringsDecoder : Decoder (List String)
stringsDecoder = list string

parseJsonFiles : String -> (List String)
parseJsonFiles jsonString = result (decodeString stringsDecoder jsonString)

result : Result a (List a) -> (List a)
result result =
  case result of
    Ok payload ->
      payload
    Err errorString ->
      [errorString]

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.batch
    [ WebSocket.listen "ws://localhost:5000/ws" Message
    , encrypted Encrypted
    , decrypted Decrypted
    , fileRead FileRead ]
