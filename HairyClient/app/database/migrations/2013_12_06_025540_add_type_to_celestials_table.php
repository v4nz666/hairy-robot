<?php

use Illuminate\Database\Migrations\Migration;

class AddTypeToCelestialsTable extends Migration {
  public function up() {
    Schema::table('celestials', function($table) {
      $table->enum('type', ['star', 'planet', 'moon', 'belt', 'asteroid'])->after('parent_id');
    });
  }
  
  public function down() {
    Schema::table('celestials', function($table) {
      $table->dropColumn('type');
    });
  }
}