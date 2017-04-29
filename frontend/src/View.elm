module View exposing (view)

import Types exposing (..)
import View.LoginView as LV exposing (view)
import View.TeamView as TV exposing (view)
import View.RegisterView as RV exposing (view)

import Html exposing (..)

view : Model -> Html Msg
view model =
  case model.view of
    LoginView ->
      LV.view model

    TeamView ->
      TV.view model

    RegisterView ->
      RV.view model
