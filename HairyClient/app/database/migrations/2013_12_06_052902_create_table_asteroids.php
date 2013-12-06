<?php

use Illuminate\Database\Migrations\Migration;

class CreateTableAsteroids extends Migration {
  public function up() {
    Schema::create('asteroids', function($table) {
      $table->increments('id');
      $table->integer('celestial_id')->unsigned();
      $table->integer('x');
      $table->integer('y');
      $table->string('coords', 256);
      
      $table->foreign('celestial_id')
            ->references('id')
            ->on('celestials');
    });
  }
  
  public function down() {
    Schema::drop('asteroids');
  }
}