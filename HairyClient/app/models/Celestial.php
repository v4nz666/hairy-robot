<?php

class Celestial extends Eloquent {
  protected $hidden = [];
  
  public function system() {
    return $this->belongsTo('System');
  }
  
  public function parent() {
    return $this->belongsTo('Celestial', 'parent_id');
  }
  
  public function children() {
    return $this->hasMany('Celestial', 'parent_id');
  }
}