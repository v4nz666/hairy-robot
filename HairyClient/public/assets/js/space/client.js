function Client() {
  return {
    socket: null,
    canvas: null,
    ctx: null,
    
    guis: new GUIs(),
    
    ticks: 0,
    fps: 0,
    fpsTicks: 0,
    
    toRads: Math.PI / 180,
    toDegs: 180 / Math.PI,
    PIx2: Math.PI * 2,
    
    clearColour: '#000000',
    
    create: function() {
      var priv = this;
      
      var me = {
        init: function() {
          var clear = function() {
            priv.ctx.save();
            priv.ctx.fillStyle = priv.clearColour;
            priv.ctx.fillRect(0, 0, priv.canvas.width, priv.canvas.height);
            priv.ctx.restore();
          };
          
          var render = function() {
            clear();
            priv.ctx.save();
            priv.guis.render();
            priv.ctx.restore();
            priv.ticks++;
            priv.fpsTicks++;
          };
          
          var calcfps = function() {
            priv.fps = priv.fpsTicks;
            priv.fpsTicks = 0;
          };
          
          var resize = function() {
            priv.canvas.width  = window.innerWidth;
            priv.canvas.height = window.innerHeight;
            priv.guis.resize();
          };
          
          priv.canvas = $('#canvas')[0];
          priv.ctx = canvas.getContext('2d');
          
          // Hook our events
          $(document).bind     ('contextmenu', function() { return false; });
          $(document).keydown  (priv.guis.keydown);
          $(document).keyup    (priv.guis.keyup);
          $(document).keypress (priv.guis.keypress);
          $(document).mousemove(priv.guis.mousemove);
          $(document).mousedown(priv.guis.mousedown);
          $(document).mouseup  (priv.guis.mouseup);
          $(window)  .resize   (resize);
          
          setInterval(render , 1000 / 60);
          setInterval(calcfps, 1000);
          
          resize();
          
          var name = $('input[name=username]').val();
          var auth = $('input[name=auth]').val();
          var ip   = $('input[name=ip]').val();
          var port = $('input[name=port]').val();
          
          var msg = Message(priv.ctx, 'Connecting...');
          priv.guis.push(msg);
          
          priv.socket = io.connect(ip + ':' + port, {'reconnect': false});
          priv.socket.on('connect', function() {
            msg.text('Logging in...');
            priv.socket.emit('lo', {name: name, auth: auth});
          });
          
          priv.socket.on('lr', function() {
            msg.pop();
            
            var guiGame = Game(priv.ctx, priv.socket);
            
            guiGame.onselectship().push(function(ship) {
              priv.socket.emit('us', {id: ship.id, s: ship.system_id});
            });
            
            priv.guis.push(guiGame);
            
            priv.socket.on('ms', guiGame.gotchat);
            priv.socket.on('us', function(data) {
              console.log('Using ship', data);
              guiGame.useship();
            });
          });
        }
      };
      
      return me;
    }
  }.create();
}

$(document).ready(function() {
  var client = Client();
  client.init();
});