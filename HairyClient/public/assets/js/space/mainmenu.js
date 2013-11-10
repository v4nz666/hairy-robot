function MainMenu(ctx) {
  return {
    ship: null,
    
    create: function() {
      var priv = this;
      
      var me = GUI(ctx);
      me.name = 'mainmenu';
      
      me.onplay = null;
      me.init = function() {
        var fraShip = Frame(me);
        fraShip.w = 200;
        fraShip.h = 100;
        
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
        
        me.controls.add(fraShip);
        me.onresize = $.proxy(function() {
          fraShip.x = (ctx.canvas.width  - fraShip.w) / 2;
          fraShip.y = (ctx.canvas.height - fraShip.h) / 2;
        }, me);
        
        var selectship = function(item) {
          priv.ship = item.ship;
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
        
        me.refreshships();
      }
      
      return me;
    }
  }.create();
}