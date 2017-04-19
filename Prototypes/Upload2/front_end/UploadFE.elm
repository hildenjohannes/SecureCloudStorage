--how to get file-reader

--sudo apt-get update
--sudo apt-get install rubygems
--sudo gem install elm_install
--sudo elm-install
--sudo elm-install simonh1000/file-reader

-- also add ""elm-lang/http": "1.0.0 <= v < 2.0.0"," in elm-package.json

module Main exposing (..)

import Html exposing (Html, div, input, button, h1, p, text)
import Html.Attributes exposing (type_, id, style)
import Html.Events exposing (onClick, on, onInput)
import Json.Decode as Json exposing (Value, andThen)
import Http exposing (..)
import Task exposing (Task)
import List as L
import DragDrop exposing (..)
import FileReader exposing (..)


-- MODEL


type alias Model =
    { message : String
    , dnd : Int
    , files : List NativeFile
    }


init : Model
init =
    { message = "Waiting..."
    , dnd = 0
    , files = []
    }



-- UPDATE


type Msg
    = DragEnter
    | DragOver
    | DragLeave
    | Drop (List NativeFile)
    | FilesSelect (List NativeFile)
    | Submit
      -- | FileData (Result FileReader.Error FileContentArrayBuffer)
    | PostResult (Result Http.Error Json.Value)


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case message of
        DragEnter ->
            { model | dnd = model.dnd + 1 } ! []

        DragOver ->
            model ! []

        DragLeave ->
            { model | dnd = model.dnd - 1 } ! []

        Drop files ->
            { model | dnd = 0, files = files } ! []

        Submit ->
            case L.head model.files of
                Just file ->
                    model ! [ sendFileToServer file ]

                Nothing ->
                    model ! []

        FilesSelect fileInstances ->
            { model | files = fileInstances } ! []

        PostResult (Ok msg) ->
            { model | message = toString msg } ! []

        PostResult (Err err) ->
            { model | message = toString err } ! []



-- VIEW


view : Model -> Html Msg
view model =
    div [ containerStyles ]
        [ h1 [] [ text "Drag 'n Drop" ]
        , input
            [ type_ "file"
            , onchange FilesSelect
            ]
            []
        , renderDropZone model
        , button
            [ onClick Submit ]
            [ text "Submit" ]
        , div [] [ text <| "Files: " ++ commaSeperate (List.map .name model.files) ]
        , p [] [ text model.message ]
        ]


commaSeperate : List String -> String
commaSeperate lst =
    List.foldl (++) "" (List.intersperse ", " lst)


renderDropZone : Model -> Html Msg
renderDropZone model =
    div
        (renderZoneAttributes model)
        [ text "Drop here" ]


renderZoneAttributes : Model -> List (Html.Attribute Msg)
renderZoneAttributes { dnd } =
    (case dnd of
        0 ->
            dropZoneDefault

        _ ->
            dropZoneHover
    )
        :: [ onDragEnter DragEnter
           , onDragOver DragOver
           , onDragLeave DragLeave
           , onDrop Drop
           ]


onchange action =
    on "change" (Json.map action parseSelectedFiles)



-- TASKS
-- readFile : FileRef -> Cmd Msg
-- readFile fileValue =
--     readAsArrayBuffer fileValue
--         |> Task.attempt FileData


sendFileToServer : NativeFile -> Cmd Msg
sendFileToServer buf =
    let
        body =
            Http.multipartBody
                [ stringPart "body" "this is the stringpPart"
                , FileReader.filePart "data" buf
                ]
    in
        Http.post "http://localhost:8001/upload" body Json.value
            |> Http.send PostResult



-- ----------------------------------------


containerStyles : Html.Attribute msg
containerStyles =
    style
        [ ( "padding", "20px" )
        ]


dropZoneDefault =
    style
        [ ( "height", "120px" )
        , ( "border-radius", "10px" )
        , ( "border", "3px dashed steelblue" )
        ]


dropZoneHover =
    style
        [ ( "height", "120px" )
        , ( "border-radius", "10px" )
        , ( "border", "3px dashed red" )
        ]



-- ----------------------------------


main =
    Html.program
        { init = ( init, Cmd.none )
        , update = update
        , view = view
        , subscriptions = always Sub.none
        }
