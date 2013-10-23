function Game(ctx, socket) {
  return {
    socket: socket,
    
    txtChat: null,
    fraChat: null,
    
    messages: [],
    maxMessages: 255,
    
    create: function() {
      var priv = this;
      
      var me = GUI(ctx);
      me.name = 'game';
      
      me.init = function() {
        priv.txtChat = new Textbox(this);
        priv.txtChat.visible(false);
        priv.txtChat.w = 200;
        priv.txtChat.backcolour = 'rgba(127, 127, 127, 0.5)';
        priv.txtChat.bordercolour = 'rgba(255, 255, 255, 0.5)';
        priv.txtChat.onkeypress = $.proxy(function(ev) {
          if(ev.which === 13) {
            if(priv.txtChat.text().length !== 0) {
              priv.socket.emit('msg', {msg: priv.txtChat.text()});
              priv.txtChat.text('');
            }
            
            priv.txtChat.visible(false);
            priv.fraChat.backcolour = null;
            priv.fraChat.bordercolour = null;
          }
        }, this);
        
        priv.fraChat = Frame(this);
        priv.fraChat.acceptinput = false;
        priv.fraChat.w = 200;
        priv.fraChat.backcolour = null;
        priv.fraChat.bordercolour = null;
        priv.fraChat.onrender = $.proxy(function() {
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
        }, this);
        
        this.controls.add(priv.txtChat);
        this.controls.add(priv.fraChat);
      }
      
      me.showchat = function() {
        priv.fraChat.backcolour = 'rgba(127, 127, 127, 0.25)';
        priv.fraChat.bordercolour = 'rgba(255, 255, 255, 0.5)';
        priv.txtChat.visible(true);
        priv.txtChat.setfocus();
      }
      
      me.gotchat = function(msg) {
        while(priv.messages.length >= priv.maxMessages) {
          priv.messages.shift();
        }
        
        priv.messages.push(msg);
      }
      
      me.onresize = $.proxy(function(w, h) {
        priv.txtChat.y = ctx.canvas.height - priv.txtChat.h;
        priv.fraChat.h = priv.txtChat.y;
      }, this);
      
      return me;
    }
  }.create();
}