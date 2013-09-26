<!DOCTYPE html>

<html>
  <head>
    <meta charset="UTF-8">
    <title>Build Proof-of-Concept</title>
    {{ HTML::script('assets/js/jquery.min.js') }}
    {{ HTML::script('assets/js/space/build.js') }}
  </head>
  
  <body>
    <div id="game">
      <div id="main" style="border: 1px solid gray; display: inline-block;">
        <canvas id="canvas" style="width: 800px; height: 600px;"></canvas>
      </div>
    </div>
  </body>
</html>