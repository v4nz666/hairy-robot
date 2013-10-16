<?php

use Illuminate\Database\Migrations\Migration;

class TableSpaceShipCreate extends Migration {
  public function up() {
    Schema::create('space_ships', function($table) {
      $table->increments('id');
      $table->string('name', 20)->unique();
      $table->string('json');
      $table->timestamps();
    });
  }
  
  public function down() {
    Schema::drop('space_ships');
  }
}