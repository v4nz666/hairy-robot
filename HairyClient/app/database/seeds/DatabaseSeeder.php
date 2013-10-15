<?php

class DatabaseSeeder extends Seeder {
  public function run() {
    Eloquent::unguard();
    
    DB::table('space_users')->delete();
    DB::table('users')->delete();
    
    $this->call('UserTableSeeder');
    $this->call('SpacePartTableSeeder');
  }
}

class UserTableSeeder extends Seeder {
  public function run() {
    User::create(['username' => 'Corey', 'password' => '$2y$08$uR2/fYV7UhBR/0aHckwbxe3lxVUk6XysFOFXQ.iNm93WNXZh4rSfO']);
    User::create(['username' => 'v4nz666', 'password' => '$2y$08$5s2X1dTgs8GoyhqSSWZ4EehyexHDICUQxpjvMPj7EbRa9JwO4UztC']);
  }
}

class SpacePartTableSeeder extends Seeder {
  public function run() {
    SpacePart::create(['name' => 'Hull', 'desc' => 'A 16x16m&sup2; section of hull', 'mass' => 1, 'render' => 'ctx.fillStyle=\'white\';ctx.strokeStyle=\'grey\';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,16);ctx.lineTo(16,16);ctx.lineTo(16,0);ctx.closePath();ctx.fill();ctx.stroke();']);
  }
}