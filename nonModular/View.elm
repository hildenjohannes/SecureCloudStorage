module View exposing (view)

import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)
import Json.Decode as Json exposing (Value)
import FileReader exposing (..)
import Types exposing (..)

view : Model -> Html Msg
view model =
  case model.view of
    LoginView ->
      loginView model

    UploadView ->
      uploadView model

loginView : Model -> Html Msg
loginView model =
  div []
    [ input [ type_ "text", placeholder "Email", onInput Email ] []
    , input [ type_ "password", placeholder "Password", onInput Password ] []
    , button [ onClick Login ] [ text "Login" ]
    , if model.showFeedback then feedback else div [] []
    ]

feedback : Html Msg
feedback =
  div [ style [("color", "red")] ] [ text "Wrong" ]

uploadView : Model -> Html Msg
uploadView model =
  div [ containerStyles ]
    [ div []
      [ h1 [] [ text "Single file select + Upload separate" ]
      , input
        [ type_ "file"
        , onchange FilesSelect ] []
        , button [ onClick Upload ] [ text "Read file" ]
      ]
    , div []
      [ h1 [] [ text "Results" ]
      , p []
        [ text <| "Files: " ++ commaSeperate (List.map .name model.selected) ]
      , p []
        [ text <| "Contents: " ++ commaSeperate model.contents ]
      , div [] [ text model.uploadMsg ]
      ]
    ]

commaSeperate : List String -> String
commaSeperate lst =
  List.foldl (++) "" (List.intersperse ", " lst)

onchange action =
  on
    "change"
    (Json.map action parseSelectedFiles)

containerStyles =
  style [ ( "padding", "20px" ) ]
