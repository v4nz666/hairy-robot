<?php

use Illuminate\Auth\UserInterface;

class SpaceUser extends Eloquent {
  public function user() {
    return $this->belongsTo('User');
  }
}