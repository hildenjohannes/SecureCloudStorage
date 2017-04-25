module State exposing (init, update, subscriptions)

import Types exposing (..)
import Ports exposing (..)
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
    , showFeedback = False }
    , Cmd.none
  )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    ShowLogin ->
      {model | view = LoginView} ! []

    ShowTeam ->
      {model | view = TeamView} ! []

    --Upload
    FileSelected ->
      model ! [fileSelected model.inputId]

    FileRead data ->
      {model | filename = data.filename, content = data.content} ! [encrypt model.content]

    Upload ->
      (model, WebSocket.send "ws://localhost:5000/ws"
      ("upload|" ++ model.filename ++ "|" ++ model.encrypted))

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

    Message message ->
      case message of
        "True" ->
          {model | loginMsg = message, view = TeamView} ! []
        _ ->
          {model | loginMsg = message} ! []

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.batch
    [ WebSocket.listen "ws://localhost:5000/ws" Message
    , encrypted Encrypted
    , decrypted Decrypted
    , fileRead FileRead ]
