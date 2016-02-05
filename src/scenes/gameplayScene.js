var GamePlayScene = function(game, stage)
{
  var self = this;
  var dc = stage.drawCanv;

  //utils
  var balloon_canv;

  //doqueues
  var dragger;
  var clicker;

  //objects
  var balloon;

  self.ready = function()
  {
    //utils
    balloon_canv = document.createElement('canvas');
    balloon_canv.width = 20;
    balloon_canv.height = 20;
    balloon_canv.context = balloon_canv.getContext('2d');
    balloon_canv.context.fillStyle = "#FF0000";
    balloon_canv.context.beginPath();
    balloon_canv.context.arc(balloon_canv.width/2,balloon_canv.height/2,balloon_canv.width/2,0,2*Math.PI);
    balloon_canv.context.fill();

    //doqueues
    dragger = new Dragger({source:stage.dispCanv.canvas});
    clicker = new Clicker({source:stage.dispCanv.canvas});

    balloon = new Balloon();
  };

  self.tick = function()
  {
    dragger.flush();
    clicker.flush();
  }

  self.draw = function()
  {
      dc.context.fillStyle = "rgba(255,0,0,0.5)";
      balloon.x = balloon.wx*dc.width-balloon.w/2;
      balloon.y = dc.height-(balloon.wy*dc.height)-balloon.h/2;
      balloon.w = balloon.ww*dc.width;
      balloon.h = balloon.wh*dc.height;
      dc.context.drawImage(balloon_canv,balloon.x,balloon.y,balloon.w,balloon.h);
  };

  self.cleanup = function()
  {
  };

  var Balloon = function()
  {
    var self = this;

    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.wx = 0.5;
    self.wy = 0.5;
    self.wxv = 0;
    self.wyv = 0;
    self.ww = 1;
    self.wh = 1;
    self.m = 1;
  }
};

