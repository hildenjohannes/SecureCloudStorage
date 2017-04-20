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
      teamView model

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


{--uploadView : Model -> Html Msg
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
    ]-}

commaSeperate : List String -> String
commaSeperate lst =
  List.foldl (++) "" (List.intersperse ", " lst)

onchange action =
  on
    "change"
    (Json.map action parseSelectedFiles)

{-containerStyles =
  style [ ( "padding", "20px" ) ]
-}


teamView : Model -> Html Msg
teamView model = --div [] [text "Logged in!", button [onClick LogOut] [text "Log out!"]]
  div []
      [
        --NAVIGATION
        navigationbar,
         --MAIN CONTENT
         div [class "container-fluid"]
          [fileNav model,
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

fileNav : Model -> Html Msg
fileNav model =
  div [class "row", style [("margin-top","6%")]]
    [
     div [class "pull-left"]
      [
       h1 [] [text "Single file select"]
       , input [type_ "file", onchange FilesSelect] []
       , button [onClick Upload] [text "Upload"]
      ]
    , div [class "center"]
      [
      h1 [] [text "Results"]
      , p []
        [ text <| "Files: " ++ commaSeperate (List.map .name model.selected) ]
      , p []
        [ text <| "Contents: " ++ commaSeperate model.contents ]
      , div [] [ text model.uploadMsg ]
      ]
    , div [class "pull-right"]
      [
      button [class "btn btn-info"] [text "Manage Team"],
      button [class "btn btn-warning"] [text "Upload file"],
      button [class "btn btn-info"] [text "Download file"]
      , button [class "btn btn-info", onClick ShowLogin] [text "Log out"]
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
    ]
  ]
