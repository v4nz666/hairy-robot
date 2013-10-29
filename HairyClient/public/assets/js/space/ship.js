function Ship() {
  return {
    create: function() {
      var priv = this;
      
      var me = {
        id: null,
        name: '',
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        comx: 0,
        comy: 0,
        parts: [],
        
        init: function() {
          
        },
        
        serialize: function() {
          var parts = [];
          
          for(var i = 0; i < this.parts.length; i++) {
            var part = this.parts[i];
            parts.push({
              id: part.part.id,
              x: part.x,
              y: part.y
            });
          }
          
          return {
            id: me.id,
            name: me.name,
            json: JSON.stringify(parts)
          };
        },
        
        deserialize: function(data) {
          var json = JSON.parse(data.json);
          me.id = data.id;
          me.name = data.name;
          for(var i = 0; i < json.length; i++) {
            me.addPart(json[i].x, json[i].y, stat.parts[json[i].id - stat.parts[0].id], true);
          }
        },
        
        render: function(ctx) {
          ctx.save();
          ctx.translate(this.x, this.y);
          
          for(i = 0; i < this.parts.length; i++) {
            var part = this.parts[i];
            
            ctx.save();
            ctx.translate(part.x * 16, part.y * 16);
            part.draw(ctx);
            ctx.restore();
          }
          
          ctx.restore();
        },
        
        addPart: function(x, y, part, force) {
          if(this.isValid(x, y) || force) {
            for(i = 0; i < this.parts.length; i++) {
              var p = this.parts[i];
              
              if(x < 0) { p.x -= x; }
              if(y < 0) { p.y -= y; }
            }
            
            if(x < 0) { this.x += x * 16; x = 0; }
            if(y < 0) { this.y += y * 16; y = 0; }
            
            this.parts.push(RenderPart(x, y, part));
            
            var w = 0, h = 0;
            for(i = 0; i < this.parts.length; i++) {
              var p = this.parts[i];
              if(p.x > w) { w = p.x; }
              if(p.y > h) { h = p.y; }
            }
            
            this.w = (w + 1) * 16;
            this.h = (h + 1) * 16;
            
            this.cacheCenterOfMass();
            this.cacheRelativeParts();
            
            return true;
          } else {
            console.log(x, y, 'Piece already there or too far away');
            return false;
          }
        },
        
        removePart: function(x, y) {
          if(this.parts.length === 1) { return false; }
          
          var part = this.partAt(x, y);
          if(part !== null) {
            if(this.parts.length !== 2) {
              if(part.up !== null) {
                if(part.up.up === null && part.up.left === null && part.up.right === null) {
                  console.log('You can\'t remove that part.');
                  return;
                }
              }
              
              if(part.down !== null) {
                if(part.down.down === null && part.down.left === null && part.down.right === null) {
                  console.log('You can\'t remove that part.');
                  return;
                }
              }
              
              if(part.left !== null) {
                if(part.left.up === null && part.left.down === null && part.left.left === null) {
                  console.log('You can\'t remove that part.');
                  return;
                }
              }
              
              if(part.right !== null) {
                if(part.right.up === null && part.right.down === null && part.right.right === null) {
                  console.log('You can\'t remove that part.');
                  return;
                }
              }
            }
            
            this.parts.splice(this.parts.indexOf(part), 1);
            this.cacheCenterOfMass();
            
            if(part.up    !== null) { part.up.down    = null; }
            if(part.down  !== null) { part.down.up    = null; }
            if(part.left  !== null) { part.left.right = null; }
            if(part.right !== null) { part.right.left = null; }
          }
        },
        
        isValid: function(x, y) {
          if(this.parts.length === 0) { return true; }
          
          // Gotta check if there's already a piece there BEFORE
          // we check if it's close enough to another piece
          for(i = 0; i < this.parts.length; i++) {
            var part = this.parts[i];
            
            if(part.x === x && part.y === y) {
              return false;
            }
          }
          
          for(i = 0; i < this.parts.length; i++) {
            var part = this.parts[i];
            
            if(Math.sqrt(Math.pow(x - part.x, 2) + Math.pow(y - part.y, 2)) <= 1) {
              return true;
            }
          }
          
          return false;
        },
        
        partAt: function(x, y) {
          for(i = 0; i < this.parts.length; i++) {
            var part = this.parts[i];
            
            if(part.x === x && part.y === y) {
              return part;
            }
          }
          
          return null;
        },
        
        cacheCenterOfMass: function() {
          var sumMassTimesCoMX = 0;
          var sumMassTimesCoMY = 0;
          var sumMass = 0;
          
          for(i = 0; i < this.parts.length; i++) {
            part = this.parts[i];
            sumMassTimesCoMX += part.part.mass * (0.5 + part.x);
            sumMassTimesCoMY += part.part.mass * (0.5 + part.y);
            sumMass += part.part.mass;
          }
          
          this.comx = sumMassTimesCoMX / sumMass;
          this.comy = sumMassTimesCoMY / sumMass;
        },
        
        cacheRelativeParts: function() {
          for(i = 0; i < this.parts.length; i++) {
            p1 = this.parts[i];
            
            for(n = 0; n < this.parts.length; n++) {
              p2 = this.parts[n];
              
              if(p1.x == p2.x) {
                if(p1.y == p2.y - 1) {
                  p1.down = p2;
                  p2.up   = p1;
                } else if(p1.y == p2.y + 1) {
                  p1.up   = p2;
                  p2.down = p1;
                }
              }
              
              if(p1.y == p2.y) {
                if(p1.x == p2.x - 1) {
                  p1.right = p2;
                  p2.left  = p1;
                } else if(p1.x == p2.x + 1) {
                  p1.left  = p2;
                  p2.right = p1;
                }
              }
            }
          }
        }
      }
      
      me.init();
      return me;
    }
  }.create();
}

function RenderPart(x, y, part) {
  var me = {
    x: x,
    y: y,
    part: part,
    up: null,
    down: null,
    left: null,
    right: null,
    
    draw: function(ctx) {
      this.part.draw(ctx, this);
    }
  }
  
  for(var i = 0; i < part.attribs.length; i++) {
    me[part.attribs[i]] = 0;
  }
  
  return me;
}