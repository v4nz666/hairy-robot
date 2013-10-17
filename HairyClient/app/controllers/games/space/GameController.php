<?php

namespace Games\Space;

class GameController extends \Controller {
  public function __construct() {
    $this->beforeFilter('auth');
    $this->beforeFilter('csrf', ['on' => ['post', 'put', 'delete']]);
  }
  
  public function home($ip = 'hairy.monoxidedesign.com', $port = 9092) {
    $user = \Auth::user()->spaceUser;
    if($user === null) {
      $user = new \SpaceUser;
      $user->user_id = \Auth::user()->id;
      $user->max_life = 100;
      $user->max_shields = 100;
      $user->max_vel = 6;
      $user->life = $user->max_life;
      $user->shields = $user->max_shields;
      $user->gun = "main.Gun\$PointDefenseTurret";
      $user->turn_speed = 5;
      $user->size = 16;
      $user->colour = '#FF00FF';
      $user->x = 400;
      $user->y = 300;
      $user->kills = 0;
      $user->deaths = 0;
      $user->credits = 10000;
      $user->save();
    }
    
    return \View::make('space.home')->with('ip', $ip)->with('port', $port);
  }
  
  public function build() {
    return \View::make('space.build');
  }
}