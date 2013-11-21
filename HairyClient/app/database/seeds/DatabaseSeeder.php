<?php

class DatabaseSeeder extends Seeder {
  public function run() {
    Eloquent::unguard();
    
    DB::table('user_ships')->delete();
    DB::table('ships')->delete();
    DB::table('users')->delete();
    DB::table('systems')->delete();
    DB::table('factions')->delete();
    DB::statement("ALTER TABLE user_ships AUTO_INCREMENT=1;");
    DB::statement("ALTER TABLE ships AUTO_INCREMENT=1;");
    DB::statement("ALTER TABLE users AUTO_INCREMENT=1;");
    DB::statement("ALTER TABLE systems AUTO_INCREMENT=1;");
    DB::statement("ALTER TABLE factions AUTO_INCREMENT=1;");
    
    $this->call('TableSeeder');
  }
}

class TableSeeder extends Seeder {
  public function run() {
    $sy[0] = System::create(['name' => 'Sol']);
    
    $fc[0] = Faction::create(['name' => 'Faction 1',     'can_join' => 1]);
    $fc[1] = Faction::create(['name' => 'Faction 2',     'can_join' => 1]);
    $fc[2] = Faction::create(['name' => 'Faction 3',     'can_join' => 1]);
    $fc[3] = Faction::create(['name' => 'Space Pirates', 'can_join' => 0]);
    
    $us[0] = User::create([
      'username'   => 'Corey',
      'password'   => '$2y$08$uR2/fYV7UhBR/0aHckwbxe3lxVUk6XysFOFXQ.iNm93WNXZh4rSfO',
      'faction_id' => $fc[0]->id
    ]);
    $us[1] = User::create([
      'username'   => 'v4nz666',
      'password'   => '$2y$08$5s2X1dTgs8GoyhqSSWZ4EehyexHDICUQxpjvMPj7EbRa9JwO4UztC',
      'faction_id' => $fc[0]->id
    ]);
    
    $sh[0] = Ship::create([
      'name'      => 'Forward Unto Dawn',
      'system_id' => $sy[0]->id,
      'user_id'   => $us[0]->id]
    );
    $sh[1] = Ship::create([
      'name'      => 'Jeff\'s Pretty Badass Ship',
      'system_id' => $sy[0]->id,
      'user_id'   => $us[1]->id
    ]);
    
    UserShip::create(['user_id' => $us[0]->id, 'ship_id' => $sh[0]->id]);
    UserShip::create(['user_id' => $us[0]->id, 'ship_id' => $sh[1]->id]);
    UserShip::create(['user_id' => $us[1]->id, 'ship_id' => $sh[0]->id]);
    UserShip::create(['user_id' => $us[1]->id, 'ship_id' => $sh[1]->id]);
  }
}