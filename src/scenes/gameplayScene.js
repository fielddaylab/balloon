var GamePlayScene = function(game, stage)
{
  var self = this;
  var dc = stage.drawCanv;
  var ctx = dc.context;

  //config
  var part_damp = 0.2;

  var gravity = 9.8; //m/s^2
  var default_env_temp = 295; //k (72f = 295k)
  var env_temp = default_env_temp;
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

  //doqueues
  var dragger;
  var presser;
  var domclicker;
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
  var clone_balloon;
  var vel_arrow;
  var acc_arrow;
  var arrow_separator;
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
  var menu_btn;
  var retry_btn;
  var reset_btn;
  var parts_btn;
  var arrows_btn;

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
  var boost;
  var pipe;
  var refuel_stations;
  var part_disp;
  var target_part_disp;
  var arrow_disp;
  var target_arrow_disp;
  var fuel;
  var clone_fuel;

  var steps;
  var cur_step;

  var step_intro;
  var step_particles;
  var step_forces;
  var step_density;
  var step_free;
  var step_standard;
  var step_refuel;
  var step_flappy;
  var step_meditate;

  self.ready = function()
  {
    //state
    rope_cut = false;
    fuel = 40;
    clone_fuel = fuel;

    //doqueues
    dragger = new Dragger({source:stage.dispCanv.canvas});
    presser = new Presser({source:stage.dispCanv.canvas});
    domclicker = new Clicker({source:stage.dispCanv.canvas});
    dom = new CanvDom(dc);
    bmwrangler = new BottomMessageWrangler();
    input_state = RESUME_INPUT;

    camera = new Camera();
    camera.wh = 30;
    camera.ww = camera.wh/9*16;
    bgcam = new Camera();
    mgcam = new Camera();
    fgcam = new Camera();
    tickParallax();
    grid = new Obj(0,0,250,250,0);
    tmp = new Obj(0,0,0,0,0);
    shadow = new Obj(0,0,10,2,0);
    flame = new Obj(0,0,2,2,0);
    basket = new Obj(0,0,10,10,0);
    balloon = new Obj(0,0,13,13,0);
    //balloon.t = 340;
    balloon.bm = hot_air_balloon_baggage;
    clone_balloon = new Obj();
    cloneObj(balloon,clone_balloon);
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

    bgsep = 10; bg = []; for(var i = 0; i < 30; i++) { bg.push(new Obj(i*bgsep+rand0()*bgsep, rand0()*5+10,  3,  2, randIntBelow(3))); bg[i].draw = drawCloud;    } bgi = 0;
    mgsep = 50; mg = []; for(var i = 0; i < 10; i++) { mg.push(new Obj(i*mgsep+rand0()*mgsep, rand0()*2+ 3, 10, 10, randIntBelow(1))); mg[i].draw = drawMountain; } mgi = 0;
    fgsep = 20; fg = []; for(var i = 0; i < 30; i++) { fg.push(new Obj(i*fgsep+rand0()*fgsep, rand0()*1+-1,  8,  8, randIntBelow(2))); fg[i].draw = drawTree;     } fgi = 0;
    centerGrounds();
    ground = new Obj();

    burn_pad = new ButtonBox(10,dc.height-100,60,40,function(){});
    flap_pad = new ButtonBox(10,dc.height-50,60,40,function(){});
    cut_pad  = new ButtonBox(dc.width-70,dc.height-50,60,40,function(){});
    menu_btn   = new ButtonBox(dc.width-110,200,100,20,function(){ game.setScene(2); });
    retry_btn  = new ButtonBox(dc.width-110, 80,100,20,function(){ });
    reset_btn  = new ButtonBox(dc.width-110,110,100,20,function(){ if(cur_step != step_free) return; game.start = 4; game.setScene(3); });
    arrows_btn = new ButtonBox(dc.width-110,140,100,20,function(){ if(cur_step != step_free) return; target_arrow_disp = (target_arrow_disp+1)%2; });
    parts_btn  = new ButtonBox(dc.width-110,170,100,20,function(){ if(cur_step != step_free) return; target_part_disp = (target_part_disp+1)%2; });
    presser.register(burn_pad);
    presser.register(flap_pad);
    presser.register(cut_pad);
    presser.register(retry_btn);
    domclicker.register(menu_btn);
    domclicker.register(reset_btn);
    domclicker.register(arrows_btn);
    domclicker.register(parts_btn);

    var b = 40;
    var w = (dc.width-(b*2))/10;
    var p = 15;
    var mint = pi*(3/4);
    var maxt = pi*(9/4);
    outside_temp_gauge = new Gauge("Outside","Temp",        w*0+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,280,380,0,999,function(v){ env_temp = v; });
    inside_temp_gauge  = new Gauge("Balloon","Temp",        w*1+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,280,380,0,999,function(v){ balloon.t = v; });
    weight_gauge       = new Gauge("","Weight",             w*2+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,2200000,3000000,0,99999999999999,function(v){ balloon.bm = v-balloon.m; });
    volume_gauge       = new Gauge("","Volume",             w*3+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,500,8000,1,999999999999999999999,function(v){ balloon.v = v; balloon.ww = sqrt(balloon.v/(balloon.wh)); });
    density_gauge      = new Gauge("","Density",            w*4+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,950,1200,1,999999999999999999999,function(v){ });
    bouyancy_gauge     = new Gauge("Net","Force",           w*5+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,-.02,.02,-999999999,99999999999,function(v){ balloon.wya = v; });
    altitude_gauge     = new Gauge("","Altitude",           w*6+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,0,100,-999999999,99999999999,function(v){ balloon.wy = v; });
    xvel_gauge         = new Gauge("Horizontal","Velocity", w*7+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,-1,1,-999999999,99999999999,function(v){ balloon.wxv = v; });
    yvel_gauge         = new Gauge("Vertical","Velocity",   w*8+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,-.2,.2,-999999999,99999999999,function(v){ balloon.wyv = v; });
    fuel_gauge         = new Gauge("","Fuel",               w*9+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,0,40,0,99999999999,function(v){ fuel = v; });

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

    part_disp = 0;
    target_part_disp = 0;
    arrow_disp = 0;
    target_arrow_disp = 0;
    wind = [];
    for(var i = 0; i < 100; i++)
      wind[i] = 0.05+psin((99-i)/20);
    boost = new Obj();
    boost.wy = randR(30,100);
    boost.wx = randR(100,400);
    boost.wh = 1;
    pipe = new Obj();
    pipe.wy = randR(30,100);
    pipe.wx = randR(100,400);
    pipe.ww = 20;
    pipe.wh = 40;
    refuel_stations = [];

    outside_temp_gauge.vis = true;
    inside_temp_gauge.vis = true;
    //self.popDismissableMessage = function(text,x,y,w,h,callback)

    steps = [];

    step_intro = steps.length;
    steps.push(new Step(
      function(){
        setDisp(0,0,true,true,false,false,false,false,false,false,false,false);
        pop([
        "Hey there!",
        "This is a hot Air Balloon.",
        "Let's see how this thing works!",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      noop,
      function() { fuel = 4; rope_cut = false; },
      function() { ctx.textAlign = "left"; ctx.fillText("<- Hold to heat balloon!",burn_pad.x+burn_pad.w+10,burn_pad.y+burn_pad.h/2); },
      function() { return balloon.t > 305; }
    ));
    steps.push(new Step(
      noop,
      function() { fuel = 4; rope_cut = false; },
      function() { ctx.textAlign = "left"; ctx.fillText("<- Keep holding!",burn_pad.x+burn_pad.w+10,burn_pad.y+burn_pad.h/2); },
      function() { return balloon.t > 315; }
    ));
    steps.push(new Step(
      noop,
      function() { fuel = 4; rope_cut = false; },
      function() { ctx.textAlign = "left"; ctx.fillText("<- Almost there!",burn_pad.x+burn_pad.w+10,burn_pad.y+burn_pad.h/2); },
      function() { return balloon.t > 325; }
    ));
    steps.push(new Step(
      noop,
      function() { fuel = 4; rope_cut = false; },
      function() { ctx.textAlign = "left"; ctx.fillText("<- Just a little longer!",burn_pad.x+burn_pad.w+10,burn_pad.y+burn_pad.h/2); },
      function() { return balloon.t > 335; }
    ));
    steps.push(new Step(
      noop,
      function() { fuel = 4; rope_cut = false; },
      function() { ctx.textAlign = "left"; ctx.fillText("<- Aaaaannnndd...",burn_pad.x+burn_pad.w+10,burn_pad.y+burn_pad.h/2); },
      function() { if(balloon.t > 343.5) { cloneObj(balloon,clone_balloon); return true; } return false; }
    ));
    steps.push(new Step(
      function() {
        pop([
          "We've heated the ballon just enough to generate some <b>upward lift</b>!",
          "<b>Cut the anchor rope</b> and let us go!</b>",
        ]);
      },
      function() { balloon.t = clone_balloon.t; },
      function() { ctx.textAlign = "left"; ctx.fillText("<- Cut the rope!",cut_pad.x+cut_pad.w+10,cut_pad.y+cut_pad.h/2); },
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() { fuel = 4; },
      function() { balloon.t = clone_balloon.t; },
      function() { ctx.textAlign = "left"; ctx.fillText("<- Cut the rope!",cut_pad.x+cut_pad.w+10,cut_pad.y+cut_pad.h/2); },
      function() { return rope_cut; }
    ));
    steps.push(new Step(
      noop,
      function() { fuel = 4; },
      noop,
      function() { if(balloon.wy > 10) { cloneObj(balloon,clone_balloon); return true; }; return false; }
    ));
    steps.push(new Step(
      function() {
        pop([
          "And off we go!",
          "Ok enough talking... I'll let you fly around for now.",
          "<b>To fly:</b><br />Press <b>burn</b> to <b>increase the temperature inside the balloon</b>,<br />open the <b>flap</b> to <b>release hot air</b>,<br />and be sure to <b>watch your fuel consumption</b>!",
          "I'll be waiting on the ground!",
          "(See how long you can fly!)",
        ]);
      },
      function() { balloon.t = clone_balloon.t; balloon.wx = clone_balloon.wx; balloon.wy = clone_balloon.wy; },
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() {
        fuel = 4;
        altitude_gauge.vis = true;
        xvel_gauge.vis = true;
        yvel_gauge.vis = true;
        fuel_gauge.vis = true;
      },
      noop,
      noop,
      function() { return balloon.wy < 0.01; }
    ));
    steps.push(new Step(
      function(){
        pop([
          "Well that was fun. You travelled "+fdisp(balloon.wx,1)+" meters!",
          "But how did it work?",
          "Why does <b>heating the balloon</b> cause it to <b>rise</b>?",
          "Let's reset everything, and try again",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() { resetState(); resetBalloon(); setTimeout(function(){target_part_disp = 1;},1000); },
      function() { resetState(); },
      noop,
      function() { return part_disp > 0.8; }
    ));

    step_particles = steps.length;
    steps.push(new Step(
      function(){
        setDisp(1,0,true,true,false,false,false,false,true,true,true,true);
        pop([
          "We've <b>reset the temperature</b> inside the balloon (so it's equal to the temperature <b>outside</b> the balloon).",
          "We're also <b>visualizing</b> the air particles <b>bouncing around</b> both <b>inside</b> <i>and</i> <b>outside</b> of the balloon.",
          "See how <b>all the particles</b> are moving at just about <b>the same speed</b>?",
          "Try to <b>get the balloon off the ground</b> again.",
          "This time, <b>watch how the air particles are affected</b>.",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() { },
      function() { rope_cut = false; if(fuel < 4) fuel = 4; },
      function() { ctx.textAlign = "left"; ctx.fillText("<- Hold to heat balloon!",burn_pad.x+burn_pad.w+10,burn_pad.y+burn_pad.h/2); },
      function() { if(balloon.t > 343.5) { cloneObj(balloon,clone_balloon); clone_fuel = fuel; return true; } return false; }
    ));
    steps.push(new Step(
      function() {
        pop([
          "See how the <b>air particles inside the balloon</b> are <b>moving faster</b>?",
          "When air (or anything, really) gets <b>heated</b>, its molecules <b>jiggle very quickly</b>.",
          "Molecules that are <b>bouncing all over the place</b> create <b>higher pressure within the balloon</b>.",
          "This <b>higher pressure</b> pushes the air <b>out</b> of the balloon, making the balloon <b>much lighter than the surrounding air</b>.",
          "And just like a <b>life vest</b> in <b>water</b>, the <b>balloon</b> begins to <b>float</b> in <b>air</b>!",
        ]);
      },
      function() { rope_cut = false; fuel = clone_fuel; balloon.t = clone_balloon.t; },
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      noop,
      function() { fuel = clone_fuel; balloon.t = clone_balloon.t; },
      function() { ctx.textAlign = "left"; ctx.fillText("<- Cut the rope!",cut_pad.x+cut_pad.w+10,cut_pad.y+cut_pad.h/2); },
      function() { return rope_cut; }
    ));
    steps.push(new Step(
      noop,
      function() { fuel = clone_fuel; },
      noop,
      function() { if(balloon.wy > 10) { cloneObj(balloon,clone_balloon); return true; }; return false; }
    ));
    steps.push(new Step(
      function() {
        fuel = 4;
        pop([
          "But wait, <i>why do <b>lighter</b> things <b>float</b></i>?",
          "Ok ok. I'll let you get to flying.",
          "Again, I'll be waiting for you on the ground!",
          "See if you can get further than last time!",
          "(Pro Tip- don't burn through all your fuel at once!)",
        ]);
      },
      function() { balloon.t = clone_balloon.t; balloon.wx = clone_balloon.wx; balloon.wy = clone_balloon.wy; },
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() { fuel = 4; },
      noop,
      noop,
      function() { return balloon.wy < 0.01; }
    ));
    steps.push(new Step(
      function() {
        pop([
          "And you're back!",
          "This time, you travelled "+fdisp(balloon.wx,1)+" meters.",
          "But let's get back to that question:",
          "<i>Why do <b>lighter</b> things <b>float</b></i>?",
          "Maybe surprisingly, the answer is actually <b>gravity</b>.",
          "Let's reset, and look at this again.",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));

    step_forces = steps.length;
    steps.push(new Step(
      function() { resetState(); resetBalloon(); },
      function() { resetState(); },
      noop,
      function() { return camera.wx < 0.2; }
    ));
    steps.push(new Step(
      function(){
        setDisp(1,0,true,true,false,false,false,false,true,true,true,true);
        pop([
          "Ok. So <b>gravity</b> is the reason hot air balloons <b>float</b>?",
          "How does that make sense?",
          "Well, we know that <b>gravity</b> pulls <b>down</b> on <b>everything</b> (at least while on planet Earth, anyways...).",
          "(That is, <b>gravity applies a downward force</b>.)",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() { steps[cur_step].t = 0; },
      function() { steps[cur_step].t++; resetState(); },
      function() {
        var bcx = balloon.x+balloon.w/2;
        var bcy = balloon.y+balloon.h/2;
        ctx.globalAlpha = steps[cur_step].t/100;
        ctx.drawImage(down_arrow_canv,bcx-50,bcy,100,100);
        ctx.globalAlpha = 1;
      },
      function() { return steps[cur_step].t >= 100; }
    ));
    steps.push(new Step(
      function(){
        pop([
          "But gravity doesn't just apply to <b>big</b> objects-",
          "It also applies to all of those little air particles!",
        ]);
      },
      noop,
      function() {
        var bcx = balloon.x+balloon.w/2;
        var bcy = balloon.y+balloon.h/2;
        ctx.drawImage(down_arrow_canv,bcx-50,bcy,100,100);
      },
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() { steps[cur_step].t = 0; },
      function() { steps[cur_step].t++; resetState(); },
      function() {
        var bcx = balloon.x+balloon.w/2;
        var bcy = balloon.y+balloon.h/2;
        ctx.drawImage(down_arrow_canv,bcx-50,bcy,100,100);
        ctx.globalAlpha = steps[cur_step].t/100;
        ctx.drawImage(down_arrows_canv,balloon.x-100,bcy-50,100,100);
        ctx.drawImage(down_arrows_canv,balloon.x+balloon.w,bcy-50,100,100);
        ctx.globalAlpha = 1;
      },
      function() { return steps[cur_step].t >= 100; }
    ));
    steps.push(new Step(
      function(){
        pop([
          "Everything is being pulled down, but there is only so much space to be pulled down to!",
          "All the little air particles are trying to wedge themselves <b>as low as they can</b>,",
          "This creates a small <b>upward force</b> on the balloon.",
        ]);
      },
      noop,
      function() {
        var bcx = balloon.x+balloon.w/2;
        var bcy = balloon.y+balloon.h/2;
        ctx.drawImage(down_arrow_canv,bcx-50,bcy,100,100);
        ctx.drawImage(down_arrows_canv,balloon.x-100,bcy-50,100,100);
        ctx.drawImage(down_arrows_canv,balloon.x+balloon.w,bcy-50,100,100);
      },
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function(){
        steps[cur_step].t = 0;
        target_arrow_disp = 1;
        pop([
          "But because the <b>balloon</b> is <b>heavier</b> than the <b>air particles trying to get under it</b>,",
          "the baloon's gravity \"wins\" the struggle to <b>be pulled down</b>, and <b>stays on the ground</b>.",
          "But what would happen if we were to <b>make the balloon lighter</b>?",
        ]);
      },
      function() { steps[cur_step].t++; if(steps[cur_step].t > 100) steps[cur_step].t = 100;},
      function() {
        var bcx = balloon.x+balloon.w/2;
        var bcy = balloon.y+balloon.h/2;
        ctx.drawImage(down_arrow_canv,bcx-50,bcy,100,100);
        ctx.drawImage(down_arrows_canv,balloon.x-100,bcy-50,100,100);
        ctx.drawImage(down_arrows_canv,balloon.x+balloon.w,bcy-50,100,100);
        ctx.globalAlpha = steps[cur_step].t/100;
        ctx.drawImage(up_arrow_canv,bcx-25,bcy-50,50,50);
        ctx.globalAlpha = 1;
      },
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() { fuel = 40; },
      function() { if(fuel < 4) fuel = 4; rope_cut = false; },
      function() {
        ctx.textAlign = "left";
        ctx.fillText("<- Heat the balloon",burn_pad.x+burn_pad.w+10,burn_pad.y+burn_pad.h/2);
      },
      function() { if(balloon.t > 343.5) { cloneObj(balloon,clone_balloon); return true; } return false; }
    ));
    steps.push(new Step(
      function() {
        pop([
          "The <b>upward force on the balloon</b> created by the <b>downward force on the surrounding air particles</b> is now <b>greater</b> then the <b>downward force of gravity on the balloon</b>!",
          "When the upward force is even <b>just a little bigger</b> than the downward force, it means the balloon will <b>start to rise</b>.",
          "If we <b>keep this temperature in the balloon</b> (thus, maintaining its lighter-than-air weight), the balloon will <b>continue to rise, forever</b>.",
          "Thankfully, <b>heat naturally escapes</b> from the balloon, letting <b>more air back in</b>, and <b>increasing the weight</b>.",
          "You can accelerate this process by <b>opening the flap</b> near the top of the balloon. The temperature inside the balloon will <b>quickly decrease</b>, making the balloon <b>heavier</b>, and causing it to <b>sink</b>.",
          "Again, try to get as far as you can!",
        ]);
      },
      function() { rope_cut = false; fuel = clone_fuel; balloon.t = clone_balloon.t; },
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() { fuel = 4; },
      function() { fuel = 4; balloon.t = clone_balloon.t; },
      function() {
        ctx.textAlign = "left";
        ctx.fillText("<- Cut the rope!",cut_pad.x+cut_pad.w+10,cut_pad.y+cut_pad.h/2);
      },
      function() { return rope_cut; }
    ));
    steps.push(new Step(
      noop,
      noop,
      noop,
      function() { return balloon.wy < 0.1; }
    ));
    steps.push(new Step(
      function() {
        pop([
          "This time, you were able to travel "+fdisp(balloon.wx,1)+" meters!",
          "Notice that, while <b>floating at a constant height</b>, the <b>downward force</b> and the <b>upward force</b> on the balloon stayed about equal?",
          "When this is the case, the object in suspension is said to be <b>neutrally bouyant</b>- it won't change its velocity up or down.",
          "Let's reset again.",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));

    step_density = steps.length;
    steps.push(new Step(
      function() { resetState(); resetBalloon(); },
      function() { resetState(); },
      noop,
      function() { return camera.wx < 0.2; }
    ));
    steps.push(new Step(
      function(){
        setDisp(1,1,true,true,false,false,false,false,true,true,true,true);
        pop([
          "So if a <b>balloon</b> is <b>lighter</b> than the <b>surounding air</b>, it begins to <b>float</b>.",
          "But, a <b>marble</b> is lighter than even the <b>lightest</b> hot air balloon...",
          "<i>Why doesn't <b>it</b> float?</i>",
          "The reason is that, when we say \"<i>lighter than the surrounding air</i>\",",
          "we really mean \"<i>lighter than the surrounding air <b>of the same size</b></i>\".",
          "A <b>marble-sized</b> ball of air is <i>much</i> lighter than a marble...",
          "so the marble \"<b>sinks</b>\" in the air!",
          "Knowing this, we can -rather than alter the balloon's weight- <b>increase its volume</b> to generate lift!",
          "Let's try that out!",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() { fuel = 40; },
      function() {
        fuel = 40;
        balloon.t = env_temp;
        burn_pad.unpress();
        rope_cut = false;
      },
      function() {
        ctx.textAlign = "left";
        ctx.fillText("X Heating disabled! Try increasing volume instead!",burn_pad.x+burn_pad.w+10,burn_pad.y+burn_pad.h/2);
        ctx.textAlign = "right";
        ctx.fillText("Drag the volume needle to change!",volume_gauge.x+volume_gauge.w/2,volume_gauge.y-50);
        volume_gauge.vis = true;
        volume_gauge.enabled = true;
      },
      function() { return balloon.v > 5000 && !volume_gauge.dragging; }
    ));
    steps.push(new Step(
      function(){
        pop([
          "See how <b>increasing the volume</b> brings <b>the force of gravity</b> <i>closer</i> to <b>the upward force of the surrounding particles</b>?",
          "We'll still need to <b>heat the air in the balloon</b> just a bit-",
          "But because we now have <b>more air to heat</b>, we <b>won't need to heat it as much!",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() { fuel = 40; },
      function() {
        if(fuel < 4) fuel = 4;
        rope_cut = false;
      },
      function() {
        ctx.textAlign = "left";
        ctx.fillText("<- Heat the balloon!",burn_pad.x+burn_pad.w+10,burn_pad.y+burn_pad.h/2);
      },
      function() {
        if(balloon.wya > 0.0005)
        {
          cloneObj(balloon,clone_balloon);
          return true;
        }
        return false;
      }
    ));
    steps.push(new Step(
      function() { fuel = 4; },
      function() { fuel = 4; balloon.t = clone_balloon.t; },
      function() {
        ctx.textAlign = "left";
        ctx.fillText("<- Cut the rope!",cut_pad.x+cut_pad.w+10,cut_pad.y+cut_pad.h/2);
      },
      function() { return rope_cut; }
    ));
    steps.push(new Step(
      noop,
      function() { fuel = 4; },
      noop,
      function() { if(balloon.wy > 10) { cloneObj(balloon,clone_balloon); return true; }; return false; }
    ));
    steps.push(new Step(
      function() {
        fuel = 4;
        pop([
          "Ok- One Last Time. See how far you can get!",
          "(This time, you can alter the volume mid-flight!)",
        ]);
      },
      function() { balloon.t = clone_balloon.t; balloon.wx = clone_balloon.wx; balloon.wy = clone_balloon.wy; },
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() { fuel = 4; },
      noop,
      noop,
      function() { return balloon.wy < 0.01; }
    ));
    steps.push(new Step(
      function() {
        pop([
          "Your distance: "+fdisp(balloon.wx,1)+" meters.",
          "Good Work!",
          "From now on, you can freely play around with whatever gauges you want!",
          "Good Luck!",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));

    step_free = steps.length;
    steps.push(new Step(
      function() {
        resetState();
        resetBalloon();
        setDisp(0,0,true,true,true,true,true,true,true,true,true,true);
        outside_temp_gauge.enabled = true;
        inside_temp_gauge.enabled = true;
        weight_gauge.enabled = true;
        volume_gauge.enabled = true;
        density_gauge.enabled = true;
        bouyancy_gauge.enabled = true;
        altitude_gauge.enabled = true;
        xvel_gauge.enabled = true;
        yvel_gauge.enabled = true;
        fuel_gauge.enabled = true;
      },
      noop,
      noop,
      function() { return false; }
    ));

    step_standard = steps.length;
    steps.push(new Step(
      function() {
        resetState();
        resetBalloon();
        setDisp(0,0,true,true,true,true,true,true,true,true,true,true);
        outside_temp_gauge.enabled = false;
        inside_temp_gauge.enabled = false;
        weight_gauge.enabled = false;
        volume_gauge.enabled = false;
        density_gauge.enabled = false;
        bouyancy_gauge.enabled = false;
        altitude_gauge.enabled = false;
        xvel_gauge.enabled = false;
        yvel_gauge.enabled = false;
        fuel_gauge.enabled = false;
      },
      noop,
      noop,
      function() { return ((balloon.wy > 0 && rope_cut) || fuel <= 0); }
    ));
    steps.push(new Step(
      noop,
      noop,
      noop,
      function() { if(balloon.wy <= 0) { if(balloon.wx > game.standard_best) game.standard_best = balloon.wx; return true; } return false; }
    ));
    steps.push(new Step(
      noop,
      noop,
      function() {
        retry_btn.draw(dc);
        ctx.fillStyle = "#000000";
        ctx.textAlign = "right";
        ctx.fillText("Your Score:"+fdisp(balloon.wx,1)+"m",dc.width-10,30);
        ctx.fillText("Top Score:"+fdisp(game.standard_best,1)+"m",dc.width-10,50);
        ctx.textAlign = "center";
        ctx.fillText("Retry",retry_btn.x+retry_btn.w/2,retry_btn.y+retry_btn.h/2);
      },
      function() { if(retry_btn.down) { cur_step = step_standard-1; return true; } return false; }
    ));

    step_refuel = steps.length;
    steps.push(new Step(
      function() {
        resetState();
        resetBalloon();
        setDisp(0,0,true,true,true,true,true,true,true,true,true,true);
        outside_temp_gauge.enabled = false;
        inside_temp_gauge.enabled = false;
        weight_gauge.enabled = false;
        volume_gauge.enabled = false;
        density_gauge.enabled = false;
        bouyancy_gauge.enabled = false;
        altitude_gauge.enabled = false;
        xvel_gauge.enabled = false;
        yvel_gauge.enabled = false;
        fuel_gauge.enabled = false;
        steps[cur_step].next_station = new Obj();
        refuel_stations[0] = randR(100,200);
        refuel_stations[1] = refuel_stations[0]+randR(500,1000);
      },
      noop,
      function() {
        steps[cur_step].next_station.wx = min(refuel_stations[0],refuel_stations[1]);
        steps[cur_step].next_station.wy = 0;
        screenSpace(camera,dc,steps[cur_step].next_station);
        var off = false;
        if(steps[cur_step].next_station.x < 10) { off = true; steps[cur_step].next_station.x = 10; }
        if(steps[cur_step].next_station.y < 10) { off = true; steps[cur_step].next_station.y = 10; }
        if(steps[cur_step].next_station.x > dc.width -20) { off = true; steps[cur_step].next_station.x = dc.width-20; }
        if(steps[cur_step].next_station.y > dc.height-90) { off = true; steps[cur_step].next_station.y = dc.height-90; }
        if(off)
        {
          ctx.strokeStyle = "#FF0000";

          var sx = balloon.x+balloon.w/2;
          var sy = balloon.y+balloon.h/2;
          var ex = steps[cur_step].next_station.x+5;
          var ey = steps[cur_step].next_station.y+5;
          var dx = ex-sx;
          var dy = ey-sy;
          var dd = Math.sqrt(dx*dx+dy*dy);

          sx = sx + (dx/dd)*(dd-40);
          sy = sy + (dy/dd)*(dd-40);

          drawArrow(dc,sx,sy,ex,ey,10);
          ctx.strokeStyle = "#000000";
        }
        else
        {
          ctx.fillStyle = "#FF0000";
          ctx.fillRect(steps[cur_step].next_station.x,steps[cur_step].next_station.y,10,10);
        }
        ctx.textAlign = "center";
        ctx.fillStyle = "#000000";
        ctx.fillText("Refuel Station",steps[cur_step].next_station.x,steps[cur_step].next_station.y-30)
        ctx.fillText(fdisp((steps[cur_step].next_station.wx-balloon.wx),1)+"m",steps[cur_step].next_station.x,steps[cur_step].next_station.y-15)
      },
      function() { return ((balloon.wy > 0 && rope_cut) || fuel <= 0); }
    ));
    steps.push(new Step(
      function() { steps[cur_step].next_station = steps[cur_step-1].next_station; refuel_stations[0] = randR(100,200); refuel_stations[1] = refuel_stations[0]+randR(500,1000); },
      function() {
        if(refuel_stations[0]-balloon.wx < -100) refuel_stations[0] = refuel_stations[1] + randR(500,1000);
        if(refuel_stations[1]-balloon.wx < -100) refuel_stations[1] = refuel_stations[0] + randR(500,1000);
        if(balloon.wy <= 0)
        {
          if(abs(refuel_stations[0]-balloon.wx) < 30) { fuel += 15; refuel_stations[0] = refuel_stations[1] + randR(500,1000); }
          if(abs(refuel_stations[1]-balloon.wx) < 30) { fuel += 15; refuel_stations[1] = refuel_stations[0] + randR(500,1000); }
        }
      },
      function() {
        steps[cur_step].next_station.wx = min(refuel_stations[0],refuel_stations[1]);
        steps[cur_step].next_station.wy = 0;
        screenSpace(camera,dc,steps[cur_step].next_station);
        var off = false;
        if(steps[cur_step].next_station.x < 10) { off = true; steps[cur_step].next_station.x = 10; }
        if(steps[cur_step].next_station.y < 10) { off = true; steps[cur_step].next_station.y = 10; }
        if(steps[cur_step].next_station.x > dc.width -20) { off = true; steps[cur_step].next_station.x = dc.width-20; }
        if(steps[cur_step].next_station.y > dc.height-90) { off = true; steps[cur_step].next_station.y = dc.height-90; }
        if(off)
        {
          ctx.strokeStyle = "#FF0000";

          var sx = balloon.x+balloon.w/2;
          var sy = balloon.y+balloon.h/2;
          var ex = steps[cur_step].next_station.x+5;
          var ey = steps[cur_step].next_station.y+5;
          var dx = ex-sx;
          var dy = ey-sy;
          var dd = Math.sqrt(dx*dx+dy*dy);

          sx = sx + (dx/dd)*(dd-40);
          sy = sy + (dy/dd)*(dd-40);

          drawArrow(dc,sx,sy,ex,ey,10);
          ctx.strokeStyle = "#000000";
        }
        else
        {
          ctx.fillStyle = "#FF0000";
          ctx.fillRect(steps[cur_step].next_station.x,steps[cur_step].next_station.y,10,10);
        }
        ctx.textAlign = "center";
        ctx.fillStyle = "#000000";
        ctx.fillText("Refuel Station",steps[cur_step].next_station.x,steps[cur_step].next_station.y-30)
        ctx.fillText(fdisp((steps[cur_step].next_station.wx-balloon.wx),1)+"m",steps[cur_step].next_station.x,steps[cur_step].next_station.y-15)
      },
      function() { if(fuel <= 0 && balloon.wy <= 0) { if(balloon.wx > game.refuel_best) game.refuel_best = balloon.wx; return true; } return false; }
    ));
    steps.push(new Step(
      noop,
      noop,
      function() {
        retry_btn.draw(dc);
        ctx.fillStyle = "#000000";
        ctx.textAlign = "right";
        ctx.fillText("Your Score:"+fdisp(balloon.wx,1)+"m",dc.width-10,30);
        ctx.fillText("Top Score:"+fdisp(game.refuel_best,1)+"m",dc.width-10,50);
        ctx.textAlign = "center";
        ctx.fillText("Retry",retry_btn.x+retry_btn.w/2,retry_btn.y+retry_btn.h/2);
      },
      function() { if(retry_btn.down) { cur_step = step_refuel-1; return true; } return false; }
    ));

    step_flappy = steps.length;
    steps.push(new Step(
      function() {
        resetState();
        resetBalloon();
        setDisp(0,0,true,true,true,true,true,true,true,true,true,false)
      },
      function()
      {
        fuel = 40;

        if(balloon.wx-pipe.wx > 100) { pipe.wx = pipe.wx+randR(200,500); pipe.wy = randR(30,100); }
      },
      function()
      {
        ctx.strokeStyle = "#FF0000";

        screenSpace(camera,dc,pipe);

        ctx.fillStyle = "#008800";
        ctx.fillRect(pipe.x,0,pipe.w,pipe.y);
        ctx.fillRect(pipe.x,pipe.y+pipe.h,pipe.w,dc.height-pipe.y-pipe.h);

        var off = false;
        if(pipe.x+pipe.w/2 < 10) { off = true; pipe.x = 10-pipe.w/2; }
        if(pipe.y+pipe.h/2 < 10) { off = true; pipe.y = 10-pipe.h/2; }
        if(pipe.x+pipe.w/2 > dc.width -20) { off = true; pipe.x = dc.width-20-pipe.w/2; }
        if(pipe.y+pipe.h/2 > dc.height-90) { off = true; pipe.y = dc.height-90-pipe.h/2; }
        if(off)
        {
          var sx = balloon.x+balloon.w/2;
          var sy = balloon.y+balloon.h/2;
          var ex = pipe.x+pipe.w/2;
          var ey = pipe.y+pipe.h/2;
          var dx = ex-sx;
          var dy = ey-sy;
          var dd = Math.sqrt(dx*dx+dy*dy);

          sx = sx + (dx/dd)*(dd-40);
          sy = sy + (dy/dd)*(dd-40);

          drawArrow(dc,sx,sy,ex,ey,10);
          ctx.strokeStyle = "#000000";
        }
        ctx.textAlign = "center";
        ctx.fillStyle = "#000000";
        ctx.fillText("Pipe Opening",pipe.x+pipe.w/2,pipe.y+pipe.h/2-30)
        ctx.fillText(fdisp((pipe.wx-balloon.wx),1)+"m",pipe.x+pipe.w/2,pipe.y+pipe.h/2-15)
      },
      function() {
        if(abs(balloon.wx-pipe.wx) < 10 && (balloon.wy-pipe.wy > 20 || pipe.wy-balloon.wy > 10))
        {
          if(pipe.wx-10 > game.flappy_best)
            game.flappy_best = pipe.wx-10;
          return true;
        }
        return false;
      }
    ));
    steps.push(new Step(
      noop,
      function() {
        balloon.wxv = 0;
        balloon.wx = pipe.wx-10;
        burn_pad.unpress();
      },
      function() {
        screenSpace(camera,dc,pipe);

        ctx.fillStyle = "#008800";
        ctx.fillRect(pipe.x,0,pipe.w,pipe.y);
        ctx.fillRect(pipe.x,pipe.y+pipe.h,pipe.w,dc.height-pipe.y-pipe.h);

        retry_btn.draw(dc);
        ctx.fillStyle = "#000000";
        ctx.textAlign = "right";
        ctx.fillText("Your Score:"+fdisp(balloon.wx,1)+"m",dc.width-10,30);
        ctx.fillText("Top Score:"+fdisp(game.flappy_best,1)+"m",dc.width-10,50);
        ctx.textAlign = "center";
        ctx.fillText("Retry",retry_btn.x+retry_btn.w/2,retry_btn.y+retry_btn.h/2);
      },
      function() { if(retry_btn.down) { cur_step = step_flappy-1; return true; } return false; }
    ));

    step_meditate = steps.length;
    steps.push(new Step(
      function() {
        resetState();
        resetBalloon();
        setDisp(0,0,false,false,false,false,false,false,false,false,false,false);
      },
      function() { fuel = 40; },
      noop,
      function() { return false; }
    ));

    cur_step = -1;
    switch(game.start)
    {
      case 0:cur_step = step_intro-1;break;
      case 1:cur_step = step_particles-1;break;
      case 2:cur_step = step_forces-1;break;
      case 3:cur_step = step_density-1;break;
      case 4:cur_step = step_free-1;break;
      case 5:cur_step = step_standard-1;break;
      case 6:cur_step = step_refuel-1;break;
      case 7:cur_step = step_flappy-1;break;
      case 8:cur_step = step_meditate-1;break;
    }

    self.nextStep();

  };

  self.nextStep = function()
  {
    cur_step = (cur_step+1)%steps.length;
    steps[cur_step].begin();
  }

  var n_ticks = 0;
  self.tick = function()
  {
    n_ticks++;
    if(part_disp < target_part_disp) { part_disp += 0.02; if(part_disp > 1) part_disp = 1; }
    if(part_disp > target_part_disp) { part_disp -= 0.02; if(part_disp < 0) part_disp = 0; }
    if(arrow_disp < target_arrow_disp) { arrow_disp += 0.02; if(arrow_disp > 1) arrow_disp = 1; }
    if(arrow_disp > target_arrow_disp) { arrow_disp -= 0.02; if(arrow_disp < 0) arrow_disp = 0; }

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
    domclicker.flush();

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
    if(balloon.wx-boost.wx > 100) { boost.wx = boost.wx+randR(200,500); boost.wy = randR(30,100); }
    //if(abs(balloon.wx-boost.wx) < 10 && abs(balloon.wy-boost.wy) < 20) { balloon.wxv += 10; boost.wx = boost.wx+randR(200,500); boost.wy = randR(30,100); }

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
    camera.ww = camera.wh/9*16;

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
    for(var i = 0; i < bg.length; i++) screenSpace(bgcam,dc,bg[i]);
    for(var i = 0; i < mg.length; i++) screenSpace(mgcam,dc,mg[i]);
    for(var i = 0; i < fg.length; i++) screenSpace(fgcam,dc,fg[i]);
    screenSpace(camera,dc,ground);
    while(grid.wx+(grid.ww/10) < camera.wx) grid.wx += grid.ww/10;
    while(grid.wx-(grid.ww/10) > camera.wx) grid.wx -= grid.ww/10;
    while(grid.wy+(grid.wh/10) < camera.wy) grid.wy += grid.wh/10;
    while(grid.wy-(grid.wh/10) > camera.wy) grid.wy -= grid.wh/10;
    screenSpace(camera,dc,grid);

    steps[cur_step].tick();
    if(steps[cur_step].test()) self.nextStep();
  }

  self.draw = function()
  {
    //sky
    ctx.fillStyle = "#8899BB";
    ctx.fillRect(0,0,dc.width,dc.height);
    for(var i = 0; i < bg.length; i++) bg[i].draw(bg[i]);
    for(var i = 0; i < mg.length; i++) mg[i].draw(mg[i]);
    //ground
    ctx.fillStyle = "#88FFAA";
    ctx.fillRect(0,ground.y,dc.width,dc.height-ground.y);
    for(var i = 0; i < fg.length; i++) fg[i].draw(fg[i]);

    drawGrid(grid);
    ctx.lineWidth = 2;


    ctx.globalAlpha = clamp(0,1,1-(balloon.wy/20));
    drawShadow(shadow);
    ctx.globalAlpha = 1;
    drawWind();
    //drawBoost();
    drawAirParticles();
    if(burn_pad.down && fuel > 0) drawFlame(flame);
    if(!rope_cut)
    {
      ctx.beginPath();
      ctx.moveTo(shadow.x,shadow.y+shadow.h);
      ctx.lineTo(basket.x+basket.w/2,basket.y+basket.h*3/4);
      ctx.moveTo(shadow.x+shadow.w,shadow.y+shadow.h);
      ctx.lineTo(basket.x+basket.w/2,basket.y+basket.h*3/4);
      ctx.stroke();
    }
    drawBasket(basket);
    drawBalloon(balloon);
    drawForceArrows();

    ctx.textAlign = "center";
    //burn_pad.draw(dc);
    if(burn_pad.down) ctx.drawImage(burn_btn_red_img,burn_pad.x,burn_pad.y,burn_pad.w,burn_pad.h);
    else              ctx.drawImage(    burn_btn_img,burn_pad.x,burn_pad.y,burn_pad.w,burn_pad.h);
    ctx.fillStyle = "#000000";
    ctx.fillText("Burn",burn_pad.x+burn_pad.w/2,burn_pad.y+burn_pad.h/2);

    //flap_pad.draw(dc);
    if(flap_pad.down) ctx.drawImage(flap_btn_red_img,flap_pad.x,flap_pad.y,flap_pad.w,flap_pad.h);
    else              ctx.drawImage(    flap_btn_img,flap_pad.x,flap_pad.y,flap_pad.w,flap_pad.h);
    ctx.fillStyle = "#000000";
    ctx.fillText("Open Flap",flap_pad.x+flap_pad.w/2,flap_pad.y+flap_pad.h/2);

    if(!rope_cut)
    {
      //cut_pad.draw(dc);
      if(cut_pad.down) ctx.drawImage(rope_btn_red_img,cut_pad.x,cut_pad.y,cut_pad.w,cut_pad.h);
      else             ctx.drawImage(    rope_btn_img,cut_pad.x,cut_pad.y,cut_pad.w,cut_pad.h);
      ctx.fillStyle = "#000000";
      ctx.fillText("Cut Rope",cut_pad.x+cut_pad.w/2,cut_pad.y+cut_pad.h/2);
    }

    menu_btn.draw(dc);
    ctx.fillStyle = "#000000";
    ctx.fillText("Menu",menu_btn.x+menu_btn.w/2,menu_btn.y+menu_btn.h/2);
    if(cur_step == step_free)
    {
      reset_btn.draw(dc);
      ctx.fillStyle = "#000000";
      ctx.fillText("Reset",reset_btn.x+reset_btn.w/2,reset_btn.y+reset_btn.h/2);
      arrows_btn.draw(dc);
      ctx.fillStyle = "#000000";
      ctx.fillText("Arrows",arrows_btn.x+arrows_btn.w/2,arrows_btn.y+arrows_btn.h/2);
      parts_btn.draw(dc);
      ctx.fillStyle = "#000000";
      ctx.fillText("Particles",parts_btn.x+parts_btn.w/2,parts_btn.y+parts_btn.h/2);
    }

    ctx.textAlign = "right";
    ctx.fillStyle = "#000000";
    if(cur_step != step_meditate)
      ctx.fillText(fdisp(balloon.wx,1)+"m",dc.width-10,12);

    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    drawGauge(outside_temp_gauge); if(outside_temp_gauge.vis) drawAroundDecimal(dc,outside_temp_gauge.x+outside_temp_gauge.w/2,outside_temp_gauge.y-10,round((env_temp*(9/5)-459)*100)/100,"","°F");
    drawGauge(inside_temp_gauge);  if(inside_temp_gauge.vis)  drawAroundDecimal(dc,  inside_temp_gauge.x+inside_temp_gauge.w/2, inside_temp_gauge.y-10,round((balloon.t*(9/5)-459)*100)/100,"","°F")
    ctx.textAlign = "center";
    drawGauge(weight_gauge);       if(weight_gauge.vis) ctx.fillText(round((balloon.m+balloon.bm)/1000)+"kg",weight_gauge.x+weight_gauge.w/2,weight_gauge.y-10)
    drawGauge(volume_gauge);       if(volume_gauge.vis) ctx.fillText(                  round(balloon.v)+"m3",volume_gauge.x+volume_gauge.w/2,volume_gauge.y-10)
    drawGauge(density_gauge);
    drawGauge(bouyancy_gauge);
    drawGauge(altitude_gauge);     if(altitude_gauge.vis) drawAroundDecimal(dc,altitude_gauge.x+altitude_gauge.w/2,altitude_gauge.y-10,fdisp(balloon.wy,2),"","m")
    drawGauge(xvel_gauge);         if(xvel_gauge.vis)     drawAroundDecimal(dc,        xvel_gauge.x+xvel_gauge.w/2,    xvel_gauge.y-10,fdisp(balloon.wxv*fps,2),"","m/s")
    drawGauge(yvel_gauge);         if(yvel_gauge.vis)     drawAroundDecimal(dc,        yvel_gauge.x+yvel_gauge.w/2,    yvel_gauge.y-10,fdisp(balloon.wyv*fps,2),"","m/s")
    drawGauge(fuel_gauge);         if(fuel_gauge.vis)     drawAroundDecimal(dc,        fuel_gauge.x+fuel_gauge.w/2,    fuel_gauge.y-10,fdisp(fuel,2),"","G")

/*
    var o = new Obj();
    o.x = 10;
    o.y = 10;
    o.w = 10;
    o.h = 10;
    drawMountain(o);
*/
    dom.draw(dc);
    steps[cur_step].draw();
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
  var Obj = function(wx,wy,ww,wh,id)
  {
    var self = this;

    self.id = id;

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
    var s = balloon.h/30;
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
    var s = balloon.h/30;
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
    ctx.fillStyle = "#FFFFFF";

    tmp.x = 0;
    tmp.y = 0;
    tmp.w = 1;
    tmp.h = 1;
    worldSpace(camera,dc,tmp);
    var maxy = min(wind.length,Math.ceil(tmp.wy)+4);
    tmp.y = dc.height-1;
    worldSpace(camera,dc,tmp);
    var miny = max(0,Math.floor(tmp.wy)-4);

    tmp.wx = camera.wx;
    tmp.wy = 0;
    tmp.ww = camera.ww;
    tmp.wh = 1;

    var a;
    for(var i = miny; i < maxy; i++)
    {
      if(i%4 != 0) continue;
      a = (wind[i]-0.55)*2;
      if(a < 0) continue;
      ctx.globalAlpha = a;
      tmp.wy = i;
      screenSpace(camera,dc,tmp);
      ctx.drawImage(speed_canv,dc.width/2-5+a*80-40,tmp.y,10*3,tmp.h*3);
    }
    ctx.globalAlpha = 1;
  }
  var drawBoost = function()
  {
    screenSpace(camera,dc,boost);
    ctx.drawImage(speed_canv,boost.x,boost.y,10*5,boost.h*5);
  }
  var tickAirParticles = function()
  {
    if(part_disp <= 0) return;
    var p;
    var temp = (tempForHeight(env_temp,balloon.wy)-290)/5; //~0 to ~1
    var n_parts = round((15-temp)*20);
    n_parts *= 4;
    n_parts = min(n_parts,air_parts.length-1);
    var s = balloon.h/30;
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
    if(part_disp <= 0) return;
    var p;
    var temp = (tempForHeight(env_temp,balloon.wy)-290)/5; //~0 to ~1
    var n_parts = round((15-temp)*20);
    var br = balloon.w;
    var brsqr = br*br;
    n_parts *= 4;
    n_parts = min(n_parts,air_parts.length-1);
    var d;

    for(var i = 0; i < n_parts; i++)
    {
      p = air_parts[i];
      d = distsqr(p,balloon)/brsqr;

      if(d > 1) p.t = 101;
      else
      {
        ctx.globalAlpha = min(1,(1-d)*2)*part_disp;
        ctx.drawImage(part_canv,p.x,p.y,p.w,p.h);
      }
    }
    ctx.globalAlpha = 1;
  }
  var tickBalloonParticles = function()
  {
    if(part_disp <= 0) return;
    var p;
    var temp = (balloon.t-290)/5; //~1 to ~14 (at same scale used by drawAirParts)
    var n_parts = round((15-temp)*20);
    n_parts = min(n_parts,balloon_parts.length-1);
    var s = balloon.h/30;
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
    if(part_disp <= 0) return;
    var p;
    var temp = (balloon.t-290)/5; //~1 to ~14 (at same scale used by drawAirParts)
    var n_parts = round((15-temp)*20);
    n_parts = min(n_parts,balloon_parts.length-1);
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
        //ctx.globalAlpha = min(1,(1-d)*2)*part_disp;
        ctx.globalAlpha = part_disp;
        ctx.drawImage(part_canv,p.x,p.y,p.w,p.h);
      }
    }
    ctx.globalAlpha = 1;
  }
  var drawFlame = function(obj)
  {
    ctx.drawImage(flame_canv,obj.x,obj.y,obj.w,obj.h);
  }
  var drawShadow = function(obj)
  {
    ctx.drawImage(shadow_canv,obj.x,obj.y,obj.w,obj.h);
  }
  var drawBasket = function(obj)
  {
    ctx.drawImage(basket_canv,obj.x,obj.y,obj.w,obj.h);
  }
  var drawBalloon = function(obj)
  {
    ctx.drawImage(balloon_canv,obj.x,obj.y,obj.w,obj.h);
    drawBalloonParticles();
  }
  var drawGrid = function(obj)
  {
    ctx.lineWidth = 0.1;
    for(var i = 0; i < 11; i++)
    {
      var x = lerp(obj.x,obj.x+obj.w,i/10);
      ctx.beginPath();
      ctx.moveTo(x,obj.y);
      ctx.lineTo(x,obj.y+obj.h);
      ctx.stroke();
      var y = lerp(obj.y,obj.y+obj.h,i/10);
      ctx.beginPath();
      ctx.moveTo(obj.x,y);
      ctx.lineTo(obj.x+obj.w,y);
      ctx.stroke();
    }
  }
  var drawCloud    = function(obj) { ctx.drawImage(obj.id == 0 ? cloud_0_img : (obj.id == 1 ? cloud_1_img : cloud_2_img),obj.x,obj.y,obj.w,obj.h); }
  var drawMountain = function(obj) { ctx.drawImage(mountain_canv,obj.x,obj.y,obj.w,obj.h); }
  var drawTree     = function(obj) { ctx.drawImage(obj.id == 0 ? tree_0_img : tree_1_img,obj.x,obj.y,obj.w,obj.h); }
  var drawGauge    = function(g)
  {
    if(!g.vis) return;
    ctx.drawImage(gauge_img,g.x,g.y,g.w,g.h);

    var t = mapVal(g.min,g.max,g.mint,g.maxt,g.val);
    if(t > g.maxt) t = g.maxt;
    if(t < g.mint) t = g.mint;

    ctx.save();
    ctx.translate(g.x+g.w/2,g.y+g.h/2);
    ctx.rotate(t);
    ctx.drawImage(needle_img,-2.5,-3,27,6);
    ctx.restore();

    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.fillText(g.t1,g.x+g.w/2,g.y+g.h+12);
    ctx.fillText(g.t2,g.x+g.w/2,g.y+g.h+12+12);
  }
  var drawForceArrows = function()
  {
    if(arrow_disp <= 0) return;
    var t = (balloon.wya+0.04)/0.04;
    var bcx = balloon.x+balloon.w/2;
    var bcy = balloon.y+balloon.h/2;
    ctx.globalAlpha = arrow_disp;
    ctx.drawImage(down_arrow_canv,bcx-50+t*25,bcy,100-t*50,100-t*50);
    ctx.drawImage(down_arrows_canv,balloon.x-100,bcy-50,100,100);
    ctx.drawImage(down_arrows_canv,balloon.x+balloon.w,bcy-50,100,100);
    ctx.drawImage(up_arrow_canv,bcx-25,bcy-50,50,50);
    ctx.globalAlpha = 1;
  }

  var Gauge = function(t1,t2,x,y,w,h,mint,maxt,min,max,minvalid,maxvalid,altered)
  {
    var self = this;
    self.t1 = t1;
    self.t2 = t2;

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
    self.minvalid = minvalid;
    self.maxvalid = maxvalid;
    self.val = self.min;
    self.r = Math.min(self.w,self.h)/2;

    self.vis = false;
    self.enabled = false;

    self.tick = function()
    {
      if(!self.vis || !self.enabled) { self.dragging = false; }
      if(self.dragging && altered)
        altered(self.last_val)
    }

    self.dragging = false;
    self.last_val = self.min;
    self.dragStart = function(evt)
    {
      if(!self.vis || !self.enabled) { self.dragging = false; return; }
      self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(!self.vis || !self.enabled) { self.dragging = false; return; }
      var x = evt.doX-self.cx;
      var y = evt.doY-self.cy;
      var t = atan2(y,x);
      if(t < halfpi) t += twopi;
      var val = mapVal(self.mint,self.maxt,self.min,self.max,t)
      if(val < self.maxvalid && val > self.minvalid)
        self.last_val = val;
    }
    self.dragFinish = function()
    {
      if(!self.vis || !self.enabled) { self.dragging = false; return; }
      self.dragging = false;
    }

  }

  var releaseUI = function()
  {
    burn_pad.unpress();
    flap_pad.unpress();
    cut_pad.unpress();
  }

  var resetState = function()
  {
    pipe.wy = randR(30,100);
    pipe.wx = randR(100,400);
    boost.wy = randR(30,100);
    boost.wx = randR(100,400);
    fuel = 40;
    rope_cut = false;
    env_temp = default_env_temp;
  }
  var resetBalloon = function()
  {
    balloon.wx = 0;
    balloon.wy = 0;
    balloon.wxa = 0;
    balloon.wya = 0;
    balloon.wxv = 0;
    balloon.wyv = 0;
    balloon.t = env_temp;
  }
  var cloneObj = function(from,to)
  {
    to.id = from.id;

    to.x = from.x;
    to.y = from.y;
    to.w = from.w;
    to.h = from.h;

    to.wx = from.wx;
    to.wy = from.wy;
    to.ww = from.ww;
    to.wh = from.wh;

    to.wxa = from.wxa;
    to.wya = from.wya;
    to.wxv = from.wxv;
    to.wyv = from.wyv;

    to.m = from.m;
    to.bm = from.bm;
    to.t = from.t;
    to.v = from.v;

    to.colliding = from.colliding;
  }

  var setDisp = function(parts,arrows,outsidet,insidet,weight,vol,dens,bouy,alt,xvel,yvel,fuel)
  {
    target_part_disp = parts;
    target_arrow_disp = arrows;
    outside_temp_gauge.vis = outsidet;
    inside_temp_gauge.vis = insidet;
    weight_gauge.vis = weight;
    volume_gauge.vis = vol;
    density_gauge.vis = dens;
    bouyancy_gauge.vis = bouy;
    altitude_gauge.vis = alt;
    xvel_gauge.vis = xvel;
    yvel_gauge.vis = yvel;
    fuel_gauge.vis = fuel;
  }

  var pop = function(msg,callback) { if(!callback) callback = dismissed; releaseUI(); input_state = IGNORE_INPUT; bmwrangler.popMessage(msg,callback); }
  var dismissed = function() { input_state = RESUME_INPUT; }

  var Step = function(begin,tick,draw,test) { this.begin = begin; this.tick = tick; this.draw = draw; this.test = test; }
};

