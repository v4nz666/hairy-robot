<?php

namespace Games\Space;

class StorageController extends \Controller {
  public function __construct() {
    $this->beforeFilter('auth');
  }
  
  public function parts() {
    return \SpacePart::with('infos', 'attribs')->get()->toJSON();
  }
  
  public function ships() {
    return \Auth::user()->spaceUser->ships->toJSON();
  }
  
  public function saveship() {
    $validator = \Validator::make(\Input::only('name', 'json'),
      [
        'name' => ['required', 'regex:/^[A-Za-z0-9\.\-_ ]{5,40}$/'],
        'json' => ['required', 'regex:/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/']
      ]
    );
    
    if($validator->fails()) {
      return var_dump($validator->messages());
    } else {
      $ship = \SpaceShip::find(\Input::get('id'));
      
      if($ship === null) {
        $ship = new \SpaceShip;
      }
      
      $ship->space_user_id = \Auth::user()->spaceUser->id;
      $ship->name = \Input::get('name');
      $ship->json = \Input::get('json');
      $ship->save();
      
      return 'saved';
    }
  }
}