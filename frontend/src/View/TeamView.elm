module View.TeamView exposing (view)

import Types exposing (..)
import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)
import Json.Decode as Json

view : Model -> Html Msg
view model = --div [] [text "Logged in!", button [onClick LogOut] [text "Log out!"]]
  div []
      [
        --NAVIGATION
        navigationbar,
         --MAIN CONTENT
         div [class "container-fluid"]
          [fileNav model,
          div [class "row"]--, style [("margin-top","1%")]]
            [
            sidebar, (center model)
            ]
          ],
         stylesheet
      ]

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

commaSeperate : List String -> String
commaSeperate lst =
  List.foldl (++) "" (List.intersperse ", " lst)

{-containerStyles =
  style [ ( "padding", "20px" ) ]
-}

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
    --  div [class "pull-left"]
    --   [
    --    h1 [] [text "Single file select"]
    --    , input [type_ "file", id model.inputId, on "change" (Json.succeed FileSelected)] []
    --   ]
    div [class "pull-right"]
      [

      button [class "btn btn-info"] [text "Manage Team"],
      input [type_ "file", id model.inputId, on "change" (Json.succeed FileSelected), class "btn btn-info"] [],
      button [class "btn btn-info", onClick Upload] [text "Upload file"],
      button [class "btn btn-info"] [text "Download file"],
      button [class "btn btn-info", onClick ShowLogin] [text "Log out"]
      ]
    ]

center : Model -> Html Msg
center model =
  div [class "col-sm-9 col-md-10 main"]
    [ --"col-sm-9 col-md-9"
    h1 [class "page-header"] [text "Files"],
    div [class "table-responsive"]
      [table [class "table table-striped"]
        [thead []
          [tr [] thList
          ],--!thead
          tbody [] (tbList model)
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

tbList : Model -> List (Html Msg)
tbList model = listF model.files
{-  [tr [] --onClick
    [
    td [] [text (maybeToString ((!!) 1 model.files))],
    --td [] [text model.files],
    td [] [text "Rebecka"],
    td [] [text "1 KB"],
    td [] [text "1 April 2017"]
    ]
  ] -}


listF : List String -> List (Html Msg)
listF list =
 case list of
    [] -> []
    x::xs ->  (listF xs ) ++
              [tr [] --onClick
              [
                td [] [text x],
                --td [] [text model.files],
                td [] [text "Rebecka"],
                td [] [text "1 KB"],
                td [] [text "1 April 2017"]
              ]]


maybeToString : Maybe String -> String
maybeToString s =
  case s of
    (Just s) -> s
    Nothing -> "Error"

(!!): Int -> List a -> Maybe a
(!!) index list =                          -- 3 [ 1, 2, 3, 4, 5, 6 ]

  if  (List.length list) >= index then

       List.take index list               -- [ 1, 2, 3 ]
       |> List.reverse                    -- [ 3, 2, 1 ]
       |> List.head                       -- Just 3
  else
     Nothing
