<?php

class HomeController extends Controller {
  public function getHome() {
    return View::make('home');
  }
}