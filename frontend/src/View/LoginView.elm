module View.LoginView exposing (view)

import Types exposing (..)
import View.Stylesheet exposing (stylesheet)

import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)

view : Model -> Html Msg
view model =
 div []
      [
      div [style [ ("padding-left", "35%"), ("padding-right", "35%")]] [
          h2 [class "form-signin-heading"] [text "Please sign in"]
          , input [type_ "email", id "inputEmail", class "form-control", placeholder "Email address", onInput Email] []
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
