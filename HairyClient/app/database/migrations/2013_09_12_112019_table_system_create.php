<?php

use Illuminate\Database\Migrations\Migration;

class TableSystemCreate extends Migration {
  public function up() {
    Schema::create('systems', function($table) {
      $table->increments('id');
      $table->string('name', 64);
      $table->timestamps();
    });
  }

  public function down() {
    Schema::drop('systems');
  }
}