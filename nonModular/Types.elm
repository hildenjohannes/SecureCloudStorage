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
  --Encryption
  , encrypted : String
  , decrypted : String
  --Login
  , email : String
  , password : String
  , loginMsg : String
  , showFeedback: Bool}

type Msg =
  ShowLogin |   --switch to login view
  ShowUpload |  --switch to upload view
  --Upload
  Upload |
  FilesSelect Files |
  PostResult (Result Http.Error Json.Value) |
  --Encryption
  Encrypt |
  Encrypted String |
  Decrypt |
  Decrypted String |
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
