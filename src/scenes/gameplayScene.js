var GamePlayScene = function(game, stage)
{
  var self = this;
  var dc = stage.drawCanv;

  //config
  var n_pipes;
  var gravity = 9.8; //m/s^2
  var env_temp  = 295; //k (72f = 295k)
  var fire_temp = 900; //k (900f = 755k)
  var gas_constant = 8.314;
  var air_molar_mass = 98.97; // g/mol
  var air_mass = 1.292; // kg/m^3
  var hot_air_balloon_baggage = 362874; //g
  var fps = 30;

  //utils
  var balloon_canv;
  var cloud_canv;
  var tree_canv;
  var mountain_canv;

  //doqueues
  var dragger;
  var presser;

  //objects
  var camera;
  var grid;
  var balloon;
  var arrow;
  var pipes;

  //scenery
  var bg;
  var mg;
  var fg;
  var ground;

  //ui
  var boost_pad;

  self.ready = function()
  {
    //config
    n_pipes = 10;

    //utils
    balloon_canv = document.createElement('canvas');
    balloon_canv.width = 100;
    balloon_canv.height = 100;
    balloon_canv.context = balloon_canv.getContext('2d');
    balloon_canv.context.fillStyle = "#FF0000";
    balloon_canv.context.beginPath();
    balloon_canv.context.arc(balloon_canv.width/2,balloon_canv.height/2,balloon_canv.width/2,0,2*Math.PI);
    balloon_canv.context.fill();

    cloud_canv = document.createElement('canvas');
    cloud_canv.width = 100;
    cloud_canv.height = 100;
    cloud_canv.context = cloud_canv.getContext('2d');
    cloud_canv.context.fillStyle = "#FFFFFF";
    cloud_canv.context.beginPath();
    cloud_canv.context.arc(cloud_canv.width/2,cloud_canv.height/2,cloud_canv.width/2,0,2*Math.PI);
    cloud_canv.context.fill();

    mountain_canv = document.createElement('canvas');
    mountain_canv.width = 100;
    mountain_canv.height = 100;
    mountain_canv.context = mountain_canv.getContext('2d');
    mountain_canv.context.fillStyle = "#888888";
    mountain_canv.context.beginPath();
    mountain_canv.context.moveTo(0,100);
    mountain_canv.context.lineTo(50,0);
    mountain_canv.context.lineTo(100,100);
    mountain_canv.context.fill();

    tree_canv = document.createElement('canvas');
    tree_canv.width = 100;
    tree_canv.height = 100;
    tree_canv.context = tree_canv.getContext('2d');
    tree_canv.context.fillStyle = "#996655";
    tree_canv.context.fillRect(40,20,20,80);
    tree_canv.context.fillStyle = "#00FF00";
    tree_canv.context.beginPath();
    tree_canv.context.arc(tree_canv.width/2,tree_canv.height/3,tree_canv.width/3,0,2*Math.PI);
    tree_canv.context.fill();

    //doqueues
    dragger = new Dragger({source:stage.dispCanv.canvas});
    presser = new Presser({source:stage.dispCanv.canvas});

    camera = new Camera();
    grid = new Obj(0,0,100,100);
    balloon = new Obj(0,0,10,10);
    balloon.bm = hot_air_balloon_baggage;
    arrow = new Obj();
    pipes = [];
    for(var i = 0; i < n_pipes; i++)
      pipes.push(new Obj(i*5,Math.random()*2-1,1,10));

    bg = []; for(var i = 0; i < 2; i++) { bg.push(new Obj(i*100,  8,  1,  1)); bg[i].draw = drawCloud;    }
    mg = []; for(var i = 0; i < 2; i++) { mg.push(new Obj(i* 50,  5,  5, 10)); mg[i].draw = drawMountain; }
    fg = []; for(var i = 0; i < 2; i++) { fg.push(new Obj(i* 10, -1,  5,  5)); fg[i].draw = drawTree;     }
    ground = new Obj();

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
    if(boost_pad.pressed) balloon.t = lerp(balloon.t,fire_temp,0.0001)
    else                  balloon.t = lerp(balloon.t, env_temp,0.0001);

    var gas_constant = 8.314;
    var air_molar_mass = 98.97; // g/mol
    var air_density = 1292;     // g/m^3
    var displaced_mass = air_density*balloon.v;
    var air_moles = displaced_mass/air_molar_mass;
    var air_pressure = (air_moles*gas_constant*env_temp)/balloon.v;

    balloon.m = air_molar_mass*air_pressure*balloon.v/(gas_constant*balloon.t)

    //accel     =               lift                             weight
    balloon.wya = ((air_density*balloon.v*gravity) - (balloon.m+balloon.bm)*gravity)/((balloon.m+balloon.bm)*fps);
    console.log(balloon.wya);
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

    ground.wx = 0;
    ground.wy = -1;
    ground.ww = 1;
    ground.wh = 2;

    //collision
    for(var i = 0; i < n_pipes; i++)
      pipes[i].colliding = queryRectCollide(balloon,pipes[i]);

    //cam track
    camera.wx = balloon.wx;
    if(balloon.wy > 40)
    {
      camera.wh = 100+((balloon.wy-40)*2);
      camera.ww = camera.wh;
    }

    //faux parallax
    for(var i = 0; i < bg.length; i++) bg[i].wx = bg[i].hwx+camera.wx*0.8;
    for(var i = 0; i < mg.length; i++) mg[i].wx = mg[i].hwx+camera.wx*0.5;
    for(var i = 0; i < fg.length; i++) fg[i].wx = fg[i].hwx+camera.wx*0.2;

    //screen space resolution
    screenSpace(camera,dc,balloon);
    screenSpace(camera,dc,arrow);
    for(var i = 0; i < n_pipes;   i++) screenSpace(camera,dc,pipes[i]);
    for(var i = 0; i < bg.length; i++) screenSpace(camera,dc,bg[i]);
    for(var i = 0; i < mg.length; i++) screenSpace(camera,dc,mg[i]);
    for(var i = 0; i < fg.length; i++) screenSpace(camera,dc,fg[i]);
    screenSpace(camera,dc,ground);
    screenSpace(camera,dc,grid);
  }

  self.draw = function()
  {
    //sky
    dc.context.fillStyle = "#8899BB";
    dc.context.fillRect(0,0,dc.width,dc.height);
    for(var i = 0; i < bg.length; i++) bg[i].draw(bg[i]);
    for(var i = 0; i < mg.length; i++) mg[i].draw(mg[i]);
    //ground
    dc.context.fillStyle = "#88FFAA";
    dc.context.fillRect(0,ground.y,dc.width,dc.height-ground.y);
    for(var i = 0; i < fg.length; i++) fg[i].draw(fg[i]);

    drawBalloon(balloon);
    drawArrow(arrow);
    for(var i = 0; i < n_pipes; i++) drawPipe(pipes[i]);
    drawGrid(grid);

/*
    var o = new Obj();
    o.x = 10;
    o.y = 10;
    o.w = 10;
    o.h = 10;
    drawMountain(o);
*/
  };

  self.cleanup = function()
  {
  };

  var Camera = function()
  {
    var self = this;

    self.wx = 0;
    self.wy = 0;
    self.ww = 100; //1 = -0.5 -> 0.5
    self.wh = 100; //1 = -0.5 -> 0.5
  }

  var drawObj = function(obj){};
  var Obj = function(wx,wy,ww,wh)
  {
    var self = this;

    if(wx == undefined) wx = 0;
    if(wy == undefined) wy = 0;
    if(ww == undefined) ww = 1;
    if(wh == undefined) wh = 1;

    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    //'home' world position (in case of need of relative positioning)
    self.hwx = wx;
    self.hwy = wy;
    self.hww = ww;
    self.hwh = wh;

    self.wx = wx;
    self.wy = wy;
    self.ww = ww;
    self.wh = wh;

    self.wxa = 0;
    self.wya = 0;
    self.wxv = 0.01;
    self.wyv = 0;

    self.m = 0;
    self.bm = 0; //baggage mass (added constant, whereas "mass" might fluctuate)
    self.t = env_temp;
    self.v = self.ww*self.wh*self.ww; //assume depth == width

    self.colliding = false;
    self.draw = drawObj; //to be replaced- hoping interpreter smart enough to pack w/ function ptr
  }

  var drawBalloon = function(obj)
  {
    dc.context.drawImage(balloon_canv,obj.x,obj.y,obj.w,obj.h);
    dc.context.fillStyle = "#000000";
    dc.context.fillText(obj.t,obj.x,obj.y+obj.h);
  }
  var drawArrow = function(obj)
  {
    dc.context.beginPath();
    dc.context.moveTo(obj.x      -obj.w/2,obj.y      -obj.h/2);
    dc.context.lineTo(obj.x+obj.w-obj.w/2,obj.y+obj.h-obj.h/2);
    dc.context.stroke();
  }
  var drawPipe = function(obj)
  {
    if(obj.colliding) dc.context.fillStyle = "#FF5500";
    else              dc.context.fillStyle = "#005500";
    dc.context.fillRect(obj.x,obj.y,obj.w,obj.h);
  }
  var drawGrid = function(obj)
  {
    for(var i = 0; i < 11; i++)
    {
      var x = lerp(obj.x,obj.x+obj.w,i/10);
      dc.context.beginPath();
      dc.context.moveTo(x,obj.y);
      dc.context.lineTo(x,obj.y+obj.h);
      dc.context.stroke();
      var y = lerp(obj.y,obj.y+obj.h,i/10);
      dc.context.beginPath();
      dc.context.moveTo(obj.x,y);
      dc.context.lineTo(obj.x+obj.w,y);
      dc.context.stroke();
    }
  }
  var drawCloud    = function(obj) { dc.context.drawImage(cloud_canv,obj.x,obj.y,obj.w,obj.h); }
  var drawMountain = function(obj) { dc.context.drawImage(mountain_canv,obj.x,obj.y,obj.w,obj.h); }
  var drawTree     = function(obj) { dc.context.drawImage(tree_canv,obj.x,obj.y,obj.w,obj.h); }
};

