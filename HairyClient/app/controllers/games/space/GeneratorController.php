<?php

namespace Games\Space;

class GeneratorController extends \Controller {
  public function __construct() {
    $this->beforeFilter('auth');
  }
  
  public function ships() {
    switch(mt_rand(0, 1)) {
      case 0:
        $noun = [
          'Pillar',
          'Dawn',
          'Noon',
          'Evening',
          'Night',
          'Midnight',
          'Spring',
          'Summer',
          'Fall',
          'Autumn',
          'Winter',
          'Beginning',
          'Ending',
          'End'
        ];
        
        $adjt = [
          'Unyielding',
          'Destructive',
          'Valiant',
          'Unending',
          'Unbending'
        ];
        
        return $adjt[mt_rand(0, count($adjt) - 1)] . ' ' .
               $noun[mt_rand(0, count($noun) - 1)];
      
      case 1:
        $noun = [
          'Pillar',
          'Dawn',
          'Noon',
          'Evening',
          'Night',
          'Midnight',
          'Spring',
          'Summer',
          'Fall',
          'Autumn',
          'Winter',
          'Beginning',
          'Ending',
          'End'
        ];
        
        return $noun[mt_rand(0, count($noun) - 1)] . ' of ' .
               $noun[mt_rand(0, count($noun) - 1)];
    }
    
    return 'Not implemented';
  }
  
  public function planets() {
    return 'Not implemented';
  }
}