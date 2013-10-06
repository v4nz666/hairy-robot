<!DOCTYPE html>

<html>
  <head>
    <meta charset="UTF-8">
    <title>Hairy Robot</title>
    {{ HTML::script('assets/js/jquery.min.js') }}
    {{ HTML::script('assets/js/socket.io.min.js') }}
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
    
    <canvas id="canvas">
      <div id="status">
        Loading...
      </div>
      
      <div id="right" style="width: 400px; display: inline-block; vertical-align: top;">
        <div id="scores" style="padding: 1em; width: 90%; height: 28%; border: 1px solid gray;"></div>
      </div>
    </canvas>
  </body>
</html>