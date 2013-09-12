<?php

class AuthController extends Controller {
  public function __construct() {
    $this->beforeFilter('nauth');
    $this->beforeFilter('csrf', array('on' => array('post', 'put', 'delete')));
  }
  
  public function putRegister() {
    $validator = Validator::make(Input::all(), [
      'name' => ['required', 'min:6', 'max:20', 'unique:users'],
      'pass' => ['required', 'min:8', 'max:256']
    ]);
    
    if($validator->passes()) {
      $user = new User;
      $user->name = Input::get('name');
      $user->pass = Hash::make(Input::get('pass'));
      $user->save();
      Auth::login($user);
      
      return Redirect::action('HomeController@home');
    } else {
      return Redirect::action('HomeController@home')->withInput(Input::flash())->withErrors($validator);
    }
  }
  
  public function login() {
    $validator = Validator::make(Input::all(), [
      'name' => ['required', 'min:6', 'max:20', 'exists:users'],
      'pass' => ['required', 'min:8', 'max:256']
    ]);
    
    if($validator->passes()) {
      if(Auth::attempt(Input::all())) {
        return Redirect::action('HomeController@home');
      }
    }
    
    return Redirect::action('HomeController@home')->withInput(Input::flash())->withErrors($validator);
  }
}