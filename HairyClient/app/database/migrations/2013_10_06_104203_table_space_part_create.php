<?php

use Illuminate\Database\Migrations\Migration;

class TableSpacePartCreate extends Migration {
  public function up() {
    Schema::create('space_parts', function($table) {
      $table->increments('id');
      $table->string('name', 64);
      $table->string('desc', 256);
      $table->integer('mass');
    });
  }
  
  public function down() {
    Schema::drop('space_parts');
  }
}