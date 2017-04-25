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
  , showFeedback: Bool
  --, files: List String
  , files: String
}

type Msg =
  ShowLogin |   --switch to login view
  ShowUpload |  --switch to upload view
  --Upload
  Upload |
  FilesSelect Files |
  PostResult (Result Http.Error Json.Value) |
  --Login
  Email String |
  Password String |
  Message String | --from server
  Login            --if the login button has been pressed

type View =
  LoginView |
  UploadView

type alias Files =
  List NativeFile
