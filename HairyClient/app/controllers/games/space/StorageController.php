<?php

namespace Games\Space;

class StorageController extends \Controller {
  public function parts() {
    $allParts = \SpacePart::with('infos', 'attribs')->get()->toJSON();
    return $allParts;
  }
}