<?php

use Illuminate\Database\Migrations\Migration;

class TableSpacePartAddRender extends Migration {
  public function up() {
    Schema::table('space_parts', function($table) {
      $table->string('render')->default('ctx.fillStyle=\'magenta\';ctx.fillRect(0,0,16,16);');
    });
  }
  
  public function down() {
    Schema::table('space_parts', function($table) {
      $table->dropColumn('render');
    });
  }
}