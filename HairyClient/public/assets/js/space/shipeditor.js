function ShipEditor(ctx) {
  return {
    ship: null,
    selected: null,
    
    create: function(ctx) {
      var priv = this;
      
      var me = GUI(ctx);
      me.init = function() {
        priv.ship = Ship();
        priv.ship.addPart(0, 0, stat.part[0]);
        
        var itemsel = function(item) {
          priv.selected = item.part;
        };
        
        var fraInfo = Frame(this);
        fraInfo.w = 250;
        fraInfo.h = 150;
        
        var lstParts = List(this);
        lstParts.w = fraInfo.w;
        
        for(var i = 0; i < stat.part.length; i++) {
          var item = lstParts.items().push(stat.part[i].name + ' - ' + stat.part[i].desc);
          item.part = stat.part[i];
          item.onselect = itemsel;
        }
        
        this.controls.add(fraInfo);
        this.controls.add(lstParts);
        
        this.onresize = function() {
          fraInfo.x = ctx.canvas.width - lstParts.w;
          lstParts.x = fraInfo.x;
          lstParts.y = fraInfo.h;
          lstParts.h = ctx.canvas.height - fraInfo.h;
        };
        
        this.onrender = function() {
          priv.ship.render(ctx);
        };
      }
      
      me.init();
      return me;
    }
  }.create(ctx);
}