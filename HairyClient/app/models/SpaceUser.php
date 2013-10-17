<?php

class SpaceUser extends Eloquent {
  public function user() {
    return $this->belongsTo('User');
  }
  
  public function ships() {
    return $this->hasMany('SpaceShip');
  }
}