<?php

use Illuminate\Database\Migrations\Migration;

class TableUsersAuthRemoveNotNull extends Migration {
  public function up() {
    DB::statement('ALTER TABLE users MODIFY users.auth VARCHAR(64);');
  }
  
  public function down() {
    DB::statement('ALTER TABLE users MODIFY users.auth VARCHAR(64) NOT NULL;');
  }
}