<?php

use Illuminate\Database\Migrations\Migration;

class AddSystemIdToFactions extends Migration {
  public function up() {
    // Add column to ships table if it doesn't exist
    if(!Schema::hasColumn('factions', 'system_id')) {
      Schema::table('factions', function($table) {
        $table->integer('system_id')
          ->unsigned()
          ->after('id');
      });
    }
    
    // Find the first System or create one if there are none
    $system = System::all()->first();
    if($system === null) {
      $system = new System;
      $system->name = 'Sol';
      $system->save();
    }
    
    // Set all Factions' systems to the first Faction's ID
    DB::statement("UPDATE `factions` SET `system_id`=" . $system->id);
    
    // Add the FK constraint
    Schema::table('factions', function($table) {
      $table->foreign('system_id')
            ->references('id')
            ->on('systems');
    });
  }
  
  public function down() {
    
  }
}