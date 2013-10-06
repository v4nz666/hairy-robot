<?php

use Illuminate\Database\Migrations\Migration;

class TableSpacePartAttribCreate extends Migration {
  public function up() {
    Schema::create('space_part_attribs', function($table) {
      $table->increments('id');
      $table->integer('space_part_id')->unsigned();
      $table->string('var', 16);
      $table->string('name', 64);
      $table->string('desc', 256);
      $table->string('type', 16);
      $table->string('vals', 128);
      
      $table->foreign('space_part_id')
            ->references('id')
            ->on('space_parts');
    });
  }
  
  public function down() {
    Schema::drop('space_part_attribs');
  }
}