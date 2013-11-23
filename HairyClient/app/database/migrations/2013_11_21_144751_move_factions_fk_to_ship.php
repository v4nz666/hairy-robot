<?php

use Illuminate\Database\Migrations\Migration;

class MoveFactionsFkToShip extends Migration {
  public function up() {
    // Drop FK and column from users table if it exists
    if(Schema::hasColumn('users', 'faction_id')) {
      Schema::table('users', function($table) {
        $table->dropForeign('users_faction_id_foreign');
        $table->dropColumn('faction_id');
      });
    }
    
    // Add column to ships table if it doesn't exist
    if(!Schema::hasColumn('ships', 'faction_id')) {
      Schema::table('ships', function($table) {
        $table->integer('faction_id')
          ->unsigned()
          ->after('user_id')
          ->nullable();
      });
    }
    
    // Find the first Faction or create one if there are none
    $faction = Faction::all()->first();
    if($faction === null) {
      $faction = new Faction;
      $faction->name = 'Faction 1';
      $faction->can_join = true;
      $faction->save();
    }
    
    // Set all Ships' facitons to the first Faction's ID
    DB::statement("UPDATE `ships` SET `faction_id`=" . $faction->id . " WHERE `faction_id` IS NULL");
    
    // Add the FK constraint
    Schema::table('ships', function($table) {
      $table->foreign('faction_id')
            ->references('id')
            ->on('factions');
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