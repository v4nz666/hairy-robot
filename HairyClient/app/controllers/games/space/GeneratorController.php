<?php

namespace Games\Space;

class GeneratorController extends \Controller {
  public function __construct() {
    $this->beforeFilter('auth');
  }
  
  public function ships() {
    return 'Not implemented';
  }
  
  public function planets() {
    return 'Not implemented';
  }
}