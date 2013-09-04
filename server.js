var $ = require('jquery');

var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app, {log: false, noDelay: true})

app.listen(8000);

function handler (req, res) {
}

server = Server(io);
server.init();
console.log('Server Initialized');
server.spin();
console.log('Server Spinning');

function Server(io) {
    return {
        id: 'Server',
        users: {},
        bullets: [],
        userCount: 0,
        ticks: 0,
        interval: 16,
        clientSampleRate: 100,
        
        width: 800,
        height: 600,
        
        userLife: 100,
        userShields: 100,
        p_size: 32,
        p_acceleration: 1,
        p_rev_acceleration: -0.75,
        
        powerupProbability: 0.3,
        powerupSpawnRate: 300,
        powerupMaxSpeed: 1,
        powerups: [],
        maxPowerups: 3,
        
        bulletSize: 2,
        maxBullets: 3,
        
        maxGuns: 4,
        gunSpread: 15,
        
        // Map the bits sent as commands to functions in this class
        cmds: {
            1:  'turnLeft',
            2:  'turnRight',
            4:  'thruster',
            8:  'reverse',
            16: 'fire',
            32: 'thrustersOff'
        },
        
        turnSpeed: 15,
        
        // These will be set in init()
        ticksPerSecond: 0,
        
        commandQueue: {},
        userScores: {},
        
        init: function() {
            
            this.ticksPerSecond = 1000 / this.interval;
            
            
            $.proxy(io.sockets.on('connection', $.proxy(function (socket) {
                
                // Register user upon connection
                this.addUser(socket);
                
                console.log("New User added[" + socket.id + "]" + 
                    "at [" + this.width/2 + this.height/2  + "]" +
                    "Total[" + this.userCount + "]");
                
                socket.emit('msg', { id: this.id, msg: 'Welcome!!' });
                
                // Register event handlers for this sockeet
                socket.on('cmd', $.proxy(this.queueCmd, this));
                
                socket.on('msg', $.proxy(this.chatReceived, this));
                
                socket.on('disconnect', $.proxy(function(){
                    this.disconnect(socket.id);
                }, this));
                
                // Send User game info
                socket.emit('powerups', this.powerups);
                io.sockets.emit('userScores', this.userScores);
            }, this)), this);
        },
        addUser: function(socket) {
            
            this.userCount++;
            var name = "User " + this.userCount;
            
            var id = socket.id;
            var user = User(socket, name, this.width/2, this.height/2, this.userLife, this.userShields);
            
            this.users[id] = user;
            
            
            this.commandQueue[id] = [];
            this.userScores[id] = userScore(this.users[id]);
            
            socket.emit('setParams', {id: id, color: this.getColor()});
            
        },
        getColor: function() {
            
            r = Math.floor(Math.random() * 255);
            g = Math.floor(Math.random() * 255);
            b = Math.floor(Math.random() * 255);
            return 'rgb('+r+','+g+','+b+')';
        },
        queueCmd: function(input) {
            if ( input.src in this.commandQueue ) {
                this.commandQueue[input.src].push(input.commands);
    //             console.log('Queuing commands[', input.commands, '] for user [', input.src, '] ' + 
    //                 'UTotal[', this.commandQueue[input.src].length, ']');
            }
        },
        chatReceived: function(msg) {
            if ( msg.msg ) {
                io.sockets.emit('msg', {id: this.users[msg.id].name, msg: msg.msg})
            }
        },
        spin: function() {
            console.log('Spinning');
            setInterval($.proxy(this.tick, this), this.interval);
        },
        
        tick: function() {
            if ( this.ticks % 60 == 0) {
                console.log('tick', this.ticks);
            }
            
            // Update bullet positions
            for ( i = this.bullets.length - 1; i >= 0; i-- ) {
                
                var bullet = this.bullets[i];
                
                bullet.x = bullet.x + bullet.vX;
                bullet.y = bullet.y + bullet.vY;
                
                if ( bullet.x < -this.bulletSize || bullet.x > this.width + this.bulletSize ||
                     bullet.y < -this.bulletSize || bullet.y > this.height + this.bulletSize ) {
                    
                    this.users[bullet.id].bullets--;
                    
                    this.bullets.splice(i, 1);
                }
            }
            
            for ( id in this.users ) {
                if ( id === 'length' || ! this.users.hasOwnProperty(id) ) continue;
                
                user = this.users[id];
                
                // Read this user's command queue
                if ( this.commandQueue[id].length > 0 ) {
                    this.processCmds(id);
                }
                
                // Update this user's position
                this.update(user);
                
                // Check this user against all bullets for collisions
                for ( i = this.bullets.length - 1; i >= 0; i-- ) {
                    var bullet = this.bullets[i];
                    
                    if ( this.collision(user, bullet) ) {
                        
                        if ( user.shields > 0 ) {
                            user.shields = Math.max(0, user.shields - bullet.damage);
                            explSize = 'small';
                        } else {
                            user.life -= bullet.damage;
                            explSize = 'medium';
                        }
                        
                        if ( user.life <= 0 ) {
                            this.killUser(user, bullet.id);
                            
                            // TODO queue up explosions and send them along with timed world updates
                            io.sockets.emit('explosion', {
                                size: 'huge', 
                                x: bullet.x, 
                                y: bullet.y, 
                                tick: this.ticks
                            } );
                        }
                        
                        this.bullets.splice(i, 1);
                        this.users[bullet.id].bullets--;
                        
                        user.socket.emit('msg', {id:this.id, msg: 
                            'Shields['+user.shields+'] Life['+user.life+'] Guns['+user.guns+']'});
                        io.sockets.emit('explosion', {
                            size: explSize, 
                            x: bullet.x, 
                            y: bullet.y, 
                            tick: this.ticks
                        });
                    }
                }
                
                for ( i = this.powerups.length - 1; i >= 0; i-- ) {
                    var powerup = this.powerups[i];
                    
                    if ( this.collision(user, powerup) ) {
                        for ( p in powerup.properties ) {
                            
                            switch ( p ) {
                                case 'shields':
                                    min = 0;
                                    max = this.userShields;
                                break;
                                case 'life':
                                    min = 0;
                                    max = this.userLife;
                                break;
                                case 'guns':
                                    min = 1;
                                    max = this.maxGuns;
                                break;
                            }
                            user[p] = this.constrain(user[p]+powerup.properties[p], min, max);
                        }
                        this.powerups.splice(i, 1);
                        user.socket.emit('msg', {id:this.id, msg: 
                            'Shields['+user.shields+'] Life['+user.life+'] Guns['+user.guns+']'});
                        io.sockets.emit('powerups', this.powerups);
                    }
                }
                
                userUpdates = {}
                
                for (_id in this.users) {
                    userUpdates[_id] = {
                        x: Math.round(this.users[_id].x),
                        y: Math.round(this.users[_id].y),
                        angle: this.users[_id].angle,
                        shields: this.users[_id].shields,
                    }
                }
                
                var update = {
                    ticks: this.ticks,
                    usersOnScreen: userUpdates,
                    bullets:    this.bullets
                }
                user.socket.emit('update', update);
            }
            
            if (this.powerups.length < this.maxPowerups && this.ticks % this.powerupSpawnRate == 0) {
                this.spawnPowerup();
            }
            this.ticks += 1;
        }, // tick()
        constrain: function(val, min, max){
            return Math.max(min, Math.min(val, max));
        },
        spawnPowerup: function() {
            if (Math.random() <= this.powerupProbability) {
                x = Math.max(0, Math.floor(Math.random() * this.width) - 1);
                y = Math.max(0, Math.floor(Math.random() * this.height) - 1);
                
                vX = Math.random() * this.powerupMaxSpeed;
                vY = Math.random() * this.powerupMaxSpeed;
                
                this.powerups.push(Powerup(x, y, vX, vY));
                io.sockets.emit('powerups', this.powerups);
            }
            
        },
        killUser: function(user, killer) {
            user.life = this.userLife;
            user.x = this.width/2;
            user.y = this.height/2;
            user.vX = 0;
            user.vY = 0;
            user.angle = 0;
            user.shields = this.userShields;
            user.guns = 1;
            
            console.log('User[', user.id, '] killed by[', killer, ']');
            
            user.deaths++;
            this.users[killer].kills++;
            this.users[killer].guns = Math.min(this.maxGuns, this.users[killer].guns + 1);
            user.guns = Math.max(1, user.guns - 1);
            
            
            //TODO user scores should only update the two people involved instead of sending the whole object
            this.userScores[user.id].deaths++;
            this.userScores[killer].kills++;
            
            
            io.sockets.emit('msg', { id: this.id, msg: user.name + " got killed by " +  this.users[killer].name } );
            io.sockets.emit('userScores', this.userScores);
            
        },
        
        processCmds: function(id) {
            
            var user = this.users[id];
            var cmdQueue = this.commandQueue[id];
            
            for ( i = 0; i < cmdQueue.length; i++ ) {
                
                var userCmds = cmdQueue[i];
                //console.log('Checking input[', userCmds, ']against[', this.cmds, ']');
                
                for ( c in this.cmds ) {
                    if ( c & userCmds ) {
                        this[this.cmds[c]](user);
                    }
                }
            }
            
            this.commandQueue[id] = [];
        },
        turnLeft: function(user) {
            user.angle = user.angle - this.turnSpeed;
            if (user.angle < 0) {
                user.angle = 360 + user.angle;
            }
        },
        turnRight: function(user) {
            user.angle = user.angle + this.turnSpeed;
            if (user.angle >= 360) {
                user.angle = user.angle - 360;
            }
        },
        thruster: function(user, reverse) {
            if ( reverse ) {
                user.acceleration = this.p_rev_acceleration;
            } else {
                user.acceleration = this.p_acceleration;
            }
        },
        reverse: function(user) {
            this.thruster(user, true);
        },
        fire: function(user) {
            maxBullets = this.maxBullets * user.guns;
            
            if (user.bullets  + user.guns <= maxBullets ) {
                spacing = this.gunSpread;
                arc = (user.guns-1) * spacing;
                
                center = (user.guns-1) / 2;
                
                for (i=0; i<user.guns;i++){
                    
                    if ( i < center ) {
                        offset = (center - i) * -spacing;
                    } else if ( i > center ) {
                        offset = (i - center) * spacing;
                    } else {
                        offset = 0;
                    }
                    b = Bullet(user, offset);
                //    console.log('Spawned bullet[', b,']User bullets[', user.bullets, ']offset[', offset, ']center[',center, ']i[',i,']');
                    this.bullets.push(b);
                    console.log('User bullets before[', user.bullets, ']');
                    user.bullets++;
                    console.log('User bullets after[', user.bullets, ']');
                    
                }
                
            }
        },
        thrustersOff: function(user) {
            user.acceleration = 0;
        },
        update: function(user) {
            
            var theta = user.angle * Math.PI/180; // Direction user is facing
            
            var vX1 = user.vX; // Current X speed
            var vY1 = user.vY; // Current Y speed
            
            var a = user.acceleration;
            
            //roughly... 
            var deltaT = this.ticksPerSecond / 1000;
            
            // v = u + at
            var vX2 = this.constrain(vX1 + ( Math.cos(theta) * ( a * deltaT ) ), -user.maxSpeed, user.maxSpeed);
            var vY2 = this.constrain(vY1 + ( Math.sin(theta) * ( a * deltaT ) ), -user.maxSpeed, user.maxSpeed);
            
            user.vX = vX2;
            user.vY = vY2;
            
            this.displace(user);
            
        },
        
        displace: function(user) {
            
            user.x = user.x + user.vX;
            user.y = user.y + user.vY;
            
            xmin = this.p_size/2;
            xmax = this.width - this.p_size / 2
            
            ymin = this.p_size/2;
            ymax = this.height - this.p_size / 2
            
            if ( user.x < xmin ) {
                user.x = xmin;
                user.vX = 0;
            }
            if ( user.x > xmax ) {
                user.x = xmax;
                user.vX = 0
            }
            
            if ( user.y < ymin ) {
                user.y = ymin;
                user.vY = 0;
            }
            if ( user.y > ymax ) {
                user.y = ymax;
                user.vY = 0
            }
                
        },
        
        collision: function(i, j) {
            // Can't collide with yourself (or bullets you've fired, which share your id)
            if (i.id == j.id ) return false;
            
            var distance = Math.sqrt((j.x - i.x)*(j.x - i.x) + (j.y - i.y)*(j.y - i.y));
            return (distance < i.size/2 + j.size/2);
        },
        
        disconnect: function(id) {
            console.log('Disconnecting[' + id + ']');
            if ( id in this.users ) {
                delete this.users[id];
                this.userCount--;
            }
            if ( id in this.commandQueue ) {
                delete this.commandQueue[id];
            }
            if ( id in this.userScores) {
                delete this.userScores[id];
            }
        }
    }
}




var User = function(socket, name, x, y, life, shields) {
    var self = {
        id: socket.id,
        name: name,
        x: x,               // x position on the map
        y: y,               // y position on the map               
        
        vX: 0,              // current X speed
        vY: 0,              // current Y speed
        acceleration: 0,    // current acceleration value
        angle: 0,           // angle ship is pointing
        
        maxSpeed: 6,
        size: 32,
        
        guns: 1,
        
        socket: socket,
        life: life,
        shields: shields,
        kills: 0,
        deaths: 0,
        bullets: 0,
        lastReported: new Date().getTime(),
    }
    
    return self;
}

var userScore = function(user) {
    var self = {
        name: user.name,
        kills: user.kills,
        deaths: user.deaths
    }
    return self;
}

var Bullet = function(user, offset) {
    
    offsetX = Math.cos((user.angle + offset) * Math.PI/180);
    offsetY = Math.sin((user.angle + offset) * Math.PI/180);
    
    
    var self = {
        
        x: user.x,
        y: user.y,
        
        vX: user.vX + offsetX + Math.cos(user.angle * Math.PI/180) * (user.maxSpeed * 2),
        vY: user.vY + offsetY + Math.sin(user.angle * Math.PI/180) * (user.maxSpeed * 2),
        
        size: 2,
        
        id: user.id,
        damage: 20
    }
    
    return self
}

var Powerup = function(x, y, vX, vY) {
    
    type = Math.floor(Math.random() * 3);
    switch ( type ) {
        case 0:
            color='cyan';
            properties = {
                shields: 50
            }
        break;
        case 1:
            color='green'
            properties = {
                life: 50
            }
        break;
        case 2:
            color='red'
            properties = {
                guns: 1
            }
        break;
    }
    
    var self = {
        x: x,
        y: y,
        vX: vX,
        vY: vY,
        color: color,
        size: 16,
        properties: properties
    }
    return self;
}
