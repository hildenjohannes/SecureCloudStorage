module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Encode as Json

--MAIN

main : Program Never Model Msg
main =
    program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }

--SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none

--MODEL

type alias Model =
    { name : String
    , password : String
    }


init :  ( Model, Cmd Msg )
init =
    ({ name = "",
    password = ""
    }, Cmd.none)


--UPDATE

type Msg
    = UpdateName String
    | UpdatePassword String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateName text ->
                ({ name = text
                , password = model.password
                }, Cmd.none)
        UpdatePassword text ->
                ({ name = model.name
                , password = text
                }, Cmd.none)


--VIEW
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


view : Model -> Html Msg
view model =
  div []--class "container"
      [
      div [style [ ("padding-left", "35%"), ("padding-right", "35%")]] [
        Html.form [class "form-signin"]--style [("width", "50%")]
          [h2 [class "form-signin-heading"] [text "Please sign in"]
          , label [for "inputEmail", class "sr-only"] [text "Email address"]
          , input [type_ "email", id "inputEmail", class "form-control", placeholder "Email address"] []
          , label [for "inputPassword", class "sr-only"] [text "Password"]
          , input [type_ "password", id "inputPassword", class "form-control", placeholder "Password"] []
          , button [class "btn btn-lg btn-primary btn-block", type_ "submit"] [text "Sign in"]
          ]
        ]
        ,stylesheet
      ]
