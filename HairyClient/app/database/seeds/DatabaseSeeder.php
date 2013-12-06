<?php

class DatabaseSeeder extends Seeder {
  public function run() {
    Eloquent::unguard();
    
    $this->command->info('Getting foreign keys...');
    $t1 = microtime(true);
    
    // Get the database name
    $dbname = DB::connection('mysql')->getDatabaseName();
    
    // Find the FKs
    $fks = DB::table('INFORMATION_SCHEMA.KEY_COLUMN_USAGE')
            ->select('TABLE_NAME', 'COLUMN_NAME', 'CONSTRAINT_NAME', 'REFERENCED_TABLE_NAME', 'REFERENCED_COLUMN_NAME')
      ->whereNotNull('REFERENCED_TABLE_NAME')
               ->get();
    
    // Find the tables
    $tables = DB::table('INFORMATION_SCHEMA.TABLES')
               ->select('TABLE_SCHEMA', 'TABLE_NAME')
                ->where('TABLE_SCHEMA', '=', $dbname)
                ->where('TABLE_NAME', '<>', 'migrations')
                  ->get();
    
    $this->command->info('Killing foreign keys...');
    
    // Kill all FKs
    foreach($fks as $fk) {
      Schema::table($fk->TABLE_NAME, function($table) use($fk) {
        $table->dropForeign($fk->CONSTRAINT_NAME);
      });
    }
    
    $this->command->info('Truncating tables...');
    
    // Truncate all tables
    foreach($tables as $table) {
      DB::table($table->TABLE_NAME)->truncate();
    }
    
    $this->command->info('Reinstating foreign keys...');
    
    // Add all the FKs back
    foreach($fks as $fk) {
      Schema::table($fk->TABLE_NAME, function($table) use($fk) {
        $table->foreign($fk->COLUMN_NAME)
              ->references($fk->REFERENCED_COLUMN_NAME)
              ->on($fk->REFERENCED_TABLE_NAME);
      });
    }
    
    $this->command->info('Truncation completed in ' . (microtime(true) - $t1) . ' seconds.');
    
    // Seed everything
    $this->call('TableSeeder');
  }
}

class TableSeeder extends Seeder {
  public function run() {
    DB::transaction(function() {
      $t1 = microtime(true);
      
      $this->command->info('Generating system...');
      
      $sy[0] = $this->generateSystem();
      
      $this->command->info('Creating factions...');
      
      $fc[0] = Faction::create(['system_id' => $sy[0]->id, 'name' => 'Faction 1',     'can_join' => 1]);
      $fc[1] = Faction::create(['system_id' => $sy[0]->id, 'name' => 'Faction 2',     'can_join' => 1]);
      $fc[2] = Faction::create(['system_id' => $sy[0]->id, 'name' => 'Faction 3',     'can_join' => 1]);
      $fc[3] = Faction::create(['system_id' => $sy[0]->id, 'name' => 'Space Pirates', 'can_join' => 0]);
      
      $this->command->info('Creating users...');
      
      $us[0] = User::create([
        'username'   => 'Corey',
        'password'   => '$2y$08$uR2/fYV7UhBR/0aHckwbxe3lxVUk6XysFOFXQ.iNm93WNXZh4rSfO'
      ]);
      $us[1] = User::create([
        'username'   => 'v4nz666',
        'password'   => '$2y$08$5s2X1dTgs8GoyhqSSWZ4EehyexHDICUQxpjvMPj7EbRa9JwO4UztC'
      ]);
      
      $this->command->info('Creating ships...');
      
      $sh[0] = Ship::create([
        'name'      => 'Forward Unto Dawn',
        'system_id' => $sy[0]->id,
        'user_id'   => $us[0]->id,
        'faction_id' => $fc[0]->id
      ]);
      $sh[1] = Ship::create([
        'name'      => 'Jeff\'s Pretty Badass Ship',
        'system_id' => $sy[0]->id,
        'user_id'   => $us[1]->id,
        'faction_id' => $fc[0]->id
      ]);
      
      $this->command->info('Creating shared ship associations...');
      
      UserShip::create(['user_id' => $us[0]->id, 'ship_id' => $sh[0]->id]);
      UserShip::create(['user_id' => $us[0]->id, 'ship_id' => $sh[1]->id]);
      UserShip::create(['user_id' => $us[1]->id, 'ship_id' => $sh[0]->id]);
      UserShip::create(['user_id' => $us[1]->id, 'ship_id' => $sh[1]->id]);
      
      $this->command->info('Seeding completed in ' . (microtime(true) - $t1) . ' seconds.');
    });
  }
  
  public function generateSystem() {
    $size = 512 * 567890;
    
    $sy = System::create(['name' => 'Sol', 'size' => $size]);
    $star = $this->generateStar($sy, null, 0);
    
    $count = 12;
    
    $fib = 1;
    $i = 0;
    
    // Distance of the outermost orbit (1000000km from the outer edge)
    $maxD = ($size / 2) - 1000000;
    
    // Our Fibonacci sequence
    $seq = [];
    
    for($i = 0; $i < $count; $i++) {
      $seq[$i] = $fib;
      $fib = ($i > 0) ? $fib + $seq[$i - 1] : $fib + 1;
    }
    
    // Divide the total System size into the number of divisions
    // defined by the largest(last) number in the sequence
    $div = $maxD / $seq[$count - 1];
    for($i = 0; $i < $count; $i++) {
      $d = $div * $seq[$i];
      if($i != 3) {
        $this->generatePlanet($star, $d);
      } else {
        $this->generateBelt($star, 0, $d);
      }
    }
    
    return $sy;
  }
  
  public function generateStar($system, $parent, $distance) {
    $name = 'Sol';
    
    // Radius ~= .5 - 5 solar radii (at 1/1000 scale)
    $radius = 12000 + mt_rand(0, 100000);
    
    // Mass ~= 0.05 - 50 Solar masses;
    $mass = 0.05 + 50 * (mt_rand(0, 100) / 100);
    
    // Temperatures range from 300K to 30000K
    $temp = 3000 + 1000 * mt_rand(0, 27);
    
    $star = Celestial::create([
      'system_id' => $system->id,
      'parent_id' => $parent != null ? $parent->id : null,
      'type'      => 'star',
      'name'      => $name,
      'distance'  => $distance,
      'size'      => $radius,
      'mass'      => $mass,
      'temp'      => $temp,
      'theta'     => mt_rand(0, 359)
    ]);
    
    $this->command->info('Generated star ' . $name . ' [distance: ' . $distance . ', radius: ' . $radius . ', mass: ' . $mass . ', temp: ' . $temp . ']');
    
    return $star;
  }
  
  public function generatePlanet($parent, $distance) {
    $system = $parent->system;
    
    //TODO: Mass/temp
    $name = 'Earth';
    $mass = 0;
    $temp = 0;
    
    $scale = mt_rand(0, 9);
    $div = 0;
    $d = $distance;
    $sSize = $system->size;
    
    // Constrain d so that inner/outer planets stay a reasonable size
    $d = max(min($d, $sSize / 15), $sSize / 100);
    
    // Small planets
    if($scale <= 2) {
      $div = 1000;
    // Large Planets
    } else if($scale >= 9) {
      $div = 250;
    } else {
      $div = 750;
    }
    
    $size = ($d / $div) + ($d / ($div * 3) * (mt_rand(0, 100) / 100) - $d / ($div * 6));
    
    $planet = Celestial::create([
      'system_id' => $system->id,
      'parent_id' => $parent->id,
      'type'      => 'planet',
      'name'      => $name,
      'distance'  => $distance,
      'size'      => $size,
      'mass'      => $mass,
      'temp'      => $temp,
      'theta'     => mt_rand(0, 359)
    ]);
    
    $n = 1 + mt_rand(0, max(1, ($size / 3000)));
    for($i = 0; $i < $n; $i++) {
      $d = max($size * 3, $size * $i) + ($size * $i / 2);
      $this->generateMoon($planet, $d);
    }
    
    $this->command->info('Generated planet ' . $name . ' [distance: ' . $distance . ', radius: ' . $size . ', mass: ' . $mass . ', temp: ' . $temp . ']');
    
    return $planet;
  }
  
  public function generateMoon($parent, $distance) {
    $system = $parent->system;
    
    $name = 'Luna';
    $mass = 0;
    $temp = 0;
    
    $minSize = 512 + mt_rand(0, 100) - 50; 
    $size = max($minSize, mt_rand(0, $parent->size / 8));
    
    $moon = Celestial::create([
      'system_id' => $system->id,
      'parent_id' => $parent->id,
      'type'      => 'moon',
      'name'      => $name,
      'distance'  => $distance,
      'size'      => $size,
      'mass'      => $mass,
      'temp'      => $temp,
      'theta'     => mt_rand(0, 359)
    ]);
    
    $this->command->info('Generated moon ' . $name . ' [distance: ' . $distance . ', radius: ' . $size . ', mass: ' . $mass . ', temp: ' . $temp . ']');
    
    return $moon;
  }
  
  public function generateBelt($parent, $distance, $size) {
    $system = $parent->system;
    
    $name = 'Belt';
    
    $belt = Celestial::create([
      'system_id' => $system->id,
      'parent_id' => $parent->id,
      'type'      => 'belt',
      'name'      => 'Belt',
      'distance'  => $distance,
      'size'      => $size,
      'mass'      => 0,
      'temp'      => 0,
      'theta'     => mt_rand(0, 359)
    ]);
    
    $this->command->info('Generated belt ' . $name . ' [distance: ' . $distance . ', radius: ' . $size . ']');
    
    $asteroidCount = floor($size / 250);
    $freq = 10000;
    $amp = $size / 100;
    
    $th = 0;
    $asteroidSpacing = M_PI * 2 / $asteroidCount;
    
    $this->command->info('Generating ' . $asteroidCount . ' asteroids...');
    
    for($i = 0; $i < $asteroidCount; $i++) {
      $th = $asteroidSpacing * $i;
      
      $c0 = new Coord;
      $totalSize = 0;
      
      $minRadius =  mt_rand(2, 100) / 100 * 200;
      $smoothness = $minRadius / 5;
      
      $numPoints = 10 + mt_rand(0, 15);
      $pointSpacing = M_PI * 2 / $numPoints;
      $points = [];
      
      for($j = 0; $j < $numPoints; $j++) {
        $_th =  $pointSpacing * $j;
        $rad = $minRadius + mt_rand(0, 100) / 100 * $smoothness - $smoothness / 2; // Couldn't this just be * $smoothness / 2?
        $x = cos($_th) * $rad;
        $y = sin($_th) * $rad;
        $totalSize = $totalSize + $rad;
        
        $c = new Coord(floor($x), floor($y));
        
        // Store the first Coord so we can close the circle properly
        if($j === 0) { $c0 = $c; }
        if($j === $numPoints - 1) {
          $c = $c0;
          $_th = M_PI * 2;
        }
        
        $points[$j] = $c;
      }
      
      $asize = $totalSize / $numPoints;
      
      $d = $size + $amp * sin($freq * $th); 
      
      $jitterX = mt_rand(0, 100) / 100 * 0.05 - 0.025;
      $jitterY = mt_rand(0, 100) / 100 * 0.05 - 0.025;
      
      $aX = cos($th + $jitterX) * $d; 
      $aY = sin($th + $jitterY) * $d; 
      
      //System.out.println("Th[" + th + "]aX[" + aX + "]aY[" + aY + "]"); 
      
      $this->generateAsteroid($belt, $d, $asize, $aX, $aY, $points);
    }
  }
  
  public function generateAsteroid($parent, $distance, $size, $x, $y, $coords) {
    $system = $parent->system;
    
    $asteroid = Celestial::create([
      'system_id' => $system->id,
      'parent_id' => $parent->id,
      'type'      => 'asteroid',
      'name'      => '',
      'distance'  => $distance,
      'size'      => $size,
      'mass'      => 0,
      'temp'      => 0,
      'theta'     => mt_rand(0, 359)
    ]);
    
    $c = '';
    $i = 0;
    
    foreach($coords as $coord) {
      if($i !== 0) $c .= ',';
      $c .= $coord->x . ',' . $coord->y;
      $i++;
    }
    
    return Asteroid::create([
      'celestial_id' => $asteroid->id,
      'x'            => $x,
      'y'            => $y,
      'coords'       => $c
    ]);
  }
}

class Coord {
  public function __construct() {
    $a = func_get_args();
    $i = func_num_args();
    
    if($i === 1) {
      $this->x = $a[0]->x;
      $this->y = $a[0]->y;
    } elseif($i === 2) {
      $this->x = $a[0];
      $this->y = $a[1];
    }
  }
  
  public $x = 0;
  public $y = 0;
}