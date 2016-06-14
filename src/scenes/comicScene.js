var ComicScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var ctx = stage.drawCanv.context;

  var clicker;

  var imgs;
  var cur_img;
  var next_btn;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    imgs = []; var i = 0;
    imgs[i] = new Image(); imgs[i].src = ""; i++;
    //imgs[i] = new Image(); imgs[i].src = ""; i++;

    next_btn = new ButtonBox(0,0,dc.width,dc.height,function(evt){cur_img++; if(cur_img >= imgs.length) game.nextScene();});
    clicker.register(next_btn);

    cur_img = 0;
  };

  self.tick = function()
  {
    clicker.tick();
  };

  self.draw = function()
  {
    ctx.drawImage(imgs[cur_img],20,20,dc.width-40,dc.height-40);
  };

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };
};
