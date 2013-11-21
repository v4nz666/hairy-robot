<?php

use Illuminate\Database\Migrations\Migration;

class AddFactionsFk extends Migration {

  /**
  * Run the migrations.
  *
  * @return void
  */
  public function up()
  {
    DB::statement("INSERT INTO factions(name, can_join) values " . 
      "('Faction 1', 1), " . 
      "('Faction 2', 1), " .
      "('Faction 3', 1)");
    
    if ( ! Schema::hasColumn('users', 'faction_id') ) {
      Schema::table('users', function($table) {
      $table->integer('faction_id')
        ->unsigned()
        ->after('id')
        ->nullable();
      });
    }
    
    DB::statement("UPDATE users set faction_id = 1 where faction_id IS NULL");
    
    Schema::table('users', function($table) {
      $table->foreign('faction_id')->references('id')->on('factions');
    });
  }

  /**
  * Reverse the migrations.
  *
  * @return void
  */
  public function down()
  { }
}