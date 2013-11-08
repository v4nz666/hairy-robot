function MainMenu(ctx) {
  return {
    ship: null,
    
    create: function() {
      var priv = this;
      
      var me = GUI(ctx);
      me.name = 'mainmenu';
      
      me.onplay = null;
      me.init = function() {
        var btnPlay = Button(me);
        btnPlay.x = 10;
        btnPlay.y = 10;
        btnPlay.w = 180;
        btnPlay.text('Play');
        btnPlay.onclick = $.proxy(function(ev) {
          me.refreshships();
          fraShip.visible(true);
        }, me);
        
        var btnEdit = new Button(me);
        btnEdit.x = 10;
        btnEdit.y = 30;
        btnEdit.w = 180;
        btnEdit.text('Edit Ships');
        btnEdit.onclick = $.proxy(function(ev) {
          btnEdit.gui.pop();
          me.guis.push(ShipEditor(ctx));
        }, me);
        
        var fraMenu = Frame(me);
        fraMenu.w = 200;
        fraMenu.h = 100;
        fraMenu.controls.add(btnPlay);
        fraMenu.controls.add(btnEdit);
        
        var fraShip = Frame(me);
        fraShip.w = 200;
        fraShip.h = 100;
        fraShip.visible(false);
        
        var btnUse = Button(me);
        btnUse.text('Use');
        
        var lstShip = List(me);
        lstShip.x = 4;
        lstShip.y = 4;
        lstShip.w = fraShip.w - lstShip.x * 2;
        lstShip.h = fraShip.h - lstShip.y * 2 - btnUse.h - 4;
        
        btnUse.x = lstShip.x + lstShip.w - btnUse.w;
        btnUse.y = lstShip.y + lstShip.h + 4;
        btnUse.onclick = $.proxy(function(ev) {
          if(this.onplay !== null) {
            this.onplay();
          }
        }, me);
        
        fraShip.controls.add(lstShip);
        fraShip.controls.add(btnUse);
        
        me.controls.add(fraMenu);
        me.controls.add(fraShip);
        me.onresize = $.proxy(function() {
          fraMenu.x = (ctx.canvas.width  - fraMenu.w) / 2;
          fraMenu.y = (ctx.canvas.height - fraMenu.h) / 2;
          fraShip.x = (ctx.canvas.width  - fraShip.w) / 2;
          fraShip.y = (ctx.canvas.height - fraShip.h) / 2;
        }, me);
        
        var selectship = function(item) {
          priv.ship = Ship();
          priv.ship.deserialize(item.ship);
        };
        
        me.refreshships = function() {
          var msg = Message(me.ctx, 'Refreshing ship list...');
          me.guis.push(msg);
          
          stat.load([{type: 'ships', cb: function() {
            lstShip.items().clear();
            
            if(stat.ships.length !== 0) {
              for(var i = 0; i < stat.ships.length; i++) {
                var item = lstShip.items().push(stat.ships[i].name);
                item.ship = stat.ships[i];
                item.onselect = selectship;
              }
              
              lstShip.items().selected(lstShip.items().first());
            } else {
              
            }
            
            msg.pop();
          }}]);
        };
        
        me.getShip = function() {
          return priv.ship;
        }
      }
      
      return me;
    }
  }.create();
}