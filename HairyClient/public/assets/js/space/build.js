function Client() {
  return {
    canvas: null,
    ctx: null,
    fps: 0,
    fpsTicks: 0,
    
    tab: null,
    mouseX: 0,
    mouseY: 0,
    gridX: 0,
    gridY: 0,
    startX: 0,
    startY: 0,
    
    ship: null,
    selectedPart: null,
    hoverPart: null,
    
    init: function() {
      this.frameRate = 60;
      this.tickRate = 1000 / this.frameRate;
      
      this.canvas = $('#canvas')[0];
      this.canvas.width = 800;
      this.canvas.height = 600;
      this.ctx = canvas.getContext('2d');
      
      this.startX = Math.floor((this.canvas.width  / 2) / 16);
      this.startY = Math.floor((this.canvas.height / 2) / 16);
      this.ship = new Ship(this.startX * 16, this.startY * 16);
      this.ship.addPart(0, 0, new Hull());
      
      $('#canvas').mousemove($.proxy(this.mouseMove, this));
      $('#canvas').click($.proxy(this.mouseClick, this));
      $('#canvas').on('contextmenu', null, function(e) { return false; });
    },
    
    run: function() {
      setInterval($.proxy(this.render, this), this.tickRate);
      setInterval($.proxy(function() {
        this.fps = this.fpsTicks;
        this.fpsTicks = 0;
      }, this), 1000);
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
      
      switch(this.tab) {
        case 'tab-create':
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
          break;
        
        case 'tab-edit':
          if(this.hoverPart !== null) {
            this.ctx.save();
            this.ctx.translate(this.gridX * 16, this.gridY * 16);
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.selectedPart.w * 16, this.selectedPart.h * 16);
            this.ctx.restore();
          }
          
          break;
      }
      
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
      this.hoverPart = this.ship.partAt(this.gridX - this.startX, this.gridY - this.startY);
    },
    
    mouseClick: function(e) {
      var x = this.gridX - this.startX;
      var y = this.gridY - this.startY;
      
      switch(this.tab) {
        case 'tab-create':
          if(this.ship.addPart(x, y, this.selectedPart)) {
            if(x < 0) { this.startX += x; }
            if(y < 0) { this.startY += y; }
          }
          
          break;
        
        case 'tab-edit':
          if(this.hoverPart !== null) {
            selectPart(this.hoverPart);
          }
          
          break;
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
        
        var render = new RenderPart(x, y, part);
        
        for(i in render.part.desc.attribs) {
          if(i === 'length') { continue; }
          attrib = render.part.desc.attribs[i];
          
          var selected = $('#create-' + attrib.id + ' option').filter(':selected');
          if(selected.length !== 0) {
            render[attrib.id] = selected[0].value;
          }
        }
        
        this.parts.push(render);
        
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
        sumMassTimesCoMX += part.part.mass * (part.part.w / 2 + part.x);
        sumMassTimesCoMY += part.part.mass * (part.part.h / 2 + part.y);
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
  
  return ship;
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
  
  part.create(me);
  return me;
}

function Part() {
  return {
    w: 1,
    h: 1,
    mass: 1,
    
    create: function(render) { },
    draw: function(ctx, render) {
      ctx.fillStyle = 'magenta';
      ctx.fillRect(0, 0, this.w * 16, this.h * 16);
    }
  }
}

Part.desc = {
  name: 'Part',
  desc: 'You shouldn\'t be able to get this part',
  info: [
    {
      id: 'mass',
      name: 'Mass',
      desc: 'The weight of this part'
    }
  ],
  attribs: null
}

function Hull() { }
Hull.prototype = new Part();
Hull.instance = new Hull();
Hull.prototype.create = function(render) {
  render.rendermode = 0;
}

Hull.desc = {
  name: 'Hull',
  desc: 'A 64x64m&sup2; section of hull',
  info: [
    {
      id: 'mass',
      name: 'Mass',
      desc: 'The weight of this part'
    }
  ],
  attribs: [
    {
      id: 'rendermode',
      name: 'Render mode',
      desc: 'The way the part renders',
      type: 'opt',
      vals: ['Square', 'Corners']
    }
  ]
}

Hull.prototype.desc = Hull.desc;
Hull.prototype.draw = function(ctx, render) {
  var w = this.w * 16;
  var h = this.h * 16;
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'grey';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  
  var drawn = false;
  if(typeof render !== 'undefined') {
    if(render.rendermode == 1) {
      if(render.left === null && render.right !== null) {
        if(render.up === null) {
          if(render.down !== null) {
            ctx.moveTo(0, h);
            ctx.lineTo(w, h);
            ctx.lineTo(w, 0);
            drawn = true;
          }
        } else {
          if(render.down === null) {
            ctx.lineTo(w, h);
            ctx.lineTo(w, 0);
            drawn = true;
          }
        }
      }
      
      if(render.right === null && render.left !== null) {
        if(render.up === null) {
          if(render.down !== null) {
            ctx.lineTo(0, h);
            ctx.lineTo(w, h);
            drawn = true;
          }
        } else {
          if(render.down === null) {
            ctx.lineTo(0, h);
            ctx.lineTo(w, 0);
            drawn = true;
          }
        }
      }
    }
  }
  
  if(!drawn) {
    ctx.lineTo(0, h);
    ctx.lineTo(w, h);
    ctx.lineTo(w, 0);
  }
  
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function addPartToInterface(part) {
  var desc = part.desc;
  
  $('#part').append('<option value="' + desc.name + '">' + desc.name + ' - ' + desc.desc + '</option>');
}

function selectPart(render) {
  var html = '';
  for(i in render.part.desc.info) {
    if(i === 'length') { continue; }
    info = render.part.desc.info[i];
    html += '<p>' + info.name + ': ' + render.part[info.id] + '<br />' + info.desc + '</p>';
  }
  
  $('#info').html(html);
  
  html = '';
  for(i in render.part.desc.attribs) {
    if(i === 'length') { continue; }
    attrib = render.part.desc.attribs[i];
    switch(attrib.type) {
      case 'opt':
        $('#options').html('<p>' + attrib.name + ': <select id="' + attrib.id + '"></select><br />' + attrib.desc + '</p>');
        
        for(n in attrib.vals) {
          if(n === 'length') { continue; }
          val = attrib.vals[n];
          html += '<option value="' + n + '">' + val + '</option>';
        }
        
        $('#' + attrib.id).html(html);
        $('#' + attrib.id).val(render[attrib.id]);
        $('#' + attrib.id).change(function(e) {
          var selected = $('option', this).filter(':selected')[0];
          render[attrib.id] = selected.value;
        });
        
        break;
    }
  }
}

$(document).ready(function() {
  addPartToInterface(Hull);
  
  $('a[name|=tab]').click(function(e) {
    $('[id|=tab]').hide();
    $('#' + this.name).show();
    client.tab = this.name;
    e.preventDefault();
  });
  
  client = new Client();
  client.init();
  
  $('#part option:eq(0)').attr('selected', true);
  $('#part').change(function(e) {
    var selected = $('option', this).filter(':selected')[0];
    client.selectedPart = window[selected.value].instance;
    
    var html = '';
    for(i in client.selectedPart.desc.attribs) {
      if(i === 'length') { continue; }
      attrib = client.selectedPart.desc.attribs[i];
      switch(attrib.type) {
        case 'opt':
          $('#create-options').html('<p>' + attrib.name + ': <select id="create-' + attrib.id + '"></select><br />' + attrib.desc + '</p>');
          
          for(n in attrib.vals) {
            if(n === 'length') { continue; }
            val = attrib.vals[n];
            html += '<option value="' + n + '">' + val + '</option>';
          }
          
          $('#create-' + attrib.id).html(html);
          
          break;
      }
    }
  }).change();
  
  $('a[name|=tab]')[0].click();
  
  client.run();
});