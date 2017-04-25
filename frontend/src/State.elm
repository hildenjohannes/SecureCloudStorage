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
    , loginMsg = ""
    , showFeedback = False
    , files = []
    }, Cmd.none
  )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    ShowLogin ->
      ({model | view = LoginView},  WebSocket.send "ws://localhost:5000/ws"
      ("listFiles|"))

    ShowTeam ->
      {model | view = TeamView} ! []

    --Upload
    FileSelected ->
      model ! [fileSelected model.inputId]

    Upload ->
      (model, WebSocket.send "ws://localhost:5000/ws"
      ("upload|" ++ model.filename ++ "|" ++ model.encrypted))

    FileRead data ->
      {model | filename = data.filename, content = data.content} ! [encrypt model.content]

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
      ("login|" ++ model.email ++ "|" ++ model.password)
      ]

    --TODO: split into several messages

    --websocket responses
    Message message ->
      case message of
        "True" ->
          ({model | loginMsg = message, view = TeamView}, WebSocket.send "ws://localhost:5000/ws"
          ("listFiles|"))
        "False" ->
          ({model | loginMsg = message}, Cmd.none)
        _ ->
          ({model | files = (parseJsonFiles message), view = TeamView}, Cmd.none) --message}, Cmd.none)

--decoder for json parser
stringsDecoder : Decoder (List String)
stringsDecoder = list string

parseJsonFiles : String -> (List String)
parseJsonFiles jsonString = result (decodeString stringsDecoder jsonString)

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
