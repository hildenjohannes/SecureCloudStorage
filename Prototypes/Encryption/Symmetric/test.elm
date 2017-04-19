port module
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)

--port module test exposing (...)

-- port for sending strings out to JavaScript
--port encrypt : String -> Cmd msg

-- port for listening for suggestions from JavaScript
--port decrypt : (List String -> msg) -> Sub msg

main =
  Html.beginnerProgram { model = "Decrypt this message", view = view, update = update }

type Msg = Encrypt | Decrypt

update msg model =
  case msg of
    Encrypt ->
      model ++ "1"

    Decrypt ->
      model ++ "2"

view model =
  div []
    [ --input [ placeholder "Enter text to encrypt", onInput Change] []
    div [] [ text (model) ]
    , button [ onClick Encrypt ] [ text "Encrypt" ]
    , button [ onClick Decrypt ] [ text "Decrypt" ]
    ]
