<!DOCTYPE html>

<html>
  <head>
    <meta charset="UTF-8">
    <title>Hairy Robot</title>
  </head>
  
  <body class="opening hide-UI view-2D zoom-large data-close controls-close">
    <div id="navbar">
      <a id="toggle-data" href="#data"><i class="icon-data"></i>Data</a>
      <h1>
        
      </h1>
      <a id="toggle-controls" href="#controls"><i class="icon-controls"></i>Controls</a>
    </div>
    <div id="data">
      <a class="star" title="star" href="#starspeed">{{ $star->name }}</a>
      
      <?php $i = 0; ?>
      @foreach($planets as $planet)
        <a class="planet{{ $i }}" title="planet{{ $i }}" href="#planet{{ $i }}speed">{{ $planet->name }}</a>
        <?php $i++; ?>
      @endforeach
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
        <div id="solar-system" class="planet1">
          <?php $i = 0; ?>
          @foreach($planets as $planet)
            <div id="planet{{ $i }}" class="orbit">
              <div class="pos">
                <div class="planet">
                  <dl class="infos">
                    <dt>{{ $planet->name }}</dt>
                    <dd><span></span></dd>
                  </dl>
                </div>
              </div>
            </div>
            <?php $i++; ?>
          @endforeach
          
          <div id="star">
            <dl class="infos">
              <dt>{{ $star->name }}</dt>
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