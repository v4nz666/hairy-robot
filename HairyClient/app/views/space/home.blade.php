<!DOCTYPE html>

<html>
  <head>
    <meta charset="UTF-8">
    <title>Hairy Robot</title>
    {{ HTML::script('assets/js/jquery.min.js') }}
    {{ HTML::script('assets/js/socket.io.min.js') }}
    {{ HTML::script('assets/js/gui.js') }}
    {{ HTML::script('assets/js/space/client.js') }}
    
    <style>
      * {
        margin: 0; padding: 0;
      }
      
      html, body {
        width: 100%; height: 100%;
      }
      
      canvas {
        display: block;
      }
    </style>
  </head>
  
  <body>
    {{ Form::hidden('username', Auth::user()->username) }}
    {{ Form::hidden('auth'    , Auth::user()->auth    ) }}
    {{ Form::hidden('ip'      , $ip) }}
    {{ Form::hidden('port'    , $port) }}
    
    <canvas id="canvas"></canvas>
  </body>
</html>