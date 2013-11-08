<?php

use Illuminate\Database\Migrations\Migration;

class TableSpaceShipAddSystemId extends Migration {
  public function up() {
    Schema::table('space_ships', function($table) {
      $table->double('system_id')->after('name')->nullable();
    });
  }
  
  public function down() {
    Schema::table('space_ships', function($table) {
      $table->dropColumn('system_id');
    });
  }
}