var GamePlayScene = function(game, stage)
{
  var self = this;
  var dc = stage.drawCanv;

  //config
  var part_damp = 0.2;

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
  var tempForHeight = function(ground,height) //k
  {
    return ground-(9.8*height/1000);
  }
  var pressureForHeight = function(height) //Pa
  {
    return (mapVal(0,2400,air_pressure_0,air_pressure_2400,balloon.wy))*1000;
  }
  var densityForHeight = function(height) //g/m^3
  {
    return (pressureForHeight(height) / (specific_gas_constant * tempForHeight(env_temp,height)))*1000;
  }

  var air_pressure_0 = 101.3; //kPa
  var air_pressure_2400 = 75.2; //kPa

  var fps = 30;

  //utils
  var shadow_canv;
  var flame_canv;
  var basket_canv;
  var balloon_canv;
  var cloud_canv;
  var mountain_canv;
  var tree_canv;
  var part_canv;
  var gauge_canv;
  var arrow_canv;

  //doqueues
  var dragger;
  var presser;
  var dom;
  var bmwrangler;

  ENUM = 0;
  var IGNORE_INPUT = ENUM; ENUM++;
  var RESUME_INPUT = ENUM; ENUM++;
  var input_state;

  //objects
  var camera;
  var tmp; //used for any non-persistent calcs
  var grid;
  var shadow;
  var flame;
  var basket;
  var balloon;
  var vel_arrow;
  var acc_arrow;
  var arrow_separator;
  var pipes;
  var balloon_parts;
  var air_parts;

  //scenery
  var bg; var bgi; var bgsep; var bgcam;
  var mg; var mgi; var mgsep; var mgcam;
  var fg; var fgi; var fgsep; var fgcam;
  var ground;

  //ui
  var burn_pad;
  var flap_pad;
  var cut_pad;

  //gauges
  var outside_temp_gauge;
  var inside_temp_gauge;
  var weight_gauge;
  var volume_gauge;
  var density_gauge;
  var bouyancy_gauge;
  var altitude_gauge;
  var xvel_gauge;
  var yvel_gauge;
  var fuel_gauge;

  //data
  var rope_cut;
  var wind;
  var part_disp;
  var fuel;

  self.ready = function()
  {
    //config
    n_pipes = 10;

    //state
    rope_cut = false;
    fuel = 40;

    //utils
    shadow_canv = document.createElement('canvas');
    shadow_canv.width = 100;
    shadow_canv.height = 100;
    shadow_canv.context = shadow_canv.getContext('2d');
    shadow_canv.context.fillStyle = "#FF0000";
    shadow_canv.context.globalAlpha=0.1;
    shadow_canv.context.beginPath();
    shadow_canv.context.arc(shadow_canv.width/2,shadow_canv.height/2,shadow_canv.width/2,0,2*pi);
    shadow_canv.context.fill();

    flame_canv = document.createElement('canvas');
    flame_canv.width = 100;
    flame_canv.height = 100;
    flame_canv.context = flame_canv.getContext('2d');
    flame_canv.context.fillStyle = "#FF7700";
    flame_canv.context.globalAlpha=0.8;
    flame_canv.context.beginPath();
    flame_canv.context.arc(flame_canv.width/2,flame_canv.height/2,flame_canv.width/2,0,2*pi);
    flame_canv.context.fill();

    basket_canv = document.createElement('canvas');
    basket_canv.width = 100;
    basket_canv.height = 100;
    basket_canv.context = basket_canv.getContext('2d');
    basket_canv.context.fillStyle = "#AA8833";
    basket_canv.context.fillRect(basket_canv.width/3,basket_canv.height*3/4,basket_canv.width/3,basket_canv.height/4);
    basket_canv.context.lineWidth = 3;
    basket_canv.context.beginPath();
    basket_canv.context.moveTo(basket_canv.width/3,basket_canv.height*3/4);
    basket_canv.context.lineTo(basket_canv.width/5,basket_canv.height/3);
    basket_canv.context.moveTo(basket_canv.width*2/3,basket_canv.height*3/4);
    basket_canv.context.lineTo(basket_canv.width*4/5,basket_canv.height/3);
    basket_canv.context.stroke();

    balloon_canv = document.createElement('canvas');
    balloon_canv.width = 100;
    balloon_canv.height = 100;
    balloon_canv.context = balloon_canv.getContext('2d');
    balloon_canv.context.fillStyle = "#FF0000";
    balloon_canv.context.beginPath();
    balloon_canv.context.arc(balloon_canv.width/2,balloon_canv.height/2,balloon_canv.width/2,0,2*pi);
    balloon_canv.context.fill();

    cloud_canv = document.createElement('canvas');
    cloud_canv.width = 100;
    cloud_canv.height = 100;
    cloud_canv.context = cloud_canv.getContext('2d');
    cloud_canv.context.fillStyle = "#FFFFFF";
    cloud_canv.context.beginPath();
    cloud_canv.context.arc(cloud_canv.width/2,cloud_canv.height/2,cloud_canv.width/2,0,2*pi);
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
    tree_canv.context.arc(tree_canv.width/2,tree_canv.height/3,tree_canv.width/3,0,2*pi);
    tree_canv.context.fill();

    part_canv = document.createElement('canvas');
    part_canv.width = 4;
    part_canv.height = 4;
    part_canv.context = part_canv.getContext('2d');
    part_canv.context.fillStyle = "#FFFFFF";
    part_canv.context.beginPath();
    part_canv.context.arc(part_canv.width/2,part_canv.height/2,part_canv.width/2,0,2*pi);
    part_canv.context.fill();

    gauge_canv = document.createElement('canvas');
    gauge_canv.width = 100;
    gauge_canv.height = 100;
    gauge_canv.context = gauge_canv.getContext('2d');
    gauge_canv.context.fillStyle = "#000000";
    gauge_canv.context.beginPath();
    gauge_canv.context.arc(gauge_canv.width/2,gauge_canv.height/2,gauge_canv.width/2,0,2*pi);
    gauge_canv.context.fill();
    var mint = pi*(8/9);
    var maxt = pi*(1/9);
    gauge_canv.context.fillStyle = "#FFFFFF";
    gauge_canv.context.beginPath();
    gauge_canv.context.arc(gauge_canv.width/2,gauge_canv.height/2,gauge_canv.width/2*0.9,0,2*pi);
    gauge_canv.context.fill();
    gauge_canv.context.fillStyle = "#88FF88";
    gauge_canv.context.beginPath();
    gauge_canv.context.moveTo(gauge_canv.width/2,gauge_canv.height/2)
    gauge_canv.context.arc(gauge_canv.width/2,gauge_canv.height/2,gauge_canv.width/2,pi+mint,pi+maxt,true);
    gauge_canv.context.fill();
    gauge_canv.context.strokeStyle = "#000000";
    gauge_canv.context.lineWidth = 8;
    gauge_canv.context.beginPath();
    gauge_canv.context.arc(gauge_canv.width/2,gauge_canv.height/2,gauge_canv.width/2*0.9,0,2*pi);
    gauge_canv.context.stroke();

    arrow_canv = document.createElement('canvas');
    arrow_canv.width = 100;
    arrow_canv.height = 100;
    arrow_canv.context = arrow_canv.getContext('2d');
    arrow_canv.context.fillStyle = "#00FF00";
    arrow_canv.context.fillRect(arrow_canv.width/4,arrow_canv.height/4,arrow_canv.width/2,arrow_canv.height);
    arrow_canv.context.beginPath();
    arrow_canv.context.moveTo(0,arrow_canv.height/4);
    arrow_canv.context.lineTo(arrow_canv.width/2,0);
    arrow_canv.context.moveTo(arrow_canv.width,arrow_canv.height/4);
    arrow_canv.context.fill();

    //doqueues
    dragger = new Dragger({source:stage.dispCanv.canvas});
    presser = new Presser({source:stage.dispCanv.canvas});
    bmwrangler = new BottomMessageWrangler();
    input_state = RESUME_INPUT;

    camera = new Camera();
    camera.wh = 30;
    camera.ww = camera.wh*2;
    bgcam = new Camera();
    mgcam = new Camera();
    fgcam = new Camera();
    tickParallax();
    grid = new Obj(0,0,100,100);
    tmp = new Obj(0,0,0,0);
    shadow = new Obj(0,0,10,2);
    flame = new Obj(0,0,2,2);
    basket = new Obj(0,0,10,10);
    balloon = new Obj(0,0,13,13);
    //balloon.t = 340;
    balloon.bm = hot_air_balloon_baggage;
    vel_arrow = new Obj();
    acc_arrow = new Obj();
    arrow_separator = new Obj();

    screenSpace(camera,dc,balloon); //needs balloon space to init parts
    balloon_parts = [];
    for(var i = 0; i < 500; i++)
      balloon_parts.push(new Part());
    initBalloonParticles();
    air_parts = [];
    for(var i = 0; i < 5000; i++)
      air_parts.push(new Part());
    initAirParticles();

    pipes = []; for(var i = 0; i < n_pipes; i++) pipes.push(new Obj(i*50,(rand()*2-1)*10,5,20));

    bgsep = 10; bg = []; for(var i = 0; i < 30; i++) { bg.push(new Obj(i*bgsep+rand0()*bgsep, rand0()*5+10,  3,  2)); bg[i].draw = drawCloud;    } bgi = 0;
    mgsep = 50; mg = []; for(var i = 0; i < 10; i++) { mg.push(new Obj(i*mgsep+rand0()*mgsep, rand0()*2+ 3, 10, 10)); mg[i].draw = drawMountain; } mgi = 0;
    fgsep = 20; fg = []; for(var i = 0; i < 30; i++) { fg.push(new Obj(i*fgsep+rand0()*fgsep, rand0()*1+-1,  8,  8)); fg[i].draw = drawTree;     } fgi = 0;
    centerGrounds();
    ground = new Obj();

    burn_pad = new ButtonBox(10,10,60,40,function(){});
    flap_pad = new ButtonBox(10,60,60,40,function(){});
    cut_pad  = new ButtonBox(10,110,60,20,function(){});
    presser.register(burn_pad);
    presser.register(flap_pad);
    presser.register(cut_pad);

    var w = dc.width/10;
    var mint = pi*(8/9);
    var maxt = pi*(1/9);
    outside_temp_gauge = new Gauge("Outside Temp",w*0,dc.height-w*5/9,w,w,mint,maxt,250,380,function(v){ env_temp = v; });
    inside_temp_gauge  = new Gauge("Inside Temp", w*1,dc.height-w*5/9,w,w,mint,maxt,250,380,function(v){ balloon.t = v; });
    weight_gauge       = new Gauge("Weight",      w*2,dc.height-w*5/9,w,w,mint,maxt,2200000,3000000,function(v){ balloon.bm = v-balloon.m; });
    volume_gauge       = new Gauge("Volume",      w*3,dc.height-w*5/9,w,w,mint,maxt,1000,4000,function(v){ balloon.v = v; balloon.ww = sqrt(balloon.v/(balloon.wh)); });
    density_gauge      = new Gauge("Density",     w*4,dc.height-w*5/9,w,w,mint,maxt,950,1200,function(v){ });
    bouyancy_gauge     = new Gauge("Net Force",   w*5,dc.height-w*5/9,w,w,mint,maxt,-.03,.03,function(v){ balloon.wya = v; });
    altitude_gauge     = new Gauge("Altitude",    w*6,dc.height-w*5/9,w,w,mint,maxt,0,100,function(v){ balloon.wy = v; });
    xvel_gauge         = new Gauge("Horiz. Vel.", w*7,dc.height-w*5/9,w,w,mint,maxt,-1,1,function(v){ balloon.wxv = v; });
    yvel_gauge         = new Gauge("Vert. Vel.",  w*8,dc.height-w*5/9,w,w,mint,maxt,-1,1,function(v){ balloon.wyv = v; });
    fuel_gauge         = new Gauge("Fuel",        w*9,dc.height-w*5/9,w,w,mint,maxt,0,40,function(v){ fuel = v; });

    dragger.register(outside_temp_gauge);
    dragger.register(inside_temp_gauge);
    dragger.register(weight_gauge);
    dragger.register(volume_gauge);
    dragger.register(density_gauge);
    dragger.register(bouyancy_gauge);
    dragger.register(altitude_gauge);
    dragger.register(xvel_gauge);
    dragger.register(yvel_gauge);
    dragger.register(fuel_gauge);

    part_disp = 1;
    wind = [];
    for(var i = 0; i < 100; i++)
      wind[i] = 0.05+psin((99-i)/20);

    //setTimeout(function(){ pop(['hi there','this is a test','here we go','ok']); },1000);
  };

  var n_ticks = 0;
  self.tick = function()
  {
    n_ticks++;
    //part_disp = (sin(n_ticks/500)+1)/2;

    bmwrangler.tick();
    if(input_state == RESUME_INPUT)
    {
      dragger.flush();
      presser.flush();
    }
    else
    {
      dragger.ignore();
      presser.ignore();
    }

         if(burn_pad.down && fuel > 0) { balloon.t = lerp(balloon.t,fire_temp,0.0001); fuel -= 0.04; if(fuel < 0) fuel = 0; }
    else if(flap_pad.down)             { balloon.t = lerp(balloon.t, env_temp,0.001);  }
    else                               { balloon.t = lerp(balloon.t, env_temp,0.0001); }

    if(cut_pad.down) rope_cut = true;

    var air_density_at_height = densityForHeight(balloon.wy);

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

    if(balloon.wy < 0)
    {
      balloon.wy = 0;
      if(balloon.wyv < 0) balloon.wyv = 0;
    }
    if(balloon.wy > 2 && !rope_cut)
    {
      balloon.wy  = 2;
      balloon.wyv = 0;
    }

    if(balloon.wy <= 0 || !rope_cut) balloon.wxv = 0;
    else                             balloon.wxv = lerp(balloon.wxv,wind[min(floor(balloon.wy),wind.length-1)],0.1);

    vel_arrow.wx = balloon.wx-1;
    vel_arrow.wy = balloon.wy;
    vel_arrow.ww = 0;
    vel_arrow.wh = balloon.wyv*10;
    acc_arrow.wx = balloon.wx+1;
    acc_arrow.wy = balloon.wy;
    acc_arrow.ww = 0;
    acc_arrow.wh = balloon.wya*1000;
    arrow_separator.wx = balloon.wx-1;
    arrow_separator.wy = balloon.wy;
    arrow_separator.ww = 2;
    arrow_separator.wh = 0;

    basket.wx = balloon.wx;
    basket.wy = balloon.wy-balloon.wh/2;

    shadow.wx = balloon.wx;
    shadow.wy = 0-balloon.wh/2-basket.wh/2;

    flame.wx = balloon.wx;
    flame.wy = balloon.wy-balloon.wh/2;

    ground.wx = 0;
    ground.wy = -1;
    ground.ww = 1;
    ground.wh = 2;

    //collision
    for(var i = 0; i < n_pipes; i++)
      pipes[i].colliding = queryRectCollide(balloon,pipes[i]);

    //cam track
    camera.wx = lerp(camera.wx,balloon.wx,0.1);
    if(balloon.wy > 20) //20+
    {
      camera.wh = lerp(camera.wh,30+((20-5)*2),0.01);
      camera.wy = lerp(camera.wy,balloon.wy-15,0.1);
    }
    else if(balloon.wy > 10) //10-20
    {
      camera.wh = lerp(camera.wh,30+((balloon.wy-5)*2),0.01);
      var b = ((balloon.wy-10)/10); //blend- ensure 0 to 1
      camera.wy = lerp(camera.wy,b*5,0.1);
    }
    else if(balloon.wy > 5) //5-10
    {
      camera.wh = lerp(camera.wh,30+((balloon.wy-5)*2),0.01);
      camera.wy = lerp(camera.wy,0,0.1);
    }
    else
    {
      camera.wh = lerp(camera.wh,30,0.01);
      camera.wy = lerp(camera.wy,0,0.1);
    }
    camera.ww = camera.wh*2;

    outside_temp_gauge.val = env_temp;
    inside_temp_gauge.val = balloon.t;
    weight_gauge.val = balloon.m+balloon.bm;
    volume_gauge.val = balloon.v;
    density_gauge.val = balloon.m/balloon.v;
    bouyancy_gauge.val = balloon.wya;
    altitude_gauge.val = balloon.wy;
    xvel_gauge.val = balloon.wxv;
    yvel_gauge.val = balloon.wyv;
    fuel_gauge.val = fuel;

    outside_temp_gauge.tick();
    inside_temp_gauge.tick();
    weight_gauge.tick();
    volume_gauge.tick();
    density_gauge.tick();
    bouyancy_gauge.tick();
    altitude_gauge.tick();
    xvel_gauge.tick();
    yvel_gauge.tick();
    fuel_gauge.tick();

    //faux parallax
    tickParallax();
    centerGrounds();
    tickBalloonParticles();
    tickAirParticles();

    //screen space resolution
    screenSpace(camera,dc,shadow);
    screenSpace(camera,dc,flame);
    screenSpace(camera,dc,basket);
    screenSpace(camera,dc,balloon);
    screenSpace(camera,dc,vel_arrow);
    screenSpace(camera,dc,acc_arrow);
    screenSpace(camera,dc,arrow_separator);
    for(var i = 0; i < n_pipes;   i++) screenSpace(camera,dc,pipes[i]);
    for(var i = 0; i < bg.length; i++) screenSpace(bgcam,dc,bg[i]);
    for(var i = 0; i < mg.length; i++) screenSpace(mgcam,dc,mg[i]);
    for(var i = 0; i < fg.length; i++) screenSpace(fgcam,dc,fg[i]);
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

    dc.context.globalAlpha = clamp(0,1,1-(balloon.wy/20));
    drawShadow(shadow);
    dc.context.globalAlpha = 1;
    drawWind();
    drawAirParticles();
    if(burn_pad.down && fuel > 0) drawFlame(flame);
    if(!rope_cut)
    {
      dc.context.beginPath();
      dc.context.moveTo(shadow.x,shadow.y+shadow.h);
      dc.context.lineTo(basket.x+basket.w/2,basket.y+basket.h*3/4);
      dc.context.moveTo(shadow.x+shadow.w,shadow.y+shadow.h);
      dc.context.lineTo(basket.x+basket.w/2,basket.y+basket.h*3/4);
      dc.context.stroke();
    }
    drawBasket(basket);
    drawBalloon(balloon);
    //dc.context.strokeStyle = "#00FF00";
    //drawArrow(vel_arrow);
    //dc.context.strokeStyle = "#0000FF";
    //drawArrow(acc_arrow);
    //dc.context.strokeStyle = "#000000";
    //drawArrow(arrow_separator);

    dc.context.textAlign = "center";
    burn_pad.draw(dc);
    dc.context.fillStyle = "#000000";
    dc.context.fillText("Fire",burn_pad.x+burn_pad.w/2,burn_pad.y+burn_pad.h/2);
    flap_pad.draw(dc);
    dc.context.fillStyle = "#000000";
    dc.context.fillText("Open Flap",flap_pad.x+flap_pad.w/2,flap_pad.y+flap_pad.h/2);
    if(!rope_cut)
    {
      cut_pad.draw(dc);
      dc.context.fillStyle = "#000000";
      dc.context.fillText("Cut Rope",cut_pad.x+cut_pad.w/2,cut_pad.y+cut_pad.h/2);
    }

    dc.context.textAlign = "right";
    dc.context.fillStyle = "#000000";
    dc.context.fillText(fdisp(balloon.wx,1)+"m",dc.width-10,12);

    drawGauge(outside_temp_gauge);
    drawGauge(inside_temp_gauge);
    drawGauge(weight_gauge);
    drawGauge(volume_gauge);
    drawGauge(density_gauge);
    drawGauge(bouyancy_gauge);
    drawGauge(altitude_gauge);
    drawGauge(xvel_gauge);
    drawGauge(yvel_gauge);
    drawGauge(fuel_gauge);

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

  var Part = function()
  {
    this.x = 0;
    this.y = 0;
    this.w = 3;
    this.h = 3;
    this.xv = 0;
    this.yv = 0;
    this.t = 0;
  }
  var initBalloonParticles = function(p)
  {
    var p;
    var temp = (balloon.t-290)/5; //~1 to ~14 (at same scale used by drawAirParts)
    var s = balloon.w/30;
    var minx = balloon.x-balloon.w/2-s/2;
    var maxx = balloon.x+balloon.w+balloon.w/2-s/2;
    var miny = balloon.y-balloon.h/2-s/2;
    var maxy = balloon.y+balloon.h+balloon.h/2-s/2;

    for(var i = 0; i < balloon_parts.length; i++)
    {
      p = balloon_parts[i];
      p.w = s;
      p.h = s;
      p.t = randIntBelow(100);
      p.x = randR(minx,maxx);
      p.y = randR(miny,maxy);
      p.xv = rand0()*temp*balloon.w/100;
      p.yv = rand0()*temp*balloon.w/100;
    }
  }
  var initAirParticles = function(p)
  {
    var p;
    var temp = (tempForHeight(env_temp,balloon.wy)-290)/5; //~0 to ~1
    var s = balloon.w/30;
    var minx = balloon.x-balloon.w/2-2/2;
    var maxx = balloon.x+balloon.w+balloon.w/2-2/2;
    var miny = balloon.y-balloon.h/2-s/2;
    var maxy = balloon.y+balloon.h+balloon.h/2-s/2;

    for(var i = 0; i < air_parts.length; i++)
    {
      p = air_parts[i];
      p.w = s;
      p.h = s;
      p.t = randIntBelow(100);
      p.x = randR(minx,maxx);
      p.y = randR(miny,maxy);
      p.xv = rand0()*temp*balloon.w/100;
      p.yv = rand0()*temp*balloon.w/100;
    }
  }

  var tickParallax = function()
  {
    bgcam.wx = camera.wx*0.2; bgcam.wy = camera.wy; bgcam.ww = camera.ww; bgcam.wh = camera.wh;
    mgcam.wx = camera.wx*0.5; mgcam.wy = camera.wy; mgcam.ww = camera.ww; mgcam.wh = camera.wh;
    fgcam.wx = camera.wx*0.8; fgcam.wy = camera.wy; fgcam.ww = camera.ww; fgcam.wh = camera.wh;
  }
  var centerGrounds = function()
  {
    var li;
    var ri;
    var ldist;
    var rdist;

    li = bgi;
    ri = (bgi+bg.length-1)%bg.length;
    ldist = abs(bg[li].wx-bgcam.wx);
    rdist = abs(bg[ri].wx-bgcam.wx);
    if(abs(ldist-rdist) > bgsep)
    {
      if(ldist > rdist) //l further than r- move to r
      {
        bg[li].wx = bg[ri].wx+bgsep+rand0()*bgsep/2;
        bg[li].wy = rand0()*5+10;
        bgi = (bgi+1)%bg.length;
      }
      else
      {
        bg[ri].wx = bg[li].wx-bgsep-rand0()*bgsep/2;
        bg[ri].wy = rand0()*5+10;
        bgi = (bgi+bg.length-1)%bg.length;
      }
    }

    li = mgi;
    ri = (mgi+mg.length-1)%mg.length;
    ldist = abs(mg[li].wx-mgcam.wx);
    rdist = abs(mg[ri].wx-mgcam.wx);
    if(abs(ldist-rdist) > bgsep)
    {
      if(ldist > rdist) //l further than r- move to r
      {
        mg[li].wx = mg[ri].wx+mgsep+rand0()*mgsep/2;
        mg[li].wy = rand0()*2+ 3;
        mgi = (mgi+1)%mg.length;
      }
      else
      {
        mg[ri].wx = mg[li].wx-mgsep-rand0()*mgsep/2;
        mg[ri].wy = rand0()*2+ 3;
        mgi = (mgi+mg.length-1)%mg.length;
      }
    }

    li = fgi;
    ri = (fgi+fg.length-1)%fg.length;
    ldist = abs(fg[li].wx-fgcam.wx);
    rdist = abs(fg[ri].wx-fgcam.wx);
    if(abs(ldist-rdist) > bgsep)
    {
      if(ldist > rdist) //l further than r- move to r
      {
        fg[li].wx = fg[ri].wx+fgsep+rand0()*fgsep/2;
        fg[li].wy = rand0()*1+-1;
        fgi = (fgi+1)%fg.length;
      }
      else
      {
        fg[ri].wx = fg[li].wx-fgsep-rand0()*fgsep/2;
        fg[ri].wy = rand0()*1+-1;
        fgi = (fgi+fg.length-1)%fg.length;
      }
    }
  }
  var drawWind = function()
  {
    dc.context.fillStyle = "#FFFFFF";

    tmp.x = 0;
    tmp.y = 0;
    tmp.w = 1;
    tmp.h = 1;
    worldSpace(camera,dc,tmp);
    var maxy = Math.ceil(tmp.wy);
    tmp.y = dc.height-1;
    worldSpace(camera,dc,tmp);
    var miny = Math.floor(tmp.wy);

    tmp.wx = camera.wx;
    tmp.wy = 0;
    tmp.ww = camera.ww;
    tmp.wh = 1;

    var x;
    for(var i = miny; i < maxy+1 && i < wind.length; i++)
    {
      x = (wind[i]*20*n_ticks)%dc.width;
      tmp.wy = i;
      screenSpace(camera,dc,tmp);
      dc.context.fillRect(x,tmp.y,10,tmp.h);
    }
  }
  var tickAirParticles = function()
  {
    if(part_disp == 0) return;
    var p;
    var temp = (tempForHeight(env_temp,balloon.wy)-290)/5; //~0 to ~1
    var n_parts = min(round((15-temp)*20),air_parts.length);
    n_parts *= 4;
    var s = balloon.w/30;
    var minx = balloon.x-balloon.w/2-2/2;
    var maxx = balloon.x+balloon.w+balloon.w/2-2/2;
    var miny = balloon.y-balloon.h/2-s/2;
    var maxy = balloon.y+balloon.h+balloon.h/2-s/2;

    for(var i = 0; i < n_parts; i++)
    {
      p = air_parts[i];
      p.w = s;
      p.h = s;
      if(p.t > 100)
      {
        p.t = 0;
        p.x = randR(minx,maxx);
        p.y = randR(miny,maxy);
        p.xv = rand0()*temp*balloon.w/100;
        p.yv = rand0()*temp*balloon.w/100;
      }
      p.x += p.xv;
      p.y += p.yv;
      p.t++;
    }
  }
  var drawAirParticles = function()
  {
    if(part_disp == 0) return;
    var p;
    var temp = (tempForHeight(env_temp,balloon.wy)-290)/5; //~0 to ~1
    var n_parts = min(round((15-temp)*20),air_parts.length);
    var br = balloon.w;
    var brsqr = br*br;
    n_parts *= 4;
    var d;

    for(var i = 0; i < n_parts; i++)
    {
      p = air_parts[i];
      d = distsqr(p,balloon)/brsqr;

      if(d > 1) p.t = 101;
      else
      {
        dc.context.globalAlpha = min(1,(1-d)*2)*part_disp;
        dc.context.drawImage(part_canv,p.x,p.y,p.w,p.h);
      }
    }
    dc.context.globalAlpha = 1;
  }
  var tickBalloonParticles = function()
  {
    if(part_disp == 0) return;
    var p;
    var temp = (balloon.t-290)/5; //~1 to ~14 (at same scale used by drawAirParts)
    var n_parts = min(round((15-temp)*20),balloon_parts.length);
    var s = balloon.w/30;
    var minx = balloon.x-balloon.w/2-s/2;
    var maxx = balloon.x+balloon.w+balloon.w/2-s/2;
    var miny = balloon.y-balloon.h/2-s/2;
    var maxy = balloon.y+balloon.h+balloon.h/2-s/2;
    var d;

    for(var i = 0; i < n_parts; i++)
    {
      p = balloon_parts[i];
      p.w = s;
      p.h = s;
      if(p.t > 100)
      {
        p.t = 0;
        p.x = randR(minx,maxx);
        p.y = randR(miny,maxy);
        p.xv = rand0()*temp*balloon.w/100;
        p.yv = rand0()*temp*balloon.w/100;
      }
      p.x += p.xv;
      p.y += p.yv;
      p.t++;
    }
  }
  var drawBalloonParticles = function()
  {
    if(part_disp == 0) return;
    var p;
    var temp = (balloon.t-290)/5; //~1 to ~14 (at same scale used by drawAirParts)
    var n_parts = min(round((15-temp)*20),balloon_parts.length);
    var br = balloon.w/2;
    var brsqr = br*br;
    var d;

    for(var i = 0; i < n_parts; i++)
    {
      p = balloon_parts[i];
      d = distsqr(p,balloon)/brsqr;
      if(d > 1) p.t = 101; //kinda tick-ish
      else
      {
        //dc.context.globalAlpha = min(1,(1-d)*2)*part_disp;
        dc.context.globalAlpha = part_disp;
        dc.context.drawImage(part_canv,p.x,p.y,p.w,p.h);
      }
    }
    dc.context.globalAlpha = 1;
  }
  var drawFlame = function(obj)
  {
    dc.context.drawImage(flame_canv,obj.x,obj.y,obj.w,obj.h);
  }
  var drawShadow = function(obj)
  {
    dc.context.drawImage(shadow_canv,obj.x,obj.y,obj.w,obj.h);
  }
  var drawBasket = function(obj)
  {
    dc.context.drawImage(basket_canv,obj.x,obj.y,obj.w,obj.h);
  }
  var drawBalloon = function(obj)
  {
    dc.context.drawImage(balloon_canv,obj.x,obj.y,obj.w,obj.h);
    drawBalloonParticles();
    dc.context.fillStyle = "#000000";
    dc.context.textAlign = "right";
    var dispTemp = round((obj.t*(9/5)-459)*100)/100; //nn.nn
    dc.context.fillText(floor(dispTemp)+".",obj.x+obj.w/2,obj.y+obj.h/2-1);
    dc.context.textAlign = "left";
    var decString = (round((dispTemp-floor(dispTemp))*100)/100)+"°";
    dc.context.fillText(decString.substring(decString.indexOf(".")+1),obj.x+obj.w/2,obj.y+obj.h/2-1);
  }
  var drawArrow = function(obj)
  {
    dc.context.beginPath();
    dc.context.moveTo(obj.x      +obj.w/2,obj.y      -obj.h/2);
    dc.context.lineTo(obj.x+obj.w+obj.w/2,obj.y+obj.h-obj.h/2);
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
  var drawGauge    = function(g)
  {
    if(!g.vis) return;
    dc.context.drawImage(gauge_canv,g.x,g.y,g.w,g.h);
    dc.context.strokeStyle = "#000000";
    dc.context.beginPath();
    dc.context.moveTo(g.cx,g.cy);
    var t = mapVal(g.min,g.max,g.mint,g.maxt,g.val);
    dc.context.lineTo(g.cx+cos(t)*g.r,g.cy+-sin(t)*g.r);
    dc.context.stroke();
    dc.context.fillStyle = "#000000";
    dc.context.textAlign = "center";
    dc.context.fillText(g.title,g.x+g.w/2,g.y-5);
  }

  var Gauge = function(title,x,y,w,h,mint,maxt,min,max,altered)
  {
    var self = this;
    self.title = title;

    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;
    self.cx = self.x+self.w/2;
    self.cy = self.y+self.h/2;
    self.mint = mint;
    self.maxt = maxt;
    self.min = min;
    self.max = max;
    self.val = self.min;
    self.r = Math.min(self.w,self.h)/2;

    self.vis = true;
    self.enabled = true;

    self.tick = function()
    {
      if(!visible || !enabled) { self.dragging = false; }
      if(self.dragging && altered)
        altered(self.last_val)
    }

    self.dragging = false;
    self.last_val = self.min;
    self.dragStart = function(evt)
    {
      if(!visible || !enabled) { self.dragging = false; return; }
      self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(!visible || !enabled) { self.dragging = false; return; }
      var x = evt.doX-self.cx;
      var y = -(evt.doY-self.cy);
      var t = atan2(y,x);
      var val = mapVal(self.mint,self.maxt,self.min,self.max,t)
      self.last_val = val;
    }
    self.dragFinish = function()
    {
      if(!visible || !enabled) { self.dragging = false; return; }
      self.dragging = false;
    }

  }

  var pop = function(msg) { input_state = IGNORE_INPUT; bmwrangler.popMessage(msg,dismissed); }
  var dismissed = function() { input_state = RESUME_INPUT; }
};

