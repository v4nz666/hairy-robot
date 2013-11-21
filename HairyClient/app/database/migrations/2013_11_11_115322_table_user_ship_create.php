<?php

use Illuminate\Database\Migrations\Migration;

class TableUserShipCreate extends Migration {
  public function up() {
    Schema::create('user_ships', function($table) {
      $table->increments('id');
      $table->integer('user_id')->unsigned()->nullable();
      $table->integer('ship_id')->unsigned()->nullable();
      $table->timestamps();
      
      $table->foreign('user_id')
            ->references('id')
            ->on('users');
      
      $table->foreign('ship_id')
            ->references('id')
            ->on('ships');
    });
  }
  
  public function down() {
    Schema::drop('user_ships');
  }
}