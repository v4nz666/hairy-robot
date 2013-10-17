<?php

class SpaceShip extends Eloquent {
  public function user() {
    return $this->belongsTo('SpaceUser');
  }
}