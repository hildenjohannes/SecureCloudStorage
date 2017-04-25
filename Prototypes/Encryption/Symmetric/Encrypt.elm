port module Encrypt exposing (..)

import Html exposing (Html, button, div, text, input)
import Html.Events exposing (onClick, onInput)
import String

main =
  Html.program
  { init = init
  , view = view
  , update = update
  , subscriptions = subscriptions
  }

-- MODEL

type alias Model =
  { word : String
  , encrypted : String
  , decrypted : String
  }

init : (Model, Cmd Msg)
init =
  (Model "Encrypt me please" "" "", Cmd.none)

-- UPDATE

type Msg
  = Change String
  | Change2 String
  | Encrypt
  | Encrypted String
  | Decrypt
  | Decrypted String

port encrypt : String -> Cmd msg
port decrypt : String -> Cmd msg

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Change newWord ->
      ( Model newWord model.encrypted model.decrypted, Cmd.none )

    Change2 newEncrypted ->
      ( Model model.word newEncrypted model.decrypted, Cmd.none )

    Encrypt ->
      ( model, encrypt model.word )

    Encrypted encryptedWord ->
      ( Model model.word encryptedWord model.decrypted, Cmd.none )

    Decrypt ->
      ( model, decrypt model.encrypted )

    Decrypted decryptedWord ->
      ( Model model.word model.encrypted decryptedWord, Cmd.none)

-- SUBSCRIPTIONS

port encrypted : (String -> msg) -> Sub msg
port decrypted : (String -> msg) -> Sub msg

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.batch
    [ encrypted Encrypted
    , decrypted Decrypted ]

-- VIEW

view : Model -> Html Msg
view model =
  div []
    [ input [ onInput Change ] []
    , button [ onClick Encrypt ] [ text "Encrypt" ]
    , div [] [ text ("Encrypted: " ++ model.encrypted) ]
    , input [ onInput Change2 ] []
    , button [ onClick Decrypt ] [ text "Decrypt" ]
    , div [] [ text ("Decrypted: " ++ model.decrypted) ]
    ]
