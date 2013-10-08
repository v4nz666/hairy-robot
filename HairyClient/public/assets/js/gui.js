function GUIs() {
  return {
    guis: [],
    
    push: function(gui) {
      gui.guis = this;
      this.guis.push(gui);
    },
    
    pop: function(gui) {
      if(typeof gui === 'undefined') {
        this.guis.pop();
      } else {
        this.guis.splice(this.guis.indexOf(gui), 1);
      }
    },
    
    clear: function() {
      this.guis.length = 0;
    },
    
    render: function() {
      for(var i = this.guis.length; --i >= 0;) {
        this.guis[i].render();
      }
    },
    
    resize: function(w, h) {
      for(var i = 0; i < this.guis.length; i++) {
        if(this.guis[i].resize(w, h)) break;
      }
    },
    
    mousemove: function(x, y, button) {
      for(var i = 0; i < this.guis.length; i++) {
        if(this.guis[i].mousemove(x, y, button)) break;
      }
    },
    
    mousedown: function(x, y, button) {
      for(var i = 0; i < this.guis.length; i++) {
        if(this.guis[i].mousedown(x, y, button)) break;
      }
    },
    
    mouseup: function(x, y, button) {
      for(var i = 0; i < this.guis.length; i++) {
        if(this.guis[i].mouseup(x, y, button)) break;
      }
    },
    
    keydown: function(key, shift, ctrl, alt) {
      for(var i = 0; i < this.guis.length; i++) {
        if(this.guis[i].keydown(key, shift, ctrl, alt)) break;
      }
    },
    
    keyup: function(key, shift, ctrl, alt) {
      for(var i = 0; i < this.guis.length; i++) {
        if(this.guis[i].keyup(key, shift, ctrl, alt)) break;
      }
    },
    
    keypress: function(key, shift, ctrl, alt) {
      for(var i = 0; i < this.guis.length; i++) {
        if(this.guis[i].keypress(key, shift, ctrl, alt)) break;
      }
    }
  }
}

function GUI(ctx) {
  return {
    ctx: ctx,
    guis: null,
    controls: new ControlStack(null),
    focus: null,
    mousedownbutton: 0,
    mousedowncontrol: null,
    mousemovecontrol: null,
    
    onrender: null,
    onresize: null,
    
    setfocus: function(control) {
      if(this.focus !== null) {
        this.focus.focus = false;
        this.focus.lostfocus();
      }
      
      this.focus = control;
      this.focus.gotfocus();
    },
    
    pop: function() {
      this.guis.pop(this);
    },
    
    mousemove: function(x, y, button) {
      if(this.mousedowncontrol !== null) {
        this.mousedowncontrol.mousemove(x - this.allX(this.mousedowncontrol), y - this.allY(this.mousedowncontrol), button);
        return true;
      } else {
        var c = this.controls.hittest(x, y);
        
        if(c !== this.mousemovecontrol) {
          if(this.mousemovecontrol !== null) this.mousemovecontrol.mouseout();
          if(c                     !== null) c.mousein();
          this.mousemovecontrol = c;
        }
        
        if(c !== null) {
          c.mousemove(x - this.allX(c), y - this.allY(c), button);
        }
      }
    },
    
    mousedown: function(x, y, button) {
      this.mousedownbutton = button;
      this.mousedowncontrol = this.controls.hittest(x, y);
      
      if(this.mousedowncontrol !== null) {
        this.mousedowncontrol.setfocus();
        this.mousedowncontrol.mousedown(x - this.allX(this.mousedowncontrol), y - this.allY(this.mousedowncontrol), button);
        return true;
      }
      
      return false;
    },
    
    mouseup: function(x, y, button) {
      if(this.mousedowncontrol !== null) {
        this.mousedowncontrol.mouseup(x - this.allX(this.mousedowncontrol), y - this.allY(this.mousedowncontrol), this.mousedownbutton);
        this.mousedowncontrol.click();
        this.mousedowncontrol = null;
        this.mousedownbutton = 0;
        return true;
      }
      
      return false;
    },
    
    keydown: function(key, shift, ctrl, alt) {
      if(this.focus !== null) {
        this.focus.keydown(key, shift, ctrl, alt);
      }
    },
    
    keyup: function(key, shift, ctrl, alt) {
      if(this.focus !== null) {
        this.focus.keyup(key, shift, ctrl, alt);
      }
    },
    
    keypress: function(key, shift, ctrl, alt) {
      if(this.focus !== null) {
        this.focus.keypress(key, shift, ctrl, alt);
      }
    },
    
    render: function() {
      this.ctx.save();
      
      if(this.onrender !== null) {
        this.onrender(this.ctx);
      }
      
      this.controls.render(this.ctx);
      this.ctx.restore();
    },
    
    resize: function(w, h) {
      if(this.onresize !== null) {
        this.onresize(w, h);
      }
    },
    
    allX: function(control) {
      var x = control.x;
      if(control.contParent != null) {
        x += allX(control.contParent);
      }
      
      return x;
    },
    
    allY: function(control) {
      var y = control.y;
      if(control.contParent != null) {
        y += allY(control.contParent);
      }
      
      return y;
    }
  }
}

// A doubly-linked list for nested controls
function ControlStack(owner) {
  return {
    owner: owner,
    first: null,
    last: null,
    size: 0,
    
    hittest: function(x, y) {
      if(this.last !== null) {
        return this.last.hittest(x, y);
      }
      
      return null;
    },
    
    // Add a control to the list
    add: function(control) {
      control.parent = this.owner;
      
      if(this.first !== null) {
        control.contNext = null;
        control.contPrev = this.first;
        this.first.contNext = control;
        this.first = control;
      } else {
        control.contNext = null;
        control.contPrev = null;
        this.first = control;
        this.last = control;
      }
      
      this.size++;
    },
    
    // Remove a control from the list
    remove: function(control) {
      var c = control.contNext;
      if(c !== null) {
        c.contPrev = control.contPrev;
        if(c.contPrev === null) { this.last = c; }
      } else {
        c = control.contPrev;
        if(c !== null) { c.contNext = null; }
        this.first = c;
      }
      
      c = control.contPrev;
      if(c !== null) {
        c.contNext = control.contNext;
        if(c.contNext === null) { this.first = c; }
      } else {
        c = control.contNext;
        if(c !== null) { c.contPrev = null; }
        this.last = c;
      }
      
      this.size--;
    },
    
    // De-focus all controls in this list and nested lists
    killFocus: function() {
      c = this.last;
      while(c !== null) {
        c.focus = false;
        c.controls.killFocus();
        c = c.contNext;
      }
    },
    
    // Render all controls and nested controls in this list
    render: function(ctx) {
      if(this.last !== null) {
        this.last.render(ctx);
      }
    }
  }
}

// A generic control capable of drawing a background box,
// a border, containing nested controls, and handling events
function Control(gui) {
  return {
    controls: new ControlStack(this),
    contParent: null,
    contNext: null,
    contPrev: null,
    gui: gui,
    focus: false,
    
    x: 0,
    y: 0,
    w: 100,
    h: 20,
    visible: true,
    forecolour: 'white',
    backcolour: null,
    bordercolour: null,
    
    ongotfocus: null,
    onlostfocus: null,
    onmousein: null,
    onmouseout: null,
    onmousemove: null,
    onmousedown: null,
    onmouseup: null,
    onclick: null,
    onkeydown: null,
    onkeyup: null,
    onkeypress: null,
    onrender: null,
    
    root: function() {
      if(this.contParent !== null) {
        return this.contParent.root();
      }
      
      return this;
    },
    
    setfocus: function() {
      if(!this.focus) {
        this.focus = true;
        this.gui.setfocus(this);
      }
    },
    
    hittest: function(x, y) {
      var c = this.controls.hittest(x - this.x, y - this.y);
      if(c !== null) {
        return c;
      }
      
      if(x >= this.x && x <= this.x + this.w &&
         y >= this.y && y <= this.y + this.h) {
        return this;
      }
      
      if(this.contNext !== null) {
        return this.contNext.hittest(x, y);
      }
      
      return null;
    },
    
    renderPre: function(ctx) {
      if(this.visible) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        if(this.backcolour !== null) {
          ctx.fillStyle = this.backcolour;
          ctx.fillRect(0, 0, this.w, this.h);
        }
        
        return true;
      }
      
      return false;
    },
    
    renderPost: function(ctx) {
      this.controls.render(ctx);
      
      if(this.bordercolour !== null) {
        ctx.strokeStyle = this.bordercolour;
        ctx.strokeRect(0, 0, this.w, this.h);
      }
      
      ctx.restore();
    },
    
    renderControl: function(ctx) { },
    render: function(ctx) {
      if(this.renderPre(ctx)) {
        this.renderControl(ctx);
        
        if(this.onrender !== null) {
          this.onrender(ctx);
        }
        
        this.renderPost(ctx);
      }
      
      if(this.contNext !== null) {
        this.contNext.render(ctx);
      }
    },
    
    gotfocus: function() {
      if(this.ongotfocus !== null) { this.ongotfocus(); }
    },
    
    lostfocus: function() {
      if(this.onlostfocus !== null) { this.onlostfocus(); }
    },
    
    mousein: function() {
      if(this.onmousein !== null) { this.onmousein(); }
    },
    
    mouseout: function() {
      if(this.onmouseout !== null) { this.onmouseout(); }
    },
    
    mousemove: function(x, y, button) {
      if(this.onmousemove !== null) { this.onmousemove(x, y, button); }
    },
    
    mousedown: function(x, y, button) {
      if(this.onmousedown !== null) { this.onmousedown(x, y, button); }
    },
    
    mouseup: function(x, y, button) {
      if(this.onmouseup !== null) { this.onmouseup(x, y, button); }
    },
    
    click: function() {
      if(this.onclick !== null) { this.onclick(); }
    },
    
    keydown: function(key, shift, ctrl, alt) {
      if(this.onkeydown !== null) { this.onkeydown(key, shift, ctrl, alt); }
    },
    
    keyup: function(key, shift, ctrl, alt) {
      if(this.onkeyup !== null) { this.onkeyup(key, shift, ctrl, alt); }
    },
    
    keypress: function(key, shift, ctrl, alt) {
      if(this.onkeypress !== null) { this.onkeypress(key, shift, ctrl, alt); }
    }
  }
}

function Label(gui) {
  this.gui = gui;
  
  this.textAlign = 'center';
  this.textBaseline = 'middle';
  
  var _text = '';
  
  this.text = function(text) {
    if(typeof text === 'undefined') {
      return _text;
    } else {
      _text = text;
    }
  };
  
  this.renderControl = function(ctx) {
    ctx.fillStyle = this.forecolour;
    ctx.textAlign = this.textAlign;
    ctx.textBaseline = this.textBaseline;
    
    switch(this.textAlign) {
      case 'center': ctx.fillText(_text, this.w / 2, this.h / 2); break;
      case 'right':  ctx.fillText(_text, this.w    , this.h / 2); break;
      default:       ctx.fillText(_text,          0, this.h / 2); break;
    }
  };
}

Label.inherits(Control);

function Button(gui) {
  this.gui = gui;
  
  this.backcolour = 'gray';
  this.bordercolour = 'white';
}

Button.inherits(Label);

function Textbox(gui) {
  this.gui = gui;
  
  this.backcolour = 'gray';
  this.bordercolour = 'white';
  this.textAlign = 'left';
  this.textW = 0;
  this.textH = getTextHeight(this.gui.ctx.font).ascent;
  this.selx = 0;
  
  var _selstart = 0;
  
  this.text = function(text) {
    if(typeof text === 'undefined') {
      return this.uber('text', text);
    } else {
      this.uber('text', text);
      this.textW = this.gui.ctx.measureText(text).width;
      this.textH = getTextHeight(this.gui.ctx.font).ascent;
      this.selstart(text.length);
    }
  }
  
  this.selstart = function(selstart) {
    _selstart = constrain(selstart, 0, this.text().length);
    this.selx = this.gui.ctx.measureText(this.text().substr(0, selstart)).width;
  }
  
  this.renderControl = function(ctx) {
    this.uber('renderControl', ctx);
    
    if(this.focus) {
      ctx.fillStyle = this.forecolour;
      ctx.fillRect(this.selx, (this.h - this.textH) / 2, 1, this.textH);
    }
  }
  
  this.keypress = function(key, shift, ctrl, alt) {
    var s = _selstart;
    this.text(this.text().substr(0, _selstart) + String.fromCharCode(key) + this.text().substr(_selstart, this.text().length));
    this.selstart(s + 1);
    this.uber('keypress', key, shift, ctrl, alt);
  }
  
  this.keydown = function(key, shift, ctrl, alt) {
    switch(key) {
      case 8:
        if(_selstart > 0) {
          var s = _selstart;
          this.text(this.text().substr(0, _selstart - 1) + this.text().substr(_selstart, this.text().length));
          this.selstart(s - 1);
        }
        
        break;
      
      case 46:
        if(_selstart < this.text().length) {
          var s = _selstart;
          this.text(this.text().substr(0, _selstart) + this.text().substr(_selstart + 1, this.text().length));
          this.selstart(s);
        }
        
        break;
      
      case 37:
        this.selstart(_selstart - 1);
        break;
      
      case 39:
        this.selstart(_selstart + 1);
        break;
    }
    
    this.uber('keydown', key, shift, ctrl, alt);
  }
}

Textbox.inherits(Label);