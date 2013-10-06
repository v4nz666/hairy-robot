<?php

class SpacePartAttrib extends Eloquent {
  public $timestamps = false;
  
  public function part() {
    return $this->belongsTo('SpacePart');
  }
}