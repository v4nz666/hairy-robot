<?php

class Celestial extends Eloquent {
  protected $hidden = [];
  
  public function system() {
    return $this->belongsTo('System');
  }
  
  public function parent() {
    return $this->belongsTo('Celestial');
  }
  
  public function children() {
    return $this->hasMany('Celestial');
  }
}