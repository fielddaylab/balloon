var GamePlayScene = function(game, stage)
{
  var self = this;
  var dc = stage.drawCanv;

  //config
  var n_pipes;
  var gravity;

  //utils
  var balloon_canv;

  //doqueues
  var dragger;
  var clicker;

  //objects
  var camera;
  var grid;
  var balloon;
  var pipes;

  //ui
  var boost_button;

  self.ready = function()
  {
    //config
    n_pipes = 10;
    gravity = 0.01;

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

    camera = new Camera();
    grid = new Grid();
    balloon = new Balloon();
    pipes = [];
    for(var i = 0; i < n_pipes; i++)
      pipes.push(new Pipe(i*5,Math.random()*2-1,1,10));

    boost_button = new ButtonBox(0,0,dc.width,dc.height,function(){ balloon.wyv = 0.2; });
    clicker.register(boost_button);
  };

  self.tick = function()
  {
    dragger.flush();
    clicker.flush();

    //gravity
    balloon.wyv -= gravity;

    //motion
    balloon.wx += balloon.wxv;
    balloon.wy += balloon.wyv;

    //cam track
    camera.wx = balloon.wx;
    if(balloon.wy > 5)
    {
      camera.wh = 10+((balloon.wy-5)*2);
      camera.ww = camera.wh;
    }
    if(balloon.wy < -5)
    {
      camera.wh = 10+((-balloon.wy-5)*2);
      camera.ww = camera.wh;
    }
    screenSpace(camera,balloon);
    for(var i = 0; i < n_pipes; i++)
      screenSpace(camera,pipes[i]);
    screenSpace(camera,grid);

    //collision
    for(var i = 0; i < n_pipes; i++)
      pipes[i].colliding = queryRectCollide(balloon,pipes[i]);
  }

  self.draw = function()
  {
    dc.context.drawImage(balloon_canv,balloon.x,balloon.y,balloon.w,balloon.h);
    for(var i = 0; i < n_pipes; i++)
    {
      if(pipes[i].colliding) dc.context.fillStyle = "#FF5500";
      else                   dc.context.fillStyle = "#005500";
      dc.context.fillRect(pipes[i].x,pipes[i].y,pipes[i].w,pipes[i].h);
    }

    grid.draw();
  };

  self.cleanup = function()
  {
  };

  var Camera = function()
  {
    var self = this;

    self.wx = 0;
    self.wy = 0;
    self.ww = 10; //1 = -0.5 -> 0.5
    self.wh = 10; //1 = -0.5 -> 0.5
  }

  var Grid = function()
  {
    var self = this;

    self.wx = 0;
    self.wy = 0;
    self.ww = 10;
    self.wh = 10;

    self.draw = function()
    {
      for(var i = 0; i < 11; i++)
      {
        var x = lerp(self.x,self.x+self.w,i/10);
        dc.context.beginPath();
        dc.context.moveTo(x,self.y);
        dc.context.lineTo(x,self.y+self.h);
        dc.context.stroke();
        var y = lerp(self.y,self.y+self.h,i/10);
        dc.context.beginPath();
        dc.context.moveTo(self.x,y);
        dc.context.lineTo(self.x+self.w,y);
        dc.context.stroke();
      }
    }
  }

  var Balloon = function()
  {
    var self = this;

    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.wx = 0;
    self.wy = 0;
    self.ww = 1;
    self.wh = 1;

    self.wxv = 0.01;
    self.wyv = 0;
    self.m = 1;
  }

  var Pipe = function(wx, wy, ww, wh)
  {
    var self = this;

    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.wx = wx;
    self.wy = wy;
    self.ww = ww;
    self.wh = wh;

    self.colliding = false;
  }

  var screenSpace = function(cam, obj)
  {
    obj.w = (obj.ww/cam.ww)*dc.width;
    obj.h = (obj.wh/cam.wh)*dc.height;
    obj.x = (((( obj.wx-obj.ww/2)-cam.wx)+(cam.ww/2))/cam.ww)*dc.width;
    obj.y = ((((-obj.wy-obj.wh/2)-cam.wy)+(cam.wh/2))/cam.wh)*dc.height;
  }
};

