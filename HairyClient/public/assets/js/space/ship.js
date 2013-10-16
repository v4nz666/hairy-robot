stat = {
  part: [],
  
  loaded: function() {
    return part.length !== 0;
  }
};

$.ajax({
  url: '/games/store/parts',
  dataType: 'json',
}).done(function(data) {
  console.log('Got parts');
  
  var draw = function(ctx, render) {
    eval(this.render);
  }
  
  stat.part = data;
  
  for(var i = 0; i < stat.part.length; i++) {
    stat.part[i].draw = draw;
  }
}).fail(function() {
  console.log('Failed to get parts');
});

function Ship() {
  return {
    create: function() {
      var priv = this;
      
      var me = {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        comx: 0,
        comy: 0,
        parts: [],
        
        init: function() {
          
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
        
        addPart: function(x, y, part) {
          if(this.isValid(x, y)) {
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