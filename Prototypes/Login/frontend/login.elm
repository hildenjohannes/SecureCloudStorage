import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import WebSocket

main =
  Html.program
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions}

--model
type alias Model =
  {email : String,
  password : String,
  message : String,
  login : Bool
  }

init : (Model, Cmd Msg)
init =
  (Model "" "" "" False, Cmd.none)

--update
type Msg =
  Email String
  | Password String
  | Message String
  | Login

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Email email ->
      ({model | email = email, login = False}, Cmd.none)

    Password password ->
      ({model | password = password, login = False}, Cmd.none)

    Login ->
      ({model | login = True}, WebSocket.send "ws://localhost:8000/ws"
      (model.email ++ "|" ++ model.password))

    Message message ->
      ({model | message = message}, Cmd.none)

--subscriptions
subscriptions : Model -> Sub Msg
subscriptions model =
  WebSocket.listen "ws://localhost:8000/ws" Message

--view
view : Model -> Html Msg
view model =
  div []
    [ input [ type_ "text", placeholder "Email", onInput Email ] []
    , input [ type_ "password", placeholder "Password", onInput Password ] []
    , button [ onClick Login ] [ text "Login" ]
    , if model.login then feedbackView model else div [] []
    ]

feedbackView : Model -> Html Msg
feedbackView model =
  let
    (color, message) =
      if model.message == "ok" then
        ("green", "Ok")
      else
        ("red", "Wrong")
  in
    div [ style [("color", color)] ] [ text message ]
