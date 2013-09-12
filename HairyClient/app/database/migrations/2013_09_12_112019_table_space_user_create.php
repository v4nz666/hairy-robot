<?php

use Illuminate\Database\Migrations\Migration;

class TableSpaceUserCreate extends Migration {
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up() {
    Schema::create('space_users', function($table) {
      $table->increments('id');
      $table->integer('user_id')->unsigned();
      $table->integer('max_life')->unsigned();
      $table->integer('max_shields')->unsigned();
      $table->integer('max_guns')->unsigned();
      $table->integer('max_bullets')->unsigned();
      $table->float  ('max_vel');
      $table->integer('life')->unsigned();
      $table->integer('shields')->unsigned();
      $table->integer('guns')->unsigned();
      $table->float('turn_speed');
      $table->integer('size')->unsigned();
      $table->string('colour', 7);
      $table->float('x');
      $table->float('y');
      $table->integer('kills');
      $table->integer('deaths');
      $table->timestamps();
      
      $table->foreign('user_id')
            ->references('id')
            ->on('users');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down() {
    Schema::drop('space_users');
  }
}