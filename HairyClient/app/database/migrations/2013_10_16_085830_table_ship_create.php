<?php

use Illuminate\Database\Migrations\Migration;

class TableShipCreate extends Migration {
  public function up() {
    Schema::create('ships', function($table) {
      $table->increments('id');
      $table->string('name', 30);
      $table->integer('system_id')->unsigned();
      $table->integer('user_id')->unsigned()->nullable();
      $table->double('x')->default(0);
      $table->double('y')->default(0);
      $table->timestamps();
      
      $table->foreign('system_id')
            ->references('id')
            ->on('systems');
      
      $table->foreign('user_id')
            ->references('id')
            ->on('users');
    });
  }
  
  public function down() {
    Schema::drop('ships');
  }
}