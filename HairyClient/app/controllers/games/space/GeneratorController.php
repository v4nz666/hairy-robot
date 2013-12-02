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
    $name = [
      'Ceres', 'Pallas', 'Juno', 'Vesta', 'Astraea', 'Hebe', 'Iris', 'Flora', 'Metis',
      'Hygiea', 'Parthenope', 'Victoria', 'Egeria', 'Irene', 'Eunomia', 'Psyche', 'Tethis',
      'Melpomene', 'Fortuna', 'Massalia', 'Lutetia', 'Kalliope', 'Thalia', 'Themis', 'Procaea',
      'Proserpina', 'Euterpe', 'Bellona', 'Amphitrite', 'Urania', 'Euphrosyne', 'Pomona',
      'Polyhymnia', 'Circe', 'Leukothea', 'Atalante', 'Fides', 'Leda', 'Laetitia', 'Harmonia',
      'Daphne', 'Isis', 'Ariadne', 'Nysa', 'Eugenia', 'Hestia', 'Aglaja', 'Doris', 'Pales', 'Virginia'
    ];
    
    $n = $name[mt_rand(0, count($name) - 1)];
    
    if(mt_rand(0, 4) === 0) {
      $n = 'New ' . $n;
    }
    
    return $n;
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