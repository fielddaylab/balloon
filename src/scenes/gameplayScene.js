var GamePlayScene = function(game, stage)
{
  var self = this;
  var dc = stage.drawCanv;

  //config
  var n_pipes;
  var gravity = 9.8; //m/s^2
  var env_temp  = 295; //k (72f = 295k)
  var fire_temp = 900; //k (900f = 755k)
  var air_molar_mass = 98.97; // g/mol
  var air_mass = 1.292; // kg/m^3
  var hot_air_balloon_baggage = 362874; //g
  var specific_gas_constant = 287.058; // J/(kg*K) //for dry air
  var gas_constant = 8.314;

  var air_density = 1292; // g/m^3 //externally found
  var densityForPressure = function(pressure) //density = kg/m^3, pressure = Pa
  {
    return pressure / (specific_gas_constant * env_temp);
  }

  var air_pressure_0 = 101.3; //kPa
  var air_pressure_2400 = 75.2; //kPa
  var air_density_0    = (densityForPressure(air_pressure_0   *1000))*1000;
  var air_density_2400 = (densityForPressure(air_pressure_2400*1000))*1000;

  var fps = 30;

  //state
  var rope_cut;

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
  var vel_arrow;
  var acc_arrow;
  var arrow_separator;
  var pipes;

  //scenery
  var bg;
  var mg;
  var fg;
  var ground;

  //ui
  var boost_pad;
  var flap_pad;
  var cut_pad;

  self.ready = function()
  {
    //config
    n_pipes = 10;

    //state
    rope_cut = false;

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
    camera.wh = 30;
    camera.ww = camera.wh*2;
    grid = new Obj(0,0,100,100);
    balloon = new Obj(0,0,13,13);
    balloon.bm = hot_air_balloon_baggage;
    vel_arrow = new Obj();
    acc_arrow = new Obj();
    arrow_separator = new Obj();

    pipes = []; for(var i = 0; i < n_pipes; i++) pipes.push(new Obj(i*50,(Math.random()*2-1)*10,5,20));

    bg = []; for(var i = 0; i < 100; i++) { bg.push(new Obj((i+Math.random())* 10, Math.random()*5+ 8,   3,  2)); bg[i].draw = drawCloud;    }
    mg = []; for(var i = 0; i < 100; i++) { mg.push(new Obj((i+Math.random())* 50,                  5,  10, 10)); mg[i].draw = drawMountain; }
    fg = []; for(var i = 0; i < 100; i++) { fg.push(new Obj((i+Math.random())* 20,                 -1,   8,  8)); fg[i].draw = drawTree;     }
    ground = new Obj();

    boost_pad = new ButtonBox(10,10,20,20,function(){});
    flap_pad  = new ButtonBox(10,40,20,20,function(){});
    cut_pad  = new ButtonBox(10,70,20,20,function(){});
    presser.register(boost_pad);
    presser.register(flap_pad);
    presser.register(cut_pad);
  };

  self.tick = function()
  {
    dragger.flush();
    presser.flush();

         if(boost_pad.down) balloon.t = lerp(balloon.t,fire_temp,0.0001)
    else if(flap_pad.down)  balloon.t = lerp(balloon.t, env_temp,0.001)
    else                    balloon.t = lerp(balloon.t, env_temp,0.0001);

    if(cut_pad.down) rope_cut = true;

    var air_density_at_height = mapVal(0,2400,air_density_0,air_density_2400,balloon.wy);

    var displaced_mass = air_density_at_height*balloon.v;
    var air_moles = displaced_mass/air_molar_mass;
    var air_pressure = (air_moles*gas_constant*env_temp)/balloon.v;

    balloon.m = air_molar_mass*air_pressure*balloon.v/(gas_constant*balloon.t)

    //accel     =               lift                             weight
    balloon.wya = ((air_density_at_height*balloon.v*gravity) - (balloon.m+balloon.bm)*gravity)/((balloon.m+balloon.bm)*fps);
    balloon.wyv += balloon.wya;
    balloon.wyv *= 0.99;

    //motion
    balloon.wx += balloon.wxv;
    balloon.wy += balloon.wyv;

    if(balloon.wy < -10)
    {
      balloon.wy = -10;
      if(balloon.wyv < 0) balloon.wyv = 0;
    }
    if(balloon.wy > 0 && !rope_cut)
    {
      balloon.wy  = 0;
      balloon.wyv = 0;
    }

    if(balloon.wy <= 0) balloon.wxv = 0;
    else                balloon.wxv = 0.05;

    vel_arrow.wx = balloon.wx;
    vel_arrow.wy = balloon.wy;
    vel_arrow.ww = 0;
    vel_arrow.wh = balloon.wyv*10;
    acc_arrow.wx = balloon.wx;
    acc_arrow.wy = balloon.wy;
    acc_arrow.ww = 0;
    acc_arrow.wh = balloon.wya*1000;
    arrow_separator.wx = balloon.wx;
    arrow_separator.wy = balloon.wy;
    arrow_separator.ww = 10;
    arrow_separator.wh = 0;

    ground.wx = 0;
    ground.wy = -1;
    ground.ww = 1;
    ground.wh = 2;

    //collision
    for(var i = 0; i < n_pipes; i++)
      pipes[i].colliding = queryRectCollide(balloon,pipes[i]);

    //cam track
    camera.wx = balloon.wx;
    if(balloon.wy > 5)
    {
      camera.wh = 30+((balloon.wy-5)*2);
      camera.ww = camera.wh*2;
    }

    //faux parallax
    for(var i = 0; i < bg.length; i++) bg[i].wx = bg[i].hwx+camera.wx*0.8;
    for(var i = 0; i < mg.length; i++) mg[i].wx = mg[i].hwx+camera.wx*0.5;
    for(var i = 0; i < fg.length; i++) fg[i].wx = fg[i].hwx+camera.wx*0.2;

    //screen space resolution
    screenSpace(camera,dc,balloon);
    screenSpace(camera,dc,vel_arrow);
    screenSpace(camera,dc,acc_arrow);
    screenSpace(camera,dc,arrow_separator);
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

    //for(var i = 0; i < n_pipes; i++) drawPipe(pipes[i]);
    //drawGrid(grid);

    drawBalloon(balloon);
    dc.context.strokeStyle = "#00FF00";
    drawArrow(vel_arrow);
    dc.context.strokeStyle = "#0000FF";
    drawArrow(acc_arrow);
    dc.context.strokeStyle = "#000000";
    drawArrow(arrow_separator);

    boost_pad.draw(dc);
    flap_pad.draw(dc);
    cut_pad.draw(dc);
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
    self.wh = 1; //1 = -0.5 -> 0.5
    self.ww = 1; //1 = -0.5 -> 0.5
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
    self.wxv = 0;
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
    dc.context.textAlign = "right";
    var dispTemp = Math.round((obj.t*(9/5)-459)*100)/100; //nn.nn
    dc.context.fillText(Math.floor(dispTemp)+".",obj.x+obj.w/2,obj.y+obj.h/2-1);
    dc.context.textAlign = "left";
    var decString = (Math.round((dispTemp-Math.floor(dispTemp))*100)/100)+"°";
    dc.context.fillText(decString.substring(decString.indexOf(".")+1),obj.x+obj.w/2,obj.y+obj.h/2-1);
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

