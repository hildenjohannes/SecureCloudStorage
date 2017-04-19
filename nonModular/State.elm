module State exposing (init, update, subscriptions)

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
    --Login
    , email = ""
    , password = ""
    , firstname = ""
    , lastname = ""
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

    ShowRegister ->
      ({model | view = RegisterView}, Cmd.none)

    --Upload
    Upload ->
      model ! List.map (sendFileToServer model.email) model.selected

    FilesSelect fileInstances ->
      { model
      | selected = fileInstances
      , uploadMsg = "Something selected" } ! []

    PostResult (Ok msg) ->
      { model | uploadMsg = toString msg } ! []

    PostResult (Err err) ->
      { model | uploadMsg = toString err } ! []

    --Login
    Email email ->
      ({model | email = email, showFeedback = False}, Cmd.none)

    Password password ->
      ({model | password = password, showFeedback = False}, Cmd.none)
    FirstName fn ->
      ({model | firstname = fn, showFeedback = False}, Cmd.none)
    LastName ln ->
      ({model | lastname = ln, showFeedback = False}, Cmd.none)


    Login ->
      ({model | showFeedback = True}, WebSocket.send "ws://localhost:5000/ws"
      ("login|" ++ model.email ++ "|" ++ model.password))
    Register ->
      ({model | showFeedback = True}, WebSocket.send "ws://localhost:5000/ws"
      ("register|" ++ model.firstname ++ "|" ++ model.lastname ++ "|" ++ model.email ++ "|" ++ model.password))

    Message message ->
      case message of
        "True" ->
          ({model | loginMsg = message, view = UploadView}, Cmd.none)
        _ ->
          ({model | loginMsg = message}, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.batch
    [ WebSocket.listen "ws://localhost:5000/ws" Message ]

--Upload
sendFileToServer : String -> NativeFile -> Cmd Msg
sendFileToServer email buf =
  let
    body =
      Http.multipartBody
        [ stringPart "owner" email
        ,FileReader.filePart "simtest" buf ]
  in
    Http.post "http://localhost:5000/upload" body Json.value
      |> Http.send PostResult
