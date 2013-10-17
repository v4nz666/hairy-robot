stat = {
  part: [],
  
  loaded: function() {
    return part.length !== 0;
  }
};

$.ajax({
  url: '/games/space/store/parts',
  dataType: 'json',
}).done(function(data) {
  console.log('Got parts [', data, ']');
  
  var draw = function(ctx, render) {
    eval(this.render);
  }
  
  stat.part = data;
  
  for(var i = 0; i < stat.part.length; i++) {
    stat.part[i].draw = draw;
  }
}).fail(function() {
  console.log('Failed to get parts');
});