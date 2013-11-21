<?php

class System extends Eloquent {
  public function ships() {
    return $this->hasMany('Ship');
  }
}