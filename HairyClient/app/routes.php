<?php

Route::get('/',         ['as' => 'home',     'uses' => 'HomeController@home']);
Route::put('/login',    ['as' => 'login',    'uses' => 'AuthController@login']);
Route::get('/logout',   ['as' => 'logout',   'uses' => 'AuthController@logout']);
Route::get('/register', ['as' => 'register', 'uses' => 'HomeController@register']);
Route::put('/register', 'AuthController@register');

Route::group(['prefix' => 'games'], function() {
  Route::group(['prefix' => 'space'], function() {
    Route::group(['prefix' => 'store'], function() {
      Route::get('/credits',       ['as' => 'games_space_store_credits',  'uses' => 'games\space\StorageController@credits']);
      Route::get('/types',         ['as' => 'games_space_store_types',    'uses' => 'games\space\StorageController@types']);
      Route::get('/parts/{type?}', ['as' => 'games_space_store_parts',    'uses' => 'games\space\StorageController@parts'])->where('type', '[0-9]+');
      Route::get('/ships/{type?}', ['as' => 'games_space_store_ships',    'uses' => 'games\space\StorageController@ships']);
      Route::put('/saveship',      ['as' => 'games_space_store_saveship', 'uses' => 'games\space\StorageController@saveship']);
    });
    
    Route::group(['prefix' => 'gen'], function() {
      Route::get('/ships',   ['as' => 'games_space_gen_ships',   'uses' => 'games\space\GeneratorController@ships']);
      Route::get('/planets', ['as' => 'games_space_gen_planets', 'uses' => 'games\space\GeneratorController@planets']);
    });
    
    Route::get('/{ip?}/{port?}', ['as' => 'games_space', 'uses' => 'games\space\GameController@home']);
  });
});