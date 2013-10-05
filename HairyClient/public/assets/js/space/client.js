function Client() {
  return {
    socket: null,
    inGame: false,
    
    user: [],
    me: null,
    
    bullets: [],
    effects: [],
    
    messages: [],
    maxMessages: 10,
    inChat: false,
    
    lifeBar: null,
    shieldBar: null,
    gun: null,
    
    keys: 0,
    
    ticks: 0,
    fps: 0,
    fpsTicks: 0,
    
    toRads: Math.PI / 180,
    toDegs: 180 / Math.PI,
    PIx2: Math.PI * 2,
    
    offsetX: 0,
    offsetY: 0,
    
    gridSize: 128,
    
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
      if(this.inGame) {
        this.physics();
        
        this.calculateOffsets();
        
        this.clear();
        this.renderBackground();
        this.renderBullets();
        this.renderUsers();
        this.renderEffects();
        this.renderPowerups();
        this.renderGUI();
      }
      
      this.ticks++;
      this.fpsTicks++;
    },
    
    calculateOffsets: function() {
        // Near the left edge of the map
        if (this.me.x <= this.ctx.canvas.width / 2) {
            this.offsetX = 0;
            this.me.onscreenX = this.me.x;
        // Near the right side of the map
        } else if (this.me.x >= this.worldWidth - (this.ctx.canvas.width / 2)) {
            this.offsetX = this.worldWidth - (this.ctx.canvas.width);
            this.me.onscreenX = this.ctx.canvas.width - (this.worldWidth - this.me.x);
        // In the middle
        } else {
            this.offsetX = Math.floor(this.me.x - this.ctx.canvas.width / 2);
            this.me.onscreenX = this.me.x - this.offsetX;
        }
        
        // Near the top of the map
        if (this.me.y <= this.ctx.canvas.height/ 2) {
            this.offsetY = 0;
            this.me.onscreenY = this.me.y;
        // Near the bottom of the map
        } else if (this.me.y >= this.worldHeight - (this.ctx.canvas.height / 2)) {
            this.offsetY = this.worldHeight - (this.ctx.canvas.height);
            this.me.onscreenY = this.ctx.canvas.height- (this.worldHeight - this.me.y);
        // In the middle of the map
        } else {
            this.offsetY = this.me.y - this.ctx.canvas.height / 2;
            this.me.onscreenY = this.me.y - this.offsetY;
        }
        
        this.gridOffsetX = this.offsetX % this.gridSize;
        this.gridOffsetY = this.offsetY % this.gridSize;
    },
    
    renderBackground: function() {
      var ctx = this.ctx;
      
      ctx.save();
      
      var _x = 0;
      var c = 1;
      
      while ( c * this.gridSize - this.gridOffsetX < ctx.canvas.width ) {
        _x = (c * this.gridSize) - this.gridOffsetX;
        ctx.beginPath();
        ctx.moveTo(_x, 0);
        ctx.lineTo(_x, ctx.canvas.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgb(32,32,32)';
        ctx.stroke();
        
        c = c + 1;
      }
      
      var _y = 0;
      c = 1;
      
      while ( c * this.gridSize - this.gridOffsetY < ctx.canvas.height) {
        _y = (c * this.gridSize) - this.gridOffsetY;
        ctx.beginPath();
        ctx.moveTo(0, _y);
        ctx.lineTo(ctx.canvas.width, _y);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgb(32,32,32)';
        ctx.stroke();
        
        c = c + 1;
      }
      ctx.restore();
    },
    renderBullets: function() {
      var ctx = this.ctx;
      var screenX;
      var screenY;
      var screenLastX;
      var screenLastY;
      
      for(i in this.bullets) {
        
        if(i === 'length') { continue; }
        
        var bullet = this.bullets[i];
        
        screenX = bullet.x - this.offsetX;
        screenY = bullet.y - this.offsetY;
        
        if ( ! this.onscreen(bullet, screenX, screenY)) {
          continue;
        }
        
        screenLastX = bullet.lastX - this.offsetX;
        screenLastY = bullet.lastY - this.offsetY;
        
        ctx.save();
        ctx.beginPath();
        
        if(!screenLastX || !screenLastY) {
          
          ctx.arc(screenX, screenY, bullet.size, 0, this.PIx2);
          ctx.fillStyle = 'white';
          ctx.fill();
        } else {
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(screenLastX, screenLastY);
          ctx.lineWidth = bullet.size * 2;
          ctx.lineCap = 'round';
          ctx.strokeStyle = 'white';
          ctx.stroke();
        }
        
        ctx.restore();
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
          
          screenX = user.x - this.offsetX;
          screenY = user.y - this.offsetY;
          
          if ( ! this.onscreen(user) ) {
            
            continue;
          }
          
        }
        
        this.ctx.save();
        
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(user.name, screenX, screenY - user.size / 2);
        
        this.ctx.translate(screenX, screenY);
        this.ctx.rotate(user.angle * this.toRads);
        
        if(user.shields > 0) {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, user.size / 2, 0, this.PIx2);
          this.ctx.closePath();
          
          if(user.shields / user.maxShields > 0.25 || this.ticks > user.lastHit) {
            this.ctx.fillStyle = 'rgba(0,255,255,' + ((user.shields / user.maxShields) * 100) / 0x139 + ')';
          } else if(this.ticks <= user.lastHit) {
            this.ctx.fillStyle = 'rgba(0,255,255,' + (0.5 - (user.shields / user.maxShields)) + ')';
          }
          
          this.ctx.fill();
        }
        
        this.ctx.beginPath();
        this.ctx.moveTo( user.size / 2, 0);
        this.ctx.lineTo(-user.size / 2, user.size / 4);
        this.ctx.bezierCurveTo(0, 5, 0, -5, -user.size / 2, -user.size / 4);
        this.ctx.lineTo(user.size / 2, 0);
        this.ctx.fillStyle = user.color;
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
        
        screenX = p.x - this.offsetX;
        screenY = p.y - this.offsetY;
        
        if ( ! this.onscreen(p, screenX, screenY)) {
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
    
    renderPowerups: function() {
      for(i in this.powerups) {
        if(i === 'length') { continue; }
        obj = this.powerups[i];
        
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(obj.x + obj.size / 2, obj.y + obj.size / 6);
        this.ctx.lineTo(obj.x - obj.size / 3, obj.y - obj.size / 2);
        this.ctx.lineTo(obj.x               , obj.y + obj.size / 2);
        this.ctx.lineTo(obj.x + obj.size / 3, obj.y - obj.size / 2);
        this.ctx.lineTo(obj.x - obj.size / 2, obj.y + obj.size / 6);
        this.ctx.lineTo(obj.x + obj.size / 2, obj.y + obj.size / 6);
        this.ctx.closePath();
        this.ctx.fillStyle = obj.color;
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(obj.x, obj.y, obj.size / 2, 0, this.PIx2);
        
        this.ctx.strokeStyle = obj.color;
        this.ctx.stroke();
        this.ctx.restore();
      }
    },
    
    renderGUI: function() {
      this.ctx.save();
      this.ctx.fillStyle = 'white';
      this.ctx.fillText(this.fps + ' FPS', 4, 12);
      this.ctx.fillText('X:' + this.me.x + " Y:" + this.me.y, 4, 24);
      this.ctx.fillText('Angle:' + this.me.angle, 4, 36);
      this.ctx.restore();
      
      var hull    = this.me.life / this.me.maxLife;
      var shields = this.me.shields / this.me.maxShields;
      
      this.ctx.save();
      this.ctx.translate(this.canvas.width - 4 - 100, 4);
      this.ctx.strokeStyle = 'white';
      this.ctx.fillStyle = 'rgb(0, 255, 0)';
      this.ctx.fillRect(0, 0, hull * 100, 12);
      this.ctx.strokeRect(0, 0, 100, 12);
      this.ctx.fillStyle = 'rgb(0, 255, 255)';
      this.ctx.fillRect(0, 14, shields * 100, 12);
      this.ctx.strokeRect(0, 14, 100, 12);
      this.ctx.fillStyle = 'rgb(255, 255, 255)';
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText('Hull:', -2, 0);
      this.ctx.fillText('Shields:', -2, 14);
      this.ctx.restore();
    },
    
    resize: function() {
      this.canvas.width  = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.render();
    },
    
    init: function() {
      this.initMenu();
    },
    
    setStatus: function(status) {
      $('#status').html(status);
    },
    
    initMenu: function() {
      this.setStatus('Initialising...');
      
      this.canvas = $('#canvas')[0];
      this.ctx = canvas.getContext('2d');
      
      name = $('input[name=username]').val();
      auth = $('input[name=auth]').val();
      ip   = $('input[name=ip]').val();
      port = $('input[name=port]').val();
      
      this.lifeBar = $('#life');
      this.shieldBar = $('#shield');
      this.gun = $('#guns');
      
      window.addEventListener('resize', $.proxy(this.resize, this), false);
      this.resize();
      
      this.setStatus('Connecting...');
      this.socket = io.connect(ip + ':' + port, {'reconnect': false});
      this.socket.on('connect', $.proxy(function() {
        this.login(name, auth);
      }, this));
    },
    
    login: function(name, auth) {
      this.setStatus('Logging in...');
      // Register setParams handler and send login
      this.socket.on('adduser',   $.proxy(this.addUser, this));
      this.socket.on('setParams', $.proxy(function(data) {
        this.setParams(data);
        this.initGame();
      }, this));
      
      this.socket.emit('login', {name: name, auth: auth});
    },
    
    addUser: function(data) {
      console.log('Adding user[', data, ']');
      var user = User();
      user.id = data.id;
      user.name = data.name;
      user.color = data.color;
      user.size = data.size;
      user.maxLife = data.maxLife;
      user.maxShields = data.maxShields;
      user.life = data.life;
      user.shields = data.shields;
      user.gun = data.gun;
      this.user[user.id] = user;
      this.addMsg({id: 'Server', msg: user.name + ' has joined the game!'});
    },
    
    remUser: function(data) {
      console.log('Removing user [' + data.id + ']');
      this.addMsg({id: 'Server', msg: this.user[data.id].name + ' has left the game!'});
      delete this.user[data.id];
    },
    
    initGame: function() {
      $('#status').hide();
      //$('#game').show();
      
      var frameRate = 60;
      var tickRate = 1000 / frameRate;
      
      // Register event handlers
      this.socket.on('userScores', $.proxy(this.userScore, this));
      this.socket.on('msg',        $.proxy(this.addMsg, this));
      this.socket.on('stats',      $.proxy(this.stats, this));
      this.socket.on('update',     $.proxy(this.update, this));
      this.socket.on('effect',     $.proxy(this.effect, this));
      this.socket.on('powerups',   $.proxy(this.powerupUpdate, this));
      this.socket.on('remuser',    $.proxy(this.remUser, this));
      this.socket.on('hit',        $.proxy(this.hit, this));
      this.socket.on('kill',       $.proxy(this.kill, this));
      this.socket.on('badd',       $.proxy(this.badd, this));
      this.socket.on('brem',       $.proxy(this.brem, this));
      
      // Hook our keyboard events
      $(document).keydown($.proxy(this.keyDown, this));
      $(document).keyup($.proxy(this.keyUp, this));
      
      this.textInput = $('#textInput');
      console.log(this.textInput);
      this.textInput.keydown($.proxy(function(ev) {this.chatInput(ev)}, this));
      
      this.inGame = true;
      
      console.log(this);
      setInterval($.proxy(this.render, this), tickRate);
      setInterval($.proxy(function() {
        this.fps = this.fpsTicks;
        this.fpsTicks = 0;
      }, this), 1000);
    },
    
    setParams: function(data){
      console.log('setting client/world[', data, ']');
      this.worldWidth = data.w;
      this.worldHeight = data.h;
      this.me = this.user[data.id];
      console.log('Set id[', this.me.id, ']');
      this.renderStats();
    },
    
    powerupUpdate: function(powerups) {
      this.powerups = powerups;
      console.log('Got Powerups[', this.powerups, ']');
    },
    
    addMsg: function(msg) {
      while(this.messages.length >= this.maxMessages) {
        this.messages.shift();
      }
      
      this.messages.push(msg);
      this.renderMessages();
    },
    
    stats: function(stats) {
      console.log(stats);
      var user = this.user[stats.id];
      user.maxLife = stats.maxLife;
      user.maxShields = stats.maxShields;
      user.life = stats.life;
      user.shields = stats.shields;
      user.gun = stats.gun;
      
      if(user == this.me) {
        this.renderStats();
      }
    },
    
    renderStats: function() {
      this.lifeBar.width((this.me.life / this.me.maxLife) * 100 + '%');
      this.shieldBar.width((this.me.shields / this.me.maxShields) * 100 + '%');
      this.gun.html(this.me.gun);
    },
    
    renderMessages: function() {
      html = '';
      for(i = 0; i < this.messages.length; i++){ 
        id = this.messages[i].id;
        msg = this.messages[i].msg;
        html += id + ': ' + msg + '<br>';
      }
      
      $('#messages').html(html);
    },
    
    userScore: function(userScores) {
      console.log('User Scores[', userScores, ']');
      html = '';
      for(i in userScores) { 
        if(i !== 'length') {
          score = userScores[i];
          console.log('Adding score[', score, ']');
          name = score.name;
          k = score.kills;
          d = score.deaths;
          html += name + ': ' + k + ' Kills - ' + d + 'Deaths<br>';
        }
      }
      
      $('#scores').html(html);
    },
    
    keyDown: function(ev) {
      if(this.textInput.is(':hidden')) {
        switch(ev.keyCode) {
          case 32: case 37: case 38: case 39: case 40:
            code = (ev.keyCode == 32) ? 0x10 : Math.pow(2, ev.keyCode - 37);
            if((this.keys & code) == 0) {
              this.keys |= code;
              this.socket.emit('keys', {keys: this.keys});
            }
            break;
          
          case 84:
            this.textInput.show();
            this.textInput.focus();
            ev.preventDefault();
            break;
        }
      }
    },
    
    keyUp: function(ev) {
      if(this.textInput.is(':hidden')) {
        switch(ev.keyCode) {
          case 32: case 37: case 38: case 39: case 40:
            code = (ev.keyCode == 32) ? 0x10 : Math.pow(2, ev.keyCode - 37);
            if((this.keys & code) != 0) {
              this.keys &= ~code;
              this.socket.emit('keys', {keys: this.keys});
            }
            break;
        }
      }
    },
    
    chatInput: function(ev) {
      if(ev.which == 13) {
        if(this.textInput.val().length != 0) {
          this.socket.emit('msg', {msg: this.textInput.val()});
          this.textInput.val('');
        }
        
        this.textInput.hide();
      }
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
    
    hit: function(hit) {
      user = this.user[hit.id];
      user.lastHit = this.ticks + 3;
      
      var a = Math.atan2(hit.y - user.y, hit.x - user.x) * this.toDegs;
      
      if(user.shields > 0 || user.life === user.maxLife) {
        this.effects.push(Effect('shieldhit', hit.x, hit.y, {a: a, charge: user.shields / user.maxShields}));
      } else {
        this.effects.push(Effect('armourhit', hit.x, hit.y, {a: a}));
      }
    },
    
    kill: function(kill) {
      user = this.user[kill.id];
      this.effects.push(Effect(0, user.x, user.y, {size: 4}));
    },
    
    badd: function(bullet) {
      this.bullets[bullet.id] = bullet;
    },
    
    brem: function(bullet) {
      delete this.bullets[bullet.id];
    },
    
    physics: function() {
      for(i in this.bullets) {
        if(i === 'length') { continue; }
        var e = this.bullets[i];
        
        if(e.acc != 0) {
          theta = e.angle * this.toRads;
          
          e.vx += Math.cos(theta) * e.acc;
          e.vy += Math.sin(theta) * e.acc;
          
          if(e.vx > e.maxVel) {
            e.vy *= (e.maxVel / e.vx);
            e.vx = e.maxVel;
            e.acc = 0;
          }
          
          if(e.vx < -e.maxVel) {
            e.vy *= (-e.maxVel / e.vx);
            e.vx = -e.maxVel;
            e.acc = 0;
          }
          
          if(e.vy > e.maxVel) {
            e.vx *= (e.maxVel / e.vy);
            e.vy = e.maxVel;
            e.acc = 0;
          }
          
          if(e.vy < -e.maxVel) {
            e.vx *= (-e.maxVel / e.vy);
            e.vy = -e.maxVel;
            e.acc = 0;
          }
        }
        
        e.lastX = e.x;
        e.lastY = e.y;
        
        e.x += e.vx;
        e.y += e.vy;
      }
    },
    
    onscreen: function(entity, screenX, screenY) {
      return ! (
        screenX + entity.size / 2 < 0                     || // Right edge is left of canvas
        screenX - entity.size / 2 > this.ctx.canvas.width || // Left edge is right of canvas
        screenY + entity.size / 2 < 0                     || // Top edge is below canvas
        screenY - entity.size / 2 > this.ctx.canvas.height   // Bottom edge is above canvas
      );
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
      var smokeSize = 2;
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