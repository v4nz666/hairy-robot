function MainMenu(ctx) {
  return {
    create: function(ctx) {
      var priv = this;
      
      var me = GUI(ctx);
      
      me.onplay = null;
      me.init = function() {
        var btnPlay = new Button(this);
        btnPlay.x = 10;
        btnPlay.y = 10;
        btnPlay.w = 180;
        btnPlay.text('Play');
        btnPlay.onclick = $.proxy(function(ev) {
          if(this.onplay !== null) {
            this.onplay();
          }
        }, this);
        
        var fraMenu = Frame(this);
        fraMenu.w = 200;
        fraMenu.h = 100;
        fraMenu.controls.add(btnPlay);
        
        this.controls.add(fraMenu);
        this.onresize = $.proxy(function() {
          fraMenu.x = (ctx.canvas.width  - fraMenu.w) / 2;
          fraMenu.y = (ctx.canvas.height - fraMenu.h) / 2;
        }, this);
      }
      
      me.init();
      return me;
    }
  }.create(ctx);
}