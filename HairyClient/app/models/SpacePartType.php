<?php

class SpacePartType extends Eloquent {
  public $timestamps = false;
  
  public function parts() {
    return $this->hasMany('SpacePart');
  }
}