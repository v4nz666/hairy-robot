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
      $table->float  ('max_vel');
      $table->integer('life')->unsigned();
      $table->integer('shields')->unsigned();
      $table->string('gun', 64);
      $table->float('turn_speed');
      $table->integer('size')->unsigned();
      $table->string('colour', 7);
      $table->double('x');
      $table->double('y');
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