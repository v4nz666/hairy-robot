function ShipEditor(ctx) {
  return {
    ship: null,
    
    create: function(ctx) {
      var priv = this;
      
      var me = GUI(ctx);
      me.init = function() {
        priv.ship = Ship();
      }
      
      me.init();
      return me;
    }
  }.create(ctx);
}