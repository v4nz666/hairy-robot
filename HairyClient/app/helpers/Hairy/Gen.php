<?php

namespace Hairy;

class Gen {
  public static function generateShip() {
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
  
  public static function generateStar() {
    return generatePlanet();
  }
  
  public static function generatePlanet() {
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
  
  public static function generateMoon() {
    return Gen::generatePlanet();
  }
  
  public static function generateBelt() {
    return Gen::generatePlanet() . ' Belt';
  }
}