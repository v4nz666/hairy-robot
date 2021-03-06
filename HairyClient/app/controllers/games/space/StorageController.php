<?php

namespace Games\Space;

class StorageController extends \Controller {
  public function __construct() {
    $this->beforeFilter('auth');
  }
  
  public function credits() {
    return json_encode(['credits' => \Auth::user()->spaceUser->credits]);
  }
  
  public function types() {
    return \SpacePartType::all()->toJSON();
  }
  
  public function parts($type = null) {
    if($type === null) {
      return \SpacePart::with('infos', 'attribs')->get()->toJSON();
    } else {
      return \SpacePart::with('infos', 'attribs')->where('space_part_type_id', '=', $type)->get()->toJSON();
    }
  }
  
  public function ships($type = null) {
    switch($type) {
      case 'mine':
        return \Auth::user()->ships()->mine()->get()->toJson();
        
      case 'shared':
        return \Auth::user()->ships()->shared()->get()->toJson();
        
      default:
        return \Auth::user()->ships->toJSON();
    }
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