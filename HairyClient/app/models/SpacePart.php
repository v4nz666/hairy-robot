<?php

class SpacePart extends Eloquent {
  public $timestamps = false;
  
  public function type() {
    return $this->belongsTo('SpacePartType');
  }
  
  public function infos() {
    return $this->hasMany('SpacePartInfo');
  }
  
  public function attribs() {
    return $this->hasMany('SpacePartAttrib');
  }
}