port module State exposing (init, update, subscriptions)

import Types exposing (..)

import FileReader exposing (..)
import Http exposing (..)
import Json.Decode as Json exposing (Value)
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
    , showFeedback = False }
    , Cmd.none
  )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    ShowLogin ->
      ({model | view = LoginView}, Cmd.none)

    ShowUpload ->
      ({model | view = UploadView}, Cmd.none)

    --Upload
    Upload ->
      model ! List.map sendFileToServer model.selected

    FilesSelect fileInstances ->
      { model
      | selected = fileInstances
      , uploadMsg = "Something selected" } ! []

    PostResult (Ok msg) ->
      { model | uploadMsg = toString msg } ! []

    PostResult (Err err) ->
      { model | uploadMsg = toString err } ! []

    --Encryption
    Encrypt ->
        ( model, encrypt model.encrypted )

    Encrypted encryptedWord ->
        ({model | encrypted = encryptedWord}, Cmd.none)

    Decrypt ->
      ( model, decrypt model.encrypted )

    Decrypted decryptedWord ->
        ({model | decrypted = decryptedWord}, Cmd.none)

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
        _ ->
          ({model | loginMsg = message}, Cmd.none)

port encrypt : String -> Cmd msg
port decrypt : String -> Cmd msg
port encrypted : (String -> msg) -> Sub msg
port decrypted : (String -> msg) -> Sub msg

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
