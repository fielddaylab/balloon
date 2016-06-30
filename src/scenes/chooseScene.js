var ChooseScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var ctx = dc.context;

  var clicker;

  var btn_intro;
  var btn_particles;
  var btn_force;
  var btn_density;
  var btn_free;

  var btn_standard;
  var btn_refuel;
  var btn_flappy;
  var btn_meditate;

  var btn_s;
  var btn_y_0;
  var btn_y_1;
  var btn_x;

  var section_line_y;
  var title_y;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    var n_x_btns = 5;
    section_line_y = 278/2+10;
    btn_s = dc.width/(n_x_btns+2);
    btn_y_0 = section_line_y+1*(dc.height-section_line_y)/3-btn_s/2-10;
    btn_y_1 = section_line_y+2*(dc.height-section_line_y)/3-btn_s/2+10;
    btn_x = [];
    for(var i = 0; i < n_x_btns; i++)
      btn_x[i] = btn_s/2+ ( btn_s+ (btn_s/(n_x_btns-1)))*i;

    title_y = dc.height/2-30;

    btn_intro     = new ButtonBox(btn_x[0],btn_y_0,btn_s,btn_s,function(evt){ game.start = 0; game.setScene(4); }); btn_intro.img = btn_intro_img;         clicker.register(btn_intro);
    btn_particles = new ButtonBox(btn_x[1],btn_y_0,btn_s,btn_s,function(evt){ game.start = 1; game.setScene(4); }); btn_particles.img = btn_particles_img; clicker.register(btn_particles);
    btn_force     = new ButtonBox(btn_x[2],btn_y_0,btn_s,btn_s,function(evt){ game.start = 2; game.setScene(4); }); btn_force.img = btn_force_img;         clicker.register(btn_force);
    btn_density   = new ButtonBox(btn_x[3],btn_y_0,btn_s,btn_s,function(evt){ game.start = 3; game.setScene(4); }); btn_density.img = btn_density_img;     clicker.register(btn_density);

    btn_standard = new ButtonBox(btn_x[0],btn_y_1,btn_s,btn_s,function(evt){ game.start = 5; game.setScene(4); }); btn_standard.img = btn_standard_img;    clicker.register(btn_standard);
    btn_refuel   = new ButtonBox(btn_x[1],btn_y_1,btn_s,btn_s,function(evt){ game.start = 6; game.setScene(4); }); btn_refuel.img = btn_refuel_img;        clicker.register(btn_refuel);
    btn_flappy   = new ButtonBox(btn_x[2],btn_y_1,btn_s,btn_s,function(evt){ game.start = 7; game.setScene(4); }); btn_flappy.img = btn_flappy_img;        clicker.register(btn_flappy);
    btn_meditate = new ButtonBox(btn_x[3],btn_y_1,btn_s,btn_s,function(evt){ game.start = 8; game.setScene(4); }); btn_meditate.img = btn_meditate_img;    clicker.register(btn_meditate);
    btn_free     = new ButtonBox(btn_x[4],btn_y_1,btn_s,btn_s,function(evt){ game.start = 4; game.setScene(4); }); btn_free.img = btn_free_img;            clicker.register(btn_free);
  };

  self.tick = function()
  {
    clicker.flush();
  };

  var space = String.fromCharCode(8202)+String.fromCharCode(8202);
  self.draw = function()
  {
    ctx.drawImage(comic_img,0,0,dc.width,dc.height);
    ctx.drawImage(menu_grad_img,0,0,dc.width,dc.height);
    var w = 324/2;
    var h = 278/2;
    ctx.drawImage(menu_logo_img,30,section_line_y-h,w,h);

    ctx.lineWidth = 10;
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#FFFFFF";
    dc.drawLine(0,section_line_y,dc.width,section_line_y);
    dc.drawLine(btn_x[0]+btn_s/2,btn_y_0+btn_s/2,btn_x[3]+btn_s/2,btn_y_0+btn_s/2);
    ctx.textAlign = "right";
    ctx.font = "60px SueEllen";
    ctx.fillText("Hot Air Balloon!".split("").join(space+space),dc.width-20,section_line_y-40);

    ctx.textAlign = "center";
    ctx.font = "20px Open Sans";

    rectBtn(btn_intro,"Intro");
    rectBtn(btn_particles,"Particles");
    rectBtn(btn_force,"Forces");
    rectBtn(btn_density,"Density");

    rectBtn(btn_standard,"Standard");
    rectBtn(btn_refuel,"Refuel");
    rectBtn(btn_flappy,"Flappy");
    rectBtn(btn_meditate,"Meditate");
    rectBtn(btn_free,"Free");
  };
  var rectBtn = function(btn,lbl)
  {
    ctx.fillStyle = "#FFFFFF";
  /*
    ctx.fillStyle = "#FFFFFF";
    dc.fillRoundRect(btn.x,btn.y,btn.w,btn.h,5);
    ctx.strokeStyle = "#000000";
    dc.strokeRoundRect(btn.x,btn.y,btn.w,btn.h,5);
  */
    ctx.drawImage(btn.img,btn.x,btn.y,btn.w,btn.h);
    ctx.fillText(lbl,btn.x+btn.w/2,btn.y+btn.h+20);
  }

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };
};

