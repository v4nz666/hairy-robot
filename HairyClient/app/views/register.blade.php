<!DOCTYPE html>

<html>
  <head>
    <meta charset="UTF-8">
    <title>Hairy Robot</title>
  </head>
  
  <body>
    {{ Form::open(['action' => 'AuthController@register', 'method' => 'put']) }}
    
    <div class="form-block">
      {{ Form::text('name', Input::old('name'), ['placeholder' => Lang::get('auth.username'), 'autofocus' => 'autofocus']) }}
      
      @foreach($errors->get('name') as $error)
        {{ $error }}
      @endforeach
    </div>
    
    <div class="form-block">
      {{ Form::password('pass', ['placeholder' => Lang::get('auth.password')]) }}
      
      @foreach($errors->get('pass') as $error)
        {{ $error }}
      @endforeach
    </div>
    
    <div class="form-block">
      {{ Form::password('conf', ['placeholder' => Lang::get('auth.confirm')]) }}
      
      @foreach($errors->get('conf') as $error)
        {{ $error }}
      @endforeach
    </div>
    
    {{ Form::submit(Lang::get('auth.register')) }}
    {{ Form::close() }}
  </body>
</html>