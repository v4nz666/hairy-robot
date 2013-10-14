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
        }).done(function(data) { priv.part = data; })
          .fail(function() { console.log('Failed to get parts'); });
        
        priv.ship = Ship();
        
        var list = List(this);
        list.h = 500;
        list.w = 500;
        list.items().push('Test');
        this.controls.add(list);
      }
      
      me.init();
      return me;
    }
  }.create(ctx);
}