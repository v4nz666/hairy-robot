<?php

class AuthController extends Controller {
  public function __construct() {
    $this->beforeFilter('nauth');
    $this->beforeFilter('csrf', array('on' => array('post', 'put', 'delete')));
  }
  
  public function login() {
    $validator = Validator::make(Input::all(), [
      'name' => ['required', 'min:6', 'max:20', 'exists:users'],
      'pass' => ['required', 'min:8', 'max:256']
    ]);
    
    if($validator->passes()) {
      if(Auth::attempt(Input::all())) {
        return Redirect::action('HomeController@getHome');
      }
    }
    
    return Redirect::action('HomeController@getHome')->withInput(Input::flash())->withErrors($validator);
  }
}