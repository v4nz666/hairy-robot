function MainMenu(ctx) {
  return {
    create: function(ctx) {
      var priv = this;
      
      var me = GUI(ctx);
      
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
          this.guis.push(ShipEditor(this.ctx));
        }, this);
        
        var btnParts = Button(this);
        btnParts.x = 10;
        btnParts.y = 50;
        btnParts.w = 180;
        btnParts.text('Get Parts');
        btnParts.onclick = function() {
          $.ajax({
            url: '/games/store/parts',
            dataType: 'json',
          })
            .done(function(data) { console.log(data); })
            .fail(function() { console.log('Failed to get parts'); });
        }
        
        var fraMenu = Frame(this);
        fraMenu.w = 200;
        fraMenu.h = 100;
        fraMenu.controls.add(btnPlay);
        fraMenu.controls.add(btnEdit);
        fraMenu.controls.add(btnParts);
        
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