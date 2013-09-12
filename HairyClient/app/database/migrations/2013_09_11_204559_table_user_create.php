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
      $table->string('name', 20)->unique();
      $table->string('pass', 60);
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