function ShipEditor(ctx) {
  return {
    ship: null,
    selected: null,
    hover: null,
    
    halfW: 0,
    halfH: 0,
    mouseX: 0,
    mouseY: 0,
    gridX: 0,
    gridY: 0,
    
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
          
          priv.halfW = ctx.canvas.width  / 2;
          priv.halfH = ctx.canvas.height / 2;
        };
        
        this.onrender = function() {
          ctx.save();
          ctx.translate(priv.halfW, priv.halfH);
          priv.ship.render(ctx);
          ctx.restore();
        };
        
        this.onmousemove = function(ev) {
          priv.mouseX = ev.offsetX - priv.halfW;
          priv.mouseY = ev.offsetY - priv.halfH;
          
          var gridX = Math.floor((ev.offsetX - priv.halfW) / 16);
          var gridY = Math.floor((ev.offsetY - priv.halfH) / 16);
          
          if(gridX != priv.gridX || gridY != priv.gridY) {
            priv.gridX = gridX;
            priv.gridY = gridY;
            priv.hover = priv.ship.partAt(priv.gridX, priv.gridY);
            
            if(ev.which != 0) {
              me.click(ev);
            }
          }
        };
        
        this.onclick = function(ev) {
          var x = priv.gridX;
          var y = priv.gridY;
          
          if(priv.ship.addPart(x, y, priv.selected)) {
            //if(x < 0) { this.startX += x; }
            //if(y < 0) { this.startY += y; }
          }
        };
      }
      
      me.init();
      return me;
    }
  }.create(ctx);
}