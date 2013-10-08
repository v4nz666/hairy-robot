function Control() {
  return {
    x: 0,
    y: 0,
    w: 100,
    h: 20,
    visible: true,
    forecolour: 'white',
    backcolour: null,
    bordercolour: null,
    onclick: null,
    
    renderPre: function(ctx) {
      if(this.visible) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        if(this.backcolour !== null) {
          ctx.fillStyle = this.backcolour;
          ctx.fillRect(0, 0, this.w, this.h);
        }
        
        return true;
      }
      
      return false;
    },
    
    renderPost: function(ctx) {
      if(this.bordercolour !== null) {
        ctx.strokeStyle = this.bordercolour;
        ctx.strokeRect(0, 0, this.w, this.h);
      }
      
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

function Label() { }
Label.prototype = new Control();
Label.prototype.text = '';
Label.prototype.textAlign = 'center';
Label.prototype.textBaseline = 'middle';
Label.prototype.renderControl = function(ctx) {
  ctx.fillStyle = this.forecolour;
  ctx.textAlign = this.textAlign;
  ctx.textBaseline = this.textBaseline;
  ctx.fillText(this.text, this.w / 2, this.h / 2);
}

function Button() { }
Button.prototype = new Label();
Button.prototype.backcolour = 'gray';
Button.prototype.bordercolour = 'white';

function Textbox() { }
Textbox.prototype = new Label();
Textbox.prototype.backcolour = 'gray';
Textbox.prototype.bordercolour = 'white';