stat = {
  vars: [],
  
  create: function() {
    var priv = this;
    
    return {
      loaded: function() {
        for(var i = 0; i < priv.vars.length; i++) {
          if(typeof stat[priv.vars[i]] === 'undefined') {
            return false;
          }
        }
        
        return true;
      },
      
      load: function(type, cb) {
        $.ajax({
          url: '/games/space/store/' + type,
          dataType: 'json'
        }).done(function(data) {
          console.log('Got ' + type + '[', data, ']');
          stat[type] = data;
          priv.vars.push(data);
          if(typeof cb !== 'undefined') { cb(); }
        }).fail(function() {
          console.log('Failed to get ' + type);
        });
      }
    }
  }
}.create();

stat.load('parts', function() {
  var draw = function(ctx, render) {
    eval(this.render);
  }
  
  for(var i = 0; i < stat.parts.length; i++) {
    stat.parts[i].draw = draw;
  }
});

stat.load('ships');