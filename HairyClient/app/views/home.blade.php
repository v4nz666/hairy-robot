<!DOCTYPE html>

<html>
  <head>
    <meta charset="UTF-8">
    <title>Hairy Robot</title>
  </head>
  
  <body>
    @if(Auth::guest())
      {{ Form::open(['action' => 'AuthController@login', 'method' => 'put']) }}
      
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
      
      {{ Form::submit(Lang::get('auth.login')) }}
      {{ Form::close() }}
      {{ HTML::linkAction('HomeController@register', Lang::get('home.register')) }}
    @else
      <p>{{ HTML::linkAction('AuthController@logout', Lang::get('auth.logout')) }}</p>
      <p>{{ HTML::linkAction('Games\SpaceController@home', Lang::get('games.space')) }}</p>
    @endif
  </body>
</html>