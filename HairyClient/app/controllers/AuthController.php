<?php

Event::listen('auth.login', function($user) {
  $user->auth = str_random(64);
  $user->save();
});

Event::listen('auth.logout', function($user) {
  $user->auth = null;
  $user->save();
});

class AuthController extends Controller {
  public function __construct() {
    $this->beforeFilter('auth', ['only' => 'logout']);
    $this->beforeFilter('nauth', ['except' => 'logout']);
    $this->beforeFilter('csrf', ['on' => ['post', 'put', 'delete']]);
  }
  
  public function register() {
    $validator = Validator::make(Input::all(), [
      'username' => ['required', 'min:5', 'max:20', 'unique:users'],
      'password' => ['required', 'min:8', 'max:256']
    ]);
    
    if($validator->passes()) {
      $user = new User;
      $user->name = Input::get('username');
      $user->pass = Hash::make(Input::get('password'));
      $user->auth = str_random(64);
      $user->save();
      Auth::login($user);
      
      return Redirect::action('HomeController@home');
    } else {
      return Redirect::action('HomeController@home')->withInput(Input::only('username'))->withErrors($validator);
    }
  }
  
  public function login() {
    $validator = Validator::make(Input::all(), [
      'username' => ['required', 'min:5', 'max:20', 'exists:users'],
      'password' => ['required', 'min:8', 'max:256']
    ]);
    
    if($validator->passes()) {
      if(Auth::attempt(Input::only('username', 'password'))) {
        return Redirect::action('HomeController@home');
      } else {
        return Redirect::action('HomeController@home')->withInput(Input::only('username'))->withErrors(['username' => 'Something went wrong']);
      }
    }
    
    return Redirect::action('HomeController@home')->withInput(Input::only('username'))->withErrors($validator);
  }
  
  public function logout() {
    Auth::logout();
    return Redirect::action('HomeController@home');
  }
}