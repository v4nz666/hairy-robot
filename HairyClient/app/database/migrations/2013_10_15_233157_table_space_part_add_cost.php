<?php

use Illuminate\Database\Migrations\Migration;

class TableSpacePartAddCost extends Migration {
  public function up() {
    Schema::table('space_parts', function($table) {
      $table->double('cost')->default(0);
    });
  }
  
  public function down() {
    Schema::table('space_parts', function($table) {
      $table->dropColumn('cost');
    });
  }
}