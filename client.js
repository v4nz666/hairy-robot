function Client() {
    return {
        id: null,
        socket: null,
        color: 'white',
        
        x: null,
        y: null,
        angle: null,
        shields: null,
        
        size: 32,
        bulletSize: 2,
        
        bullets: [],
        explosions: [],
        particleSize: 1,
        
        messages: [],
        maxMessages: 10,
        inChat: false,
        
        lifeBar: null,
        shieldBar: null,
        guns: null,
        
        commands: {
            1:  false, //turnLeft
            2:  false, //turnRight
            4:  false, //thruster
            8:  false, //reverse
            16: false, //fire
            32: false  //thrustersOff
        },
        
        sample: function() {
            cmds = 0;
            this.commands[32] = ( ! this.commands[4] && ! this.commands[8] );
            
            for (key in this.commands) {
                if ( this.commands[key] === true ) {
                    cmds = cmds | key;
                }
            }
            
            if ( cmds ) {
                var input = {
                    src: this.id,
                    commands: cmds
                }
                this.socket.emit('cmd', input);
            }
        },
        
        clear: function(clr) {
            if ( typeof clr === 'undefined' ) {
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
            for (i = 0; i < this.bullets.length; i++ ) {
                    var bullet = this.bullets[i];
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.arc(bullet.x, bullet.y, this.bulletSize, 0, Math.PI * 2);
                    this.ctx.closePath();
                    this.ctx.fillStyle = 'white';
                    this.ctx.fill();
                    this.ctx.restore();
            }
        },
        
        renderUsers: function() {
            for (key in this.users ) {
                user = this.users[key];
                
                if ( ! user.x || ! user.y ) { continue; }
                
                
                if ( key == this.id ) { 
                    color = this.color; 
                } else {
                    color = 'white';
                }
                this.ctx.save();
                
                this.ctx.textAlign = 'center';
                this.ctx.fillStyle = 'white';
                this.ctx.fillText(user.name, user.x, user.y - this.size / 2);
                
                this.ctx.translate(user.x, user.y);
                this.ctx.rotate(user.angle*Math.PI/180);
                
                this.ctx.beginPath();
                this.ctx.moveTo(this.size/2, 0);
                this.ctx.lineTo(-this.size/2, 8);
                this.ctx.bezierCurveTo(0,5, 0,-5, -this.size/2,-8);
                this.ctx.lineTo(this.size/2, 0);
                this.ctx.fillStyle = color;
                this.ctx.fill();
                this.ctx.restore();
                
                if ( user.shields > 0 ) {
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.arc(user.x, user.y, this.size/2, 0, Math.PI * 2);
                    this.ctx.closePath();
                    this.ctx.fillStyle = 'rgba(0,255,255,' + user.shields/500 + ')';
                    this.ctx.fill();
                    this.ctx.restore();
                }
            }
        },
        
        renderExplosions: function() {
            for (i = 0; i < this.explosions.length; i++ ) {
                this.renderExplosion(this.explosions[i]);
            }
            
            for ( i = this.explosions.length - 1; i >= 0; i-- ) {
                if ( this.explosions[i].ttl <= 0 ) {
                    this.explosions.splice(i,1);
                    continue;
                }   
            }
        },
        
        renderExplosion: function(expl) {
            var ctx = this.ctx;
            
            for ( _i = expl.particles.length -1; _i >= 0; _i-- ) {
                p = expl.particles[_i];
                
                var theta = p.angle * Math.PI/180
                var vX = Math.cos(theta) * p.v;
                var vY = Math.sin(theta) * p.v;
                
                p.x = p.x + vX;
                p.y = p.y + vY;
                
                if ( p.x < -this.particleSize || p.x > this.width + this.particleSize ||
                     p.y < -this.particleSize || p.y > this.height + this.particleSize ) {
                    
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
            for ( i in this.powerups ) {
                if ( i === 'length' ) { continue; }
                obj = this.powerups[i];
                
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.moveTo(obj.x+obj.size/2, obj.y + obj.size/6);
                this.ctx.lineTo(obj.x-obj.size/3, obj.y - obj.size/2);
                this.ctx.lineTo(obj.x, obj.y + obj.size/2);
                this.ctx.lineTo(obj.x+obj.size/3, obj.y - obj.size/2);
                this.ctx.lineTo(obj.x-obj.size/2, obj.y + obj.size/6);
                this.ctx.lineTo(obj.x+obj.size/2, obj.y + obj.size/6);
                this.ctx.closePath();
                this.ctx.fillStyle = obj.color;
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.arc(obj.x, obj.y, obj.size/2, 0, Math.PI*2);
                
                this.ctx.strokeStyle = obj.color;
                this.ctx.stroke();
                this.ctx.restore();
                
            }
        },
        
        init: function() {
          this.socket = io.connect('http://home.monoxidedesign.com:9092', { 'reconnect': false } );
          this.initMenu();
        },
        
        initMenu: function() {
          username = $('#username');
          username.keyup($.proxy(function(e) {
            if(e.keyCode == 13) {
              this.login(username.val());
            }
          }, this));
        },
        
        login: function(name) {
          $('#login :input').attr('disabled', true);
          
          // Register setParams handler and send login
          this.socket.on('setParams', $.proxy(function(data) {
            this.setParams(data);
            this.initGame();
          }, this));
          
          this.socket.emit('login', {name: name} );
        },
        
        initGame: function() {
            $('#login').hide();
            $('#game').show();
            
            var sampleRate = 100; // Client input sample rate in milliseconds
            var frameRate = 60;
            var tickRate = 1000 / frameRate;
            
            // Register event handlers
            this.socket.on('userScores', $.proxy(this.userScore, this));
            this.socket.on('msg',        $.proxy(this.addMsg, this));
            this.socket.on('stats',      $.proxy(this.stats, this));
            this.socket.on('update',     $.proxy(this.update, this));
            this.socket.on('explosion',  $.proxy(this.explosion, this));
            this.socket.on('powerups',   $.proxy(this.powerupUpdate, this));
            
            // Hook our keyboard events
            $(document).keydown($.proxy(function(ev) {this.addInput(ev, true)}, this));
            $(document).keyup($.proxy(function(ev) {this.addInput(ev, false)}, this));
            
            this.textInput = $('#textInput');
            console.log(this.textInput);
            this.textInput.keydown($.proxy(function(ev) {this.chatInput(ev)}, this));
            
            this.lifeBar = $('#life');
            this.shieldBar = $('#shield');
            this.guns = $('#guns');
            
            this.canvas = $('#canvas')[0];
            this.canvas.width = 800;
            this.canvas.height = 600;
            this.ctx = canvas.getContext('2d');
            
            console.log(this);
            setInterval($.proxy(this.sample, this), sampleRate);
            setInterval($.proxy(this.render, this), frameRate);
        },
        
        setParams: function(data){
            console.log('setting client[', data, ']');
            this.id = data.id;
            this.color = data.color;
            console.log('Set id[', this.id, ']');
        },
        
        powerupUpdate: function(powerups) {
            this.powerups = powerups;
            console.log('Got Powerups[', this.powerups, ']');
        },
        
        addMsg: function(msg) {
            while (this.messages.length >= this.maxMessages) {
                this.messages.shift();
            }
            this.messages.push(msg);
            
            this.renderMessages();
        },
        
        stats: function(stats) {
          console.log(stats);
          this.lifeBar.width((stats.life / 100) * 100 + "%");
          this.shieldBar.width((stats.shields / 100) * 100 + "%");
          this.guns.html(stats.guns);
        },
        
        renderMessages: function() {
            html = '';
            for (i = 0; i < this.messages.length; i++){ 
                id = this.messages[i].id;
                msg = this.messages[i].msg;
                html += id + ': ' + msg + '<br />';
            }
            $('#messages').html(html);
        },
        
        userScore: function(userScores) {
            console.log('User Scores[', userScores, ']');
            html = '';
            for (i in userScores){ 
                if ( i !== 'length') {
                    score = userScores[i];
                    console.log('Adding score[', score, ']');
                    name = score.name;
                    k = score.kills;
                    d = score.deaths;
                    html += name + ': ' + k + ' Kills - ' + d + 'Deaths<br />';
                }
                
            }
            $('#scores').html(html);
        },
        
        addInput: function(ev, down) {
          if(this.textInput.is(':hidden')) {
            cmd = Cmd(this.id, ev);
            
            switch(ev.keyCode) {
                case 37:
                    this.commands[1] = down;
                break;
                
                case 39:
                    this.commands[2] = down;
                break;
                
                case 38:
                    this.commands[4] = down;
                break;
                
                case 40:
                    this.commands[8] = down;
                break;
                
                case 32:
                    this.commands[16] = down;
                break;
                
                case 84:
                  if(down) {
                    this.textInput.show();
                    this.textInput.focus();
                    ev.preventDefault();
                  }
                break;
            }
          }
        },
        
        chatInput: function(ev) {
          if(ev.which == 13) {
            if(this.textInput.val().length != 0) {
              this.socket.emit('msg', {id: this.id, msg: this.textInput.val()});
              this.textInput.val('');
            }
            
            this.textInput.hide();
          }
        },
        
        update: function(up) {
            
            this.users = {}
            this.ticks = up.ticks;
            this.bullets = up.bullets;
            for ( key in up.usersOnScreen ) {
                user = up.usersOnScreen[key];
                this.users[key] = user;
                
                if ( user.id == this.id ) {
                    this.x = user.x;
                    this.y = user.y;
                    this.shields = user.shields;
                    this.angle = user.angle;
                }
                
            }
        },
        
        explosion: function(expl) {
            
            var expl = Explosion(expl.size, expl.x, expl.y, expl.tick);
            this.explosions.push(expl);
        },
        
        isRegistered: function() {
            return typeof this.id != "undefined";
        }
    }
}



function Cmd(id, commands) {
    return  {
        src: id,
        commands: commands
    }
}

function Explosion(size, x, y, tick) {
    
    switch ( size ) {
        case 'small' :
            var numParticles = 8;
            var maxVelocity = 3;
            var ttl = 10;
            break;
        case 'med' :
        case 'medium' :
            var numParticles = 16;
            var maxVelocity = 4;
            var ttl = 20;
            break;
        case 'lg' :
        case 'large' :
            var numParticles = 32;
            var maxVelocity = 6;
            var ttl = 30;
            break;
        case 'huge' :
            var numParticles = 64;
            var maxVelocity = 8;
            var ttl = 40;
            break;
    }
    
    var particles = [];
    
    for ( var i = 0; i < numParticles; i++ ) {
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
        g: Math.floor(64 * Math.random()),
        b: Math.floor(64 * Math.random()),
        x: x,
        y: y
    }
}
$(document).ready(function() {
    var client = Client();
    client.init();
});