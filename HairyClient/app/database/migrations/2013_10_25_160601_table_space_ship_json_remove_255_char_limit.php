<?php

use Illuminate\Database\Migrations\Migration;

class TableSpaceShipJsonRemove255CharLimit extends Migration {
  public function up() {
    DB::statement('ALTER TABLE space_ships MODIFY space_ships.json VARCHAR(8000) NOT NULL;');
  }
  
  public function down() {
    DB::statement('ALTER TABLE space_ships MODIFY space_ships.json VARCHAR(255) NOT NULL;');
  }
}