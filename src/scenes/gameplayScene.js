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
  var fallback_click;
  var hit_ui;

  ENUM = 0;
  var IGNORE_INPUT = ENUM; ENUM++;
  var RESUME_INPUT = ENUM; ENUM++;
  var input_state;

  ENUM = 0;
  var SPEAKER_TALL = 0;
  var SPEAKER_AXE = 1;
  var SPEAKER_SHORT = 3;

  //objects
  var camera;
  var cam_target;
  var tmp; //used for any non-persistent calcs
  var grid;
  var shadow;
  var flame; var flame_t;
  var basket;
  var char;
  var char_pose;
  var char_time;
  var char_r_f;
  var char_r_t;
  var balloon;
  var clone_balloon;
  var rope;
  var bubble_origin;
  var vel_arrow;
  var acc_arrow;
  var arrow_separator;
  var balloon_parts;
  var air_parts;

  //scenery
  var vg; var vgi; var vgsep; var vgybase; var vgyrange; var vgcam;
  var bg; var bgi; var bgsep; var bgybase; var bgyrange; var bgcam;
  var mg; var mgi; var mgsep; var mgybase; var mgyrange; var mgcam;
  var fg; var fgi; var fgsep; var fgybase; var fgyrange; var fgcam;
  var faux_ground; var faux_ground_i; var faux_ground_sep;
  var sky;
  var ground;

  //ui
  var burn_pad;
  var flap_pad;
  var cut_pad;

  var eye_btn; var drawer_disp; var drawer_disp_target;
  var menu_btn;
  var retry_btn;
  var modal_menu_btn;
  var modal_retry_btn;
  var reset_btn;
  var parts_btn;
  var arrows_btn;

  //gauges
  var outside_temp_gauge;
  var inside_temp_gauge;
  var weight_gauge;
  var volume_gauge;
  var density_gauge;
  var buoyancy_gauge;
  var altitude_gauge;
  var xvel_gauge;
  var yvel_gauge;
  var fuel_gauge;
  var selected_gauge;
  var slider;

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
  var fuel_pulse_n;
  var clone_fuel;

  var scene_title;
  var scene_n;

  var steps;
  var cur_step;
  var lines;
  var speaks;
  var speak_t;
  var speak_pose;
  var cur_line;

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
    ctx.font = "12px Open Sans";

    //state
    rope_cut = false;
    fuel = 40;
    fuel_pulse_n = 0;
    clone_fuel = fuel;

    scene_title = "";
    scene_n = 0;

    //doqueues
    dragger = new Dragger({source:stage.dispCanv.canvas});
    presser = new Presser({source:stage.dispCanv.canvas});
    domclicker = new Clicker({source:stage.dispCanv.canvas});
    dom = new CanvDom(dc);
    fallback_click = {x:0,y:0,w:dc.width,h:dc.height,click:function(evt){if(!hit_ui)dom.click(evt);}};
    input_state = RESUME_INPUT;

    camera = new Camera();
    camera.wh = 30;
    camera.ww = camera.wh/dc.height*dc.width;
    cam_target = new Camera();
    cam_target.wh = camera.wh;
    cam_target.ww = camera.ww/dc.height*dc.width;
    vgcam = new Camera();
    bgcam = new Camera();
    mgcam = new Camera();
    fgcam = new Camera();
    tickParallax();
    grid = new Obj(0,0,250,250,0);
    tmp = new Obj(0,0,0,0,0);
    shadow = new Obj(0,0,10,2,0);
    flame = new Obj(0,0,2,4,0);
    flame_t = 0;
    basket = new Obj(0,0,4,4,0);
    char = new Obj(0,0,4,4,0);
    char_r_f = 100;
    char_r_t = 200;
    char_pose = [];
    for(var i = 0; i < char_imgs.length; i++)
      char_pose[i] = randIntBelow(3);
    char_time = [];
    for(var i = 0; i < char_imgs.length; i++)
      char_time[i] = Math.round(randR(char_r_f,char_r_t));
    balloon = new Obj(0,0,13,13,0);
    //balloon.t = 340;
    balloon.bm = hot_air_balloon_baggage;
    clone_balloon = new Obj();
    cloneObj(balloon,clone_balloon);
    rope = new Obj(0,0,10,4,0);
    bubble_origin = new Obj(0,0,0.1,0.1,0);
    vel_arrow = new Obj();
    acc_arrow = new Obj();
    arrow_separator = new Obj();

    screenSpace(camera,dc,balloon); //needs balloon space to init parts
    balloon_parts = [];
    for(var i = 0; i < 500; i++)
      balloon_parts.push(new Part(0));
    initBalloonParticles();
    air_parts = [];
    for(var i = 0; i < 5000; i++)
      air_parts.push(new Part(0));
    initAirParticles();

    //initial calibration
    basket.wx = balloon.wx;
    basket.wy = balloon.wy-balloon.wh*0.7;
    rope.wy = basket.wy-basket.wh/2;
    bubble_origin.wy = basket.wy+1;
    bubble_origin.w = 100;
    char.wx = basket.wx;
    char.wy = basket.wy;

    vgsep =  2; vgybase = 100; vgyrange = 40; vg = []; for(var i = 0; i <200; i++) { vg.push(new Obj(i*vgsep+rand0()*vgsep, rand0()*vgyrange+vgybase, 0.1+Math.random()*0.1, 0.1+Math.random()*0.1, randIntBelow(3))); vg[i].draw = drawPart;     } vgi = 0;
    bgsep = 10; bgybase =  12; bgyrange = 10; bg = []; for(var i = 0; i < 30; i++) { bg.push(new Obj(i*bgsep+rand0()*bgsep, rand0()*bgyrange+bgybase,     3+Math.random()*3,     2+Math.random()*3, randIntBelow(5))); bg[i].draw = drawCloud;    } bgi = 0;
    mgsep = 30; mgybase =  28; mgyrange = 20; mg = []; for(var i = 0; i < 20; i++) { mg.push(new Obj(i*mgsep+rand0()*mgsep, rand0()*mgyrange+mgybase,     4+Math.random()*4,     3+Math.random()*4, randIntBelow(5))); mg[i].draw = drawMountain; } mgi = 0;
    fgsep = 20; fgybase =  -1; fgyrange =  1; fg = []; for(var i = 0; i < 30; i++) { fg.push(new Obj(i*fgsep+rand0()*fgsep, rand0()*fgyrange+fgybase,                     8,                     8, randIntBelow(3))); fg[i].draw = drawTree;     } fgi = 0;
    faux_ground_sep = 100; faux_ground = []; for(var i = 0; i < 3; i++) { faux_ground.push(new Obj(i*faux_ground_sep, -20, faux_ground_sep+1, faux_ground_sep/2, i)); faux_ground[i].draw = drawGround; } faux_ground_i = 0;
    centerGrounds();
    sky = new Obj();
    ground = new Obj();

    burn_pad = new ButtonBox(dc.width-70,dc.height-210,60,60,function(){});
    flap_pad = new ButtonBox(dc.width-70,dc.height-140,60,60,function(){});
    cut_pad  = new ButtonBox(dc.width-70,dc.height-70 ,60,60,function(){});

    eye_btn    = new ButtonBox(dc.width-65,dc.height-250,50,30,function(){ hit_ui = true; if(drawer_disp_target <= 0.5) drawer_disp_target = 1; else if(drawer_disp_target > 0.5) drawer_disp_target = 0; }); drawer_disp = 0; drawer_disp_target = 0;
    menu_btn   = new ButtonBox(dc.width   ,dc.height-280,100,20,function(){ game.setScene(3); });
    retry_btn  = new ButtonBox(dc.width   ,dc.height-310,100,20,function(){ });
    modal_menu_btn  = new ButtonBox(500,475,160,40,function(){ });
    modal_retry_btn = new ButtonBox(220,475,160,40,function(){ });
    reset_btn  = new ButtonBox(dc.width   ,dc.height-310,100,20,function(){ if(cur_step != step_free) return; game.start = 4; game.setScene(4); });
    arrows_btn = new ButtonBox(dc.width   ,dc.height-340,100,20,function(){ if(cur_step != step_free) return; target_arrow_disp = (target_arrow_disp+1)%2; });
    parts_btn  = new ButtonBox(dc.width   ,dc.height-370,100,20,function(){ if(cur_step != step_free) return; target_part_disp = (target_part_disp+1)%2; });
    presser.register(burn_pad);
    presser.register(flap_pad);
    presser.register(cut_pad);
    presser.register(retry_btn);
    presser.register(modal_menu_btn);
    presser.register(modal_retry_btn);
    //domclicker.register(dom); //let fallback click hear it

    domclicker.register(eye_btn);
    domclicker.register(menu_btn);
    domclicker.register(reset_btn);
    domclicker.register(arrows_btn);
    domclicker.register(parts_btn);
    domclicker.register(fallback_click);

    var b = 40;
    var w = (dc.width-(b*2))/10;
    var p = 15;
    var mint = pi*(3/4);
    var maxt = pi*(9/4);
    outside_temp_gauge = new Gauge("Outside","Temp",        w*0+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,280,380,0,999,function(v){ env_temp = v; return true; });
    inside_temp_gauge  = new Gauge("Balloon","Temp",        w*1+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,280,380,0,999,function(v){ balloon.t = v; return true; });
    weight_gauge       = new Gauge("","Weight",             w*2+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,2200000,3000000,0,99999999999999,function(v){ return; balloon.bm = v-balloon.m; return true; });
    volume_gauge       = new Gauge("","Volume",             w*3+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,500,8000,1,999999999999999999999,function(v){ balloon.v = v; balloon.ww = sqrt(balloon.v/(balloon.wh)); return true; });
    density_gauge      = new Gauge("","Density",            w*4+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,950,1200,1,999999999999999999999,function(v){ return false; });
    buoyancy_gauge     = new Gauge("Net","Force",           w*5+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,-.02,.02,-999999999,99999999999,function(v){ balloon.wya = v; return true; });
    altitude_gauge     = new Gauge("","Altitude",           w*6+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,0,100,-999999999,99999999999,function(v){ balloon.wy = v; return true; });
    xvel_gauge         = new Gauge("Horizontal","Velocity", w*7+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,-1,1,-999999999,99999999999,function(v){ balloon.wxv = v; return true; });
    yvel_gauge         = new Gauge("Vertical","Velocity",   w*8+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,-.2,.2,-999999999,99999999999,function(v){ balloon.wyv = v; return true; });
    fuel_gauge         = new Gauge("","Fuel",               w*9+p+b,p+b,w-(2*p),w-(2*p),mint,maxt,0,40,0,99999999999,function(v){ fuel = v; return true; });
    selected_gauge = undefined;
    slider = new Slider();

    presser.register(outside_temp_gauge);
    presser.register(inside_temp_gauge);
    presser.register(weight_gauge);
    presser.register(volume_gauge);
    presser.register(density_gauge);
    presser.register(buoyancy_gauge);
    presser.register(altitude_gauge);
    presser.register(xvel_gauge);
    presser.register(yvel_gauge);
    presser.register(fuel_gauge);
    dragger.register(slider);

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
    lines = [];
    speaks = [];
    speak_t = 0;
    speak_pose = 0;

    step_intro = steps.length;
    steps.push(new Step(
      function(){
        scene_title = "Intro";
        scene_n = 300;
        setDisp(0,0,true,true,false,false,false,false,false,false,false,false);
        pop([
        "It's ready!",
        "Can this thing actually fly?",
        "Let's find out!",
        ],
        [
          SPEAKER_TALL,
          SPEAKER_SHORT,
          SPEAKER_TALL,
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      noop,
      function() { fuel = 4; rope_cut = false; },
      function() { drawHeatTip("Hold to heat balloon!",125); },
      function() { return balloon.t > 305; }
    ));
    steps.push(new Step(
      noop,
      function() { fuel = 4; rope_cut = false; },
      function() { drawHeatTip("Keep holding!",125); },
      function() { return balloon.t > 315; }
    ));
    steps.push(new Step(
      noop,
      function() { fuel = 4; rope_cut = false; },
      function() { drawHeatTip("Almost there!",125); },
      function() { return balloon.t > 325; }
    ));
    steps.push(new Step(
      noop,
      function() { fuel = 4; rope_cut = false; },
      function() { drawHeatTip("Just a little longer!",125); },
      function() { return balloon.t > 335; }
    ));
    steps.push(new Step(
      noop,
      function() { fuel = 4; rope_cut = false; },
      function() { drawHeatTip("Aaaaannnndd...",125); },
      function() { if(balloon.t > 343.5) { cloneObj(balloon,clone_balloon); return true; } return false; }
    ));
    steps.push(new Step(
      function() {
        pop([
          "It's working! We've heated the balloon enough to rise off the ground!",
          "Cut the rope! Cut the rope!",
        ],
        [
          SPEAKER_TALL,
          SPEAKER_AXE,
        ]);
      },
      function() { balloon.t = clone_balloon.t; },
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() { fuel = 4; },
      function() { balloon.t = clone_balloon.t; },
      function() { drawCutTip("Cut the rope!"); },
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
          "We're FLYING!!!",
          "Wait... how does this thing work?",
          "It's easy! Heat the balloon to rise higher, and open the flap to sink back down.",
          "Just make sure to keep an eye on our fuel!",
        ],
        [
          SPEAKER_SHORT,
          SPEAKER_SHORT,
          SPEAKER_TALL,
          SPEAKER_TALL,
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
      function() { return balloon.wy < 0.01 || fuel <= 0.01; }
    ));
    steps.push(new Step(
      function() {
        if(fuel <= 0.01)
        {
          pop([
            "Uh oh... out of fuel!",
            "Hold on tight!",
          ],
          [
            SPEAKER_SHORT,
            SPEAKER_TALL,
          ]);
        }
        altitude_gauge.vis = true;
        xvel_gauge.vis = true;
        yvel_gauge.vis = true;
        fuel_gauge.vis = true;
      },
      noop,
      noop,
      function() { return (input_state == RESUME_INPUT && balloon.wy < 0.01); }
    ));
    steps.push(new Step(
      function(){
        pop([
          "Whoa... That. Was. AWESOME!",
          "Check it out! We traveled "+fdisp(balloon.wx,1)+" meters!",
          "But how? How are we flying?!",
          "Are we... magic?",
          "Actually, it's just buoyancy!",
          "Let's go again. I'll show you how it works!",
        ],
        [
          SPEAKER_AXE,
          SPEAKER_TALL,
          SPEAKER_SHORT,
          SPEAKER_AXE,
          SPEAKER_TALL,
          SPEAKER_TALL,
        ]);
        game.intro_complete = true;
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
        scene_title = "Particles";
        scene_n = 300;
        setDisp(1,0,true,true,false,false,false,false,true,true,true,true);
        pop([
          "Those are air particles bouncing around.",
          "Oooh... pretty.",
          "Right now, the air inside the balloon is about the same temperature as the air outside.",
          "So the air particles are all moving at the same speed.",
          "Let's heat the balloon again. Check out what happens to the air particles.",
        ],
        [
          SPEAKER_TALL,
          SPEAKER_SHORT,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_TALL,
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() { },
      function() { rope_cut = false; if(fuel < 4) fuel = 4; },
      function() { drawHeatTip("Hold to heat balloon!",125); },
      function() { if(balloon.t > 343.5) { cloneObj(balloon,clone_balloon); clone_fuel = fuel; return true; } return false; }
    ));
    steps.push(new Step(
      function() {
        pop([
          "Wahoo!!",
          "See how the air particles in the balloon are moving faster now?",
          "They're dancing!!",
          "The molecules bouncing around create more pressure inside the balloon.",
          "The pressure pushes air out, making the balloon lighter than the air around it.",
          "And the balloon starts to float!",
          "Ohhhh. I get it. We're not magic...",
          "BUOYANCY is magic!", //CRIT NOPE
          "Abracadabra!",
        ],
        [
          SPEAKER_AXE,
          SPEAKER_TALL,
          SPEAKER_SHORT,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_AXE,
          SPEAKER_AXE,
          SPEAKER_AXE,
        ]);
      },
      function() { rope_cut = false; fuel = clone_fuel; balloon.t = clone_balloon.t; },
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      noop,
      function() { fuel = clone_fuel; balloon.t = clone_balloon.t; },
      function() { drawCutTip("Cut the rope!"); },
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
          "Sigh.",
          "Think about it this way. It's like the beach ball on the pond",
          "The beach ball is filled with air, and air is lighter than water...", //CRIT DIFF MATS
          "So the beach ball floats!",
          "Ohhhhh!",
          "Abraca... um... science!", //CRIT WUT
          "Why do lighter things float?",
          "Tell us later! I want to fly again!",
          "Okay, okay...",
          "Let's see if we can go farther than last time!",
          "Heat the balloon just enough to stay level with the wind.",
          "The wind will help us move faster!",
        ],
        [
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_AXE,
          SPEAKER_AXE,
          SPEAKER_SHORT,
          SPEAKER_AXE,
          SPEAKER_SHORT,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_TALL,
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
          "Aaaand... touchdown!",
          "This time, we travelled "+fdisp(balloon.wx,1)+" meters.",
          "Ok, so tell us now!",
          "Why do lighter things float?",
          "Actually, the answer is gravity.",
          "Wait... doesn't gravity make things fall down? How can it make us fly too?",
          "Let's reset again and I'll show you!",
        ],
        [
          SPEAKER_AXE,
          SPEAKER_TALL,
          SPEAKER_SHORT,
          SPEAKER_SHORT,
          SPEAKER_TALL,
          SPEAKER_SHORT,
          SPEAKER_TALL,
        ]);
        game.particles_complete = true;
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));

    step_forces = steps.length;
    steps.push(new Step(
      function() {
        scene_title = "Forces";
        scene_n = 300;
        resetState();
        resetBalloon();
      },
      function() { resetState(); },
      noop,
      function() { return camera.wx < 0.2; }
    ));
    steps.push(new Step(
      function(){
        setDisp(1,0,true,true,false,false,false,false,true,true,true,true);
        pop([
          "So gravity makes hot air balloons float?",
          "How??",
          "Well, it might help to explain a little more about gravity first.",
          "Gravity pulls down on everything... on planet Earth, anyway.",
          "Everything?? Even little caterpillars and clouds and... me?!",
          "Yep! That's how you can walk around without floating away.",
          "Gravity applies a downward force and keeps you on the ground.",
          "Wow... thanks, gravity!!",
          "But what does that have to do with our balloon?",
          "Gravity pulls down on everything... including our balloon!",
        ],
        [
          SPEAKER_SHORT,
          SPEAKER_SHORT,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_SHORT,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_SHORT,
          SPEAKER_SHORT,
          SPEAKER_TALL,
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
        ctx.drawImage(arrow_down_img,bcx-50,bcy-10,100,100);
        ctx.globalAlpha = 1;
      },
      function() { return steps[cur_step].t >= 100; }
    ));
    steps.push(new Step(
      function(){
        pop([
          "But that's not all... gravity also pulls down on all those tiny air particles.",
        ],
        [
          SPEAKER_TALL,
        ]);
      },
      noop,
      function() {
        var bcx = balloon.x+balloon.w/2;
        var bcy = balloon.y+balloon.h/2;
        ctx.drawImage(arrow_down_img,bcx-50,bcy-10,100,100);
      },
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() { steps[cur_step].t = 0; },
      function() { steps[cur_step].t++; resetState(); },
      function() {
        var bcx = balloon.x+balloon.w/2;
        var bcy = balloon.y+balloon.h/2;
        ctx.drawImage(arrow_down_img,bcx-50,bcy-10,100,100);
        ctx.globalAlpha = steps[cur_step].t/100;
        ctx.drawImage(arrows_small_img,balloon.x-100,bcy-50,100,100);
        ctx.drawImage(arrows_small_img,balloon.x+balloon.w,bcy-50,100,100);
        ctx.globalAlpha = 1;
      },
      function() { return steps[cur_step].t >= 100; }
    ));
    steps.push(new Step(
      function(){
        pop([
          "See those arrows? They represent the downward force of gravity.",
          "Thanks to gravity, everything on earth -including those air particles- are constantly racing to get as low to the ground as they can.",
          "Right now, our balloon is heavier than the air particles around it.",
          "So even though the air particles WANT to get all the way to the ground, they're no match for our balloon."
        ],
        [
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_TALL,
        ]);
      },
      noop,
      function() {
        var bcx = balloon.x+balloon.w/2;
        var bcy = balloon.y+balloon.h/2;
        ctx.drawImage(arrow_down_img,bcx-50,bcy-10,100,100);
        ctx.drawImage(arrows_small_img,balloon.x-100,bcy-50,100,100);
        ctx.drawImage(arrows_small_img,balloon.x+balloon.w,bcy-50,100,100);
      },
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function(){
        steps[cur_step].t = 0;
        target_arrow_disp = 1;
        pop([
          "This seat's already taken!!",
          "Basically.",
          "So what happens if we make the balloon lighter?",
          "I bet you can guess!",
        ],
        [
          SPEAKER_SHORT,
          SPEAKER_TALL,
          SPEAKER_SHORT,
          SPEAKER_TALL,
        ]);
      },
      function() { steps[cur_step].t++; if(steps[cur_step].t > 100) steps[cur_step].t = 100;},
      function() {
        var bcx = balloon.x+balloon.w/2;
        var bcy = balloon.y+balloon.h/2;
        ctx.drawImage(arrow_down_img,bcx-50,bcy-10,100,100);
        ctx.drawImage(arrows_small_img,balloon.x-100,bcy-50,100,100);
        ctx.drawImage(arrows_small_img,balloon.x+balloon.w,bcy-50,100,100);
        ctx.globalAlpha = steps[cur_step].t/100;
        ctx.drawImage(arrow_up_img,bcx-25,bcy-50,50,50);
        ctx.globalAlpha = 1;
      },
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() { fuel = 40; },
      function() { if(fuel < 4) fuel = 4; rope_cut = false; },
      function() { drawHeatTip("Heat the balloon!",125); },
      function() { if(balloon.t > 343.5) { cloneObj(balloon,clone_balloon); return true; } return false; }
    ));
    steps.push(new Step(
      function() {
        pop([
          "Yay, gravity!!",
          "Wait... I still don't quite get it...",
          "It's basically a game of tug of war.",
          "Imagine if the two of us were playing tug of war against Charles, Max, Mr. Hart, Jack, Francis... there's no way we could win!",
          "Speak for yourself...",
          "Haha, very funny.",
          "But now imagine we took away a bunch of people on the other team, and just left Francis.",
          "Together, our pull on the rope would be stronger. We would win for sure!",
          "Oh... I get it!! At first the downward force of our balloon was stronger.",
          "But when we made our balloon lighter, the air particles were strong enough to push us out of the way and take our spot...",
          "They won the tug of war!",
          "Yep. And with our spot taken... there's nowhere to go but up!!",
          "So... what happens if we keep this temperature inside the balloon?",
          "The air particles will keep pushing us upward, and the balloon will keep rising and rising... forever.",
          "GULP",
          "Um... I can't fly away forever. I forgot to feed my hamster.",
          "Don't worry! Heat escapes the balloon naturally.",
          "When heat escapes, it lets more cool air back inside and makes us heavier",
          "So we'll eventually come back down.",
          "We can sink faster by opening the flap and letting out some of the heat.",
          "Phew.",
          "Ok, let's go again!",
          "I bet we can get even farther this time!",
        ],
        [
          SPEAKER_SHORT,
          SPEAKER_SHORT,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_SHORT,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_SHORT,
          SPEAKER_SHORT,
          SPEAKER_SHORT,
          SPEAKER_TALL,
          SPEAKER_SHORT,
          SPEAKER_TALL,
          SPEAKER_SHORT,
          SPEAKER_AXE,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_AXE,
          SPEAKER_SHORT,
          SPEAKER_SHORT,
        ]);
      },
      function() { rope_cut = false; fuel = clone_fuel; balloon.t = clone_balloon.t; },
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() { fuel = 4; },
      function() { fuel = 4; balloon.t = clone_balloon.t; },
      function() { drawCutTip("Cut the rope!"); },
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
          "This time, we traveled "+fdisp(balloon.wx,1)+" meters!",
          "Did you see what happened when the balloon stayed at a constant height?",
          "The up and down arrows were the same size!",
          "Yep! That means the upward and downward forces on our balloon were just about equal.",
          "When that happens, we keep floating at the same velocity... we don't accelerate up or down.",
          "We can call this neutrally buoyant.",
          "Wow... my mom says I'm never neutral about anything!!",
        ],
        [
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_AXE,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_AXE,
        ]);
        game.forces_complete = true;
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));

    step_density = steps.length;
    steps.push(new Step(
      function() {
        scene_title = "Density";
        scene_n = 300;
        resetState();
        resetBalloon();
      },
      function() { resetState(); },
      noop,
      function() { return camera.wx < 0.2; }
    ));
    steps.push(new Step(
      function(){
        setDisp(1,1,true,true,false,false,false,false,true,true,true,true);
        pop([
          "Hang on... if a balloon is lighter than the surrounding air, it starts to float...",
          "Yep!",
          "But a marble is lighter than even the lightest hot air balloon...",
          "OH NO! Is my marble collection going to float away??",
          "Nope, it's okay! When we say lighter than the surrounding air, we really mean lighter than the surrounding air of the same size.",
          "A marble-sized ball of air is much lighter than a marble, so the marble sinks!",
          "Thank goodness!",
          "So does that mean we can make our balloon go higher just by making it bigger?",
          "Exactly! Want to try it?",
        ],
        [
          SPEAKER_SHORT,
          SPEAKER_TALL,
          SPEAKER_SHORT,
          SPEAKER_SHORT,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_SHORT,
          SPEAKER_SHORT,
          SPEAKER_TALL,
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      function() {
        fuel = 40;
        selected_gauge = volume_gauge;
        volume_gauge.vis = true;
        volume_gauge.enabled = true;
      },
      function() {
        fuel = 40;
        balloon.t = env_temp;
        burn_pad.unpress();
        rope_cut = false;
      },
      function() {
        drawKnobTip("Drag to increase volume!",160);
      },
      function() { return balloon.v > 6000; }
    ));
    steps.push(new Step(
      function(){
        slider.dragging = false;
        pop([
          "Did you see what happened to those arrows?",
          "Now the downward force of gravity is close to the upward force of the air particles!",
          "We'll still need to heat the air in the balloon a tiny bit-",
          "But now we have more air to heat, so we won't need to heat it as much!",
        ],
        [
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_TALL,
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
      function() { drawHeatTip("Heat the balloon!",125); },
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
      function() { drawCutTip("Cut the rope!"); },
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
          "Cool! We can save fuel!",
          "I bet we can definitely break our record now!",
          "This time, try increasing the volume of our balloon mid-flight.",
        ],
        [
          SPEAKER_AXE,
          SPEAKER_SHORT,
          SPEAKER_TALL,
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
          "This time, we went "+fdisp(balloon.wx,1)+" meters.",
          "NICE!",
          "Can we try again?",
          "Yes! Let's keep flying!",
          "From now on, we can experiment with volume or temperature directly!",
          "Just touch the gauge you want to change!",
        ],
        [
          SPEAKER_TALL,
          SPEAKER_AXE,
          SPEAKER_SHORT,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_TALL,
        ]);
        game.density_complete = true;
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));

    step_free = steps.length;
    steps.push(new Step(
      function() {
        scene_title = "Free Play";
        scene_n = 300;
        resetState();
        resetBalloon();
        setDisp(0,0,true,true,true,true,true,true,true,true,true,true);
        outside_temp_gauge.enabled = true;
        inside_temp_gauge.enabled = true;
        weight_gauge.enabled = true;
        volume_gauge.enabled = true;
        density_gauge.enabled = true;
        buoyancy_gauge.enabled = true;
        altitude_gauge.enabled = true;
        xvel_gauge.enabled = true;
        yvel_gauge.enabled = true;
        fuel_gauge.enabled = true;
        if(game.start == 4)
        {
          pop([
            "Wheee!!! Time to fly!",
            "This is the playground, which means we can experiment with the volume or temperature gauges however we want!",
            "(Plus, infinite fuel!)",
            "Have fun!",
          ],
          [
            SPEAKER_SHORT,
            SPEAKER_TALL,
            SPEAKER_TALL,
            SPEAKER_TALL,
          ]);
        }
      },
      function() { fuel = 40; },
      noop,
      function() { return false; }
    ));

    step_standard = steps.length;
    steps.push(new Step(
      function() {
        scene_title = "Standard Game";
        scene_n = 300;
        resetState();
        resetBalloon();
        setDisp(0,0,true,true,true,true,true,true,true,true,true,true);
        outside_temp_gauge.enabled = false;
        inside_temp_gauge.enabled = false;
        weight_gauge.enabled = false;
        volume_gauge.enabled = false;
        density_gauge.enabled = false;
        buoyancy_gauge.enabled = false;
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
        var w = 520;
        var h = 300;
        var img_w = 340;
        var img_h = img_w * 858 / 924;

        ctx.fillStyle = "rgba(50,100,255,0.4)";
        ctx.fillRect(0, 0, dc.width, dc.height);
        ctx.fillStyle = "white";
        ctx.fillRect((dc.width - w) / 2, (dc.height - h) / 2 + 70, w, h);
        ctx.drawImage(nice_job_img, (dc.width - img_w) / 2, 25, img_w, img_h);

        ctx.textAlign = "center";
        ctx.font = "25px Open Sans";
        ctx.fillStyle = "black";
        ctx.fillText("Nice flight!", dc.width / 2, 380);
        ctx.font = "20px Open Sans";
        ctx.fillText("Your Score: "+fdisp(balloon.wx,1)+"m", dc.width / 2, 415);
        ctx.fillText("Top Score: "+fdisp(game.standard_best,1)+"m", dc.width / 2, 445);

        ctx.fillStyle = "rgb(86,160,171)";
        ctx.fillRect(modal_menu_btn.x, modal_menu_btn.y + 7, modal_menu_btn.w, modal_menu_btn.h);
        ctx.fillRect(modal_retry_btn.x, modal_retry_btn.y + 7, modal_retry_btn.w, modal_retry_btn.h);
        ctx.fillStyle = "rgb(140,216,226)";
        ctx.fillRect(modal_menu_btn.x, modal_menu_btn.y, modal_menu_btn.w, modal_menu_btn.h);
        ctx.fillRect(modal_retry_btn.x, modal_retry_btn.y, modal_retry_btn.w, modal_retry_btn.h);

        ctx.fillStyle = "white";
        ctx.fillText("Fly Again!", modal_retry_btn.x + modal_retry_btn.w / 2, modal_retry_btn.y + 28);
        ctx.fillText("Back to Menu", modal_menu_btn.x + modal_menu_btn.w / 2, modal_menu_btn.y + 28);
      },
      function() {
        if (modal_retry_btn.down) {
          cur_step = step_standard-1;
          return true;
        } else if (modal_menu_btn.down) {
          game.setScene(3);
          return true;
        }
        return false; 
      }
    ));

    step_refuel = steps.length;
    steps.push(new Step(
      function() {
        scene_title = "Refuel Game";
        scene_n = 300;
        resetState();
        resetBalloon();
        setDisp(0,0,true,true,true,true,true,true,true,true,true,true);
        outside_temp_gauge.enabled = false;
        inside_temp_gauge.enabled = false;
        weight_gauge.enabled = false;
        volume_gauge.enabled = false;
        density_gauge.enabled = false;
        buoyancy_gauge.enabled = false;
        altitude_gauge.enabled = false;
        xvel_gauge.enabled = false;
        yvel_gauge.enabled = false;
        fuel_gauge.enabled = false;
        steps[cur_step].next_station = new Obj();
        refuel_stations[0] = randR(100,200);
        refuel_stations[1] = refuel_stations[0]+randR(500,1000);
        pop([
        "This time we're on a mission!",
        "Ooh... what kind of mission?",
        "We're starting out without much fuel...",
        "But there are propane tanks spaced out along our route!",
        "Our goal is to make it from one tank to the next... without running out of fuel.",
        "No prob. Let's do it!",
        ],
        [
          SPEAKER_TALL,
          SPEAKER_SHORT,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_AXE,
        ]);
      },
      noop,
      function() {
        steps[cur_step].next_station.wx = min(refuel_stations[0],refuel_stations[1]);
        steps[cur_step].next_station.wy = 0;
        screenSpace(camera,dc,steps[cur_step].next_station);
        var off = false;
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

          ctx.save();
          ctx.translate(sx,sy);
          ctx.rotate(Math.atan2(ey-sy,ex-sx));
          ctx.drawImage(alert_bg_img,-20,-20,50,40);
          ctx.restore();
          ctx.drawImage(alert_danger_img,sx-5,sy-10,10,20);
          //drawArrow(dc,sx,sy,ex,ey,10);
          ctx.strokeStyle = "#000000";
        }
        else
        {
          ctx.fillStyle = "#FF0000";
          ctx.fillRect(steps[cur_step].next_station.x,steps[cur_step].next_station.y,10,10);
        }
        ctx.textAlign = "center";
        ctx.fillStyle = colorForHeight();
        if(off)
          ctx.fillText("Refuel Station",steps[cur_step].next_station.x-30,steps[cur_step].next_station.y-50)
        ctx.fillText(fdisp((steps[cur_step].next_station.wx-balloon.wx),1)+"m",steps[cur_step].next_station.x-30,steps[cur_step].next_station.y-35)
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
        ctx.drawImage(tank_img,steps[cur_step].next_station.x,steps[cur_step].next_station.y+150,100,100);
        var off = false;
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

          ctx.save();
          ctx.translate(sx,sy);
          ctx.rotate(Math.atan2(ey-sy,ex-sx));
          ctx.drawImage(alert_bg_img,-20,-20,50,40);
          ctx.restore();
          ctx.drawImage(alert_danger_img,sx-5,sy-10,10,20);
          //drawArrow(dc,sx,sy,ex,ey,10);
          ctx.strokeStyle = "#000000";
        }
        ctx.textAlign = "center";
        ctx.fillStyle = colorForHeight();
        if(off)
          ctx.fillText("Refuel Station",steps[cur_step].next_station.x-30,steps[cur_step].next_station.y-50)
        ctx.fillText(fdisp((steps[cur_step].next_station.wx-balloon.wx),1)+"m",steps[cur_step].next_station.x-30,steps[cur_step].next_station.y-35)
      },
      function() { if(fuel <= 0 && balloon.wy <= 0) { if(balloon.wx > game.refuel_best) game.refuel_best = balloon.wx; return true; } return false; }
    ));
    steps.push(new Step(
      noop,
      noop,
      function() {
        var w = 520;
        var h = 300;
        var img_w = 340;
        var img_h = img_w * 858 / 924;

        ctx.fillStyle = "rgba(50,100,255,0.4)";
        ctx.fillRect(0, 0, dc.width, dc.height);
        ctx.fillStyle = "white";
        ctx.fillRect((dc.width - w) / 2, (dc.height - h) / 2 + 70, w, h);
        ctx.drawImage(nice_job_img, (dc.width - img_w) / 2, 25, img_w, img_h);

        ctx.textAlign = "center";
        ctx.font = "25px Open Sans";
        ctx.fillStyle = "black";
        ctx.fillText("Nice flight!", dc.width / 2, 380);
        ctx.font = "20px Open Sans";
        ctx.fillText("Your Score: "+fdisp(balloon.wx,1)+"m", dc.width / 2, 415);
        ctx.fillText("Top Score: "+fdisp(game.refuel_best,1)+"m", dc.width / 2, 445);

        ctx.fillStyle = "rgb(86,160,171)";
        ctx.fillRect(modal_menu_btn.x, modal_menu_btn.y + 7, modal_menu_btn.w, modal_menu_btn.h);
        ctx.fillRect(modal_retry_btn.x, modal_retry_btn.y + 7, modal_retry_btn.w, modal_retry_btn.h);
        ctx.fillStyle = "rgb(140,216,226)";
        ctx.fillRect(modal_menu_btn.x, modal_menu_btn.y, modal_menu_btn.w, modal_menu_btn.h);
        ctx.fillRect(modal_retry_btn.x, modal_retry_btn.y, modal_retry_btn.w, modal_retry_btn.h);

        ctx.fillStyle = "white";
        ctx.fillText("Fly Again!", modal_retry_btn.x + modal_retry_btn.w / 2, modal_retry_btn.y + 28);
        ctx.fillText("Back to Menu", modal_menu_btn.x + modal_menu_btn.w / 2, modal_menu_btn.y + 28);
      },
      function() {
        if (modal_retry_btn.down) {
          cur_step = step_refuel-1;
          return true;
        } else if (modal_menu_btn.down) {
          game.setScene(3);
          return true;
        }
        return false; 
      }
    ));

    step_flappy = steps.length;
    steps.push(new Step(
      function() {
        scene_title = "Flappy Game";
        scene_n = 300;
        resetState();
        resetBalloon();
        setDisp(0,0,true,true,true,true,true,true,true,true,true,false)
        pop([
        "You guys ready for a challenge?",
        "Bring it on!",
        "This is a ballooning obstacle course!",
        "There are pipes along the route, blocking our way...",
        "But the pipes have gaps that are wide enough to fly through!",
        "Let's see how far we can get!",
        ],
        [
          SPEAKER_TALL,
          SPEAKER_AXE,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_TALL,
          SPEAKER_TALL,
        ]);
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

        ctx.drawImage(pipe_img,pipe.x,0,pipe.w,pipe.y);
        ctx.drawImage(pipe_img,pipe.x-10,pipe.y-40,pipe.w+20,40);
        ctx.drawImage(pipe_img,pipe.x,pipe.y+pipe.h,pipe.w,dc.height-pipe.y-pipe.h);
        ctx.drawImage(pipe_img,pipe.x-10,pipe.y+pipe.h,pipe.w+20,40);

        var off = false;
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

          ctx.save();
          ctx.translate(sx,sy);
          ctx.rotate(Math.atan2(ey-sy,ex-sx));
          ctx.drawImage(alert_bg_img,-20,-20,50,40);
          ctx.restore();
          ctx.drawImage(alert_danger_img,sx-5,sy-10,10,20);
          ctx.strokeStyle = "#000000";
        }
        ctx.textAlign = "center";
        ctx.fillStyle = colorForHeight();
        if(off)
          ctx.fillText("Pipe Opening",pipe.x+pipe.w/2-30,pipe.y+pipe.h/2-50)
        ctx.fillText(fdisp((pipe.wx-balloon.wx),1)+"m",pipe.x+pipe.w/2-30,pipe.y+pipe.h/2-35)
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
        drawer_disp_target = 1;
      },
      function() {
        screenSpace(camera,dc,pipe);

        ctx.drawImage(pipe_img,pipe.x,0,pipe.w,pipe.y);
        ctx.drawImage(pipe_img,pipe.x-10,pipe.y-40,pipe.w+20,40);
        ctx.drawImage(pipe_img,pipe.x,pipe.y+pipe.h,pipe.w,dc.height-pipe.y-pipe.h);
        ctx.drawImage(pipe_img,pipe.x-10,pipe.y+pipe.h,pipe.w+20,40);

        var w = 520;
        var h = 300;
        var img_w = 340;
        var img_h = img_w * 858 / 924;

        ctx.fillStyle = "rgba(50,100,255,0.4)";
        ctx.fillRect(0, 0, dc.width, dc.height);
        ctx.fillStyle = "white";
        ctx.fillRect((dc.width - w) / 2, (dc.height - h) / 2 + 70, w, h);
        ctx.drawImage(nice_job_img, (dc.width - img_w) / 2, 25, img_w, img_h);

        ctx.textAlign = "center";
        ctx.font = "25px Open Sans";
        ctx.fillStyle = "black";
        ctx.fillText("Nice flight!", dc.width / 2, 380);
        ctx.font = "20px Open Sans";
        ctx.fillText("Your Score: "+fdisp(balloon.wx,1)+"m", dc.width / 2, 415);
        ctx.fillText("Top Score: "+fdisp(game.flappy_best,1)+"m", dc.width / 2, 445);

        ctx.fillStyle = "rgb(86,160,171)";
        ctx.fillRect(modal_menu_btn.x, modal_menu_btn.y + 7, modal_menu_btn.w, modal_menu_btn.h);
        ctx.fillRect(modal_retry_btn.x, modal_retry_btn.y + 7, modal_retry_btn.w, modal_retry_btn.h);
        ctx.fillStyle = "rgb(140,216,226)";
        ctx.fillRect(modal_menu_btn.x, modal_menu_btn.y, modal_menu_btn.w, modal_menu_btn.h);
        ctx.fillRect(modal_retry_btn.x, modal_retry_btn.y, modal_retry_btn.w, modal_retry_btn.h);

        ctx.fillStyle = "white";
        ctx.fillText("Fly Again!", modal_retry_btn.x + modal_retry_btn.w / 2, modal_retry_btn.y + 28);
        ctx.fillText("Back to Menu", modal_menu_btn.x + modal_menu_btn.w / 2, modal_menu_btn.y + 28);
      },
      function() {
        if (modal_retry_btn.down) {
          cur_step = step_flappy-1;
          return true;
        } else if (modal_menu_btn.down) {
          game.setScene(3);
          return true;
        }
        return false; 
      }
    ));

    step_meditate = steps.length;
    steps.push(new Step(
      function() {
        scene_title = "Meditate";
        scene_n = 300;
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

    hit_ui = false;
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
    fuel_pulse_n++;
    scene_n--;
    if(fuel > 1) fuel_pulse_n = 0;
    if(part_disp < target_part_disp) { part_disp += 0.02; if(part_disp > 1) part_disp = 1; }
    if(part_disp > target_part_disp) { part_disp -= 0.02; if(part_disp < 0) part_disp = 0; }
    if(arrow_disp < target_arrow_disp) { arrow_disp += 0.02; if(arrow_disp > 1) arrow_disp = 1; }
    if(arrow_disp > target_arrow_disp) { arrow_disp -= 0.02; if(arrow_disp < 0) arrow_disp = 0; }

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

    if(cut_pad.down)
    {
      if(!rope_cut)
      {
        for(var i = 0; i < char_imgs.length; i++)
        {
          char_pose[i] = 2;
          char_time[i] = Math.round(randR(char_r_f,char_r_t));
        }
      }
      char_pose[3] = 1;
      rope_cut = true;
    }

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

    if(!rope_cut) balloon.wx = 0;
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
    basket.wy = balloon.wy-balloon.wh*0.7;
    bubble_origin.wy = basket.wy+1;
    char.wx = basket.wx;
    char.wy = basket.wy;

    shadow.wx = balloon.wx;
    shadow.wy = -balloon.wh/2-basket.wh*1.2;

    flame.wx = balloon.wx;
    flame.wy = balloon.wy-balloon.wh*.35;

    sky.wx = 0;
    sky.wy = 70;
    sky.ww = 1;
    sky.wh = 140;
    ground.wx = 0;
    ground.wy = -1;
    ground.ww = 1;
    ground.wh = 2;

    //cam track
    /*
    //old
    cam_target.wx = balloon.wx;
    if(balloon.wy > 20) //20+
    {
      cam_target.wh = 60;
      cam_target.wy = balloon.wy-15;
      cam_target.ww = cam_target.wh/dc.height*dc.width;
    }
    else if(balloon.wy > 10) //10-20
    {
      cam_target.wh = mapVal(10,20,40,60,balloon.wy);
      cam_target.wy = mapVal(10,20,0,5,balloon.wy);
      cam_target.ww = cam_target.wh/dc.height*dc.width;
    }
    else if(balloon.wy > 5) //5-10
    {
      cam_target.wh = mapVal(5,10,30,40,balloon.wy);
      cam_target.wy = 0;
      cam_target.ww = cam_target.wh/dc.height*dc.width;
    }
    else
    {
      cam_target.wh = 30;
      cam_target.wy = 0;
      cam_target.ww = cam_target.wh/dc.height*dc.width;
    }
    */
    //new
    var t;
    if(balloon.wy > 20) //20+
    {
      cam_target.wx = balloon.wx+32;
      cam_target.wy = balloon.wy;
      cam_target.wh = 60;
    }
    else if(balloon.wy > 10) //10-20
    {
      t = invlerp(10,20,balloon.wy);
      cam_target.wx = lerp(balloon.wx+18,balloon.wx+32,t);
      cam_target.wy = balloon.wy;
      cam_target.wh = lerp(45,60,t);
    }
    else if(balloon.wy > 5) //5-10
    {
      t = invlerp(5,10,balloon.wy);
      cam_target.wx = lerp(balloon.wx+10,balloon.wx+18,t);
      cam_target.wy = lerp(0,balloon.wy,t);
      cam_target.wh = lerp(35,45,t);
    }
    else
    {
      t = invlerp(0,5,balloon.wy);
      cam_target.wx = lerp(balloon.wx,balloon.wx+10,t);
      cam_target.wy = lerp(-2,0,t);
      cam_target.wh = lerp(30,35,t);
    }
    cam_target.ww = cam_target.wh/dc.height*dc.width;

    camera.wx = lerp(camera.wx,cam_target.wx,0.1);
    camera.wy = lerp(camera.wy,cam_target.wy,0.02);
    camera.ww = lerp(camera.ww,cam_target.ww,0.01);
    camera.wh = lerp(camera.wh,cam_target.wh,0.01);

    /*
    //zoom out
    camera.wh = 100;
    camera.ww = camera.wh/dc.height*dc.width;
    //*/

    outside_temp_gauge.tick();
    inside_temp_gauge.tick();
    weight_gauge.tick();
    volume_gauge.tick();
    density_gauge.tick();
    buoyancy_gauge.tick();
    altitude_gauge.tick();
    xvel_gauge.tick();
    yvel_gauge.tick();
    fuel_gauge.tick();

    outside_temp_gauge.val = outside_temp_gauge.slider_val = env_temp;
    inside_temp_gauge.val  = inside_temp_gauge.slider_val = balloon.t;
    weight_gauge.val       = weight_gauge.slider_val = balloon.m+balloon.bm;
    volume_gauge.val       = volume_gauge.slider_val = balloon.v;
    density_gauge.val      = density_gauge.slider_val = balloon.m/balloon.v;
    buoyancy_gauge.val     = buoyancy_gauge.slider_val = balloon.wya;
    altitude_gauge.val     = altitude_gauge.slider_val = balloon.wy;
    xvel_gauge.val         = xvel_gauge.slider_val = balloon.wxv;
    yvel_gauge.val         = yvel_gauge.slider_val = balloon.wyv;
    fuel_gauge.val         = fuel_gauge.slider_val = fuel;

    slider.tick();

    //faux parallax
    tickParallax();
    centerGrounds();
    tickBalloonParticles();
    tickAirParticles();

    //screen space resolution
    screenSpace(camera,dc,shadow);
    screenSpace(camera,dc,flame);
    screenSpace(camera,dc,basket);
    screenSpace(camera,dc,char);
    screenSpace(camera,dc,balloon);
    screenSpace(camera,dc,rope);
    screenSpace(camera,dc,bubble_origin);
      var obj = bubble_origin;
      obj.w = 100;
      obj.h = 200;
      obj.x = basket.x+basket.w+150; if(obj.x < 20) obj.x = 20;
      obj.y = obj.y-obj.h; if(obj.y < 20) obj.y = 20; if(obj.y > dc.height-obj.h-20) obj.y = dc.height-obj.h-20;
    screenSpace(camera,dc,cam_target);
    screenSpace(camera,dc,vel_arrow);
    screenSpace(camera,dc,acc_arrow);
    screenSpace(camera,dc,arrow_separator);
    for(var i = 0; i < vg.length; i++) screenSpace(vgcam,dc,vg[i]);
    for(var i = 0; i < bg.length; i++) screenSpace(bgcam,dc,bg[i]);
    for(var i = 0; i < mg.length; i++) screenSpace(mgcam,dc,mg[i]);
    for(var i = 0; i < fg.length; i++) screenSpace(fgcam,dc,fg[i]);
    for(var i = 0; i < faux_ground.length; i++) screenSpace(fgcam,dc,faux_ground[i]);
    screenSpace(camera,dc,ground);
    screenSpace(camera,dc,sky);
    while(grid.wx+(grid.ww/10) < camera.wx) grid.wx += grid.ww/10;
    while(grid.wx-(grid.ww/10) > camera.wx) grid.wx -= grid.ww/10;
    while(grid.wy+(grid.wh/10) < camera.wy) grid.wy += grid.wh/10;
    while(grid.wy-(grid.wh/10) > camera.wy) grid.wy -= grid.wh/10;
    screenSpace(camera,dc,grid);

    drawer_disp = lerp(drawer_disp,drawer_disp_target,0.1);
    speak_t = lerp(speak_t,1,0.1);

    steps[cur_step].tick();
    if(steps[cur_step].test()) self.nextStep();
    hit_ui = false;

    fuel_gauge.x = density_gauge.x;
    density_gauge.enabled = false;
    buoyancy_gauge.enabled = false;
    altitude_gauge.enabled = false;
    xvel_gauge.enabled = false;
    yvel_gauge.enabled = false;
    fuel_gauge.enabled = false;
    weight_gauge.enabled = false;
    density_gauge.vis = false;
    buoyancy_gauge.vis = false;
    altitude_gauge.vis = false;
    xvel_gauge.vis = false;
    yvel_gauge.vis = false;
  }

  var drawKnobTip = function(prompt,w)
  {
    var h = 20;
    var r = slider.w-10;
    var x = cos(slider.t)*r + 30;
    var y = dc.height - sin(slider.t)*r;
    y += Math.sin(n_ticks/10)*4;
    ctx.fillStyle = "#FFFFFF";
    dc.fillRoundRect(x,y-h/2,w,h,5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x+1,y-h/2+5);
    ctx.lineTo(x-5,y);
    ctx.lineTo(x+1,y+h/2-5);
    ctx.closePath();
    ctx.fill();
    ctx.textAlign = "left";
    ctx.fillStyle = "#000000";
    ctx.fillText(prompt,x+4,y+5);
  }
  var drawHeatTip = function(prompt,w)
  {
    var h = 20;
    var x = burn_pad.x-w-80;
    var y = burn_pad.y+burn_pad.h/2;
    y += Math.sin(n_ticks/10)*4;
    ctx.fillStyle = "#FFFFFF";
    dc.fillRoundRect(x,y-h/2,w,h,5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x+w-1,y-h/2+5);
    ctx.lineTo(x+w+5,y);
    ctx.lineTo(x+w-1,y+h/2-5);
    ctx.closePath();
    ctx.fill();
    ctx.textAlign = "right";
    ctx.fillStyle = "#000000";
    ctx.fillText(prompt,x+w-4,y+5);
  }
  var drawCutTip = function(prompt)
  {
    var w = 90;
    var h = 20;
    var x = cut_pad.x-w-115;
    var y = cut_pad.y+cut_pad.h/2;
    y += Math.sin(n_ticks/10)*4;
    ctx.fillStyle = "#FFFFFF";
    dc.fillRoundRect(x,y-h/2,w,h,5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x+w-1,y-h/2+5);
    ctx.lineTo(x+w+5,y);
    ctx.lineTo(x+w-1,y+h/2-5);
    ctx.closePath();
    ctx.fill();
    ctx.textAlign = "right";
    ctx.fillStyle = "#000000";
    ctx.fillText(prompt,x+w-4,y+5);
  }
  self.draw = function()
  {
    //sky
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,dc.width,dc.height);
    var skygrad = ctx.createLinearGradient(0,sky.y,0,sky.y+sky.h);
    skygrad.addColorStop(0,"#000000");
    skygrad.addColorStop(0.8,"#8899BB");
    skygrad.addColorStop(1,"#FFFFFF");
    ctx.fillStyle=skygrad;
    ctx.fillRect(0,sky.y,dc.width,sky.h+dc.height);

    for(var i = 0; i < vg.length; i++) vg[i].draw(vg[i]);
    for(var i = 0; i < bg.length; i++) bg[i].draw(bg[i]);
    for(var i = 0; i < mg.length; i++) mg[i].draw(mg[i]);
    //ground
    //ctx.fillStyle = "#88FFAA";
    //var g_w = dc.width;
    //ctx.drawImage(grass_img,0,ground.y,g_w,dc.height-ground.y);
    for(var i = 0; i < faux_ground.length; i++) faux_ground[i].draw(faux_ground[i]);
    for(var i = 0; i < fg.length; i++) fg[i].draw(fg[i]);

    //drawGrid(grid);
    ctx.lineWidth = 2;

    ctx.globalAlpha = clamp(0,1,1-(balloon.wy/20));
    drawShadow(shadow);
    ctx.globalAlpha = 1;
    drawWind();
    //drawBoost();
    drawAirParticles();
    drawRope(rope);
    drawBasket(basket);
    drawChars(char);
    drawBalloon(balloon);
    //drawCamTarget(cam_target);
    drawForceArrows();

    ctx.font = "20px Open Sans";
    ctx.textAlign = "right";

    if(input_state == IGNORE_INPUT) ctx.globalAlpha = 0.5;
    if(burn_pad.down) ctx.drawImage(burn_btn_red_img,burn_pad.x,burn_pad.y,burn_pad.w,burn_pad.h);
    else              ctx.drawImage(    burn_btn_img,burn_pad.x,burn_pad.y,burn_pad.w,burn_pad.h);
    ctx.fillText("BURN",burn_pad.x-10,burn_pad.y+burn_pad.h-23);

    if(flap_pad.down) ctx.drawImage(flap_btn_red_img,flap_pad.x,flap_pad.y,flap_pad.w,flap_pad.h);
    else              ctx.drawImage(    flap_btn_img,flap_pad.x,flap_pad.y,flap_pad.w,flap_pad.h);
    ctx.fillText("OPEN FLAP",flap_pad.x-10,flap_pad.y+flap_pad.h-23);

    if(!rope_cut)
    {
      if(cut_pad.down) ctx.drawImage(rope_btn_red_img,cut_pad.x,cut_pad.y,cut_pad.w,cut_pad.h);
      else             ctx.drawImage(    rope_btn_img,cut_pad.x,cut_pad.y,cut_pad.w,cut_pad.h);
      ctx.fillText("CUT ROPE",cut_pad.x-10,cut_pad.y+cut_pad.h-23);
    }
    ctx.font = "12px Open Sans";
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(0,0,0,0.2)";
    var w = 150;
    var x = dc.width-(drawer_disp*w);
    menu_btn.x = x+10;
    retry_btn.x = x+10;
    reset_btn.x = x+10;
    parts_btn.x = x+10;
    arrows_btn.x = x+10;

    ctx.fillRect(x,0,w,dc.height);
    ctx.drawImage(eye_img,eye_btn.x,eye_btn.y,eye_btn.w,eye_btn.h);
    ctx.textAlign = "left";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Return To Menu",menu_btn.x+10,menu_btn.y+menu_btn.h*0.8);
    if(cur_step == step_free)
    {
      ctx.fillText("Reset Balloon",reset_btn.x+10,reset_btn.y+reset_btn.h*0.8);
      ctx.fillText("Display Arrows",arrows_btn.x+10,arrows_btn.y+arrows_btn.h*0.8);
      ctx.fillText("Display Particles",parts_btn.x+10,parts_btn.y+parts_btn.h*0.8);
    }

    ctx.textAlign = "right";
    ctx.fillStyle = colorForHeight();
    if(cur_step != step_meditate)
    {
      ctx.font = "16px Open Sans";
      ctx.fillText("Distance Travelled",dc.width-10,50);
      ctx.font = "30px Open Sans";
      ctx.fillText(Math.floor(balloon.wx)+"m",dc.width-10,76);
      var a = vForHeight()/255;
      ctx.fillStyle = "rgba(255,255,255,"+a+")";
      ctx.font = "14px Open Sans";
      ctx.fillText("Altitude",dc.width-10,100);
      ctx.font = "20px Open Sans";
      ctx.fillText(Math.floor(balloon.wy)+"m",dc.width-10,120);
      ctx.font = "12px Open Sans";
    }

    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    drawGauge(outside_temp_gauge); if(outside_temp_gauge.vis) drawAroundDecimal(dc,outside_temp_gauge.x+outside_temp_gauge.w/2,outside_temp_gauge.y-10,round((env_temp*(9/5)-459)*100)/100,"","°F");
    drawGauge(inside_temp_gauge);  if(inside_temp_gauge.vis)  drawAroundDecimal(dc,  inside_temp_gauge.x+inside_temp_gauge.w/2, inside_temp_gauge.y-10,round((balloon.t*(9/5)-459)*100)/100,"","°F")
    ctx.textAlign = "center";
    drawGauge(weight_gauge);       if(weight_gauge.vis) ctx.fillText(round((balloon.m+balloon.bm)/1000)+"kg",weight_gauge.x+weight_gauge.w/2,weight_gauge.y-10)
    drawGauge(volume_gauge);       if(volume_gauge.vis) ctx.fillText(                  round(balloon.v)+"m3",volume_gauge.x+volume_gauge.w/2,volume_gauge.y-10)
    drawGauge(density_gauge);
    drawGauge(buoyancy_gauge);
    drawGauge(altitude_gauge);     if(altitude_gauge.vis) drawAroundDecimal(dc,altitude_gauge.x+altitude_gauge.w/2,altitude_gauge.y-10,fdisp(balloon.wy,2),"","m")
    drawGauge(xvel_gauge);         if(xvel_gauge.vis)     drawAroundDecimal(dc,        xvel_gauge.x+xvel_gauge.w/2,    xvel_gauge.y-10,fdisp(balloon.wxv*fps,2),"","m/s")
    drawGauge(yvel_gauge);         if(yvel_gauge.vis)     drawAroundDecimal(dc,        yvel_gauge.x+yvel_gauge.w/2,    yvel_gauge.y-10,fdisp(balloon.wyv*fps,2),"","m/s")
    drawGauge(fuel_gauge);         if(fuel_gauge.vis)     drawAroundDecimal(dc,        fuel_gauge.x+fuel_gauge.w/2,    fuel_gauge.y-10,fdisp(fuel,2),"","G")

    if(scene_n > 0)
    {
      var v = 0;
      if(scene_n > 250) v = (300-scene_n)/50;
      else              v = scene_n/100;
      ctx.fillStyle = "rgba(0,0,0,"+v+")";
      ctx.font = "60px Open Sans";
      ctx.textAlign = "left";
      ctx.fillText(scene_title,50,220);
    }
    if(fuel < 1. && balloon.wy > 0.01)
    {
      ctx.fillStyle = "rgba(255,0,0,"+sin(fuel_pulse_n/50)+")";
      ctx.font = "100px Open Sans";
      ctx.textAlign = "center";
      if(fuel <= 0)
        ctx.fillText("FUEL EMPTY",dc.width/2,dc.height/2-50);
      else
        ctx.fillText("FUEL LOW",dc.width/2,dc.height/2-50);
    }
    ctx.font = "12px Open Sans";

    if(selected_gauge) drawSlider(slider);

    steps[cur_step].draw();
    if(input_state == IGNORE_INPUT)
    {
      drawBubble(bubble_origin);

      dom.x = bubble_origin.x;
      dom.y = bubble_origin.y;
      dom.w = bubble_origin.w;
      dom.h = bubble_origin.h;
      dom.draw(12,dc);
    }
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

  var Part = function(i)
  {
    this.i = i;
    this.x = 0;
    this.y = 0;
    this.w = 1;
    this.h = 1;
    this.xv = 0;
    this.yv = 0;
    this.t = 0;
  }
  var initBalloonParticles = function(p)
  {
    var p;
    var temp = (balloon.t-290)/5; //~1 to ~14 (at same scale used by drawAirParts)
    var s = balloon.h/60;
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
    var s = balloon.h/60;
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
    vgcam.wx = camera.wx*0.1; vgcam.wy = camera.wy; vgcam.ww = camera.ww; vgcam.wh = camera.wh;
    bgcam.wx = camera.wx*0.2; bgcam.wy = camera.wy; bgcam.ww = camera.ww; bgcam.wh = camera.wh;
    mgcam.wx = camera.wx*0.5; mgcam.wy = camera.wy; mgcam.ww = camera.ww; mgcam.wh = camera.wh;
    fgcam.wx = camera.wx*0.8; fgcam.wy = camera.wy; fgcam.ww = camera.ww; fgcam.wh = camera.wh;
  }
  var centerOneGrounds = function(i,arr,cam,sep,base,range)
  {
    var li = i;
    var ri = (i+arr.length-1)%arr.length;
    var ldist = abs(arr[li].wx-cam.wx);
    var rdist = abs(arr[ri].wx-cam.wx);
    if(abs(ldist-rdist) > sep)
    {
      if(ldist > rdist) //l further than r- move to r
      {
        arr[li].wx = arr[ri].wx+sep+rand0()*sep/2;
        arr[li].wy = rand0()*range+base;
        i = (i+1)%arr.length;
      }
      else
      {
        arr[ri].wx = arr[li].wx-sep-rand0()*sep/2;
        arr[ri].wy = rand0()*range+base;
        i = (i+arr.length-1)%arr.length;
      }
    }
    return i;
  }
  var centerGrounds = function()
  {
    vgi = centerOneGrounds(vgi,vg,vgcam,vgsep,vgybase,vgyrange);
    bgi = centerOneGrounds(bgi,bg,bgcam,bgsep,bgybase,bgyrange);
    mgi = centerOneGrounds(mgi,mg,mgcam,mgsep,mgybase,mgyrange);
    fgi = centerOneGrounds(fgi,fg,fgcam,fgsep,fgybase,fgyrange);
    //faux_ground_i = centerOneGrounds(faux_ground_i,faux_ground,faux_ground_cam,faux_ground_sep,faux_ground[0].wy,0);

    li = faux_ground_i;
    ri = (faux_ground_i+faux_ground.length-1)%faux_ground.length;
    ldist = abs(faux_ground[li].wx-fgcam.wx);
    rdist = abs(faux_ground[ri].wx-fgcam.wx);
    if(abs(ldist-rdist) > faux_ground_sep)
    {
      if(ldist > rdist) //l further than r- move to r
      {
        faux_ground[li].wx = faux_ground[ri].wx+faux_ground_sep;
        faux_ground_i = (faux_ground_i+1)%faux_ground.length;
      }
      else
      {
        faux_ground[ri].wx = faux_ground[li].wx-faux_ground_sep;
        faux_ground_i = (faux_ground_i+faux_ground.length-1)%faux_ground.length;
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

    /*
    var a;
    for(var i = miny; i < maxy; i++)
    {
      if(i%4 != 0) continue;
      a = (wind[i]-0.55)*2;
      if(a < 0) continue;
      ctx.globalAlpha = a;
      tmp.wy = i;
      screenSpace(camera,dc,tmp);
      ctx.drawImage(stream_img,dc.width/2-5+a*80-40,tmp.y,10*3,tmp.h*3);
    }
    ctx.globalAlpha = 1;
    */

    maxy = wind.length;
    miny = 0;
    tmp.wy = miny;
    screenSpace(camera,dc,tmp);
    ymin = tmp.y;
    tmp.wy = maxy;
    screenSpace(camera,dc,tmp);
    ymax = tmp.y;

    ctx.drawImage(stream_img,dc.width/2,ymin,200,(ymax-ymin)+tmp.h*3);
  }
  var drawBoost = function()
  {
    screenSpace(camera,dc,boost);
    ctx.drawImage(stream_img,boost.x,boost.y,10*5,boost.h*5);
  }
  var tickAirParticles = function()
  {
    if(part_disp <= 0) return;
    var p;
    var temp = (tempForHeight(env_temp,balloon.wy)-290)/5; //~0 to ~1
    var n_parts = round((15-temp)*20);
    n_parts *= 4;
    n_parts = min(n_parts,air_parts.length-1);
    var s = balloon.h/60;
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
        var pin = Math.round(Math.abs(p.xv+p.yv))*5;
        if(pin > 9) pin = 9;
        ctx.drawImage(part_canvs[1+pin],p.x,p.y,p.w,p.h);
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
    var s = balloon.h/60;
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
        ctx.globalAlpha = part_disp;
        var pin = Math.round(Math.abs(p.xv+p.yv))*5;
        if(pin > 9) pin = 9;
        ctx.drawImage(part_canvs[1+pin],p.x,p.y,p.w,p.h);
      }
    }
    ctx.globalAlpha = 1;
  }
  var drawFlame = function(obj)
  {
    ctx.globalAlpha = flame_t;
    var h = flame_t*2; if(h > 1) h = 1;
    if(randB())
      ctx.drawImage(fire_img,obj.x,obj.y+((1-h)*obj.h),obj.w,obj.h*h);
    else
    {
      ctx.save();
      ctx.translate(obj.x+obj.w/2,obj.y+((1-h)*obj.h));
      ctx.scale(-1,1);
      ctx.drawImage(fire_img,-obj.w/2,0,obj.w,obj.h*h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  var drawShadow = function(obj)
  {
    ctx.drawImage(shadow_canv,obj.x,obj.y,obj.w,obj.h);
  }
  var drawBasket = function(obj)
  {
    ctx.strokeStyle = "#7D2724";
    ctx.lineWidth = 0.5;
    dc.drawLine(basket.x+basket.w*.20,basket.y+basket.h*.1,balloon.x+balloon.w*0.40,balloon.y+balloon.h*0.95);
    dc.drawLine(basket.x+basket.w*.32,basket.y+basket.h*.1,balloon.x+balloon.w*0.45,balloon.y+balloon.h*0.95);
    dc.drawLine(basket.x+basket.w*.68,basket.y+basket.h*.1,balloon.x+balloon.w*0.55,balloon.y+balloon.h*0.95);
    dc.drawLine(basket.x+basket.w*.80,basket.y+basket.h*.1,balloon.x+balloon.w*0.60,balloon.y+balloon.h*0.95);
    ctx.drawImage(basket_img,basket.x,basket.y,basket.w,basket.h);
    ctx.strokeStyle = "#000000";
  }
  var drawChars = function(obj)
  {
    for(var i = 0; i < char_imgs.length; i++)
    {
      char_time[i]--;
      if(char_time[i] <= 0)
      {
        char_pose[i] = randIntBelow(3);
        char_time[i] = Math.round(randR(char_r_f,char_r_t));
      }
    }
    var i;
    //i = 2; ctx.drawImage(char_imgs[i][char_pose[i]],obj.x,obj.y,obj.w,obj.h);
    i = 3; ctx.drawImage(char_imgs[i][char_pose[i]],obj.x,obj.y,obj.w,obj.h);
    //i = 4; ctx.drawImage(char_imgs[i][char_pose[i]],obj.x,obj.y,obj.w,obj.h);
    i = 0; ctx.drawImage(char_imgs[i][char_pose[i]],obj.x,obj.y,obj.w,obj.h);
    //i = 5; ctx.drawImage(char_imgs[i][char_pose[i]],obj.x,obj.y,obj.w,obj.h);
    i = 1; ctx.drawImage(char_imgs[i][char_pose[i]],obj.x,obj.y,obj.w,obj.h);
  }
  var drawBalloon = function(obj)
  {
    ctx.drawImage(balloon_back_img,obj.x,obj.y,obj.w,obj.h);
    if(burn_pad.down && fuel > 0) flame_t = 1;
    else { flame_t -= 0.05; if(flame_t < 0) flame_t = 0; }
    drawFlame(flame);
    drawBalloonParticles();
    ctx.globalAlpha = 1-part_disp;
    ctx.drawImage(balloon_img,obj.x,obj.y,obj.w,obj.h);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "#7D2724";
    ctx.lineWidth = 0.5;
    dc.drawLine(basket.x+basket.w*.20,basket.y+basket.h*.08,balloon.x+balloon.w*0.35,balloon.y+balloon.h*0.95);
    dc.drawLine(basket.x+basket.w*.23,basket.y+basket.h*.08,balloon.x+balloon.w*0.40,balloon.y+balloon.h*0.92);
    dc.drawLine(basket.x+basket.w*.35,basket.y+basket.h*.08,balloon.x+balloon.w*0.45,balloon.y+balloon.h*0.90);
    dc.drawLine(basket.x+basket.w*.65,basket.y+basket.h*.08,balloon.x+balloon.w*0.55,balloon.y+balloon.h*0.90);
    dc.drawLine(basket.x+basket.w*.77,basket.y+basket.h*.08,balloon.x+balloon.w*0.60,balloon.y+balloon.h*0.92);
    dc.drawLine(basket.x+basket.w*.80,basket.y+basket.h*.08,balloon.x+balloon.w*0.65,balloon.y+balloon.h*0.95);
  }
  var drawRope = function(obj)
  {
    if(rope_cut) ctx.drawImage(rope_cut_img,obj.x,obj.y,obj.w,obj.h);
    else
    {
      ctx.drawImage(rope_img,obj.x,obj.y,obj.w,obj.h);
      ctx.strokeStyle = "#7D2724";
      ctx.lineWidth = 1;
      dc.drawLine(obj.x+obj.w*.25,obj.y+obj.h*.12,basket.x,basket.y+basket.h/2);
      dc.drawLine(obj.x+obj.w*.70,obj.y+obj.h*.10,basket.x+basket.w,basket.y+basket.h/2);
      dc.drawLine(obj.x+obj.w*.07,obj.y+obj.h*.85,basket.x,basket.y+basket.h/2);
      dc.drawLine(obj.x+obj.w*.90,obj.y+obj.h*.85,basket.x+basket.w,basket.y+basket.h/2);
      ctx.strokeStyle = "#000000";
    }
  }
  var drawBubble = function(obj,doit)
  {
    var img;
    ctx.drawImage(bubble_img,obj.x-80,obj.y-40,obj.w+110,obj.h+50);
    ctx.drawImage(char_imgs[speaks[cur_line]][speak_pose],obj.x-50,obj.y-50,60,60);
  }
  var drawCamTarget = function(obj)
  {
    ctx.strokeStyle = "#000000"
    ctx.strokeRect(obj.x,obj.y,obj.w,obj.h);
    ctx.strokeStyle = "#000000"
    ctx.strokeRect(obj.x+obj.w*0.1,obj.y+obj.h*0.1,obj.w*0.8,obj.h*0.8);
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
  var drawPart     = function(obj) { ctx.drawImage(part_canvs[0],obj.x,obj.y,obj.w,obj.h); }
  var drawCloud    = function(obj) { ctx.drawImage(cloud_imgs[obj.id],obj.x,obj.y,obj.w,obj.h); }
  var drawMountain = function(obj) { ctx.drawImage(cloud_imgs[obj.id],obj.x,obj.y,obj.w,obj.h); }
  var drawTree     = function(obj) { ctx.drawImage(tree_imgs[obj.id],obj.x,obj.y,obj.w,obj.h); }
  var drawGround   = function(obj) { ctx.drawImage(grass_img,obj.x,obj.y,obj.w,obj.h); }
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

    ctx.fillStyle = colorForHeight();
    ctx.textAlign = "center";
    ctx.fillText(g.t1,g.x+g.w/2,g.y+g.h+12);
    ctx.fillText(g.t2,g.x+g.w/2,g.y+g.h+12+12);
  }
  var drawSlider = function(s)
  {
    ctx.fillStyle = "#FFFFFF";
    dc.fillRoundRect(-10,dc.height-50,160,40,10);
    ctx.fillStyle = "#EE5A4B";
    ctx.font = "Bold 12px Open Sans";
    ctx.fillText(selected_gauge.TITLE,10,dc.height-32);
    ctx.font = "12px Open Sans";
    if(selected_gauge == outside_temp_gauge)
      ctx.fillText((round((env_temp*(9/5)-459)*100)/100)+"°F",10,dc.height-18);
    if(selected_gauge == inside_temp_gauge)
      ctx.fillText((round((balloon.t*(9/5)-459)*100)/100)+"°F",10,dc.height-18)
    if(selected_gauge == volume_gauge)
      ctx.fillText(round(balloon.v)+"m3",10,dc.height-18)

    var r = s.w-10;

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0,dc.height,r,0,twopi-halfpi,true);
    ctx.stroke();

    ctx.strokeStyle = "#EE5A4B";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0,dc.height,r,0,twopi-s.t,true);
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(cos(s.t)*r,dc.height-sin(s.t)*r,10,0,twopi);
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cos(s.t)*r,dc.height-sin(s.t)*r,10,0,twopi);
    ctx.stroke();
  }
  var drawForceArrows = function()
  {
    if(arrow_disp <= 0) return;
    var t = (balloon.wya+0.04)/0.04;
    var bcx = balloon.x+balloon.w/2;
    var bcy = balloon.y+balloon.h/2;
    ctx.globalAlpha = arrow_disp;
    ctx.drawImage(arrow_down_img,bcx-50+t*25,bcy-10,100-t*50,100-t*50);
    ctx.drawImage(arrows_small_img,balloon.x-100,bcy-50,100,100);
    ctx.drawImage(arrows_small_img,balloon.x+balloon.w,bcy-50,100,100);
    ctx.drawImage(arrow_up_img,bcx-25,bcy-50,50,50);
    ctx.globalAlpha = 1;
  }

  var Gauge = function(t1,t2,x,y,w,h,mint,maxt,min,max,minvalid,maxvalid,altered)
  {
    var self = this;
    self.t1 = t1;
    self.t2 = t2;
    var space = String.fromCharCode(8202)+String.fromCharCode(8202);
    if(self.t1 != "")
      self.TITLE = (self.t1+" "+self.t2).toUpperCase().split("").join(space+space);
    else
      self.TITLE = (self.t2).toUpperCase().split("").join(space+space);

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
    self.slider_val = self.val;
    self.r = Math.min(self.w,self.h)/2;

    self.vis = false;
    self.enabled = false;

    self.tick = function()
    {
      if(self.val != self.slider_val && altered) altered(self.slider_val);
      self.val = self.slider_val;
    }

    self.press = function(evt)
    {
      if(self.enabled)
      {
        if(selected_gauge == self) selected_gauge = undefined;
        else selected_gauge = self;
      }
    }
    self.unpress = function(evt)
    {

    }
  }
  var Slider = function()
  {
    var self = this;

    self.x = 0;
    self.w = 200;
    self.h = 200;
    self.y = dc.height-self.h;

    self.t = 0;
    self.tick = function()
    {
      if(selected_gauge)
        self.t = mapVal(selected_gauge.min,selected_gauge.max,0,halfpi,selected_gauge.val);
    }

    self.dragging = false;
    self.dragStart = function(evt)
    {
      if(!selected_gauge || !selected_gauge.vis || ! selected_gauge.enabled) { self.dragging = false; return; }

      var r = self.w-10;
      var dx = cos(self.t)*r-evt.doX;
      var dy = (dc.height-sin(self.t)*r)-evt.doY;
      if(dx*dx + dy*dy > 10*10) return;
      self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(!self.dragging || !selected_gauge || !selected_gauge.vis || ! selected_gauge.enabled) { self.dragging = false; return; }
      var x = evt.doX;
      var y = dc.height-evt.doY;
      var t = atan2(y,x);
      var val = mapVal(0,halfpi,selected_gauge.min,selected_gauge.max,t);
      if(val < selected_gauge.maxvalid && val > selected_gauge.minvalid)
        selected_gauge.slider_val = val;
    }
    self.dragFinish = function()
    {
      self.dragging = false;
    }

  }

  var vForHeight = function()
  {
    var v = Math.floor(mapVal(30,50,0,256,balloon.wy));
    if(v < 0) v = 0; if(v > 255) v = 255;
    return v;
  }
  var colorForHeight = function()
  {
    var v = vForHeight();
    return "rgba("+v+","+v+","+v+",1)";
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

  var setDisp = function(parts,arrows,outsidet,insidet,weight,vol,dens,buoy,alt,xvel,yvel,fuel)
  {
    target_part_disp = parts;
    target_arrow_disp = arrows;
    outside_temp_gauge.vis = outsidet;
    inside_temp_gauge.vis = insidet;
    weight_gauge.vis = weight;
    volume_gauge.vis = vol;
    density_gauge.vis = dens;
    buoyancy_gauge.vis = buoy;
    altitude_gauge.vis = alt;
    xvel_gauge.vis = xvel;
    yvel_gauge.vis = yvel;
    fuel_gauge.vis = fuel;
  }

  var dismissed = function() { input_state = RESUME_INPUT; }
  var nextPop = function()
  {
    cur_line++;
    var l = textToLines(dc, "12px Open Sans", bubble_origin.w, lines[cur_line])
    if(cur_line == 0 || speaks[cur_line] != speaks[cur_line-1])
      speak_t = 0;
    speak_pose = 3;
    releaseUI();
    input_state = IGNORE_INPUT;
    if(cur_line >= lines.length-1) dom.popDismissableMessage(l,bubble_origin.x,bubble_origin.y,bubble_origin.w,bubble_origin.h,dismissed);
    else                           dom.popDismissableMessage(l,bubble_origin.x,bubble_origin.y,bubble_origin.w,bubble_origin.h,nextPop);
  };
  var pop = function(l,s)
  {
    lines = l;
    speaks = s;
    cur_line = -1;
    nextPop();
  }

  var Step = function(begin,tick,draw,test) { this.begin = begin; this.tick = tick; this.draw = draw; this.test = test; }
};

