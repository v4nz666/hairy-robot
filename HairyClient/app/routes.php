<?php

Route::get('/',                     'HomeController@home');
Route::put('/login',                'AuthController@login');
Route::get('/logout',               'AuthController@logout');
Route::get('/register',             'HomeController@register');
Route::put('/register',             'AuthController@register');
Route::get('/games/space/build',    'games\SpaceController@build');
Route::get('/games/space/{ip?}/{port?}', 'games\SpaceController@home');
Route::get('/games/store/parts',    'games\PartsController@getAll');