<?php

use Illuminate\Database\Migrations\Migration;

class AddSizeToSystemsTable extends Migration {
  public function up() {
    Schema::table('systems', function($table) {
      $table->integer('size')->unsigned()->after('name');
    });
  }
  
  public function down() {
    Schema::table('systems', function($table) {
      $table->dropColumn('size');
    });
  }
}