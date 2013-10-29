<?php

class DatabaseSeeder extends Seeder {
  public function run() {
    Eloquent::unguard();
    
    DB::table('space_ships')->delete();
    DB::table('space_users')->delete();
    DB::table('users')->delete();
    DB::table('space_part_infos')->delete();
    DB::table('space_part_attribs')->delete();
    DB::table('space_parts')->delete();
    DB::table('space_part_types')->delete();
    
    $this->call('UserTableSeeder');
    $this->call('SpacePartTypeTableSeeder');
    $this->call('SpacePartTableSeeder');
  }
}

class UserTableSeeder extends Seeder {
  public function run() {
    $users = [['Corey',   '$2y$08$uR2/fYV7UhBR/0aHckwbxe3lxVUk6XysFOFXQ.iNm93WNXZh4rSfO'],
              ['v4nz666', '$2y$08$5s2X1dTgs8GoyhqSSWZ4EehyexHDICUQxpjvMPj7EbRa9JwO4UztC']];
    
    foreach($users as $user) {
      User::create(['username' => $user[0], 'password' => $user[1]]);
    }
  }
}

class SpacePartTypeTableSeeder extends Seeder {
  public function run() {
    $types = [['Hull',     'Parts that make up the body of your ship'],
              ['Thruster', 'Parts that make you move']];
    
    foreach($types as $type) {
      SpacePartType::create(['name' => $type[0], 'desc' => $type[1]]);
    }
  }
}

class SpacePartTableSeeder extends Seeder {
  public function run() {
    $id = SpacePartType::first()->id;
    $parts = [['Hull', $id++, 'A 16x16m² section of hull', 1, 'ctx.fillStyle=\'white\';ctx.strokeStyle=\'grey\';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,16);ctx.lineTo(16,16);ctx.lineTo(16,0);ctx.closePath();ctx.fill();ctx.stroke();', 1000, [], []],
              ['Rocket', $id++, 'Makes you move', 1, 'ctx.fillStyle=\'white\';ctx.beginPath();ctx.moveTo(4,4);ctx.lineTo(4,12);ctx.lineTo(12,12);ctx.lineTo(12,4);ctx.closePath();ctx.fill();', 1000, [], [['acc', 'Acceleration', 'Acceleration (m/s²)', 'num', '0.03125']]]];
    
    foreach($parts as $part) {
      $id = SpacePart::create(['name' => $part[0], 'space_part_type_id' => $part[1], 'desc' => $part[2], 'mass' => $part[3], 'render' => $part[4], 'cost' => $part[5]])->id;
      
      foreach($part[6] as $info) {
        SpacePartInfo::create(['space_part_id' => $id, 'var' => $info[0], 'name' => $info[1], 'desc' => $info[2]]);
      }
      
      foreach($part[7] as $attrib) {
        SpacePartAttrib::create(['space_part_id' => $id, 'var' => $attrib[0], 'name' => $attrib[1], 'desc' => $attrib[2], 'type' => $attrib[3], 'vals' => $attrib[4]]);
      }
    }
  }
}