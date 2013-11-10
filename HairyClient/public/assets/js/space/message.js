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
        
        me.text = l.text;
        
        var f = Frame(me);
        f.w = l.w;
        f.h = 50;
        f.controls().add(l);
        
        me.controls().add(f);
        
        me.addcontrol = function(control) {
          f.controls().add(control);
        };
        
        me.onmousemove().push(function(ev, ret) { return true; });
        me.onmousedown().push(function(ev, ret) { return true; });
        me.onmouseup  ().push(function(ev, ret) { return true; });
        me.onclick    ().push(function(ev, ret) { return true; });
        me.ondblclick ().push(function(ev, ret) { return true; });
        me.onkeydown  ().push(function(ev, ret) { return true; });
        me.onkeyup    ().push(function(ev, ret) { return true; });
        me.onkeypress ().push(function(ev, ret) { return true; });
        me.onresize   ().push(function() {
          f.x = (ctx.canvas.width  - f.w) / 2;
          f.y = (ctx.canvas.height - f.h) / 2;
        });
      };
      
      return me;
    }
  }.create();
}