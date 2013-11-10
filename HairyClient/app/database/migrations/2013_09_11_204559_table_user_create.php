<?php

use Illuminate\Database\Migrations\Migration;

class TableUserCreate extends Migration {
  public function up() {
    Schema::create('users', function($table) {
      $table->increments('id');
      $table->string('username', 20)->unique();
      $table->string('password', 60);
      $table->string('auth', 64)->nullable();
      $table->integer('credits')->default(0);
      $table->timestamps();
    });
  }
  
  public function down() {
    Schema::drop('users');
  }
}