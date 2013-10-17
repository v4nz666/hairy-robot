<?php

Route::get('/',                          ['as' => 'home',     'uses' => 'HomeController@home']);
Route::put('/login',                     ['as' => 'login',    'uses' => 'AuthController@login']);
Route::get('/logout',                    ['as' => 'logout',   'uses' => 'AuthController@logout']);
Route::get('/register',                  ['as' => 'register', 'uses' => 'HomeController@register']);
Route::put('/register',                  'AuthController@register');

Route::group(['prefix' => 'games'], function() {
  Route::group(['prefix' => 'space'], function() {
    Route::get('/store/parts',   ['as' => 'games_space_store_parts', 'uses' => 'games\space\StorageController@parts']);
    Route::get('/{ip?}/{port?}', ['as' => 'games_space',             'uses' => 'games\space\GameController@home']);
  });
});