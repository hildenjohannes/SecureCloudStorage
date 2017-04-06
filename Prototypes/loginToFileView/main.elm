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
    , loggedin : Bool
    , files : List String
    , teams : List String
    }


init :  ( Model, Cmd Msg )
init =
    ({ name = ""
    , password = ""
    , loggedin = False
    , files = []
    , teams = []
    }, Cmd.none)


--UPDATE

type Msg
    = UpdateName String
    | UpdatePassword String
    | LogIn
    | LogOut


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateName text ->
                ({ name = text
                , password = model.password
                , loggedin = model.loggedin
                , files = model.files
                , teams = model.teams
                }, Cmd.none)
        UpdatePassword text ->
                ({ name = model.name
                , password = text
                , loggedin = model.loggedin
                , files = model.files
                , teams = model.teams
                }, Cmd.none)
        LogIn ->
                ({model | loggedin = True}, Cmd.none)
        LogOut ->
                ({model | loggedin = False}, Cmd.none)

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
  div [] [if model.loggedin then teamView else loginView, stylesheet]

loginView : Html Msg
loginView = --div [] [text "Not logged in!", button [onClick LogIn] [text "Log in!"]]
  div [style [ ("padding-left", "35%"), ("padding-right", "35%")]] [
    Html.form [class "form-signin"]--style [("width", "50%")]
      [h2 [class "form-signin-heading"] [text "Please sign in"]
      , label [for "inputEmail", class "sr-only"] [text "Email address"]
      , input [type_ "email", id "inputEmail", class "form-control", placeholder "Email address"] []
      , label [for "inputPassword", class "sr-only"] [text "Password"]
      , input [type_ "password", id "inputPassword", class "form-control", placeholder "Password"] []
      , button [class "btn btn-lg btn-primary btn-block", type_ "submit", onClick LogIn] [text "Sign in"]
      ]
    ]

teamView : Html Msg
teamView = --div [] [text "Logged in!", button [onClick LogOut] [text "Log out!"]]
  div []
      [
        --NAVIGATION
        navigationbar,
         --MAIN CONTENT
         div [class "container-fluid"]
          [fileNav,
          div [class "row"]--, style [("margin-top","1%")]]
            [
            sidebar, center
            ]
          ],
         stylesheet
      ]

navigationbar : Html Msg
navigationbar =
  nav [class "navbar navbar-inverse navbar-fixed-top" ]
    [div [class "container-fluid"]
      [div [class "navbar-header"]
        [
        a [class "navbar-brand", href "#"] [text "Secure Cloud Storage"]
        ]--!navbar-header
      ,
      div [id "navbar", class "navbar-collapse collpase"]
       [ul [class "nav navbar-nav navbar-right"]
        [li [class "active"] [a [href "#"] [text "Home"]],
         li [] [a [href "#"] [text "Profile"]],
         li [] [a [href "#"] [text "Settings"]]
        ]--! ul
       ]--! navbar
      ]--! container-fluid
    ]--! nav

sidebar : Html Msg
sidebar =
  div [class "col-sm-3 col-md-2 sidebar"]
    [
    ul [class "nav nav-sidebar"]
      [
       li [class "active"] [a [href "#"] [text "Overview", span [class "sr-only"] [text "current"]]],
       li [] [a [href "#"] [text "TEAM 0"]],
       li [] [a [href "#"] [text "TEAM 1"]],
       li [] [a [href "#"] [text "TEAM 2"]],
       li [] [a [href "#"] [text "TEAM 3"]]
      ]
    ]

fileNav : Html Msg
fileNav =
  div [class "row", style [("margin-top","6%")]]
    [
    div [class "pull-right"]
      [
      button [class "btn btn-info"] [text "Manage Team"],
      button [class "btn btn-warning"] [text "Upload file"],
      button [class "btn btn-info"] [text "Download file"]
      , button [class "btn btn-info", onClick LogOut] [text "Log out"]
      ]
    ]

center : Html Msg
center =
  div [class "col-sm-9 col-md-10 main"]
    [ --"col-sm-9 col-md-9"
    h1 [class "page-header"] [text "Files"],
    div [class "table-responsive"]
      [table [class "table table-striped"]
        [thead []
          [tr [] thList
          ],--!thead
          tbody [] tbList
        ]--!table
      ]--! table-responsive
    ]

thList : List (Html Msg)
thList =             [
  th [] [text "Name"],
  th [] [text "Owner"],
  th [] [text "Size"],
  th [] [text "Upload date"]
  ]

tbList : List (Html Msg)
tbList =
  [tr [] --onClick
    [
    td [] [text "File1"],
    td [] [text "Rebecka"],
    td [] [text "1 KB"],
    td [] [text "1 April 2017"]
    ],
  tr []
    [
    td [] [text "File2"],
    td [] [text "Rebecka"],
    td [] [text "1 KB"],
    td [] [text "1 April 2017"]
    ],
  tr []
    [
    td [] [text "File3"],
    td [] [text "Rebecka"],
    td [] [text "1 KB"],
    td [] [text "1 April 2017"]
    ]
  ]
