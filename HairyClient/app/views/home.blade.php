<!DOCTYPE html>

<html>
  <head>
    <meta charset="UTF-8">
    <title>Hairy Robot</title>
    {{ HTML::style('assets/css/system.css') }}
  </head>
  
  <body class="opening hide-UI view-2D zoom-large data-close controls-close">
    <div id="navbar">
      <a id="toggle-data" href="#data"><i class="icon-data"></i>Data</a>
      <h1>
        @if(Auth::guest())
          {{ Form::open(['route' => 'login', 'method' => 'put']) }}
          
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
          {{ HTML::linkRoute('register', Lang::get('home.register')) }}
        @else
          <p>{{ HTML::linkRoute('logout', Lang::get('auth.logout')) }}</p>
          <p>{{ HTML::linkRoute('games_space', Lang::get('games.space')) }}</p>
        @endif
      </h1>
      <a id="toggle-controls" href="#controls"><i class="icon-controls"></i>Controls</a>
    </div>
    <div id="data">
      <a class="sun" title="sun" href="#sunspeed">Sun</a>
      <a class="mercury" title="mercury" href="#mercuryspeed">Mercury</a>
      <a class="venus" title="venus" href="#venusspeed">Venus</a>
      <a class="earth active" title="earth" href="#earthspeed">Earth</a>
      <a class="mars" title="mars" href="#marsspeed">Mars</a>
      <a class="jupiter" title="jupiter" href="#jupiterspeed">Jupiter</a>
      <a class="saturn" title="saturn" href="#saturnspeed">Saturn</a>
      <a class="uranus" title="uranus" href="#uranusspeed">Uranus</a>
      <a class="neptune" title="neptune" href="#neptunespeed">Neptune</a>
    </div>
    <div id="controls">
      <label class="set-view">
        <input type="checkbox">
      </label>
      <label class="set-zoom">
        <input type="checkbox">
      </label>
      <label>
        <input type="radio" class="set-speed" name="scale" checked>
        <span>Speed</span>
      </label>
      <label>
        <input type="radio" class="set-size" name="scale">
        <span>Size</span>
      </label>
      <label>
        <input type="radio" class="set-distance" name="scale">
        <span>Distance</span>
      </label>
    </div>
    <div id="universe" class="scale-stretched">
      <div id="galaxy">
        <div id="solar-system" class="earth">
          <div id="mercury" class="orbit">
            <div class="pos">
              <div class="planet">
                <dl class="infos">
                  <dt>Mercury</dt>
                  <dd><span></span></dd>
                </dl>
              </div>
            </div>
          </div>
          <div id="venus" class="orbit">
            <div class="pos">
              <div class="planet">
                <dl class="infos">
                  <dt>Venus</dt>
                  <dd><span></span></dd>
                </dl>
              </div>
            </div>
          </div>
          <div id="earth" class="orbit">
            <div class="pos">
              <div class="orbit">
                <div class="pos">
                  <div class="moon"></div>
                </div>
              </div>
              <div class="planet">
                <dl class="infos">
                  <dt>Earth</dt>
                  <dd><span></span></dd>
                </dl>
              </div>
            </div>
          </div>
          <div id="mars" class="orbit">
            <div class="pos">
              <div class="planet">
                <dl class="infos">
                  <dt>Mars</dt>
                  <dd><span></span></dd>
                </dl>
              </div>
            </div>
          </div>
          <div id="jupiter" class="orbit">
            <div class="pos">
              <div class="planet">
                <dl class="infos">
                  <dt>Jupiter</dt>
                  <dd><span></span></dd>
                </dl>
              </div>
            </div>
          </div>
          <div id="saturn" class="orbit">
            <div class="pos">
              <div class="planet">
                <div class="ring"></div>
                <dl class="infos">
                  <dt>Saturn</dt>
                  <dd><span></span></dd>
                </dl>
              </div>
            </div>
          </div>
          <div id="uranus" class="orbit">
            <div class="pos">
              <div class="planet">
                <dl class="infos">
                  <dt>Uranus</dt>
                  <dd><span></span></dd>
                </dl>
              </div>
            </div>
          </div>
          <div id="neptune" class="orbit">
            <div class="pos">
              <div class="planet">
                <dl class="infos">
                  <dt>Neptune</dt>
                  <dd><span></span></dd>
                </dl>
              </div>
            </div>
          </div>
          <div id="sun">
            <dl class="infos">
              <dt>Sun</dt>
              <dd><span></span></dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
    
    {{ HTML::script('//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js') }}
    {{ HTML::script('assets/js/stylefix.js') }}
    {{ HTML::script('assets/js/system.js') }}
  </body>
</html>