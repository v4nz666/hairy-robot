function Game(ctx, socket) {
  return {
    socket: socket,
    
    onselectship: ExecutionStack(),
    
    guiShipList: null,
    lstShip: null,
    
    txtChat: null,
    fraChat: null,
    
    messages: [],
    maxMessages: 255,
    
    create: function() {
      var priv = this;
      
      var me = GUI(ctx, 'game');
      
      me.onselectship = function() {
        return priv.onselectship;
      };
      
      me.init = function() {
        priv.guiShipList = Message(ctx, 'Please choose your ship:');
        priv.lstShip = List(priv.guiShipList);
        priv.lstShip.y = 20;
        priv.lstShip.w = 150;
        priv.guiShipList.addcontrol(priv.lstShip);
        
        priv.txtChat = Textbox(this);
        priv.txtChat.visible(false);
        priv.txtChat.w = 200;
        priv.txtChat.backcolour = 'rgba(127, 127, 127, 0.5)';
        priv.txtChat.bordercolour = 'rgba(255, 255, 255, 0.5)';
        priv.txtChat.onkeypress().push(function(ev) {
          if(ev.which === 13) {
            if(priv.txtChat.text().length !== 0) {
              priv.socket.emit('ms', {msg: priv.txtChat.text()});
              priv.txtChat.text('');
            }
            
            priv.txtChat.visible(false);
            priv.fraChat.backcolour = null;
            priv.fraChat.bordercolour = null;
          }
        });
        
        priv.fraChat = Frame(this);
        priv.fraChat.acceptinput = false;
        priv.fraChat.w = 200;
        priv.fraChat.backcolour = null;
        priv.fraChat.bordercolour = null;
        priv.fraChat.onrender().push(function() {
          var max = Math.min(priv.maxMessages, priv.messages.length);
          var min = priv.txtChat.visible() ? 0 : Math.max(max - 6, 0);
          
          var h = getTextHeight(ctx.font).ascent;
          var x = 4;
          var y = 0;
          
          ctx.save();
          ctx.translate(0, priv.fraChat.h);
          ctx.fillStyle = 'rgb(255, 255, 255)';
          ctx.textBaseline = 'top';
          
          for(var i = max; --i >= min;) {
            y -= h;
            id = priv.messages[i].id;
            msg = priv.messages[i].msg;
            ctx.fillText(id + ': ' + msg, x, y);
          }
          
          ctx.restore();
        });
        
        me.controls().add(priv.txtChat);
        me.controls().add(priv.fraChat);
        
        me.showshiplist();
      };
      
      me.onresize().push(function(w, h) {
        priv.txtChat.y = ctx.canvas.height - priv.txtChat.h;
        priv.fraChat.h = priv.txtChat.y;
      });
      
      me.onkeydown().push(function(ev, handled) {
        if(!handled) {
          if(ev.which === 84) {
            me.showchat();
            ev.preventDefault();
            return true;
          }
        }
      });
      
      me.showchat = function() {
        priv.fraChat.backcolour = 'rgba(127, 127, 127, 0.25)';
        priv.fraChat.bordercolour = 'rgba(255, 255, 255, 0.5)';
        priv.txtChat.visible(true);
        priv.txtChat.setfocus();
      };
      
      me.gotchat = function(msg) {
        while(priv.messages.length >= priv.maxMessages) {
          priv.messages.shift();
        }
        
        priv.messages.push(msg);
      };
      
      me.showshiplist = function() {
        var loadingShips = Message(ctx, 'Loading ships...');
        me.guis().push(loadingShips);
        
        stat.load([{type: 'ships', cb: function() {
          loadingShips.pop();
          
          priv.lstShip.items().clear();
          for(var i = 0; i < stat.ships.length; i++) {
            priv.lstShip.items().push(stat.ships[i].name).ondblclick().push($.proxy(function() {
              priv.onselectship.execute(this);
            }, stat.ships[i]));
          }
          
          me.guis().push(priv.guiShipList);
        }}]);
      };
      
      me.useship = function() {
        priv.guiShipList.pop();
      };
      
      return me;
    }
  }.create();
}