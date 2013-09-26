function Client() {
  return {
    canvas: null,
    ctx: null,
    fps: 0,
    fpsTicks: 0,
    
    mouseX: 0,
    mouseY: 0,
    gridX: 0,
    gridY: 0,
    startX: 0,
    startY: 0,
    
    ship: null,
    selectedPart: new Hull(),
    
    init: function() {
      var frameRate = 60;
      var tickRate = 1000 / frameRate;
      
      this.canvas = $('#canvas')[0];
      this.canvas.width = 800;
      this.canvas.height = 600;
      this.ctx = canvas.getContext('2d');
      
      this.startX = Math.floor((this.canvas.width  / 2) / 16);
      this.startY = Math.floor((this.canvas.height / 2) / 16);
      this.ship = new Ship(this.startX * 16, this.startY * 16);
      this.ship.addPart(0, 0, new Hull());
      
      setInterval($.proxy(this.render, this), tickRate);
      setInterval($.proxy(function() {
        this.fps = this.fpsTicks;
        this.fpsTicks = 0;
      }, this), 1000);
      
      $('#canvas').mousemove($.proxy(this.mouseMove, this));
      $('#canvas').click($.proxy(this.mouseClick, this));
    },
    
    render: function() {
      this.clear();
      this.renderShip();
      this.renderGUI();
      
      this.ticks++;
      this.fpsTicks++;
    },
    
    clear: function(clr) {
      if(typeof clr === 'undefined') {
        clr = 'rgb(0,0,0)';
      }
      
      this.ctx.save();
      this.ctx.fillStyle = clr;
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.restore();
    },
    
    renderShip: function() {
      this.ctx.save();
      this.ctx.translate(this.ship.x, this.ship.y);
      this.ship.render(this.ctx);
      this.ctx.restore();
    },
    
    renderGUI: function() {
      this.ctx.fillStyle = 'white';
      this.ctx.strokeStyle = 'grey';
      
      this.ctx.save();
      this.ctx.translate(this.gridX * 16, this.gridY * 16);
      this.selectedPart.draw(this.ctx);
      
      if(this.ship.isValid(this.gridX - this.startX, this.gridY - this.startY)) {
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
      } else {
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      }
      
      this.ctx.fillRect(0, 0, this.selectedPart.w * 16, this.selectedPart.h * 16);
      this.ctx.restore();
      
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(this.ship.x - 4, this.ship.y - 4);
      this.ctx.lineTo(this.ship.x - 4, this.ship.y + this.ship.h + 4);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(this.ship.x - 4, this.ship.y + this.ship.h + 4);
      this.ctx.lineTo(this.ship.x + this.ship.w + 4, this.ship.y + this.ship.h + 4);
      this.ctx.stroke();
      this.ctx.textAlign = 'right';
      this.ctx.fillText(this.ship.h * 4 + 'm', this.ship.x - 8, this.ship.y + this.ship.h / 2 + 4);
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.ship.w * 4 + 'm', this.ship.x + this.ship.w / 2, this.ship.y + this.ship.h + 16);
      this.ctx.beginPath();
      this.ctx.arc(this.ship.x + this.ship.comx * 16, this.ship.y + this.ship.comy * 16, 2, 0, Math.PI * 2);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();
      
      this.ctx.save();
      this.ctx.fillText(this.fps + " FPS", 4, 12);
      this.ctx.restore();
    },
    
    mouseMove: function(e) {
      this.mouseX = e.offsetX;
      this.mouseY = e.offsetY;
      this.gridX = Math.floor(e.offsetX / 16);
      this.gridY = Math.floor(e.offsetY / 16);
    },
    
    mouseClick: function(e) {
      var x = this.gridX - this.startX;
      var y = this.gridY - this.startY;
      if(this.ship.addPart(x, y, this.selectedPart)) {
        if(x < 0) { this.startX += x; }
        if(y < 0) { this.startY += y; }
      }
    }
  }
}

function Ship(x, y) {
  var ship = {
    x: x,
    y: y,
    w: 0,
    h: 0,
    comx: 0,
    comy: 0,
    parts: [],
    
    render: function(ctx) {
      for(i = 0; i < this.parts.length; i++) {
        var part = this.parts[i];
        
        ctx.save();
        ctx.translate(part.x * 16, part.y * 16);
        part.draw(ctx);
        ctx.restore();
      }
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
        
        this.parts.push(new RenderPart(x, y, part));
        
        var w = 0, h = 0;
        for(i = 0; i < this.parts.length; i++) {
          var p = this.parts[i];
          if(p.x > w) { w = p.x; }
          if(p.y > h) { h = p.y; }
        }
        
        this.w = (w + 1) * 16;
        this.h = (h + 1) * 16;
        
        this.calcCenterOfMass();
        
        return true;
      } else {
        console.log(x, y, 'Piece already there or too far away');
        return false;
      }
    },
    
    isValid: function(x, y) {
      if(this.parts.length === 0) { return true; }
      
      for(i = 0; i < this.parts.length; i++) {
        var part = this.parts[i];
        
        if(part.x === x && part.y === y) {
          return false;
        }
        
        if(Math.sqrt(Math.pow(x - part.x, 2) + Math.pow(y - part.y, 2)) <= 1) {
          return true;
        }
      }
      
      return false;
    },
    
    calcCenterOfMass: function() {
      var sumMassTimesCoMX = 0;
      var sumMassTimesCoMY = 0;
      var sumMass = 0;
      
      for(i = 0; i < this.parts.length; i++) {
        part = this.parts[i];
        sumMassTimesCoMX += part.part.mass * (part.part.w / 2 + part.x);
        sumMassTimesCoMY += part.part.mass * (part.part.h / 2 + part.y);
        sumMass += part.part.mass;
      }
      
      this.comx = sumMassTimesCoMX / sumMass;
      this.comy = sumMassTimesCoMY / sumMass;
    }
  }
  
  return ship;
}

function RenderPart(x, y, part) {
  return {
    x: x,
    y: y,
    part: part,
    
    draw: function(ctx) {
      this.part.draw(ctx);
    }
  }
}

function Part() {
  return {
    w: 1,
    h: 1,
    mass: 1,
    
    draw: function(ctx) {
      ctx.fillStyle = 'magenta';
      ctx.fillRect(0, 0, this.w * 16, this.h * 16);
    }
  }
}

function Hull() { }
Hull.prototype = new Part();
Hull.prototype.draw = function(ctx) {
  var w = this.w * 16;
  var h = this.h * 16;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'grey';
  ctx.strokeRect(1, 1, w - 2, h - 2);
}

$(document).ready(function() {
  var client = new Client();
  client.init();
});