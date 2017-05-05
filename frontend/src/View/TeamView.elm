module View.TeamView exposing (view)

import Types exposing (..)
import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)
import Json.Decode as Json

view : Model -> Html Msg
view model =
  div []
      [
        --NAVIGATION
        navigationbar,
         --MAIN CONTENT
         div [class "container-fluid"]
          [fileNav model,
          div [class "row"]
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
    [
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
tbList model = listFiles model model.files

listFiles : Model -> (List String) -> List (Html Msg)
listFiles model list =
 case list of
    [] -> []
    x::xs ->  (listFiles model xs ) ++
              [tr [onClick <| UpdateChosenFile x, if (x==model.chosenFile) then class model.rowActive else class model.rowInactive]
              [
                td [] [text x],
                td [] [text "You"],
                td [] [text "x KB"],
                td [] [text "xx-xx-xxxx"]
              ]]


maybeToString : Maybe String -> String
maybeToString s =
  case s of
    (Just s) -> s
    Nothing -> "Error"

(!!): Int -> List a -> Maybe a
(!!) index list =

  if  (List.length list) >= index then

       List.take index list
       |> List.reverse
       |> List.head                       
  else
     Nothing
