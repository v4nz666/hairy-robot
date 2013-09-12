<?php

namespace Games;

class SpaceController extends \Controller {
  public function __construct() {
    $this->beforeFilter('auth');
    $this->beforeFilter('csrf', ['on' => ['post', 'put', 'delete']]);
  }
  
  public function home() {
    $user = \Auth::user()->spaceUser;
    if($user === null) {
      $user = new \SpaceUser;
      $user->user_id = \Auth::user()->id;
      $user->max_life = 100;
      $user->max_shields = 100;
      $user->max_guns = 5;
      $user->max_bullets = 3;
      $user->max_vel = 6;
      $user->life = $user->max_life;
      $user->shields = $user->max_shields;
      $user->guns = 1;
      $user->turn_speed = 5;
      $user->size = 32;
      $user->colour = '#FF00FF';
      $user->x = 400;
      $user->y = 300;
      $user->kills = 0;
      $user->deaths = 0;
      $user->save();
    }
    
    return \View::make('space.home');
  }
}