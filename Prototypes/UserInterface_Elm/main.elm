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
    { teams : List String
    , files : List String
    }


init :  ( Model, Cmd Msg )
init =
    ({ teams = []
    , files = []
    }, Cmd.none)


--UPDATE

type Msg
    = UpdateTodo String
    | AddTodo
    | RemoveItem String
    | RemoveAll
    | ClearInput


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateTodo text ->
                ({ teams = []
                , files = []
                }, Cmd.none)

        AddTodo ->
                ({ teams = []
                , files = []
                }, Cmd.none)

        RemoveItem text ->
                ({ teams = []
                , files = []
                }, Cmd.none)

        RemoveAll ->
                ({ teams = []
                , files = []
                }, Cmd.none)

        ClearInput ->
                ({ teams = []
                , files = []
                }, Cmd.none)
--JS
--script : List Attribute -> List Html -> Html
--script attrs children = node "script" attrs children

--scriptSrc : String -> Html
--scriptSrc s = script [ type_ "text/javascript", src s ] []

--bootstrapScript = scriptSrc "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"

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

todoItem : String -> Html Msg
todoItem todo =
    li [ class "list-group-item" ] [ text todo, button [ onClick (RemoveItem todo), class "btn btn-info" ] [ text "x" ] ]


todoList : List String -> Html Msg
todoList todos =
    let
        child =
            List.map todoItem todos
    in
        ul [ class "list-group" ] child


view : Model -> Html Msg
view model =
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
        [button [
          property "navbar-toggle" (Json.string "collapsed"),
          property "data-toggle" (Json.string "collapse"),
          property "data-target" (Json.string "#navbar"),
          property "aria-expanded" (Json.string "false"),
          property "aria-controls" (Json.string "navbar")]
          [text "toggle"],
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
  [tr []
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
