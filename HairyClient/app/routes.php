<?php

Route::get('/', 'HomeController@home');
Route::put('/login', 'AuthController@login');
Route::get('/logout', 'AuthController@logout');
Route::get('/register', 'HomeController@register');
Route::put('/register', 'AuthController@register');
Route::get('/games/space', 'Games\SpaceController@home');
Route::get('/games/space/build', 'Games\SpaceController@build');