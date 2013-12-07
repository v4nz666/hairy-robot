<?php

namespace Games\Space;

use Hairy\Gen;

class GeneratorController extends \Controller {
  public function __construct() {
    $this->beforeFilter('auth');
  }
  
  public function ships() {
    return Gen::generateShip();
  }
  
  public function planets() {
    return Gen::generatePlanet();
  }
  
  // Damn, this was a good shot at splitting words into syllables, but won't work...
  public function syllables($word) {
    $word = strtolower($word);
    
    // Regex Patterns Needed
    $triples = 'dn\'t|eau|iou|ouy|you|bl$';
    $doubles = 'ai|ae|ay|au|ea|ee|ei|eu|ey|ie|ii|io|oa|oe|oi|oo|ou|oy|ue|uy|ya|ye|yi|yo|yu';
    $singles = 'a|e|i|o|u|y';
    $vowels = '/('.$triples.'|'.$doubles.'|'.$singles.')/';
    $trailing_e = '/e$/'; $trailing_s = '/s$/';
    
    // Cleaning up word endings
    $word = preg_replace($trailing_s, '', $word);
    $word = preg_replace($trailing_e, '', $word);
    
    // Count # of “vowels”
    preg_match_all($vowels, $word, $matches);
    
    $i = 0;
    foreach($matches[0] as $v) {
      echo $i;
      $n = strpos($word, $v, $i);
      echo substr($word, $i, strlen($v) + $n - $i) . ' ';
      $i += $n + strlen($v);
    }
    
    //$syl_count = count($matches[0]);
    //return $syl_count;
    //return $matches;
  }
}