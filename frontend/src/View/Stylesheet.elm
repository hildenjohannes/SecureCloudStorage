module View.Stylesheet exposing (stylesheet)

import Types exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)

stylesheet : Html Msg
stylesheet =
    let
        tag =
            "link"
        attrs =
            [ attribute "Rel" "stylesheet"
            , attribute "property" "stylesheet"
            , attribute "href" "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
            ]

        children =
            []
    in
        node tag attrs children
