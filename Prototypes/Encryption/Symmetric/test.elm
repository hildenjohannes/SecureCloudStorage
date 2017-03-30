import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)

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
