<?php

class Ship extends Eloquent {
  protected $hidden = ['user_id', 'x', 'y', 'created_at', 'updated_at', 'pivot'];
  
  public function owner() {
    return $this->belongsToMany('User', 'user_ships');
  }
  
  public function scopeMine($query) {
    return $query->where('ships.user_id', '=', Auth::user()->id);
  }
  
  public function scopeShared($query) {
    return $query->where('ships.user_id', '<>', Auth::user()->id);
  }
}