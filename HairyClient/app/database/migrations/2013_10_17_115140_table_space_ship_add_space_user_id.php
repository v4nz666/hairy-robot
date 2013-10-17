<?php

use Illuminate\Database\Migrations\Migration;

class TableSpaceShipAddSpaceUserId extends Migration {
  public function up() {
    Schema::table('space_ships', function($table) {
      $table->integer('space_user_id')->unsigned()->after('id');
      
      $table->foreign('space_user_id')
            ->references('id')
            ->on('space_users');
    });
  }
  
  public function down() {
    Schema::table('space_ships', function($table) {
      $table->dropColumn('space_user_id');
    });
  }
}