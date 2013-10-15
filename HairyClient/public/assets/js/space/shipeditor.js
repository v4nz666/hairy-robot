function ShipEditor(ctx) {
  return {
    ship: null,
    part: null,
    selected: null,
    
    create: function(ctx) {
      var priv = this;
      
      var me = GUI(ctx);
      me.init = function() {
        $.ajax({
          url: '/games/store/parts',
          dataType: 'json',
        }).done(function(data) {
          priv.part = data;
          
          for(var i = 0; i < priv.part.length; i++) {
            var item = lstParts.items().push(priv.part[i].name + ' - ' + priv.part[i].desc);
            item.part = priv.part[i];
            item.onselect = itemsel;
          }
          
          priv.ship.addPart(0, 0, priv.part[0]);
        }).fail(function() {
          console.log('Failed to get parts');
        });
        
        priv.ship = Ship();
        
        var itemsel = function(item) {
          priv.selected = item.part;
        };
        
        var fraInfo = Frame(this);
        fraInfo.w = 250;
        fraInfo.h = 150;
        
        var lstParts = List(this);
        lstParts.w = fraInfo.w;
        
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