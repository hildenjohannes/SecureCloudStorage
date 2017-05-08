module Types exposing (..)

type alias Model =
  { view      : View
  --Upload
  , inputId   : String
  , filename  : String
  , content   : String
  --Encryption
  , encrypted : String
  , decrypted : String
  --Login
  , email     : String
  , password  : String
  --Register
  , firstname : String
  , lastname  : String
  , files     : List String
  , showFeedback  : Bool
  , chosenFile    : String
  ,rowActive      : String
  ,rowInactive    : String}

type alias FileData =
  { filename      : String
  , content       : String }

type Msg =
  Logout         |   --Logout
  ShowTeam          |  --switch to upload view
  ShowRegister      | -- switch to regiserview
  --Upload
  FileSelected      |
  FileRead FileData |
  Upload |
  --Download
  Download |
  --Encryption
  Encrypted String  |
  Decrypted String  |
  --Login
  Email String      |
  Password String   |
  Login             |         --if the login button has been pressed
  --Register
  FirstName String  |
  LastName String   |
  Register          |
  --websocket
  Message String    |

  UpdateChosenFile String

type View =
  LoginView |
  TeamView  |
  RegisterView
