<?php

Route::get('/', 'HomeController@getHome');
Route::put('/login', 'AuthController@login');