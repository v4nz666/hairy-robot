<?php

class HomeController extends Controller {
  public function __construct() {
    $this->beforeFilter('nauth', ['only' => 'register']);
    $this->beforeFilter('csrf',  ['on' => ['post', 'put', 'delete']]);
  }
  
  public function home() {
    return View::make('home');
  }
  
  public function register() {
    return View::make('register');
  }
}