<!DOCTYPE html>

<html>
  <head>
    <meta charset="UTF-8">
    <title>Hairy Robot</title>
    {{ HTML::style('assets/css/system2.css') }}
    
    <style>
      /* --------------------------------------------------------------------------- planets index */
      @for($i = 0; $i < count($planets); $i++)
      <?php if($planets[$i]->type !== 'planet') continue; ?>
      #planet{{ $i }} {
        z-index: {{ count($planets) - $i + 1 }};
      }
      @endfor
      
      #star {
        z-index: 1;
      }
      
      /* --------------------------------------------------------------------------- data */
      /* --------------------------------------------------------------------------- speed */
      /* sideral years */
      @for($i = 0; $i < count($planets); $i++)
      <?php if($planets[$i]->type !== 'planet') continue; ?>
      #planet{{ $i }} .pos,
      #planet{{ $i }} .planet,
      #planet{{ $i }}.orbit {
        animation-duration: {{ 12.00021 + ($i - 2) * 4 }}s; /***** TODO *****/
      }
      @endfor
      
      /* --------------------------------------------------------------------------- planets sizes */
      /* --------------------------------------------------------------------------- stretched sizes */
      .scale-stretched #star {
        font-size: 24em;
      }
      
      <?php $scale = 3.92 / $planets[2]->size; ?> /* TODO this isn't so great */
      @for($i = 0; $i < count($planets); $i++)
      <?php if($planets[$i]->type !== 'planet') continue; ?>
      .scale-stretched #planet{{ $i }} .planet {
        font-size: {{ min(12, $planets[$i]->size * $scale) }}em;
      }
      @endfor
      
      /* --------------------------------------------------------------------------- stretched orbits */
      <?php $s = 32; $last = 0; $scale = 3.92 / $planets[2]->size; ?> /* TODO this isn't so great */
      @for($i = 0; $i < count($planets); $i++)
      <?php if($planets[$i]->type !== 'planet') continue; ?>
      .scale-stretched #planet{{ $i }}.orbit {
        <?php $size = min(12, $planets[$i]->size * $scale) + 2; $s += $size + $last; $last = $size; ?>
        width: {{ $s }}em;
        height: {{ $s }}em;
        margin-top: {{ $s / -2 }}em;
        margin-left: {{ $s / -2 }}em;
      }
      @endfor
      
      /* --------------------------------------------------------------------------- text infos data */
      /* --------------------------------------------------------------------------- speed */
      .set-speed dl.infos dd span:after {
        content: 'Orbit Velocity'; }
      
      .set-speed #star dl.infos dd:after {
        content: '0 km/h'; }
      
      @for($i = 0; $i < count($planets); $i++)
      <?php if($planets[$i]->type !== 'planet') continue; ?>
      .set-speed #planet{{ $i }} dl.infos dd:after {
        content: '107,218 km/h'; } /***** TODO *****/
      @endfor
      
      /* --------------------------------------------------------------------------- size */
      .set-size dl.infos dd span:after {
        content: 'Equatorial Circumference'; }
      
      .set-size #star dl.infos dd:after {
        content: '4,370,005 km'; } /***** TODO *****/
      
      @for($i = 0; $i < count($planets); $i++)
      <?php if($planets[$i]->type !== 'planet') continue; ?>
      .set-size #planet{{ $i }} dl.infos dd:after {
        content: '40,030 km'; } /***** TODO *****/
      @endfor
      
      /* --------------------------------------------------------------------------- distance */
      .set-distance dl.infos dd span:after {
        content: 'From Sun'; } /***** TODO *****/
      
      .set-distance #star dl.infos dd span:after {
        content: 'From Earth'; } /***** TODO *****/
      
      .set-distance #star dl.infos dd:after {
        content: '149,598,262 km'; } /***** TODO *****/
      
      @for($i = 0; $i < count($planets); $i++)
      <?php if($planets[$i]->type !== 'planet') continue; ?>
      .set-distance #planet{{ $i }} dl.infos dd:after {
        content: '149,598,262 km'; } /***** TODO *****/
      @endfor
      
      .star #star .infos,
      @for($i = 0; $i < count($planets); $i++)
      <?php if($planets[$i]->type !== 'planet') continue; ?>
      .planet{{ $i }} #planet{{ $i }} .infos
      @if($i < count($planets) - 1) ,
      @endif
      @endfor
      {
        display: block;
        opacity: 1;
        transform: rotateX(0deg);
      }

      @for($i = 0; $i < count($planets); $i++)
      <?php if($planets[$i]->type !== 'planet') continue; ?>
      .planet{{ $i }} #planet{{ $i }}.orbit
      @if($i < count($planets) - 1) ,
      @endif
      @endfor
      {
        border: 1px solid rgba(255, 255, 255, 0.8);
      }
    </style>
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