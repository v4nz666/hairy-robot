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
    
    render: function(ctx) {
      for(var i = this.guis.length; --i >= 0;) {
        this.guis[i].render(ctx);
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
    }
  }
}

function GUI() {
  return {
    guis: null,
    controls: new ControlStack(null),
    focus: null,
    mousedownbutton: 0,
    mousedowncontrol: null,
    
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
    
    render: function(ctx) {
      ctx.save();
      this.controls.render(ctx);
      ctx.restore();
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
    },
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
    
    keydown: function(key) {
      if(this.onkeydown !== null) { this.onkeydown(key); }
    },
    
    keyup: function(key) {
      if(this.onkeyup !== null) { this.onkeyup(key); }
    }
  }
}

function Label(gui) { this.gui = gui; }
Label.prototype = new Control();
Label.prototype.text = '';
Label.prototype.textAlign = 'center';
Label.prototype.textBaseline = 'middle';
Label.prototype.renderControl = function(ctx) {
  ctx.fillStyle = this.forecolour;
  ctx.textAlign = this.textAlign;
  ctx.textBaseline = this.textBaseline;
  ctx.fillText(this.text, this.w / 2, this.h / 2);
}

function Button(gui) { this.gui = gui; }
Button.prototype = new Label();
Button.prototype.backcolour = 'gray';
Button.prototype.bordercolour = 'white';

function Textbox(gui) { this.gui = gui; }
Textbox.prototype = new Label();
Textbox.prototype.backcolour = 'gray';
Textbox.prototype.bordercolour = 'white';