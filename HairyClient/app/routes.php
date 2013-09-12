<?php

Route::get('/', 'HomeController@home');
Route::put('/login', 'AuthController@login');