import Haste.App
import qualified Haste.App.Concurrent as H
import Haste.DOM
import Haste.Events
import Haste.Parsing
import qualified Control.Concurrent as C

main :: IO ()
main = do
    runApp (mkConfig "localhost" 24601) $ do

      runClient $ withElem "button" $ \button -> do
        button `onEvent` Click $ \_ -> do
          --alert "hello"
          --msg <- liftIO $ readFile "/home/johannes/examples.desktop"
          --setAttr str
          --alert "HEJ"
          --japp <- newTextElem "Hejsan"
          --appendChild japp "Filelist"
          --japp <- withElem "str" $ \x -> do
          msg <- toNumber $ withElem "inputAmount" $ \inputAmount -> getProp inputAmount "value"
          --msgInt <- runParser int msg
          alert msg --FÖRSÖKER TA IN EN SIFFRA OCH LOOPA SÅ MÅNGA GÅNGER, GER MAYBE a, PROBLEM
          liftIO $ fillList 3

          --withElem "li5" $ \li5 -> setProp li5 "innerText" "hej"
        return ()

fillList :: Int -> IO ()
fillList 0 = return ()
fillList n = do
               listItem <- newElem "li"
               setProp listItem "innerText" "Filename.txt"
               withElem "fileList" $ \fileList -> appendChild fileList listItem
               fillList (n-1)
