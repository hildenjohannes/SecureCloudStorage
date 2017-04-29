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
  , files: List String
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
  Login |         --if the login button has been pressed
  --websocket
  Message String  --from server

type View =
  LoginView |
  TeamView
