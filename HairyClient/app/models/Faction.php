<?php

class Faction extends Eloquent {
  protected $hidden = [];
  
  public function users() {
    return $this->hasMany('User');
  }
}