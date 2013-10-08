function getTextHeight(font) {
  var text = $('<span>Hg</span>').css({ fontFamily: font });
  var block = $('<div style="display: inline-block; width: 1px; height: 0px;"></div>');
  var div = $('<div></div>');
  var body = $('body');
  
  div.append(text, block);
  body.append(div);
  
  try {
    var result = {};
    
    block.css({ verticalAlign: 'baseline' });
    result.ascent = block.offset().top - text.offset().top;
    
    block.css({ verticalAlign: 'bottom' });
    result.height = block.offset().top - text.offset().top;
    
    result.descent = result.height - result.ascent;
  } finally {
    div.remove();
  }
  
  return result;
};

Function.prototype.inherits = function(parent) {
  var d = 0, p = (this.prototype = new parent());
 
  this.prototype.uber = function(name) {
    var f, r, t = d, v = parent.prototype;
    if (t) {
      while (t) {
        v = v.constructor.prototype;
        t -= 1;
      }
      f = v[name];
    } else {
      f = p[name];
      if (f == this[name]) {
        f = v[name];
      }
    }
    d += 1;
    r = f.apply(this, Array.prototype.slice.apply(arguments, [1]));
    d -= 1;
    return r;
  };
};

if(!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(elt /*, from*/) {
    var len = this.length >>> 0;
    var from = Number(arguments[1]) || 0;
    
    from = (from < 0) ? Math.ceil(from) : Math.floor(from);
    if(from < 0) { from += len; }

    for(; from < len; from++) {
      if(from in this && this[from] === elt) {
        return from;
      }
    }
    
    return -1;
  };
}