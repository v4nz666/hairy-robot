function GUIs() {
  return {
    guis: [],
    
    push: function(gui) {
      gui.guis = this;
      gui.init();
      gui.resize();
      this.guis.unshift(gui);
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
    
    resize: function() {
      for(var i = 0; i < this.guis.length; i++) {
        this.guis[i].resize();
      }
    },
    
    mousemove: function(ev) {
      for(var i = 0; i < this.guis.length; i++) {
        if(this.guis[i].mousemove(ev)) break;
      }
    },
    
    mousedown: function(ev) {
      for(var i = 0; i < this.guis.length; i++) {
        if(this.guis[i].mousedown(ev)) break;
      }
    },
    
    mouseup: function(ev) {
      for(var i = 0; i < this.guis.length; i++) {
        if(this.guis[i].mouseup(ev)) break;
      }
    },
    
    keydown: function(ev) {
      if(ev.which == 8) { ev.preventDefault(); }
      
      for(var i = 0; i < this.guis.length; i++) {
        if(this.guis[i].keydown(ev)) break;
      }
    },
    
    keyup: function(ev) {
      for(var i = 0; i < this.guis.length; i++) {
        if(this.guis[i].keyup(ev)) break;
      }
    },
    
    keypress: function(ev) {
      for(var i = 0; i < this.guis.length; i++) {
        if(this.guis[i].keypress(ev)) break;
      }
    }
  }
}

function GUI(ctx) {
  return {
    name: 'generic',
    ctx: ctx,
    guis: null,
    controls: new ControlStack(null),
    focus: null,
    mousedownbutton: 0,
    mousedowncontrol: null,
    mousemovecontrol: null,
    
    onmousemove: null,
    onmousedown: null,
    onmouseup: null,
    onclick: null,
    onkeydown: null,
    onkeyup: null,
    onkeypress: null,
    onrender: null,
    onresize: null,
    
    setfocus: function(control) {
      if(this.focus !== null) {
        this.focus.focus = false;
        this.focus.lostfocus();
      }
      
      this.focus = control;
      
      if(this.focus !== null) {
        this.focus.gotfocus();
      }
    },
    
    pop: function() {
      this.guis.pop(this);
    },
    
    mousemove: function(ev) {
      var ret = false;
      
      if(this.mousedowncontrol !== null) {
        var allx = this.allX(this.mousedowncontrol);
        var ally = this.allY(this.mousedowncontrol);
        var button = ev.which;
        ev.pageX -= allx;
        ev.pageY -= ally;
        ev.which = this.mousedownbutton;
        this.mousedowncontrol.mousemove(ev);
        ev.pageX += allx;
        ev.pageY += ally;
        ev.which = button;
        ret = true;
      } else {
        var c = this.controls.hittest(ev.pageX, ev.pageY);
        
        if(c !== this.mousemovecontrol) {
          if(this.mousemovecontrol !== null) this.mousemovecontrol.mouseout();
          if(c                     !== null) c.mousein();
          this.mousemovecontrol = c;
        }
        
        if(c !== null) {
          var allx = this.allX(c);
          var ally = this.allY(c);
          ev.pageX -= allx;
          ev.pageY -= ally;
          c.mousemove(ev);
          ev.pageX += allx;
          ev.pageY += ally;
          ret = true;
        }
      }
      
      if(this.onmousemove !== null) {
        ret |= this.onmousemove(ev, ret);
      }
      
      return ret;
    },
    
    mousedown: function(ev) {
      var ret = false;
      
      this.mousedownbutton = ev.which;
      this.mousedowncontrol = this.controls.hittest(ev.pageX, ev.pageY);
      
      if(this.mousedowncontrol !== null) {
        var allx = this.allX(this.mousedowncontrol);
        var ally = this.allY(this.mousedowncontrol);
        ev.pageX -= allx;
        ev.pageY -= ally;
        
        this.mousedowncontrol.setfocus();
        this.mousedowncontrol.mousedown(ev);
        
        ev.pageX += allx;
        ev.pageY += ally;
        
        ret = true;
      }
      
      if(this.onmousedown !== null) {
        ret |= this.onmousedown(ev, ret);
      }
      
      return ret;
    },
    
    mouseup: function(ev) {
      var ret = false;
      
      if(this.mousedowncontrol !== null) {
        var allx = this.allX(this.mousedowncontrol);
        var ally = this.allY(this.mousedowncontrol);
        var button = ev.which;
        ev.pageX -= allx;
        ev.pageY -= ally;
        ev.which = this.mousedownbutton;
        
        this.mousedowncontrol.mouseup(ev);
        this.mousedowncontrol.click();
        this.mousedowncontrol = null;
        this.mousedownbutton = 0;
        
        ev.pageX += allx;
        ev.pageY += ally;
        ev.which = button;
        
        ret = true;
      }
      
      if(this.onmouseup !== null) {
        ret |= this.onmouseup(ev, ret);
      }
      
      ret |= this.click(ev, ret);
      
      return ret;
    },
    
    click: function(ev, ret) {
      if(this.onclick !== null) {
        return this.onclick(ev, ret);
      }
    },
    
    keydown: function(ev) {
      var ret = false;
      
      if(this.focus !== null) {
        this.focus.keydown(ev);
        ret = true;
      }
      
      if(this.onkeydown !== null) {
        ret |= this.onkeydown(ev, ret);
      }
      
      return ret;
    },
    
    keyup: function(ev) {
      var ret = false;
      
      if(this.focus !== null) {
        this.focus.keyup(ev);
        ret = true;
      }
      
      if(this.onkeyup !== null) {
        ret |= this.onkeyup(ev, ret);
      }
      
      return ret;
    },
    
    keypress: function(ev) {
      var ret = false;
      
      if(this.focus !== null) {
        this.focus.keypress(ev);
        ret = true;
      }
      
      if(this.onkeypress !== null) {
        ret = ret || this.onkeypress(ev, ret);
      }
      
      return ret;
    },
    
    render: function() {
      this.ctx.save();
      
      if(this.onrender !== null) {
        this.onrender(this.ctx);
      }
      
      this.controls.render(this.ctx);
      this.ctx.restore();
    },
    
    resize: function() {
      if(this.onresize !== null) {
        this.onresize();
      }
    },
    
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
      if(this.first !== null) {
        return this.first.hittest(x, y);
      }
      
      return null;
    },
    
    // Add a control to the list
    add: function(control) {
      control.contParent = this.owner;
      
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
    create: function() {
      var _visible = true;
      
      var me = {
        controls: null,
        contParent: null,
        contNext: null,
        contPrev: null,
        gui: gui,
        focus: false,
        
        acceptinput: true,
        x: 0,
        y: 0,
        w: 100,
        h: 20,
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
            return _visible;
          }
          
          if(_visible !== visible) {
            _visible = visible;
            
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
          if(_visible && me.acceptinput) {
            var c = me.controls.hittest(x - me.x, y - me.y);
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
        
        renderPre: function(ctx) {
          if(_visible) {
            ctx.save();
            ctx.translate(me.x, me.y);
            
            if(me.backcolour !== null) {
              ctx.fillStyle = me.backcolour;
              ctx.fillRect(0, 0, me.w, me.h);
            }
            
            return true;
          }
          
          return false;
        },
        
        renderPost: function(ctx) {
          me.controls.render(ctx);
          
          if(me.bordercolour !== null) {
            ctx.strokeStyle = me.bordercolour;
            ctx.strokeRect(0.5, 0.5, me.w, me.h);
          }
          
          ctx.restore();
        },
        
        renderControl: function(ctx) { },
        render: function(ctx) {
          if(me.renderPre(ctx)) {
            me.renderControl(ctx);
            
            if(me.onrender !== null) {
              me.onrender(ctx);
            }
            
            me.renderPost(ctx);
          }
          
          if(me.contNext !== null) {
            me.contNext.render(ctx);
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
      
      me.controls = new ControlStack(me);
      
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
            w = this.gui.ctx.measureText(_text).width;
            h = getTextHeight(this.gui.ctx.font).ascent;
          }
        }
      };
      
      me.renderControl = function(ctx) {
        ctx.fillStyle = this.forecolour;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        
        switch(this.textAlign) {
          case 'center': ctx.fillText(_text, this.w / 2, this.h / 2); break;
          case 'right':  ctx.fillText(_text, this.w    , this.h / 2); break;
          default:       ctx.fillText(_text,          0, this.h / 2); break;
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
      me.textH = getTextHeight(me.gui.ctx.font).ascent;
      me.selx = 0;
      
      me.textSuper = me.text;
      me.text = function(text) {
        if(typeof text === 'undefined') {
          return this.textSuper(text);
        } else {
          this.textSuper(text);
          this.textW = this.gui.ctx.measureText(text).width;
          this.textH = getTextHeight(this.gui.ctx.font).ascent;
          this.selstart(text.length);
        }
      }
      
      me.selstart = function(selstart) {
        _selstart = constrain(selstart, 0, this.text().length);
        this.selx = this.gui.ctx.measureText(this.text().substr(0, selstart)).width;
      }
      
      me.renderControlSuper = me.renderControl;
      me.renderControl = function(ctx) {
        ctx.save();
        ctx.translate(2, 0);
        this.renderControlSuper(ctx);
        
        if(this.focus) {
          ctx.fillStyle = this.forecolour;
          ctx.fillRect(this.selx, (this.h - this.textH) / 2, 1, this.textH);
        }
        
        ctx.restore();
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
          f.controls.add(l);
          me.controls.add(f);
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