<?php

class System extends Eloquent {
  public function ships() {
    return $this->hasMany('Ship');
  }
  
  public function factions() {
    return $this->hasMany('Faction');
  }
  
  public function celestials() {
    return $this->hasMany('Celestial');
  }
}