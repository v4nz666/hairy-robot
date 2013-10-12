<?php

namespace Games;

class PartsController extends \Controller {
  public function __construct() {
  }
  
  public function getAll() {
    $allParts = \SpacePart::all()->toJSON();
    return json_encode($allParts);
  }
  
  public function build() {
    return \View::make('space.build');
  }
}