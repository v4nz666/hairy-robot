stat = {
  vars: [],
  onload: null,
  
  checkonload: function() {
    if(this.onload !== null) {
      if(stat.loaded()) {
        this.onload();
      }
    }
  },
  
  create: function() {
    var priv = this;
    
    return {
      onload: function(cb) {
        priv.onload = cb;
        priv.checkonload();
      },
      
      loaded: function() {
        return priv.vars.length === 0;
      },
      
      load: function(types) {
        for(var i = 0; i < types.length; i++) {
          stat[types[i].type] = null;
          priv.vars.push(types[i].type);
          
          $.ajax({
            url: '/games/space/store/' + types[i].type,
            dataType: 'json',
            idx: i
          }).done(function(data) {
            console.log('Got ' + types[this.idx].type + '[', data, ']');
            stat[types[this.idx].type] = data;
            priv.vars.splice(priv.vars.indexOf(data), 1);
            if(typeof types[this.idx].cb !== 'undefined') { types[this.idx].cb(); }
            priv.checkonload();
          }).fail(function() {
            console.log('Failed to get ' + types[this.idx].types);
          });
        }
      }
    }
  }
}.create();

stat.load([
  {
    type: 'parts',
    cb: function() {
      var draw = function(ctx, render) {
        eval(this.render);
      }
      
      for(var i = 0; i < stat.parts.length; i++) {
        stat.parts[i].draw = draw;
      }
    }
  },
  
  {
    type: 'ships'
  }
]);

stat.onload(function() {
  console.log('test');
});