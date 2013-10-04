<?php

use Illuminate\Database\Migrations\Migration;

class TableSpaceUserAddCredits extends Migration {
  public function up() {
    Schema::table('space_users', function($table) {
      $table->integer('credits')->unsigned();
    });
  }
  
  public function down() {
    Schema::table('space_users', function($table) {
      $table->dropColumn('credits');
    });
  }
}