module Types exposing (..)

import FileReader exposing (..)
import Json.Decode as Json exposing (Value)
import Http exposing (..)

type alias Model =
  { view : View
  --Upload
  , uploadMsg : String
  , selected : Files
  , contents : List String
  --Login
  , email : String
  , password : String
  , loginMsg : String
  , showFeedback: Bool}

type Msg =
  ShowLogin |
  ShowUpload |
  --Upload
  Upload |
  FilesSelect Files |
  PostResult (Result Http.Error Json.Value) |
  --Login
  Email String |
  Password String |
  Message String |
  Login

type View =
  LoginView |
  UploadView

type alias Files =
  List NativeFile
