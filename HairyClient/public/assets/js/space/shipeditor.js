function ShipEditor(ctx) {
  return {
    ship: null,
    selected: null,
    hover: null,
    
    halfW: 0,
    halfH: 0,
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
    gridX: 0,
    gridY: 0,
    
    create: function() {
      var priv = this;
      
      var me = GUI(ctx);
      me.init = function() {
        priv.ship = Ship();
        priv.ship.addPart(0, 0, stat.parts[0]);
        
        var itemsel = function(item) {
          priv.selected = item.part;
        };
        
        var lstShips = List(this);
        lstShips.w = 250;
        
        for(var i = 0; i < stat.ships.length; i++) {
          var item = lstShips.items().push(stat.ships[i].name);
          item.ship = stat.ships[i];
        }
        
        var fraInfo = Frame(this);
        fraInfo.w = 250;
        fraInfo.h = 150;
        
        var lstParts = List(this);
        lstParts.w = fraInfo.w;
        
        for(var i = 0; i < stat.parts.length; i++) {
          var item = lstParts.items().push(stat.parts[i].name + ' - ' + stat.parts[i].desc);
          item.part = stat.parts[i];
          item.onselect = itemsel;
        }
        
        lstParts.items().selected(lstParts.items().first());
        
        this.controls.add(lstShips);
        this.controls.add(fraInfo);
        this.controls.add(lstParts);
        
        this.onresize = function() {
          lstShips.h = ctx.canvas.height;
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
          
          ctx.fillStyle = 'white';
          ctx.strokeStyle = 'grey';
          
          ctx.save();
          ctx.translate(priv.gridX * 16, priv.gridY * 16);
          priv.selected.draw(ctx);
          
          if(priv.ship.isValid(priv.gridX - priv.startX, priv.gridY - priv.startY)) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
          } else {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
          }
          
          ctx.fillRect(0, 0, 16, 16);
          ctx.restore();
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(priv.ship.x - 4, priv.ship.y - 4);
          ctx.lineTo(priv.ship.x - 4, priv.ship.y + priv.ship.h + 4);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(priv.ship.x - 4, priv.ship.y + priv.ship.h + 4);
          ctx.lineTo(priv.ship.x + priv.ship.w + 4, priv.ship.y + priv.ship.h + 4);
          ctx.stroke();
          ctx.textAlign = 'right';
          ctx.fillText(priv.ship.h + 'm', priv.ship.x - 8, priv.ship.y + priv.ship.h / 2 + 4);
          ctx.textAlign = 'center';
          ctx.fillText(priv.ship.w + 'm', priv.ship.x + priv.ship.w / 2, priv.ship.y + priv.ship.h + 16);
          ctx.beginPath();
          ctx.arc(priv.ship.x + priv.ship.comx * 16, priv.ship.y + priv.ship.comy * 16, 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
          ctx.restore();
        };
        
        this.onmousemove = function(ev, ret) {
          if(ret) return;
          
          priv.mouseX = ev.offsetX - priv.halfW;
          priv.mouseY = ev.offsetY - priv.halfH;
          
          var gridX = Math.floor((ev.offsetX - priv.halfW) / 16);
          var gridY = Math.floor((ev.offsetY - priv.halfH) / 16);
          
          if(gridX != priv.gridX || gridY != priv.gridY) {
            priv.gridX = gridX;
            priv.gridY = gridY;
            priv.hover = priv.ship.partAt(priv.gridX - priv.startX, priv.gridY - priv.startY);
            
            if(ev.which != 0) {
              me.click(ev);
            }
          }
        };
        
        this.onclick = function(ev, ret) {
          if(ret) return;
          
          var x = priv.gridX;
          var y = priv.gridY;
          
          switch(ev.which) {
            case 1:
              if(priv.ship.addPart(x - priv.startX, y - priv.startY, priv.selected)) {
                if(x < priv.startX) { priv.startX -= 1; }
                if(y < priv.startY) { priv.startY -= 1; }
              }
              
              break;
            
            case 3:
              priv.ship.removePart(x - priv.startX, y - priv.startY);
              break;
          }
        };
      }
      
      me.init();
      return me;
    }
  }.create();
}