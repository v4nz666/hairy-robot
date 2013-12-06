<?php

class DatabaseSeeder extends Seeder {
  public function run() {
    Eloquent::unguard();
    
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
    
    // Kill all FKs
    foreach($fks as $fk) {
      Schema::table($fk->TABLE_NAME, function($table) use($fk) {
        $table->dropForeign($fk->CONSTRAINT_NAME);
      });
    }
    
    // Truncate all tables
    foreach($tables as $table) {
      DB::table($table->TABLE_NAME)->truncate();
    }
    
    // Add all the FKs back
    foreach($fks as $fk) {
      Schema::table($fk->TABLE_NAME, function($table) use($fk) {
        $table->foreign($fk->COLUMN_NAME)
              ->references($fk->REFERENCED_COLUMN_NAME)
              ->on($fk->REFERENCED_TABLE_NAME);
      });
    }
    
    // Seed everything
    $this->call('TableSeeder');
  }
}

class TableSeeder extends Seeder {
  public function run() {
    $sy[0] = $this->generateSystem();
    
    $fc[0] = Faction::create(['system_id' => $sy[0]->id, 'name' => 'Faction 1',     'can_join' => 1]);
    $fc[1] = Faction::create(['system_id' => $sy[0]->id, 'name' => 'Faction 2',     'can_join' => 1]);
    $fc[2] = Faction::create(['system_id' => $sy[0]->id, 'name' => 'Faction 3',     'can_join' => 1]);
    $fc[3] = Faction::create(['system_id' => $sy[0]->id, 'name' => 'Space Pirates', 'can_join' => 0]);
    
    $us[0] = User::create([
      'username'   => 'Corey',
      'password'   => '$2y$08$uR2/fYV7UhBR/0aHckwbxe3lxVUk6XysFOFXQ.iNm93WNXZh4rSfO'
    ]);
    $us[1] = User::create([
      'username'   => 'v4nz666',
      'password'   => '$2y$08$5s2X1dTgs8GoyhqSSWZ4EehyexHDICUQxpjvMPj7EbRa9JwO4UztC'
    ]);
    
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
    
    UserShip::create(['user_id' => $us[0]->id, 'ship_id' => $sh[0]->id]);
    UserShip::create(['user_id' => $us[0]->id, 'ship_id' => $sh[1]->id]);
    UserShip::create(['user_id' => $us[1]->id, 'ship_id' => $sh[0]->id]);
    UserShip::create(['user_id' => $us[1]->id, 'ship_id' => $sh[1]->id]);
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
        //star.addCelestial(AsteroidBelt.generate(this, star, 0, (int)d));
      }
    }
    
    return $sy;
  }
  
  public function generateStar($system, $parent, $distance) {
    // Radius ~= .5 - 5 solar radii (at 1/1000 scale)
    $radius = 12000 + mt_rand(0, 100000);
    
    // Mass ~= 0.05 - 50 Solar masses;
    $mass = 0.05 + 50 * (mt_rand(0, 100) / 100);
    
    // Temperatures range from 300K to 30000K
    $temp = 3000 + 1000 * mt_rand(0, 27);
    
    return Celestial::create([
      'system_id' => $system->id,
      'parent_id' => $parent != null ? $parent->id : null,
      'type'      => 'star',
      'name'      => 'Sol',
      'distance'  => $distance,
      'size'      => $radius,
      'mass'      => $mass,
      'temp'      => $temp,
      'theta'     => mt_rand(0, 359)
    ]);
  }
  
  public function generatePlanet($parent, $distance) {
    $system = $parent->system;
    
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
    
    //TODO: Mass/temp
    $planet = Celestial::create([
      'system_id' => $system->id,
      'parent_id' => $parent->id,
      'type'      => 'planet',
      'name'      => 'Earth',
      'distance'  => $distance,
      'size'      => $size,
      'mass'      => 0,
      'temp'      => 0,
      'theta'     => mt_rand(0, 359)
    ]);
    
    $n = 1 + mt_rand(0, max(1, ($size / 3000)));
    for($i = 0; $i < $n; $i++) {
      $d = max($size * 3, $size * $i) + ($size * $i / 2);
      $this->generateMoon($planet, $d);
    }
    
    return $planet;
  }
  
  public function generateMoon($parent, $distance) {
    $system = $parent->system;
    
    $minSize = 512 + mt_rand(0, 100) - 50; 
    $size = max($minSize, mt_rand(0, $parent->size / 8));
    
    return Celestial::create([
      'system_id' => $system->id,
      'parent_id' => $parent->id,
      'type'      => 'moon',
      'name'      => 'Luna',
      'distance'  => $distance,
      'size'      => $size,
      'mass'      => 0,
      'temp'      => 0,
      'theta'     => mt_rand(0, 359)
    ]);
  }
}