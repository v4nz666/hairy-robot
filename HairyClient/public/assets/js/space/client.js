function Client() {
  return {
    socket: null,
    canvas: null,
    ctx: null,
    
    user: [],
    me: null,
    
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
          
          var initMenu = function() {
            var menu = MainMenu(priv.ctx);
            var name = $('input[name=username]').val();
            var auth = $('input[name=auth]').val();
            var ip   = $('input[name=ip]').val();
            var port = $('input[name=port]').val();
            
            menu.onplay = function() {
              var msg = Message(priv.ctx, 'Connecting...');
              priv.guis.push(msg);
              
              priv.socket = io.connect(ip + ':' + port, {'reconnect': false});
              priv.socket.on('connect', function() {
                msg.text('Logging in...');
                priv.socket.emit('login', {name: name, auth: auth});
              });
            };
            
            priv.guis.push(menu);
          };
          
          stat.load([{type: 'parts', cb: function() {
            var draw = function(ctx, render) {
              eval(this.render);
            }
            
            for(var i = 0; i < stat.parts.length; i++) {
              stat.parts[i].draw = draw;
            }
          }}]);
          
          priv.canvas = $('#canvas')[0];
          priv.ctx = canvas.getContext('2d');
          
          var frameRate = 60;
          var tickRate = 1000 / frameRate;
          
          // Hook our events
          $(document).bind     ('contextmenu', function() { return false; });
          $(document).keydown  ($.proxy(priv.guis.keydown  , priv.guis));
          $(document).keyup    ($.proxy(priv.guis.keyup    , priv.guis));
          $(document).keypress ($.proxy(priv.guis.keypress , priv.guis));
          $(document).mousemove($.proxy(priv.guis.mousemove, priv.guis));
          $(document).mousedown($.proxy(priv.guis.mousedown, priv.guis));
          $(document).mouseup  ($.proxy(priv.guis.mouseup  , priv.guis));
          $(window)  .resize   (resize);
          
          setInterval(render , tickRate);
          setInterval(calcfps, 1000);
          
          resize();
          
          stat.onload(initMenu);
        },
        
        setParams: function(data){
          this.me = this.user[data.id];
          console.log('Set id[', this.me.id, ']');
        },
        
        setSystem: function(data){
          this.system = data.system;
          this.setZoom(this.zoomLevel);
          console.log('Set system[', this.system, ']');
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