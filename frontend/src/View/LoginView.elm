module View.LoginView exposing (view)

import Types exposing (..)
import View.Stylesheet exposing (stylesheet)

import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)

view : Model -> Html Msg
view model =
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
          , button [class "btn btn-lg btn-primary btn-block", onClick ShowRegister] [text "Register"]
          , if model.showFeedback then feedback else div [] []
        ]
        ,stylesheet
      ]

feedback : Html Msg
feedback =
  div [ style [("color", "red")] ] [ text "Wrong" ]
