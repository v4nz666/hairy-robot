function ShipEditor(ctx) {
  return {
    ship: null,
    selected: null,
    hover: null,
    
    types: [],
    
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
      me.name = 'shipeditor';
      
      me.init = function() {
        var itemsel = function(item) {
          priv.selected = item.part;
        };
        
        var lstShips = List(me);
        lstShips.w = 150;
        
        var fraInfo = Frame(me);
        fraInfo.w = 250;
        fraInfo.h = 150;
        
        var btnRefresh = Button(me);
        btnRefresh.text('Refresh');
        btnRefresh.onclick = function(ev) {
          me.refreshships();
        };
        
        var btnNew = Button(me);
        btnNew.text('New');
        btnNew.onclick = function(ev) {
          me.showAddShip();
        };
        
        var btnSave = Button(me);
        btnSave.text('Save');
        btnSave.onclick = function(ev) {
          var msgsaving = Message(me.ctx, 'Saving ship ' + priv.ship.name + '...');
          me.guis.push(msgsaving);
          
          var jsondata = priv.ship.serialize();
          jsondata._method = 'PUT';
          
          $.ajax({
            type: 'POST',
            url: '/games/space/store/saveship',
            data: jsondata
          }).done(function(data) {
            msgsaving.pop();
            console.log('Got [', data, ']');
            me.refreshships();
          }).fail(function() {
            msgsaving.pop();
            msgsaving = Message(me.ctx, 'Failed to save ship.');
            me.guis.push(msgsaving);
            console.log('Failed to save ship');
          });
        };
        
        var lstParts = List(me);
        lstParts.w = fraInfo.w;
        
        me.controls.add(lstShips);
        me.controls.add(fraInfo);
        me.controls.add(btnRefresh);
        me.controls.add(btnNew);
        me.controls.add(btnSave);
        me.controls.add(lstParts);
        
        me.onresize = function() {
          lstShips.h = ctx.canvas.height;
          fraInfo.x = ctx.canvas.width - lstParts.w;
          lstParts.x = fraInfo.x;
          
          var h = 0;
          for(var i = 0; i < priv.types.length; i++) {
            priv.types[i].w = lstParts.w / priv.types.length;
            priv.types[i].x = lstParts.x + priv.types[i].w * i;
            priv.types[i].y = fraInfo.h;
            h = priv.types[i].h;
          }
          
          lstParts.y = fraInfo.h + h;
          lstParts.h = ctx.canvas.height - fraInfo.h - h;
          btnSave.x = lstParts.x - btnSave.w - 4;
          btnSave.y = ctx.canvas.height - btnSave.h - 4;
          btnNew.x = btnSave.x - btnNew.w - 4;
          btnNew.y = btnSave.y;
          btnRefresh.x = lstShips.x + lstShips.w + 4;
          btnRefresh.y = btnSave.y;
          
          priv.halfW = ctx.canvas.width  / 2;
          priv.halfH = ctx.canvas.height / 2;
        };
        
        var onrender = function() {
          ctx.save();
          ctx.translate(priv.halfW, priv.halfH);
          priv.ship.render(ctx);
          
          ctx.fillStyle = 'white';
          ctx.strokeStyle = 'grey';
          
          if(priv.selected !== null) {
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
          }
          
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
        
        me.onmousemove = function(ev, ret) {
          if(ret  || priv.ship === null) return;
          
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
        
        me.onclick = function(ev, ret) {
          if(ret || priv.ship === null) return;
          
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
        
        me.showAddShip = function() {
          var msg = Message(me.ctx, 'Pick a name for your ship:');
          
          var name = Textbox(msg);
          name.w = 110;
          name.y = 20;
          
          var okay = Button(msg);
          okay.text('=>');
          okay.w = 40;
          okay.x = name.w;
          okay.y = 20;
          okay.onclick = function(ev) {
            priv.ship = Ship();
            priv.ship.name = name.text();
            priv.ship.addPart(0, 0, stat.parts[0]);
            me.onrender = onrender;
            msg.pop();
          };
          
          me.guis.push(msg);
          
          msg.addcontrol(name);
          msg.addcontrol(okay);
        };
        
        var selectship = function(item) {
          priv.ship = Ship();
          priv.ship.deserialize(item.ship);
          me.onrender = onrender;
        };
        
        me.refreshships = function() {
          var msg = Message(me.ctx, 'Refreshing ship list...');
          me.guis.push(msg);
          
          stat.load([{type: 'ships', cb: function() {
            lstShips.items().clear();
            
            if(stat.ships.length !== 0) {
              for(var i = 0; i < stat.ships.length; i++) {
                var item = lstShips.items().push(stat.ships[i].name);
                item.ship = stat.ships[i];
                item.onselect = selectship;
              }
              
              lstShips.items().selected(lstShips.items().first());
            } else {
              me.showAddShip();
            }
            
            msg.pop();
          }}]);
        };
        
        me.showparts = function(type) {
          var msg = Message(me.ctx, 'Getting parts...');
          me.guis.push(msg);
          
          if(typeof type === 'undefined') { type = ''; }
          
          $.ajax({
            url: '/games/space/store/parts/' + type,
            dataType: 'json'
          }).done(function(data) {
            console.log('Got parts [', data, ']');
            
            var draw = function(ctx, render) {
              eval(this.render);
            }
            
            lstParts.items().clear();
            
            for(var i = 0; i < data.length; i++) {
              var item = lstParts.items().push(data[i].name + ' - ' + data[i].desc);
              data[i].draw = draw;
              item.part = data[i];
              item.onselect = itemsel;
            }
            
            lstParts.items().selected(lstParts.items().first());
            
            msg.pop();
          }).fail(function() {
            console.log('Failed to get parts');
          });
        };
        
        me.showtypes = function() {
          var msg = Message(me.ctx, 'Getting part types...');
          me.guis.push(msg);
          
          $.ajax({
            url: '/games/space/store/types',
            dataType: 'json'
          }).done(function(data) {
            console.log('Got types [', data, ']');
            
            var button = Button(me);
            button.text('All');
            button.onclick = me.showparts;
            
            me.controls.add(button);
            priv.types.push(button);
            
            for(var i = 0; i < data.length; i++) {
              var button = Button(me);
              button.text(data[i].name);
              button.type = data[i].id;
              button.onclick = $.proxy(function() {
                me.showparts(this.type);
              }, button);
              
              me.controls.add(button);
              priv.types.push(button);
            }
            
            me.resize();
            
            priv.types[0].onclick();
            
            msg.pop();
          }).fail(function() {
            console.log('Failed to get part types');
          });
        };
        
        me.refreshships();
        me.showtypes();
      }
      
      return me;
    }
  }.create();
}