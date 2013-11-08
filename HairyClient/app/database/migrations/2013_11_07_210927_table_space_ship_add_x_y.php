<?php

use Illuminate\Database\Migrations\Migration;

class TableSpaceShipAddXY extends Migration {
  public function up() {
    Schema::table('space_ships', function($table) {
      $table->double('x')->after('name');
      $table->double('y')->after('x');
    });
  }
  
  public function down() {
    Schema::table('space_ships', function($table) {
      $table->dropColumn('x');
      $table->dropColumn('y');
    });
  }
}