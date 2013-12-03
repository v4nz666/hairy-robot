<?php

use Illuminate\Database\Migrations\Migration;

class CreateCelestialsTable extends Migration {
  public function up() {
    Schema::create('celestials', function($table) {
      $table->increments('id');
      $table->integer('system_id')->unsigned();
      $table->integer('parent_id')->unsigned()->nullable();
      $table->string('name', 40);
      $table->double('distance');
      $table->integer('size');
      $table->double('mass');
      $table->double('temp');
      $table->double('theta');
      $table->timestamps();
    });
  }
  
  public function down() {
    Schema::drop('celestials');
  }
}