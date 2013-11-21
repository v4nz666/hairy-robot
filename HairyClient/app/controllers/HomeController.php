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
    $factions = Faction::where('can_join', '=', 1)->lists('name', 'id');
    array_unshift($factions, Lang::get('home.selectFaction'));
    return View::make('register')->with('factions', $factions);
  }
}