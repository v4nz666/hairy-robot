<?php

class Faction extends Eloquent {
  protected $hidden = [];
  
  public function ships() {
    return $this->hasMany('Ship');
  }
}