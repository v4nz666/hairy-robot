function ShipEditor(ctx) {
  return {
    ship: null,
    part: null,
    
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
            console.log(priv.part[i].name + ' - ' + priv.part[i].desc);
            var item = list.items().push(priv.part[i].name + ' - ' + priv.part[i].desc);
            item.part = priv.part[i];
            item.onselect = itemsel;
          }
        }).fail(function() {
          console.log('Failed to get parts');
        });
        
        priv.ship = Ship();
        
        var list = List(this);
        list.h = 500;
        list.w = 500;
        
        var itemsel = function(item) {
          console.log(item.text());
        };
        
        this.controls.add(list);
      }
      
      me.init();
      return me;
    }
  }.create(ctx);
}