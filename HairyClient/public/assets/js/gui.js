function Control() {
  return {
    x: 0,
    y: 0,
    w: 100,
    h: 20,
    visible: true,
    forecolour: 'white',
    backcolour: 'gray',
    bordercolour: 'white',
    onclick: null,
    
    renderPre: function(ctx) {
      if(this.visible) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.backcolour;
        ctx.fillRect(0, 0, this.w, this.h);
        return true;
      }
      
      return false;
    },
    
    renderPost: function(ctx) {
      ctx.strokeStyle = this.bordercolour;
      ctx.strokeRect(0, 0, this.w, this.h);
      ctx.restore();
    },
    
    renderControl: function(ctx) { },
    render: function(ctx) {
      if(this.renderPre(ctx)) {
        this.renderControl(ctx);
        this.renderPost(ctx);
      }
    },
    
    click: function() {
      if(this.onclick !== null) {
        this.onclick();
      }
    }
  }
}

function Button() { }
Button.prototype = new Control();
Button.prototype.text = '';
Button.prototype.textAlign = 'center';
Button.prototype.textBaseline = 'middle';
Button.prototype.renderControl = function(ctx) {
  ctx.fillStyle = this.forecolour;
  ctx.textAlign = this.textAlign;
  ctx.textBaseline = this.textBaseline;
  ctx.fillText(this.text, this.w / 2, this.h / 2);
}

function Textbox() { }
Textbox.prototype = new Control();
Textbox.prototype.text = '';
Textbox.prototype.textAlign = 'center';
Textbox.prototype.textBaseline = 'middle';
Textbox.prototype.renderControl = function(ctx) {
  ctx.fillStyle = this.forecolour;
  ctx.textAlign = this.textAlign;
  ctx.textBaseline = this.textBaseline;
  ctx.fillText(this.text, this.w / 2, this.h / 2);
}