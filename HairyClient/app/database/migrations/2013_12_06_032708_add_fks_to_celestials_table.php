<?php

use Illuminate\Database\Migrations\Migration;

class AddFksToCelestialsTable extends Migration {
  public function up() {
    Schema::table('celestials', function($table) {
      $table->foreign('system_id')
            ->references('id')
            ->on('systems');
      
      $table->foreign('parent_id')
            ->references('id')
            ->on('celestials');
    });
  }
  
  public function down() {
    $table->dropForeign('celestials_system_id_foreign');
    $table->dropForeign('celestials_parent_id_foreign');
  }
}