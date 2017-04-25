module Types exposing (..)

type alias Model =
  { view : View
  --Upload
  , inputId : String
  , filename : String
  , content : String
  --Encryption
  , encrypted : String
  , decrypted : String
  --Login
  , email : String
  , password : String
  , loginMsg : String
  , showFeedback: Bool }

type alias FileData =
  { filename : String
  , content : String }

type Msg =
  ShowLogin |   --switch to login view
  ShowTeam |  --switch to upload view
  --Upload
  FileSelected |
  FileRead FileData |
  Upload |
  --Encryption
  Encrypted String |
  Decrypted String |
  --Login
  Email String |
  Password String |
  Message String | --from server
  Login            --if the login button has been pressed

type View =
  LoginView |
  TeamView
