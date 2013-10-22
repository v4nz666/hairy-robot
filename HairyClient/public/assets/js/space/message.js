function Message(ctx, text) {
  return {
    create: function() {
      var priv = this;
      
      var me = GUI(ctx);
      me.init = function() {
        var l = Label(this);
        l.textAlign = 'center';
        l.textBaseline = 'middle';
        l.autosize = false;
        l.text(text);
        l.w = 150;
        
        var f = Frame(this);
        f.w = l.w;
        f.h = 50;
        f.controls.add(l);
        
        this.controls.add(f);
        
        this.onresize = function() {
          f.x = (ctx.canvas.width  - f.w) / 2;
          f.y = (ctx.canvas.height - f.h) / 2;
        };
        
        this.addcontrol = function(control) {
          f.controls.add(control);
        };
        
        this.onmousemove = function(ev) { return true; }
        this.onmousedown = function(ev) { return true; }
        this.onmouseup   = function(ev) { return true; }
        this.onclick     = function()   { return true; }
        this.onkeydown   = function(ev) { return true; }
        this.onkeyup     = function(ev) { return true; }
        this.onkeypress  = function(ev) { return true; }
      };
      
      return me;
    }
  }.create();
}