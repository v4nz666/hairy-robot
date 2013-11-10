<?php

use Illuminate\Auth\UserInterface;

class User extends Eloquent implements UserInterface {
  protected $hidden = ['password'];
  
  public function getAuthIdentifier() {
    return $this->getKey();
  }
  
  public function getAuthPassword() {
    return $this->password;
  }
  
  public function ships() {
    return $this->hasMany('Ship');
  }
}