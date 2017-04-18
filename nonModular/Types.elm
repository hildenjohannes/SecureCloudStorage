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
  , firstname : String
  , lastname : String
  , loginMsg : String
  , showFeedback: Bool}

type Msg =
  ShowLogin |   --switch to login view
  ShowUpload |  --switch to upload view
  ShowRegister | --switch to register view
  --Upload
  Upload |
  FilesSelect Files |
  PostResult (Result Http.Error Json.Value) |
  --Login
  Email String |
  Password String |
  FirstName String |
  LastName String |
  Message String | --from server
  Login          |  --if the login button has been pressed
  Register

type View =
  LoginView |
  UploadView |
  RegisterView

type alias Files =
  List NativeFile
