function Client() {
  return {
    socket: null,
    inGame: false,
    
    user: [],
    me: null,
    
    guis: new GUIs(),
    
    effects: [],
    
    keys: 0,
    
    ticks: 0,
    fps: 0,
    fpsTicks: 0,
    cpf: 0,
    
    toRads: Math.PI / 180,
    toDegs: 180 / Math.PI,
    PIx2: Math.PI * 2,
    
    offsetX: 0,
    offsetY: 0,
    
    gridSize: 512,
    gridColor:  'rgba(255,255,255,0.1)',
    
    zoomLevel: 1,
    zoomSpeed: 1,
    maxZoom: 65536,
    
    clear: function(clr) {
      if(typeof clr === 'undefined') {
        clr = 'rgb(0,0,0)';
      }
      
      this.ctx.save();
      this.ctx.fillStyle = clr;
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.restore();
    },
    
    render: function() {
      this.clear();
      this.ctx.save();
      this.guis.render();
      this.ctx.restore();
      this.ticks++;
      this.fpsTicks++;
      this.cpf = 0;
    },
    
    renderGame: function() {
      if ( ! this.system ) { return; }
      
      this.calculateOffsets();
      
      this.renderBackground();
      this.renderCelestials();
      this.renderUsers();
      this.renderEffects();
      this.renderGUI();
    },
    
    calculateOffsets: function() {
      this.offsetX = Math.floor(this.me.x - (this.ctx.canvas.width / 2 * this.zoomLevel));
      this.offsetY = Math.floor(this.me.y - (this.ctx.canvas.height / 2 * this.zoomLevel));
      
      this.me.onscreenX = Math.floor(this.ctx.canvas.width / 2);
      this.me.onscreenY = Math.floor(this.ctx.canvas.height / 2);
      
      this.gridOffsetX = Math.floor((this.offsetX  / this.zoomLevel) % this.gridSize);
      this.gridOffsetY = Math.floor((this.offsetY  / this.zoomLevel) % this.gridSize);
      
      this.offsetXScaled = this.offsetX / this.zoomLevel;
      this.offsetYScaled = this.offsetY / this.zoomLevel;
    },
    
    renderBackground: function() {
      if ( this.zoomLevel > 64 ) { return; }
      
      var ctx = this.ctx;
      
      ctx.save();
      
      var _x = 0;
      var c = 1;
      
      ctx.strokeStyle = this.gridColor;
      
      while(c * this.gridSize / this.zoomLevel - this.gridOffsetX < ctx.canvas.width) {
        _x = (c * this.gridSize / this.zoomLevel) - this.gridOffsetX;
        ctx.beginPath();
        ctx.moveTo(_x, 0);
        ctx.lineTo(_x, ctx.canvas.height);
        ctx.lineWidth = 1;
        
        ctx.stroke();
        
        c = c + 1;
      }
      
      var _y = 0;
      c = 1;
      
      while( (c * this.gridSize / this.zoomLevel) - this.gridOffsetY < ctx.canvas.height ) {
        _y = (c * this.gridSize / this.zoomLevel) - this.gridOffsetY;
        ctx.beginPath();
        ctx.moveTo(0, _y);
        ctx.lineTo(ctx.canvas.width, _y);
        ctx.lineWidth = 1;
        ctx.stroke();
        
        c = c + 1;
      }
      
      ctx.restore();
    },
    
    renderCelestials: function() {
      this.renderCelestial(this.system.star);
    },
    
    renderCelestial: function(c) {
      if(this.onscreen2(c)) {
        this.cpf++;
        
        var ctx = this.ctx;
        
        var screenX = c.xScaled - this.offsetXScaled;
        var screenY = c.yScaled - this.offsetYScaled;
        
        ctx.save();
        ctx.beginPath();
        
        if ( ! c.points ) {
          ctx.arc(screenX, screenY, c.sizeScaled, 0, this.PIx2);
        } else {
          for (i = 0; i < c.points.length; i++) {
            var point = c.points[i];
            if ( i == 0 ) {
              ctx.moveTo(screenX + point.x / this.zoomLevel, screenY + point.y / this.zoomLevel);
            } else {
              ctx.lineTo(screenX + point.x / this.zoomLevel, screenY + point.y / this.zoomLevel);
            }
          }
        }
        ctx.closePath();
        
        if(c.type === 'a') {
          ctx.strokeStyle = '#444444';
          ctx.stroke();
          ctx.fillStyle = '#333333';
          ctx.fill();
        } else {
          if(c.stroke) {
            ctx.strokeStyle = c.stroke;
            ctx.stroke();
          }
          
          if(c.fill) {
            ctx.fillStyle = c.fill;
            ctx.fill();
          }
        }
        
        ctx.restore();
      }
      
      if(c.type === 'b') {
        var start = Math.atan2(this.me.y - c.y, this.me.x - c.x) * this.toDegs;
        if(start < 0) start += 360;
        
        var scale = Math.round(c.celestial.length / 360);
        
        start = Math.floor(start * scale - 50);
        if(start < 0) {
          start += c.celestial.length;
        }
        
        var end = (start + 100);
        
        for(var i = start; i < end; i++) {
          if(i < c.celestial.length) {
            this.renderCelestial(c.celestial[i]);
          } else {
            this.renderCelestial(c.celestial[i - start]);
          }
        }
      } else {
        for(var i = 0; i < c.celestial.length; i++) {
          this.renderCelestial(c.celestial[i]);
        }
      }
    },
    
    renderUsers: function() {
      var screenX = 0;
      var screenY = 0;
      
      for(key in this.user) {
        user = this.user[key];
        
        if(!user.x || !user.y) { continue; }
        
        if(user.id == this.me.id) {
          screenX = this.me.onscreenX;
          screenY = this.me.onscreenY;
        } else {
          screenX = (user.x - this.offsetX) / this.zoomLevel;
          screenY = (user.y - this.offsetY) / this.zoomLevel;
          
          if(!this.onscreen(user, screenX, screenY)) {
            continue;
          }
        }
        
        this.ctx.save();
        
        var size = 16 / this.zoomLevel;
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(user.name, screenX, screenY - size);
        
        this.ctx.translate(screenX, screenY);
        this.ctx.rotate(user.angle * this.toRads);
        
        this.ctx.beginPath();
        this.ctx.moveTo( size, 0);
        this.ctx.lineTo(-size, size / 2);
        this.ctx.bezierCurveTo(0, 5, 0, -5, -size, -size / 2);
        this.ctx.lineTo(size, 0);
        this.ctx.fillStyle = '#FF00FF';
        this.ctx.fill();
        
        this.ctx.restore();
      }
    },
    
    renderEffects: function() {
      for(key in this.effects) {
        effect = this.effects[key];
        this.renderEffect(effect);
        
        if(effect.particles.length === 0) {
          delete this.effects[key];
        }
      }
    },
    
    renderEffect: function(expl) {
      var ctx = this.ctx;

      for(key in expl.particles) {
        p = expl.particles[key];
        
        var theta = p.angle * this.toRads;
        var vX = Math.cos(theta) * p.v;
        var vY = Math.sin(theta) * p.v;
        
        p.x = p.x + vX;
        p.y = p.y + vY;
        
        if(p.x < -p.size || p.x > this.width  + p.size ||
           p.y < -p.size || p.y > this.height + p.size) {
          delete expl.particles[i];
        }
        
        screenX = (p.x - this.offsetX) / this.zoomLevel;
        screenY = (p.y - this.offsetY) / this.zoomLevel;
        
        if(!this.onscreen(p, screenX, screenY)) {
          continue;
        }
        
        ctx.save();
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size, 0, this.PIx2);
        ctx.closePath();
        ctx.fillStyle = 'rgb(' + p.r + ',' + p.g + ',' + p.b + ')';
        ctx.fill();
        ctx.restore();
        
        p.ttl--;
        if(p.ttl == 0) {
          delete expl.particles[key];
        }
      }
    },
    
    renderGUI: function() {
      this.ctx.save();
      this.ctx.fillStyle = 'white';
      this.ctx.fillText(this.fps + ' FPS', 4, 12);
      this.ctx.fillText('X:        ' + this.me.x         + ' Y:        ' + this.me.y, 4, 24);
      this.ctx.fillText('Angle:    ' + this.me.angle, 4, 36);
      this.ctx.fillText('X-Offset: ' + this.offsetX      + ' Y-Offset: ' + this.offsetY, 4, 48);
      this.ctx.fillText('Grid-X:   ' + this.gridOffsetX  + ' Grid-Y:   ' + this.gridOffsetY, 4, 60);
      this.ctx.fillText('X-Scr:    ' + this.me.onscreenX + ' Y-Scr:    ' + this.me.onscreenY, 4, 72);
      this.ctx.fillText('Zoom:     ' + this.zoomLevel, 4, 84);
      this.ctx.fillText('CPF:      ' + this.cpf, 4, 96);
      this.ctx.restore();
    },
    
    resize: function() {
      this.canvas.width  = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.guis.resize();
    },
    
    init: function() {
      stat.load([
        {
          type: 'parts',
          cb: function() {
            var draw = function(ctx, render) {
              eval(this.render);
            }
            
            for(var i = 0; i < stat.parts.length; i++) {
              stat.parts[i].draw = draw;
            }
          }
        }
      ]);
      
      this.canvas = $('#canvas')[0];
      this.ctx = canvas.getContext('2d');
      
      var frameRate = 60;
      var tickRate = 1000 / frameRate;
      
      // Hook our events
      $(document).bind     ('contextmenu', function() { return false; });
      $(document).keydown  ($.proxy(this.guis.keydown  , this.guis));
      $(document).keyup    ($.proxy(this.guis.keyup    , this.guis));
      $(document).keypress ($.proxy(this.guis.keypress , this.guis));
      $(document).mousemove($.proxy(this.guis.mousemove, this.guis));
      $(document).mousedown($.proxy(this.guis.mousedown, this.guis));
      $(document).mouseup  ($.proxy(this.guis.mouseup  , this.guis));
      $(window)  .resize   ($.proxy(this.resize        , this));
      
      setInterval($.proxy(this.render, this), tickRate);
      setInterval($.proxy(function() {
        this.fps = this.fpsTicks;
        this.fpsTicks = 0;
      }, this), 1000);
      
      this.resize();
      this.initMenu();
    },
    
    gotchat: function(msg) {
    
    },
    
    initMenu: function() {
      var menu = MainMenu(this.ctx);
      
      menu.onplay   = $.proxy(function() {
        var msg = Message(this.ctx, 'Connecting...');
        this.guis.push(msg);
        
        this.socket = io.connect(ip + ':' + port, {'reconnect': false});
        this.socket.on('connect', $.proxy(function() {
          msg.text('Logging in...');
          
          this.socket.on('adduser',   $.proxy(this.addUser, this));
          this.socket.on('setParams', $.proxy(function(data) {
            msg.pop();
            menu.pop();
            this.initGame();
            this.setParams(data);
          }, this));
          this.socket.on('setSystem', $.proxy(this.setSystem, this));
          
          this.socket.emit('login', {name: name, auth: auth});
        }, this));
      }, this);
      
      this.guis.push(menu);
      
      var name = $('input[name=username]').val();
      var auth = $('input[name=auth]').val();
      var ip   = $('input[name=ip]').val();
      var port = $('input[name=port]').val();
    },
    
    addUser: function(data) {
      console.log('Adding user[', data, ']');
      var user = User();
      user.id = data.id;
      user.name = data.name;
      this.user[user.id] = user;
      this.gotchat({id: 'Server', msg: user.name + ' has joined the game!'});
    },
    
    remUser: function(data) {
      console.log('Removing user [' + data.id + ']');
      this.gotchat({id: 'Server', msg: this.user[data.id].name + ' has left the game!'});
      delete this.user[data.id];
    },
    
    initGame: function() {
      var guiGame = Game(this.ctx, this.socket);
      guiGame.onkeydown = $.proxy(function(ev, handled) {
        if(!handled) {
          switch(ev.which) {
            case 32: case 37: case 38: case 39: case 40:
              var code = (ev.which == 32) ? 0x10 : Math.pow(2, ev.which - 37);
              if((this.keys & code) == 0) {
                this.keys |= code;
                this.socket.emit('keys', {keys: this.keys});
              }
              break;
            
            //PGUP
            case 33:
              this.zoomIn();
              break;
            
            //PGDN
            case 34:
              this.zoomOut();
              break;
            
            case 84:
              guiGame.showchat();
              ev.preventDefault();
              break;
          }
        }
      }, this);
      
      guiGame.onkeyup = $.proxy(function(ev, handled) {
        switch(ev.which) {
          case 32: case 37: case 38: case 39: case 40:
            var code = (ev.which == 32) ? 0x10 : Math.pow(2, ev.which - 37);
            if((this.keys & code) != 0) {
              this.keys &= ~code;
              this.socket.emit('keys', {keys: this.keys});
            }
            break;
        }
      }, this);
      
      guiGame.onrender = $.proxy(this.renderGame, this);
      
      this.guis.push(guiGame);
      this.gotchat = guiGame.gotchat;
      
      // Register event handlers
      this.socket.on('msg',     $.proxy(this.gotchat, this));
      this.socket.on('update',  $.proxy(this.update, this));
      this.socket.on('effect',  $.proxy(this.effect, this));
      this.socket.on('remuser', $.proxy(this.remUser, this));
      this.socket.on('zoom',    $.proxy(function(data) {
        this.setZoom(data.zoom);
      }, this));
      
      this.inGame = true;
    },
    
    setParams: function(data){
      console.log('setting client/world[', data, ']');
      this.me = this.user[data.id];
      console.log('Set id[', this.me.id, ']');
    },
    setSystem: function(data){
      this.system = data.system;
      this.setZoom(this.zoomLevel);
      console.log('Set system[', this.system, ']');
    },
    
    update: function(up) {
      for(key in up.usersOnScreen) {
        user = up.usersOnScreen[key];
        this.user[user.id].x = user.x;
        this.user[user.id].y = user.y;
        this.user[user.id].angle = user.angle;
      }
    },
    
    effect: function(expl) {
      var expl = Effect(0, expl.x, expl.y, {size: expl.size});
      this.effects.push(expl);
    },
    
    zoomOut: function() {
      var newZoom = this.zoomLevel + this.zoomSpeed;
      
      if ( newZoom <= this.maxZoom ) {
        this.setZoom(newZoom);
      }
    },
    
    zoomIn: function() {
      var newZoom = Math.max(this.zoomLevel - this.zoomSpeed, 1);
      
      if ( newZoom != this.zoomLevel ) {
        this.setZoom(newZoom);
      }
    },
    
    setZoom: function(zoomLevel) {
      this.zoomLevel = zoomLevel;
      this.scalecelestial(this.system.star);
    },
    
    onscreen: function(entity, screenX, screenY, scaled) {
      var size = entity.size / this.zoomLevel;
      var w = this.canvas.width;
      var h = this.canvas.height;
      
      if(scaled) {
        screenX /= this.zoomLevel;
        screenY /= this.zoomLevel;
      }
      
      return !(
        screenX + (size) < 0 || // Right edge is left of canvas
        screenX - (size) > w || // Left edge is right of canvas
        screenY + (size) < 0 || // Top edge is below canvas
        screenY - (size) > h);  // Bottom edge is above canvas
    },
    
    onscreen2: function(entity) {
      var size = entity.sizeScaled;
      var w = this.canvas.width;
      var h = this.canvas.height;
      
      var screenX = entity.xScaled - this.offsetXScaled;
      var screenY = entity.yScaled - this.offsetYScaled;
      
      return !(
        screenX + size < 0 || // Right edge is left of canvas
        screenX - size > w || // Left edge is right of canvas
        screenY + size < 0 || // Top edge is below canvas
        screenY - size > h);  // Bottom edge is above canvas
    },
    
    scalecelestial: function(c) {
      c.sizeScaled = c.size / this.zoomLevel;
      c.xScaled = c.x / this.zoomLevel;
      c.yScaled = c.y / this.zoomLevel;
      
      for(var i = 0; i < c.celestial.length; i++) {
        this.scalecelestial(c.celestial[i]);
      }
    }
  }
}

function Effect(type, x, y, data) {
  var particles = [];
  
  switch(type) {
    case 0: // Regular explosion
      var numParticles = Math.pow(2, data.size + 2);
      var maxVelocity = data.size * 2;
      var ttl = data.size * 20;
      
      for(var i = 0; i < numParticles; i++) {
        particles[i] = {
          v: maxVelocity * Math.random(),
          angle: 360 * Math.random(),
          r: Math.floor(0xFF * Math.random()),
          g: Math.floor(0x40 * Math.random()),
          b: Math.floor(0x40 * Math.random()),
          x: x,
          y: y,
          size: 1,
          ttl: ttl
        }
      }
      
      break;
    
    case 'shieldhit':
      var mult = Math.min(data.charge > 0 ? 1 / data.charge : 10, 10);
      var numParticles = Math.round(20 * mult);
      var maxVelocity = 1.5;
      var ttl = 15;
      var size = 0.4 * mult;
      
      for(var i = 0; i < numParticles; i++) {
        particles[i] = {
          v: maxVelocity * Math.random(),
          angle: data.a + 40 * Math.random() - 20,
          r: 0,
          g: Math.floor(0x7F * Math.random()) + 0x80,
          b: Math.floor(0x7F * Math.random()) + 0x80,
          x: x,
          y: y,
          size: size * Math.random(),
          ttl: Math.round(ttl * Math.random() + ttl / 2)
        }
      }
      break;
    
    case 'armourhit':
      var smokeCount = 30;
      var smokeVel = 0.6;
      var smokeTTL = 30;
      var smokeSize = 1;
      var fireCount = 30;
      var fireVel = 0.6;
      var fireTTL = 30;
      var fireSize = 1;
      
      for(var i = 0; i < smokeCount; i++) {
        var c = Math.floor(0x3F * Math.random()) + 0x20;
        particles[i] = {
          v: smokeVel * Math.random(),
          angle: data.a + 60 * Math.random() - 30,
          r: c,
          g: c,
          b: c,
          x: x,
          y: y,
          size: smokeSize * Math.random(),
          ttl: Math.round(smokeTTL * Math.random() + smokeTTL / 2)
        }
      }
      
      var n = i;
      
      for( ; i < fireCount + n; i++) {
        var r = Math.floor(0x7F * Math.random()) + 0x60;
        var g = Math.floor(r * Math.random());
        particles[i] = {
          v: fireVel * Math.random(),
          angle: data.a + 30 * Math.random() - 15,
          r: r,
          g: g,
          b: 0,
          x: x,
          y: y,
          size: fireSize * Math.random(),
          ttl: Math.round(fireTTL * Math.random() + fireTTL / 2)
        }
      }
      break;
  }
  
  return {
    x: x,
    y: y,
    particles: particles
  }
}

function User() {
  return {
    id: null,
    name: null,
    x: 0,
    y: 0,
    onscreenX: 0,
    onscreenY: 0,
    color: '#FF00FF',
    size: 0,
    lastHit: 0
  }
}

$(document).ready(function() {
  var client = Client();
  client.init();
});