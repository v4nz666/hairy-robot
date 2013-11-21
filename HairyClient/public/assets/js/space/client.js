function Client() {
  return {
    socket: null,
    canvas: null,
    ctx: null,
    
    entity: [],
    celestial: [],
    
    guis: GUIs(),
    
    ticks: 0,
    fps: 0,
    fpsTicks: 0,
    
    toRads: Math.PI / 180,
    toDegs: 180 / Math.PI,
    PIx2: Math.PI * 2,
    
    offsetX: 0,
    offsetY: 0,
    
    gridSize: 512,
    gridColor: 'rgba(255,255,255,0.1)',
    
    zoomLevel: 1,
    zoomSpeed: 1,
    maxZoom: 65536,
    
    clearColour: '#000000',
    
    create: function() {
      var priv = this;
      
      priv.update = function(data) {
        var updates = [];
        
        for(var key in priv.entity) {
          if(key === 'length') { continue; }
          
          var id = priv.entity[key].i;
          var exists = false;
          
          for(var i = 0; i < data.length; i++) {
            if(id === data[i].i) {
              exists = true;
              break;
            }
          }
          
          if(!exists) {
            console.log(data);
            console.log('Removing entity', key, priv.entity[key]);
            delete priv.entity[key];
          }
        }
        
        for(var i = 0; i < data.length; i++) {
          var e = data[i];
          
          if(typeof priv.entity[e.i] !== 'undefined') {
            priv.entity[e.i].x = e.x;
            priv.entity[e.i].y = e.y;
            priv.entity[e.i].a = e.a;
          } else {
            updates.push(e.i);
            e.n = 'Loading...';
            priv.entity[e.i] = e;
          }
        }
        
        if(updates.length > 0) {
          priv.socket.emit('er', {i: updates});
          console.log('Sending entity request', updates);
        }
      };
      
      priv.updatecelestials = function(data) {
        var updates = [];
        
        for(var key in priv.celestial) {
          if(key === 'length') { continue; }
          
          var id = priv.celestial[key].i;
          var exists = false;
          
          for(var i = 0; i < data.length; i++) {
            if(id === data[i].i) {
              exists = true;
              break;
            }
          }
          
          if(!exists) {
            console.log(data);
            console.log('Removing celestial', key, priv.celestial[key]);
            delete priv.celestial[key];
          }
        }
        
        for(var i = 0; i < data.length; i++) {
          var e = data[i];
          
          if(typeof priv.celestial[e.i] !== 'undefined') {
            priv.celestial[e.i].x = e.x;
            priv.celestial[e.i].y = e.y;
            priv.celestial[e.i].a = e.a;
          } else {
            updates.push(e.i);
            e.n = 'Loading...';
            priv.celestial[e.i] = e;
          }
        }
        
        if(updates.length > 0) {
          priv.socket.emit('cr', {i: updates});
          console.log('Sending celestial request', updates);
        }
      };
      
      priv.addentity = function(data) {
        $.extend(priv.entity[data.i], data);
        console.log('Got entity', data.i, priv.entity[data.i]);
      };
      
      priv.addcelestial = function(data) {
        $.extend(priv.celestial[data.i], data);
        console.log('Got celestial', data.i, priv.celestial[data.i]);
      };
      
      priv.rendergame = function() {
        priv.calculateoffsets();
        priv.rendercelestials();
        priv.renderentities();
        priv.rendergui();
      };
      
      priv.calculateoffsets = function() {
        if(typeof priv.me !== 'undefined') {
          priv.offsetX = Math.floor(priv.me.x - (priv.canvas.width  / 2 * priv.zoomLevel));
          priv.offsetY = Math.floor(priv.me.y - (priv.canvas.height / 2 * priv.zoomLevel));
          
          priv.me.onscreenX = Math.floor(priv.canvas.width / 2);
          priv.me.onscreenY = Math.floor(priv.canvas.height / 2);
          
          priv.gridOffsetX = Math.floor((priv.offsetX / priv.zoomLevel) % priv.gridSize);
          priv.gridOffsetY = Math.floor((priv.offsetY / priv.zoomLevel) % priv.gridSize);
          
          priv.offsetXScaled = priv.offsetX / priv.zoomLevel;
          priv.offsetYScaled = priv.offsetY / priv.zoomLevel;
        }
      };
      
      priv.renderentities = function() {
        var screenX = 0;
        var screenY = 0;
        
        for(key in priv.entity) {
          if(key === 'length') { continue; }
          e = priv.entity[key];
          
          screenX = (e.x - priv.offsetX) / priv.zoomLevel;
          screenY = (e.y - priv.offsetY) / priv.zoomLevel;
          
          /*if(!this.onscreen(user, screenX, screenY)) {
            continue;
          }*/
          
          priv.ctx.save();
          
          var size = 16 / priv.zoomLevel;
          priv.ctx.textAlign = 'center';
          priv.ctx.fillStyle = 'white';
          priv.ctx.fillText(e.n, screenX, screenY - size);
          
          priv.ctx.translate(screenX, screenY);
          priv.ctx.rotate(e.a * priv.toRads);
          
          priv.ctx.beginPath();
          priv.ctx.moveTo( size, 0);
          priv.ctx.lineTo(-size, size / 2);
          priv.ctx.bezierCurveTo(0, 5, 0, -5, -size, -size / 2);
          priv.ctx.lineTo(size, 0);
          priv.ctx.fillStyle = 'rgb(255, 0, 255)';
          priv.ctx.fill();
          
          priv.ctx.restore();
        }
      };
      
      priv.rendercelestials = function() {
        var screenX = 0;
        var screenY = 0;
        
        for(key in priv.celestial) {
          if(key === 'length') { continue; }
          e = priv.celestial[key];
          
          screenX = (e.x - priv.offsetX) / priv.zoomLevel;
          screenY = (e.y - priv.offsetY) / priv.zoomLevel;
          
          /*if(!this.onscreen(user, screenX, screenY)) {
            continue;
          }*/
          
          priv.ctx.save();
          
          priv.ctx.save();
          priv.ctx.beginPath();
          
          if(!e.p) {
            priv.ctx.arc(screenX, screenY, e.s / priv.zoomLevel, 0, priv.PIx2);
          } else {
            for(i = 0; i < e.p.length; i++) {
              var point = e.p[i];
              if(i === 0) {
                priv.ctx.moveTo(screenX + point.x / priv.zoomLevel, screenY + point.y / priv.zoomLevel);
              } else {
                priv.ctx.lineTo(screenX + point.x / priv.zoomLevel, screenY + point.y / priv.zoomLevel);
              }
            }
          }
          
          priv.ctx.closePath();
          
          if(e.t === 'a') {
            priv.ctx.strokeStyle = '#444444';
            priv.ctx.stroke();
            priv.ctx.fillStyle = '#333333';
            priv.ctx.fill();
          } else {
            if(e.stroke) {
              priv.ctx.strokeStyle = e.stroke;
              priv.ctx.stroke();
            }
            
            if(e.fill) {
              priv.ctx.fillStyle = e.fill;
              priv.ctx.fill();
            }
          }
          
          priv.ctx.restore();
        }
      };
      
      priv.rendergui = function() {
        priv.ctx.save();
        priv.ctx.fillStyle = 'white';
        priv.ctx.fillText(priv.fps + ' FPS', 4, 12);
        
        if(typeof priv.me !== 'undefined') {
          priv.ctx.fillText('X:        ' + priv.me.x         + ' Y:        ' + priv.me.y, 4, 24);
          priv.ctx.fillText('Angle:    ' + priv.me.a, 4, 36);
          priv.ctx.fillText('X-Offset: ' + priv.offsetX      + ' Y-Offset: ' + priv.offsetY, 4, 48);
          priv.ctx.fillText('Grid-X:   ' + priv.gridOffsetX  + ' Grid-Y:   ' + priv.gridOffsetY, 4, 60);
          priv.ctx.fillText('X-Scr:    ' + priv.me.onscreenX + ' Y-Scr:    ' + priv.me.onscreenY, 4, 72);
          priv.ctx.fillText('Zoom:     ' + priv.zoomLevel, 4, 84);
          priv.ctx.fillText('CPF:      ' + priv.cpf, 4, 96);
          priv.ctx.restore();
        }
      };
      
      var me = {};
      
      me.init = function() {
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
          
          guiGame.onrender().push(priv.rendergame);
          guiGame.onselectship().push(function(ship) {
            priv.socket.emit('us', {i: ship.id, s: ship.system_id});
          });
          
          guiGame.onkeydown().push(function(ev, handled) {
            if(!handled) {
              switch(ev.which) {
                case 32: case 37: case 38: case 39: case 40:
                  var code = (ev.which == 32) ? 0x10 : Math.pow(2, ev.which - 37);
                  if((priv.keys & code) == 0) {
                    priv.keys |= code;
                    priv.socket.emit('ke', {k: priv.keys});
                  }
                  break;
              }
            }
          });
          
          guiGame.onkeyup().push(function(ev, handled) {
            switch(ev.which) {
              case 32: case 37: case 38: case 39: case 40:
                var code = (ev.which == 32) ? 0x10 : Math.pow(2, ev.which - 37);
                if((priv.keys & code) != 0) {
                  priv.keys &= ~code;
                  priv.socket.emit('ke', {k: priv.keys});
                }
                break;
            }
          });
          
          priv.guis.push(guiGame);
          
          var useship = function(data) {
            priv.me = {i: data.i, x: 0, y: 0, a: 0, n: data.n};
            priv.entity[data.i] = priv.me;
            guiGame.useship(data);
            console.log('Got Me', data.i, priv.me);
          };
          
          priv.socket.on('ms', guiGame.gotchat);
          priv.socket.on('us', useship);
          priv.socket.on('up', priv.update);
          priv.socket.on('cp', priv.updatecelestials);
          priv.socket.on('ea', priv.addentity);
          priv.socket.on('ca', priv.addcelestial);
        });
      };
      
      return me;
    }
  }.create();
}

$(document).ready(function() {
  var client = Client();
  client.init();
});