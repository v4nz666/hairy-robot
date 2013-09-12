<!DOCTYPE html>

<html>
  <head>
    <meta charset="UTF-8">
    <title>Hairy Robot</title>
    {{ HTML::script('assets/js/jquery.min.js') }}
    {{ HTML::script('assets/js/socket.io.min.js') }}
    {{ HTML::script('assets/js/client.js') }}
  </head>
  
  <body>
    {{ Form::hidden('username', Auth::user()->username) }}
    {{ Form::hidden('auth'    , Auth::user()->auth    ) }}
    
    <div id="status">
      Loading...
    </div>
    
    <div id="game" style="display: none;">
      <div id="main" style="border: 1px solid gray; display: inline-block;">
        <canvas id="canvas" style="width: 800px; height: 600px;"></canvas>
      </div>
      
      <div id="right" style="width: 400px; display: inline-block; vertical-align: top;">
        <div style="display: inline-block;">
          <p>
            Life:<br>
            Shields:<br>
            Guns:
          </p>
        </div>
        
        <div id="stats" style="display: inline-block;">
          <div id="life-outer" style="width: 100px; height: 1em; border: 1px solid black;">
            <div id="life" style="height: 100%; background: lime;"></div>
          </div>
          <div id="shield-outer" style="width: 100px; height: 1em; border: 1px solid black;">
            <div id="shield" style="height: 100%; background: turquoise;"></div>
          </div>
          <div id="guns-outer">
            <span id="guns">1</span>
          </div>
        </div>
        
        <div id="scores" style="padding: 1em; width: 90%; height: 28%; border: 1px solid gray;"></div>
        <div id="messages" style="padding: 1em; width: 90%; height: 78%; border: 1px solid gray;"></div>
        <div id="chat" style="padding: 1em; width: 90%; heigh: 1.5em;">
          <input id="textInput" type="text" style="width: 100%; display: none;">
          <p>Press &quot;t&quot; to chat</p>
        </div>
      </div>
    </div>
  </body>
</html>