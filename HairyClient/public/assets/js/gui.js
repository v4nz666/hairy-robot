function ExecutionStack() {
  return {
    stack: [],
    
    create: function() {
      var priv = this;
      
      var me = {
        push: function(fn) {
          if(typeof fn !== 'function') {
            return;
          }
          
          priv.stack.push(fn);
        },
        
        pop: function() {
          priv.stack.pop();
        },
        
        execute: function() {
          for(var i = 0; i < priv.stack.length; i++) {
            if(priv.stack[i].apply(this, arguments)) { return true; };
          }
          
          return false;
        }
      };
      
      return me;
    }
  }.create();
}

function GUIs() {
  return {
    guis: [],
    
    create: function() {
      var priv = this;
      
      var me = {
        push: function(gui) {
          gui.guis(me);
          gui.init();
          gui.resize();
          priv.guis.unshift(gui);
        },
        
        pop: function(gui) {
          if(typeof gui === 'undefined') {
            priv.guis.pop();
          } else {
            priv.guis.splice(priv.guis.indexOf(gui), 1);
          }
        },
        
        clear: function() {
          priv.guis.length = 0;
        },
        
        render: function() {
          for(var i = priv.guis.length; --i >= 0;) {
            priv.guis[i].render();
          }
        },
        
        resize: function() {
          for(var i = 0; i < priv.guis.length; i++) {
            priv.guis[i].resize();
          }
        },
        
        mousemove: function(ev) {
          for(var i = 0; i < priv.guis.length; i++) {
            if(priv.guis[i].mousemove(ev)) break;
          }
        },
        
        mousedown: function(ev) {
          for(var i = 0; i < priv.guis.length; i++) {
            if(priv.guis[i].mousedown(ev)) break;
          }
        },
        
        mouseup: function(ev) {
          for(var i = 0; i < priv.guis.length; i++) {
            if(priv.guis[i].mouseup(ev)) break;
          }
        },
        
        keydown: function(ev) {
          if(ev.which == 8) { ev.preventDefault(); }
          
          for(var i = 0; i < priv.guis.length; i++) {
            if(priv.guis[i].keydown(ev)) break;
          }
        },
        
        keyup: function(ev) {
          for(var i = 0; i < priv.guis.length; i++) {
            if(priv.guis[i].keyup(ev)) break;
          }
        },
        
        keypress: function(ev) {
          for(var i = 0; i < priv.guis.length; i++) {
            if(priv.guis[i].keypress(ev)) break;
          }
        }
      };
      
      return me;
    }
  }.create();
}

function GUI(ctx, name) {
  return {
    name: typeof name === 'undefined' ? 'generic' : name,
    ctx: ctx,
    guis: null,
    controls: new ControlStack(null),
    focus: null,
    mousedownbutton: 0,
    mousedowncontrol: null,
    mousemovecontrol: null,
    
    onmousemove: ExecutionStack(),
    onmousedown: ExecutionStack(),
    onmouseup:   ExecutionStack(),
    onclick:     ExecutionStack(),
    onkeydown:   ExecutionStack(),
    onkeyup:     ExecutionStack(),
    onkeypress:  ExecutionStack(),
    onrender:    ExecutionStack(),
    onresize:    ExecutionStack(),
    
    allX: function(control) {
      var x = control.x;
      if(control.contParent !== null) {
        x += this.allX(control.contParent);
      }
      
      return x;
    },
    
    allY: function(control) {
      var y = control.y;
      if(control.contParent !== null) {
        y += this.allY(control.contParent);
      }
      
      return y;
    },
    
    create: function() {
      var priv = this;
      
      var me = {
        context:     function() { return priv.ctx;         },
        controls:    function() { return priv.controls;    },
        onmousemove: function() { return priv.onmousemove; },
        onmousedown: function() { return priv.onmousedown; },
        onmouseup:   function() { return priv.onmouseup;   },
        onclick:     function() { return priv.onclick;     },
        onkeydown:   function() { return priv.onkeydown;   },
        onkeyup:     function() { return priv.onkeyup;     },
        onkeypress:  function() { return priv.onkeypress;  },
        onrender:    function() { return priv.onrender;    },
        onresize:    function() { return priv.onresize;    },
        
        guis: function(guis) {
          if(typeof guis === 'undefined') {
            return priv.guis;
          } else {
            priv.guis = guis;
          }
        },
        
        setfocus: function(control) {
          if(priv.focus !== null) {
            priv.focus.focus = false;
            priv.focus.lostfocus();
          }
          
          priv.focus = control;
          
          if(priv.focus !== null) {
            priv.focus.gotfocus();
          }
        },
        
        pop: function() {
          priv.guis.pop(me);
        },
        
        mousemove: function(ev) {
          var ret = false;
          
          if(priv.mousedowncontrol !== null) {
            var allx = priv.allX(priv.mousedowncontrol);
            var ally = priv.allY(priv.mousedowncontrol);
            var button = ev.which;
            ev.pageX -= allx;
            ev.pageY -= ally;
            ev.which = priv.mousedownbutton;
            priv.mousedowncontrol.mousemove(ev);
            ev.pageX += allx;
            ev.pageY += ally;
            ev.which = button;
            ret = true;
          } else {
            var c = priv.controls.hittest(ev.pageX, ev.pageY);
            
            if(c !== priv.mousemovecontrol) {
              if(priv.mousemovecontrol !== null) priv.mousemovecontrol.mouseout();
              if(c                     !== null) c.mousein();
              priv.mousemovecontrol = c;
            }
            
            if(c !== null) {
              var allx = priv.allX(c);
              var ally = priv.allY(c);
              ev.pageX -= allx;
              ev.pageY -= ally;
              c.mousemove(ev);
              ev.pageX += allx;
              ev.pageY += ally;
              ret = true;
            }
          }
          
          ret |= priv.onmousemove.execute(ev, ret);
          
          return ret;
        },
        
        mousedown: function(ev) {
          var ret = false;
          
          priv.mousedownbutton = ev.which;
          priv.mousedowncontrol = priv.controls.hittest(ev.pageX, ev.pageY);
          
          if(priv.mousedowncontrol !== null) {
            var allx = priv.allX(priv.mousedowncontrol);
            var ally = priv.allY(priv.mousedowncontrol);
            ev.pageX -= allx;
            ev.pageY -= ally;
            
            priv.mousedowncontrol.setfocus();
            priv.mousedowncontrol.mousedown(ev);
            
            ev.pageX += allx;
            ev.pageY += ally;
            
            ret = true;
          }
          
          ret |= priv.onmousedown.execute(ev, ret);
          
          return ret;
        },
        
        mouseup: function(ev) {
          var ret = false;
          
          if(priv.mousedowncontrol !== null) {
            var allx = priv.allX(priv.mousedowncontrol);
            var ally = priv.allY(priv.mousedowncontrol);
            var button = ev.which;
            ev.pageX -= allx;
            ev.pageY -= ally;
            ev.which = priv.mousedownbutton;
            
            priv.mousedowncontrol.mouseup(ev);
            priv.mousedowncontrol.click();
            priv.mousedowncontrol = null;
            priv.mousedownbutton = 0;
            
            ev.pageX += allx;
            ev.pageY += ally;
            ev.which = button;
            
            ret = true;
          }
          
          ret |= priv.onmouseup.execute(ev, ret);
          ret |= priv.onclick.execute(ev, ret);
          
          return ret;
        },
        
        keydown: function(ev) {
          var ret = false;
          
          if(priv.focus !== null) {
            priv.focus.keydown(ev);
            ret = true;
          }
          
          ret |= priv.onkeydown.execute(ev, ret);
          
          return ret;
        },
        
        keyup: function(ev) {
          var ret = false;
          
          if(priv.focus !== null) {
            priv.focus.keyup(ev);
            ret = true;
          }
          
          ret |= priv.onkeyup.execute(ev, ret);
          
          return ret;
        },
        
        keypress: function(ev) {
          var ret = false;
          
          if(priv.focus !== null) {
            priv.focus.keypress(ev);
            ret = true;
          }
          
          ret = ret || priv.onkeypress.execute(ev, ret);
          
          return ret;
        },
        
        render: function() {
          priv.ctx.save();
          priv.onrender.execute(priv.ctx);
          priv.controls.render();
          priv.ctx.restore();
        },
        
        resize: function() {
          priv.onresize.execute();
        }
      };
      
      return me;
    }
  }.create();
}

// A doubly-linked list for nested controls
function ControlStack(owner) {
  return {
    owner: owner,
    first: null,
    last: null,
    size: 0,
    
    create: function() {
      var priv = this;
      
      var me = {
        hittest: function(x, y) {
          if(priv.first !== null) {
            return priv.first.hittest(x, y);
          }
          
          return null;
        },
        
        // Add a control to the list
        add: function(control) {
          control.contParent = priv.owner;
          
          if(priv.first !== null) {
            control.contNext = null;
            control.contPrev = priv.first;
            priv.first.contNext = control;
            priv.first = control;
          } else {
            control.contNext = null;
            control.contPrev = null;
            priv.first = control;
            priv.last = control;
          }
          
          priv.size++;
        },
        
        // Remove a control from the list
        remove: function(control) {
          var c = control.contNext;
          if(c !== null) {
            c.contPrev = control.contPrev;
            if(c.contPrev === null) { priv.last = c; }
          } else {
            c = control.contPrev;
            if(c !== null) { c.contNext = null; }
            priv.first = c;
          }
          
          c = control.contPrev;
          if(c !== null) {
            c.contNext = control.contNext;
            if(c.contNext === null) { priv.first = c; }
          } else {
            c = control.contNext;
            if(c !== null) { c.contPrev = null; }
            priv.last = c;
          }
          
          priv.size--;
        },
        
        // De-focus all controls in this list and nested lists
        killFocus: function() {
          c = priv.last;
          while(c !== null) {
            c.focus = false;
            c.controls.killFocus();
            c = c.contNext;
          }
        },
        
        // Render all controls and nested controls in this list
        render: function() {
          if(priv.last !== null) {
            priv.last.render();
          }
        }
      };
      
      return me;
    }
  }.create();
}

// A generic control capable of drawing a background box,
// a border, containing nested controls, and handling events
function Control(gui) {
  return {
    visible: true,
    
    controls: null,
    
    ongotfocus:  ExecutionStack(),
    onlostfocus: ExecutionStack(),
    onmousein:   ExecutionStack(),
    onmouseout:  ExecutionStack(),
    onmousemove: ExecutionStack(),
    onmousedown: ExecutionStack(),
    onmouseup:   ExecutionStack(),
    onclick:     ExecutionStack(),
    onkeydown:   ExecutionStack(),
    onkeyup:     ExecutionStack(),
    onkeypress:  ExecutionStack(),
    onrender:    ExecutionStack(),
    
    create: function() {
      var priv = this;
      
      var me = {
        contParent: null,
        contNext: null,
        contPrev: null,
        gui: gui,
        ctx: gui.context(),
        focus: false,
        
        acceptinput: true,
        x: 0,
        y: 0,
        w: 100,
        h: 20,
        forecolour: 'white',
        backcolour: null,
        bordercolour: null,
        
        controls:    function() { return priv.controls;    },
        ongotfocus:  function() { return priv.ongotfocus;  },
        onlostfocus: function() { return priv.onlostfocus; },
        onmousein:   function() { return priv.onmousein;   },
        onmouseout:  function() { return priv.onmouseout;  },
        onmousemove: function() { return priv.onmousemove; },
        onmousedown: function() { return priv.onmousedown; },
        onmouseup:   function() { return priv.onmouseup;   },
        onclick:     function() { return priv.onclick;     },
        onkeydown:   function() { return priv.onkeydown;   },
        onkeyup:     function() { return priv.onkeyup;     },
        onkeypress:  function() { return priv.onkeypress;  },
        onrender:    function() { return priv.onrender;    },
        
        remove: function() {
          if(me.contParent !== null) {
            me.contParent.controls.remove(me);
          }
        },
        
        root: function() {
          if(me.contParent !== null) {
            return me.contParent.root();
          }
          
          return me;
        },
        
        visible: function(visible) {
          if(typeof visible === 'undefined') {
            return priv.visible;
          }
          
          if(priv.visible !== visible) {
            priv.visible = visible;
            
            if(!visible && focus) {
              me.gui.setfocus(me.contParent);
            }
          }
        },
        
        setfocus: function() {
          if(!me.focus) {
            me.focus = true;
            me.gui.setfocus(me);
          }
        },
        
        hittest: function(x, y) {
          if(priv.visible && me.acceptinput) {
            var c = priv.controls.hittest(x - me.x, y - me.y);
            if(c !== null) {
              return c;
            }
            
            if(x >= me.x && x <= me.x + me.w &&
               y >= me.y && y <= me.y + me.h) {
              return me;
            }
          }
          
          if(me.contPrev !== null) {
            return me.contPrev.hittest(x, y);
          }
          
          return null;
        },
        
        renderPre: function() {
          if(priv.visible) {
            me.ctx.save();
            me.ctx.translate(me.x, me.y);
            
            if(me.backcolour !== null) {
              me.ctx.fillStyle = me.backcolour;
              me.ctx.fillRect(0, 0, me.w, me.h);
            }
            
            return true;
          }
          
          return false;
        },
        
        renderPost: function() {
          priv.controls.render();
          
          if(me.bordercolour !== null) {
            me.ctx.strokeStyle = me.bordercolour;
            me.ctx.strokeRect(0.5, 0.5, me.w, me.h);
          }
          
          me.ctx.restore();
        },
        
        renderControl: function() { },
        render: function() {
          if(me.renderPre()) {
            me.renderControl();
            priv.onrender.execute(me.ctx);
            me.renderPost();
          }
          
          if(me.contNext !== null) {
            me.contNext.render();
          }
        },
        
        gotfocus: function() {
          if(me.ongotfocus !== null) { me.ongotfocus(); }
        },
        
        lostfocus: function() {
          if(me.onlostfocus !== null) { me.onlostfocus(); }
        },
        
        mousein: function() {
          if(me.onmousein !== null) { me.onmousein(); }
        },
        
        mouseout: function() {
          if(me.onmouseout !== null) { me.onmouseout(); }
        },
        
        mousemove: function(ev) {
          if(me.onmousemove !== null) { me.onmousemove(ev); }
        },
        
        mousedown: function(ev) {
          if(me.onmousedown !== null) { me.onmousedown(ev); }
        },
        
        mouseup: function(ev) {
          if(me.onmouseup !== null) { me.onmouseup(ev); }
        },
        
        click: function() {
          if(me.onclick !== null) { me.onclick(); }
        },
        
        keydown: function(ev) {
          if(me.onkeydown !== null) { me.onkeydown(ev); }
        },
        
        keyup: function(ev) {
          if(me.onkeyup !== null) { me.onkeyup(ev); }
        },
        
        keypress: function(ev) {
          if(me.onkeypress !== null) { me.onkeypress(ev); }
        }
      }
      
      priv.controls = new ControlStack(me);
      
      return me;
    }
  }.create();
}

function Frame(gui) {
  return {
    create: function() {
      var me = Control(gui);
      me.backcolour = 'gray';
      me.bordercolour = 'white';
      return me;
    }
  }.create();
}

function Label(gui) {
  return {
    create: function() {
      var _text = '';
      
      var me = Control(gui);
      me.textAlign = 'center';
      me.textBaseline = 'middle';
      me.autosize = true;
      
      me.text = function(text) {
        if(typeof text === 'undefined') {
          return _text;
        } else {
          _text = text;
          
          if(me.autosize) {
            w = me.ctx.measureText(_text).width;
            h = getTextHeight(me.ctx.font).ascent;
          }
        }
      };
      
      me.renderControl = function() {
        me.ctx.fillStyle = this.forecolour;
        me.ctx.textAlign = this.textAlign;
        me.ctx.textBaseline = this.textBaseline;
        
        switch(this.textAlign) {
          case 'center': me.ctx.fillText(_text, this.w / 2, this.h / 2); break;
          case 'right':  me.ctx.fillText(_text, this.w    , this.h / 2); break;
          default:       me.ctx.fillText(_text,          0, this.h / 2); break;
        }
      };
      
      return me;
    }
  }.create();
}

function Button(gui) {
  return {
    create: function() {
      var me = Label(gui);
      me.backcolour = 'gray';
      me.bordercolour = 'white';
      return me;
    }
  }.create();
}

function Textbox(gui) {
  return {
    create: function() {
      var _selstart = 0;
      
      var me = Label(gui);
      me.backcolour = 'gray';
      me.bordercolour = 'white';
      me.textAlign = 'left';
      me.textW = 0;
      me.textH = getTextHeight(me.ctx.font).ascent;
      me.selx = 0;
      
      me.textSuper = me.text;
      me.text = function(text) {
        if(typeof text === 'undefined') {
          return this.textSuper(text);
        } else {
          this.textSuper(text);
          this.textW = me.ctx.measureText(text).width;
          this.textH = getTextHeight(me.ctx.font).ascent;
          this.selstart(text.length);
        }
      }
      
      me.selstart = function(selstart) {
        _selstart = constrain(selstart, 0, this.text().length);
        this.selx = me.ctx.measureText(this.text().substr(0, selstart)).width;
      }
      
      me.renderControlSuper = me.renderControl;
      me.renderControl = function() {
        me.ctx.save();
        me.ctx.translate(2, 0);
        this.renderControlSuper();
        
        if(this.focus) {
          me.ctx.fillStyle = this.forecolour;
          me.ctx.fillRect(this.selx, (this.h - this.textH) / 2, 1, this.textH);
        }
        
        me.ctx.restore();
      }
      
      me.keypressSuper = me.keypress;
      me.keypress = function(ev) {
        if(ev.which !== 13) {
          var s = _selstart;
          this.text(this.text().substr(0, _selstart) + String.fromCharCode(ev.which) + this.text().substr(_selstart, this.text().length));
          this.selstart(s + 1);
        }
        
        this.keypressSuper(ev);
      }
      
      me.keydownSuper = me.keydown;
      me.keydown = function(ev) {
        switch(ev.which) {
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
        
        this.keydownSuper(ev);
      }
      
      return me;
    }
  }.create();
}

function List(gui) {
  return {
    item: [],
    selected: null,
    create: function() {
      var priv = this;
      var me = Control(gui);
      me.backcolour = 'gray';
      me.bordercolour = 'white';
      me.h = 40;
      
      var items = {
        clear: function() {
          for(var i = 0; i < priv.item.length; i++) {
            priv.item[i].remove();
          }
          
          priv.item = [];
          priv.selected = null;
        },
        
        length: function() {
          return priv.item.length;
        },
        
        first: function() {
          return priv.item[0];
        },
        
        last: function() {
          return priv.item[priv.item.length - 1];
        },
        
        push: function(text) {
          var prev = priv.item[priv.item.length - 1];
          prev = typeof prev === 'undefined' ? null : prev;
          
          var f = Frame(gui);
          f.w = me.w;
          
          if(prev !== null) {
            f.h = 40;
            f.y = prev.y + prev.h;
          } else {
            f.h = 40;
          }
          
          f.onselect = null;
          f.onclick = function() {
            items.selected(f);
          }
          
          var l = Label(gui);
          l.textAlign = 'left';
          l.text(text);
          l.acceptinput = false;
          l.x = 4;
          l.y = (f.h - l.h) / 2;
          
          f.text = l.text;
          f.controls().add(l);
          me.controls().add(f);
          priv.item.push(f);
          
          return f;
        },
        
        selected: function(selected) {
          if(typeof selected === 'undefined') {
            return priv.selected;
          }
          
          if(priv.selected !== null) {
            priv.selected.backcolour = 'gray';
          }
          
          priv.selected = selected;
          priv.selected.backcolour = 'green';
          
          if(priv.selected.onselect !== null) {
            priv.selected.onselect(priv.selected);
          }
        }
      }
      
      me.items = function() {
        return items;
      };
      
      return me;
    }
  }.create();
}