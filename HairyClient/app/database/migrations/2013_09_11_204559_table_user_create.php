<?php

use Illuminate\Database\Migrations\Migration;

class TableUserCreate extends Migration {
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up() {
    Schema::create('users', function($table) {
      $table->increments('id');
      $table->string('username', 20)->unique();
      $table->string('password', 60);
      $table->string('auth', 64);
      $table->timestamps();
    });
  }
  
  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down() {
    Schema::drop('users');
  }
}