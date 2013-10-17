<?php

namespace Games\Space;

class StorageController extends \Controller {
  public function __construct() {
    $this->beforeFilter('auth');
  }
  
  public function parts() {
    return \SpacePart::with('infos', 'attribs')->get()->toJSON();
  }
  
  public function ships() {
    return \Auth::user()->spaceUser->ships->toJSON();
  }
}