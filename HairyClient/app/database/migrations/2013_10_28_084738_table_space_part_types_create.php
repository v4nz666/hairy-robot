<?php

use Illuminate\Database\Migrations\Migration;

class TableSpacePartTypesCreate extends Migration {
  public function up() {
    Schema::create('space_part_types', function($table) {
      $table->increments('id');
      $table->string('name', 64);
      $table->string('desc', 256);
    });
  }
  
  public function down() {
    Schema::drop('space_part_types');
  }
}