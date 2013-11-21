<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFactionsTable extends Migration {

  /**
    * Run the migrations.
    *
    * @return void
    */
  public function up()
  {
    Schema::create('factions', function(Blueprint $table)
    {
      $table->increments('id');
      $table->string('name', 30);
      $table->boolean('can_join')->default(false);
      $table->timestamps();
    });
  }

  /**
    * Reverse the migrations.
    *
    * @return void
    */
  public function down()
  {
    Schema::drop('factions');
  }

  }