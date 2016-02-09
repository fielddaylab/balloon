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
  var presser;

  //objects
  var camera;
  var grid;
  var balloon;
  var arrow;
  var pipes;

  //ui
  var boost_pad;

  self.ready = function()
  {
    //config
    n_pipes = 10;
    gravity = 0.002;

    //utils
    balloon_canv = document.createElement('canvas');
    balloon_canv.width = 100;
    balloon_canv.height = 100;
    balloon_canv.context = balloon_canv.getContext('2d');
    balloon_canv.context.fillStyle = "#FF0000";
    balloon_canv.context.beginPath();
    balloon_canv.context.arc(balloon_canv.width/2,balloon_canv.height/2,balloon_canv.width/2,0,2*Math.PI);
    balloon_canv.context.fill();

    //doqueues
    dragger = new Dragger({source:stage.dispCanv.canvas});
    presser = new Presser({source:stage.dispCanv.canvas});

    camera = new Camera();
    grid = new Grid();
    balloon = new Balloon();
    arrow = new Arrow();
    pipes = [];
    for(var i = 0; i < n_pipes; i++)
      pipes.push(new Pipe(i*5,Math.random()*2-1,1,10));

    boost_pad = new function()
    {
      var self = this;

      self.x = 0;
      self.y = 0;
      self.w = dc.width;
      self.h = dc.height;

      self.pressed = false;
      self.press = function(evt) { self.pressed = true; }
      self.unpress = function(evt) { self.pressed = false; }
    }
    presser.register(boost_pad);
  };

  self.tick = function()
  {
    dragger.flush();
    presser.flush();

    //temp
    if(boost_pad.pressed) balloon.t += 0.001;
    else balloon.t = lerp(balloon.t,1,0.001);

    //accel     =         lift             weight
    balloon.wya = (balloon.t-1)*0.001 + -gravity;
    balloon.wyv += balloon.wya;

    //motion
    balloon.wx += balloon.wxv;
    balloon.wy += balloon.wyv;
    if(balloon.wy < -10)
    {
      balloon.wy = -10;
      if(balloon.wyv < 0) balloon.wyv = 0;
    }

    arrow.wx = balloon.wx;
    arrow.wy = balloon.wy;
    arrow.ww = 0;
    arrow.wh = balloon.wya*1000;

    //cam track
    camera.wx = balloon.wx;
    if(balloon.wy > 4)
    {
      camera.wh = 10+((balloon.wy-4)*2);
      camera.ww = camera.wh;
    }
    if(balloon.wy < -4)
    {
      camera.wh = 10+((-balloon.wy-4)*2);
      camera.ww = camera.wh;
    }
    screenSpace(camera,dc,balloon);
    screenSpace(camera,dc,arrow);
    for(var i = 0; i < n_pipes; i++)
      screenSpace(camera,dc,pipes[i]);
    screenSpace(camera,dc,grid);

    //collision
    for(var i = 0; i < n_pipes; i++)
      pipes[i].colliding = queryRectCollide(balloon,pipes[i]);
  }

  self.draw = function()
  {
    //sky
    dc.context.fillStyle = "#8899AA";
    dc.context.fillRect(0,0,dc.width,dc.height);

    //balloon
    dc.context.drawImage(balloon_canv,balloon.x,balloon.y,balloon.w,balloon.h);
    dc.context.fillStyle = "#000000";
    dc.context.fillText(balloon.t,balloon.x,balloon.y+balloon.h);

    //arrow
    dc.context.beginPath();
    dc.context.moveTo(arrow.x        -arrow.w/2,arrow.y        -arrow.h/2);
    dc.context.lineTo(arrow.x+arrow.w-arrow.w/2,arrow.y+arrow.h-arrow.h/2);
    dc.context.stroke();

    //pipes
    for(var i = 0; i < n_pipes; i++)
    {
      if(pipes[i].colliding) dc.context.fillStyle = "#FF5500";
      else                   dc.context.fillStyle = "#005500";
      dc.context.fillRect(pipes[i].x,pipes[i].y,pipes[i].w,pipes[i].h);
    }

    //ui
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

    self.wya = 0;
    self.wxv = 0.01;
    self.wyv = 0;
    self.m = 1;
    self.t = 1;
  }
  var Arrow = function()
  {
    var self = this;

    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.wx = 0;
    self.wy = 0;
    //w/h better read as offx/offy
    self.ww = 1;
    self.wh = 1;
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
};

