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

stylesheet : Html Msg
stylesheet =
    let
        tag =
            "link"

        attrs =
            [ attribute "Rel" "stylesheet"
            , attribute "property" "stylesheet"
            , attribute "href" "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
            --, attribute "href" "css/bootstrap.min.css"
            ]

        children =
            []
    in
        node tag attrs children

loginView : Model -> Html Msg
loginView model =
    {--div [style [("padding-left", "35%"), ("padding-right", "35%")]]
      [Html.form [] [  h2 [class "form-signin-heading"] [text "Please sign in"]
        , input [ class ".input-lg", type_ "text", placeholder "Email", onInput Email ] []
        , input [ class "input-sm", type_ "password", placeholder "Password", onInput Password ] []
        , button [ onClick Login ] [ text "Login" ]
        , if model.showFeedback then feedback else div [] [] ]
      ]-}

 div []--class "container"
      [
      div [style [ ("padding-left", "35%"), ("padding-right", "35%")]] [
        --Html.form [class "form-signin"]--style [("width", "50%")]
          h2 [class "form-signin-heading"] [text "Please sign in"]
          --, label [for "inputEmail", class "sr-only"] [text "Email address"]
          , input [type_ "email", id "inputEmail", class "form-control", placeholder "Email address", onInput Email] []
        --  , label [for "inputPassword", class "sr-only"] [text "Password"]
          , input [type_ "password", id "inputPassword", class "form-control", placeholder "Password", onInput Password] []
          , button [class "btn btn-lg btn-primary btn-block", onClick Login] [text "Sign in"]
          , if model.showFeedback then feedback else div [] []
        ]
        ,stylesheet
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
