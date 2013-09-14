function Client() {
  return {
    socket: null,
    
    user: [],
    me: null,
    
    bullets: [],
    explosions: [],
    particleSize: 1,
    
    messages: [],
    maxMessages: 10,
    inChat: false,
    
    lifeBar: null,
    shieldBar: null,
    gun: null,
    
    keys: 0,
    
    clear: function(clr) {
      if(typeof clr === 'undefined') {
        clr = 'rgb(0,0,0)';
      }
      
      this.ctx.save();
      this.ctx.fillStyle = clr;
      this.ctx.fillRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.restore();
    },
    
    render: function() {
      this.clear();
      this.renderBullets();
      this.renderUsers();
      this.renderExplosions();
      this.renderPowerups();
    },
    
    renderBullets: function() {
      for(i = 0; i < this.bullets.length; i++) {
        var bullet = this.bullets[i];
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        this.ctx.restore();
      }
    },
    
    renderUsers: function() {
      for(key in this.user) {
        user = this.user[key];
        
        if(!user.x || !user.y) { continue; }
        
        this.ctx.save();
        
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(user.name, user.x, user.y - user.size / 2);
        
        this.ctx.translate(user.x, user.y);
        this.ctx.rotate(user.angle * Math.PI / 180);
        
        this.ctx.beginPath();
        this.ctx.moveTo( user.size / 2, 0);
        this.ctx.lineTo(-user.size / 2, 8);
        this.ctx.bezierCurveTo(0, 5, 0, -5, -user.size / 2, -8);
        this.ctx.lineTo(user.size / 2, 0);
        this.ctx.fillStyle = user.color;
        this.ctx.fill();
        this.ctx.restore();
        
        if(user.shields > 0) {
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.arc(user.x, user.y, user.size / 2, 0, Math.PI * 2);
          this.ctx.closePath();
          this.ctx.fillStyle = 'rgba(0,255,255,' + user.shields / 500 + ')';
          this.ctx.fill();
          this.ctx.restore();
        }
      }
    },
    
    renderExplosions: function() {
      for(i = 0; i < this.explosions.length; i++) {
        this.renderExplosion(this.explosions[i]);
      }
      
      for(i = this.explosions.length - 1; i >= 0; i--) {
        if(this.explosions[i].ttl <= 0) {
          this.explosions.splice(i, 1);
          continue;
        }   
      }
    },
    
    renderExplosion: function(expl) {
      var ctx = this.ctx;
      
      for(_i = expl.particles.length -1; _i >= 0; _i--) {
        p = expl.particles[_i];
        
        var theta = p.angle * Math.PI / 180
        var vX = Math.cos(theta) * p.v;
        var vY = Math.sin(theta) * p.v;
        
        p.x = p.x + vX;
        p.y = p.y + vY;
        
        if(p.x < -this.particleSize || p.x > this.width  + this.particleSize ||
           p.y < -this.particleSize || p.y > this.height + this.particleSize) {
          expl.particles.splice(i, 1);
        }
        
        ctx.save();
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, this.particleSize, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = 'rgb(' + p.r + ',' + p.g + ',' + p.b + ')';
        ctx.fill();
        ctx.restore();
      }
      
      expl.ttl--;
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
        this.ctx.arc(obj.x, obj.y, obj.size / 2, 0, Math.PI * 2);
        
        this.ctx.strokeStyle = obj.color;
        this.ctx.stroke();
        this.ctx.restore();
      }
    },
    
    init: function() {
      this.socket = io.connect('http://hairy.monoxidedesign.com:9092', {'reconnect': false});
      this.initMenu();
    },
    
    setStatus: function(status) {
      $('#status').html(status);
    },
    
    initMenu: function() {
      this.setStatus('Initialising...');
      name = $('input[name=username]').val();
      auth = $('input[name=auth]').val();
      
      this.lifeBar = $('#life');
      this.shieldBar = $('#shield');
      this.gun = $('#guns');
      
      this.login(name, auth);
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
      this.user.splice(data.id, 1);
    },
    
    initGame: function() {
      $('#status').hide();
      $('#game').show();
      
      var frameRate = 60;
      var tickRate = 1000 / frameRate;
      
      // Register event handlers
      this.socket.on('userScores', $.proxy(this.userScore, this));
      this.socket.on('msg',        $.proxy(this.addMsg, this));
      this.socket.on('stats',      $.proxy(this.stats, this));
      this.socket.on('update',     $.proxy(this.update, this));
      this.socket.on('explosion',  $.proxy(this.explosion, this));
      this.socket.on('powerups',   $.proxy(this.powerupUpdate, this));
      this.socket.on('remuser',    $.proxy(this.remUser, this));
      
      // Hook our keyboard events
      $(document).keydown($.proxy(this.keyDown, this));
      $(document).keyup($.proxy(this.keyUp, this));
      
      this.textInput = $('#textInput');
      console.log(this.textInput);
      this.textInput.keydown($.proxy(function(ev) {this.chatInput(ev)}, this));
      
      this.canvas = $('#canvas')[0];
      this.canvas.width = 800;
      this.canvas.height = 600;
      this.ctx = canvas.getContext('2d');
      
      console.log(this);
      setInterval($.proxy(this.render, this), frameRate);
    },
    
    setParams: function(data){
      console.log('setting client[', data, ']');
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
      this.lifeBar.width((this.me.life / this.me.maxLife) * 100 + "%");
      this.shieldBar.width((this.me.shields / this.me.maxShields) * 100 + "%");
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
      this.ticks = up.ticks;
      this.bullets = up.bullets;
      
      for(key in up.usersOnScreen) {
        user = up.usersOnScreen[key];
        this.user[user.id].x = user.x;
        this.user[user.id].y = user.y;
        this.user[user.id].angle = user.angle;
      }
    },
    
    explosion: function(expl) {
      var expl = Explosion(expl.size, expl.x, expl.y, expl.tick);
      this.explosions.push(expl);
    }
  }
}

function Explosion(size, x, y, tick) {
  switch(size) {
    case 'small':
      var numParticles = 8;
      var maxVelocity = 3;
      var ttl = 10;
      break;
    
    case 'med':
    case 'medium':
      var numParticles = 16;
      var maxVelocity = 4;
      var ttl = 20;
      break;
    
    case 'lg':
    case 'large':
      var numParticles = 32;
      var maxVelocity = 6;
      var ttl = 30;
      break;
    
    case 'huge':
      var numParticles = 64;
      var maxVelocity = 8;
      var ttl = 40;
      break;
  }
  
  var particles = [];
  
  for(var i = 0; i < numParticles; i++) {
    particles[i] = Particle(x, y, maxVelocity);
  }
  
  return {
    x: x,
    y: y,
    particles: particles,
    ttl: ttl,
    born: tick
  }
}

function Particle(x, y, mV) {
  return {
    v: mV * Math.random(),
    angle: 360 * Math.random(),
    r: Math.floor(255 * Math.random()),
    g: Math.floor( 64 * Math.random()),
    b: Math.floor( 64 * Math.random()),
    x: x,
    y: y
  }
}

function User() {
  return {
    id: null,
    name: null,
    x: 0,
    y: 0,
    color: '#FF00FF',
    size: 0
  }
}

$(document).ready(function() {
  var client = Client();
  client.init();
});