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
      
      <div id="right" style="width: 400px; display: inline-block; vertical-align: top;">
        <div id="tabs">
          <a name="tab-create" href="#">Create</a>
          <a name="tab-edit" href="#">Edit</a>
        </div>
        
        <div id="tab-create">
          <div id="parts">
            <select id="part" size="6"></select>
          </div>
        </div>
        
        <div id="tab-edit">
          <div id="info">
            
          </div>
          
          <div id="options">
            
          </div>
        </div>
      </div>
    </div>
  </body>
</html>