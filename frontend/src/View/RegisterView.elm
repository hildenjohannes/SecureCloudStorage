module View.RegisterView exposing (view)

import Types exposing (..)
import View.Stylesheet exposing (stylesheet)

import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)

view : Model -> Html Msg
view model =
   div []--class "container"
        [
        div [style [ ("padding-left", "35%"), ("padding-right", "35%")]] [
          --Html.form [class "form-signin"]--style [("width", "50%")]
            h2 [class "form-signin-heading"] [text "Please sign in"]
            --, label [for "inputEmail", class "sr-only"] [text "Email address"]
            , input [type_ "email", id "inputEmail", class "form-control", placeholder "Email address", onInput Email] []
          --  , label [for "inputPassword", class "sr-only"] [text "Password"]
            , input [type_ "password", id "inputPassword", class "form-control", placeholder "Password", onInput Password] []
            , input [type_ "text", class "form-control", placeholder "First name", onInput FirstName] []
            , input [type_ "text", class "form-control", placeholder "Last name", onInput LastName] []
            , button [class "btn btn-lg btn-primary btn-block", onClick Register] [text "Register"]

          ]
          ,stylesheet
        ]
