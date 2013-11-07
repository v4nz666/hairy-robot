<?php

Route::get('/',                          ['as' => 'home',     'uses' => 'HomeController@home']);
Route::put('/login',                     ['as' => 'login',    'uses' => 'AuthController@login']);
Route::get('/logout',                    ['as' => 'logout',   'uses' => 'AuthController@logout']);
Route::get('/register',                  ['as' => 'register', 'uses' => 'HomeController@register']);
Route::put('/register',                  'AuthController@register');

Route::group(['prefix' => 'games'], function() {
  Route::group(['prefix' => 'space'], function() {
    Route::get('/store/credits',         ['as' => 'games_space_store_credits',  'uses' => 'games\space\StorageController@credits']);
    Route::get('/store/types',           ['as' => 'games_space_store_types',    'uses' => 'games\space\StorageController@types']);
    Route::get('/store/parts/{type?}',   ['as' => 'games_space_store_parts',    'uses' => 'games\space\StorageController@parts'])->where('type', '[0-9]+');
    Route::get('/store/ships',           ['as' => 'games_space_store_ships',    'uses' => 'games\space\StorageController@ships']);
    Route::put('/store/saveship',        ['as' => 'games_space_store_saveship', 'uses' => 'games\space\StorageController@saveship']);
    Route::get('/{ip?}/{port?}',         ['as' => 'games_space',                'uses' => 'games\space\GameController@home']);
  });
});