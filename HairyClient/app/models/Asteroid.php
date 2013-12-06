<?php

class Asteroid extends Eloquent {
  public $timestamps = false;
  
  protected $hidden = [];
  
  public function celestial() {
    return $this->belongsTo('Celestial');
  }
}