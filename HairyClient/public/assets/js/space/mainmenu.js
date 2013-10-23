function MainMenu(ctx) {
  return {
    create: function() {
      var priv = this;
      
      var me = GUI(ctx);
      me.name = 'mainmenu';
      
      me.onplay = null;
      me.init = function() {
        var btnPlay = Button(this);
        btnPlay.x = 10;
        btnPlay.y = 10;
        btnPlay.w = 180;
        btnPlay.text('Play');
        btnPlay.onclick = $.proxy(function(ev) {
          if(this.onplay !== null) {
            this.onplay();
          }
        }, this);
        
        var btnEdit = new Button(this);
        btnEdit.x = 10;
        btnEdit.y = 30;
        btnEdit.w = 180;
        btnEdit.text('Edit Ships');
        btnEdit.onclick = $.proxy(function(ev) {
          btnEdit.gui.pop();
          this.guis.push(ShipEditor(ctx));
        }, this);
        
        var fraMenu = Frame(this);
        fraMenu.w = 200;
        fraMenu.h = 100;
        fraMenu.controls.add(btnPlay);
        fraMenu.controls.add(btnEdit);
        
        this.controls.add(fraMenu);
        this.onresize = $.proxy(function() {
          fraMenu.x = (ctx.canvas.width  - fraMenu.w) / 2;
          fraMenu.y = (ctx.canvas.height - fraMenu.h) / 2;
        }, this);
      }
      
      return me;
    }
  }.create();
}