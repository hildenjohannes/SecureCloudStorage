module Main exposing (..)

import Html exposing (Html, div, input, button, h1, p, text, form)
import Html.Attributes exposing (type_, id, style, multiple)
import Html.Events exposing (onClick, on, onSubmit, onInput)
import Task
import Json.Decode as Json exposing (Value, andThen)
import FileReader exposing (..)
import Http exposing (..)
import List as L



type alias Files =
    List NativeFile


type alias Model =
    { message : String
    , selected : Files
    , contents : List String
    }


init : Model
init =
    { message = "Waiting..."
    , selected = []
    , contents = []
    }


type Msg
    = Upload
    | FilesSelect Files
    | PostResult (Result Http.Error Json.Value)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Upload ->
            model ! List.map sendFileToServer model.selected

        FilesSelect fileInstances ->
            { model
                | selected = fileInstances
                , message = "Something selected"
            }
                ! []
        PostResult (Ok msg) ->
            { model | message = toString msg } ! []

        PostResult (Err err) ->
            { model | message = toString err } ! []



-- VIEW


view : Model -> Html Msg
view model =
    div [ containerStyles ]
        [ div []
            [ h1 [] [ text "Single file select + Upload separate" ]
            , input
                [ type_ "file"
                , onchange FilesSelect
                ]
                []
            , button
                [ onClick Upload ]
                [ text "Read file" ]
            ]
        , div []
            [ h1 [] [ text "Results" ]
            , p []
                [ text <|
                    "Files: "
                        ++ commaSeperate (List.map .name model.selected)
                ]
            , p []
                [ text <|
                    "Contents: "
                        ++ commaSeperate model.contents
                ]
            , div [] [ text model.message ]
            ]
        ]


commaSeperate : List String -> String
commaSeperate lst =
    List.foldl (++) "" (List.intersperse ", " lst)


onchange action =
    on
        "change"
        (Json.map action parseSelectedFiles)


containerStyles =
    style [ ( "padding", "20px" ) ]



-- TASKS



sendFileToServer : NativeFile -> Cmd Msg
sendFileToServer buf =
    let
        body =
            Http.multipartBody
                [ FileReader.filePart "simtest" buf

                ]
    in
        Http.post "http://localhost:5000/upload" body Json.value
            |> Http.send PostResult

-- ----------------------------------


main =
    Html.program
        { init = ( init, Cmd.none )
        , update = update
        , view = view
        , subscriptions = (always Sub.none)
        }
