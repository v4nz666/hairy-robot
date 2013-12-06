<?php

namespace Games\Space;

class GameController extends \Controller {
  public function __construct() {
    $this->beforeFilter('auth');
    $this->beforeFilter('csrf', ['on' => ['post', 'put', 'delete']]);
  }
  
  public function home($ip = 'hairy.monoxidedesign.com', $port = 9092) {
    return \View::make('space.home')->with('ip', $ip)->with('port', $port);
  }
  
  public function build() {
    return \View::make('space.build');
  }
  
  public function system() {
    $system  = \System::find(1);
    $star    = $system->celestials->first();
    $planets = $star->children->all();
    return \View::make('space.system')->with('system', $system)->with('star', $star)->with('planets', $planets);
  }
}