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
    $sy[0] = System::create(['name' => 'Sol']);
    
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
}