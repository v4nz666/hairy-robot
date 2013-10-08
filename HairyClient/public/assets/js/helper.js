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