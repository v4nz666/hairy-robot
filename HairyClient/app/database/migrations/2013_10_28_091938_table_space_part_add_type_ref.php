<?php

use Illuminate\Database\Migrations\Migration;

class TableSpacePartAddTypeRef extends Migration {
  public function up() {
    $type = SpacePartType::find(1);
    
    if($type === null) {
      $type = new SpacePartType;
      $type->name = 'Hull';
      $type->desc = 'Parts that make up the body of your ship';
      $type->save();
    }
    
    Schema::table('space_parts', function($table) {
      $table->integer('space_part_type_id')->unsigned()->after('id');
    });
    
    DB::statement('UPDATE `space_parts` SET `space_part_type_id`=1 WHERE 1');
    
    Schema::table('space_parts', function($table) {
      $table->foreign('space_part_type_id')
            ->references('id')
            ->on('space_part_types');
    });
  }
  
  public function down() {
    Schema::table('space_parts', function($table) {
      $table->dropColumn('space_part_type_id');
    });
  }
}