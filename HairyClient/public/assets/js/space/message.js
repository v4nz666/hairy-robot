function Message(ctx, text) {
  return {
    create: function() {
      var priv = this;
      
      var me = GUI(ctx);
      me.name = 'message';
      
      me.init = function() {
        var l = Label(me);
        l.textAlign = 'center';
        l.textBaseline = 'middle';
        l.autosize = false;
        l.text(text);
        l.w = 150;
        
        var f = Frame(me);
        f.w = l.w;
        f.h = 50;
        f.controls.add(l);
        
        me.controls.add(f);
        
        me.onresize = function() {
          f.x = (ctx.canvas.width  - f.w) / 2;
          f.y = (ctx.canvas.height - f.h) / 2;
        };
        
        me.addcontrol = function(control) {
          f.controls.add(control);
        };
        
        me.onmousemove = function(ev, ret) { return true; }
        me.onmousedown = function(ev, ret) { return true; }
        me.onmouseup   = function(ev, ret) { return true; }
        me.onclick     = function(ev, ret) { return true; }
        me.onkeydown   = function(ev, ret) { return true; }
        me.onkeyup     = function(ev, ret) { return true; }
        me.onkeypress  = function(ev, ret) { return true; }
      };
      
      return me;
    }
  }.create();
}