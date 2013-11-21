<!DOCTYPE html>

<html>
  <head>
    <meta charset="UTF-8">
    <title>Hairy Robot</title>
  </head>
  
  <body>
    {{ Form::open(['action' => 'AuthController@register', 'method' => 'put']) }}
    
    <div class="form-block">
      {{ Form::text('username', Input::old('username'), ['placeholder' => Lang::get('auth.username'), 'autofocus' => 'autofocus']) }}
      
      @foreach($errors->get('username') as $error)
        {{ $error }}
      @endforeach
    </div>
    
    <div class="form-block">
      {{ Form::password('password', ['placeholder' => Lang::get('auth.password')]) }}
      
      @foreach($errors->get('password') as $error)
        {{ $error }}
      @endforeach
    </div>
    
    <div class="form-block">
      {{ Form::password('conf', ['placeholder' => Lang::get('auth.confirm')]) }}
      
      @foreach($errors->get('conf') as $error)
        {{ $error }}
      @endforeach
    </div>
    
    <div class="form-block">
      {{ Form::select('faction', $factions, Form::old('faction')) }}
      
      @foreach($errors->get('faction') as $error)
        {{ $error }}
      @endforeach
    </div>
    
    {{ Form::submit(Lang::get('auth.register')) }}
    {{ Form::close() }}
  </body>
</html>