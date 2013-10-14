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
            var item = list.items().push(priv.part[i].name + ' - ' + priv.part[i].desc);
            item.part = priv.part[i];
            item.onselect = itemsel;
          }
        }).fail(function() {
          console.log('Failed to get parts');
        });
        
        priv.ship = Ship();
        
        var list = List(this);
        list.w = 250;
        
        var itemsel = function(item) {
          priv.selected = item.part;
        };
        
        this.controls.add(list);
        
        this.onresize = function() {
          list.h = ctx.canvas.height;
          list.x = ctx.canvas.width - list.w;
        };
      }
      
      me.init();
      return me;
    }
  }.create(ctx);
}