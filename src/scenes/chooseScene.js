var ChooseScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;

  var clicker;

  var btn_intro;
  var btn_particles;
  var btn_forces;
  var btn_density;
  var btn_free;

  var btn_standard;
  var btn_refuel;
  var btn_flappy;
  var btn_meditate;

  var btn_s;
  var btn_y;
  var btn_0_x;
  var btn_1_x;
  var btn_2_x;
  var btn_3_x;
  var btn_4_x;
  var btn_5_x;
  var btn_6_x;
  var btn_7_x;
  var btn_8_x;

  var section_line_0_y;
  var section_line_1_y;
  var title_y;
  var subtitle_y;


  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    btn_s = (dc.width/10)-20;
    btn_y = (3*dc.height/4)-btn_s/2;
    btn_0_x = btn_s/2+0*(btn_s+20)+10;
    btn_1_x = btn_s/2+1*(btn_s+20)+10;
    btn_2_x = btn_s/2+2*(btn_s+20)+10;
    btn_3_x = btn_s/2+3*(btn_s+20)+10;
    btn_4_x = btn_s/2+4*(btn_s+20)+10;
    btn_5_x = btn_s/2+5*(btn_s+20)+10;
    btn_6_x = btn_s/2+6*(btn_s+20)+10;
    btn_7_x = btn_s/2+7*(btn_s+20)+10;
    btn_8_x = btn_s/2+8*(btn_s+20)+10;

    section_line_0_y = dc.height/3;
    section_line_1_y = dc.height/3+2*btn_s;
    title_y = dc.height/2-30;
    subtitle_y = btn_y-40;

    btn_intro     = new ButtonBox(btn_0_x,btn_y,btn_s,btn_s,function(evt){ game.start = 0; game.setScene(3); });
    btn_particles = new ButtonBox(btn_1_x,btn_y,btn_s,btn_s,function(evt){ game.start = 1; game.setScene(3); });
    btn_forces    = new ButtonBox(btn_2_x,btn_y,btn_s,btn_s,function(evt){ game.start = 2; game.setScene(3); });
    btn_density   = new ButtonBox(btn_3_x,btn_y,btn_s,btn_s,function(evt){ game.start = 3; game.setScene(3); });
    btn_free      = new ButtonBox(btn_4_x,btn_y,btn_s,btn_s,function(evt){ game.start = 4; game.setScene(3); });

    btn_standard  = new ButtonBox(btn_5_x,btn_y,btn_s,btn_s,function(evt){ game.start = 5; game.setScene(3); });
    btn_refuel    = new ButtonBox(btn_6_x,btn_y,btn_s,btn_s,function(evt){ game.start = 6; game.setScene(3); });
    btn_flappy    = new ButtonBox(btn_7_x,btn_y,btn_s,btn_s,function(evt){ game.start = 7; game.setScene(3); });
    btn_meditate  = new ButtonBox(btn_8_x,btn_y,btn_s,btn_s,function(evt){ game.start = 8; game.setScene(3); });

    clicker.register(btn_intro);
    clicker.register(btn_particles);
    clicker.register(btn_forces);
    clicker.register(btn_density);
    clicker.register(btn_free);
    clicker.register(btn_standard);
    clicker.register(btn_refuel);
    clicker.register(btn_flappy);
    clicker.register(btn_meditate);
  };

  self.tick = function()
  {
    clicker.flush();
  };

  var space = String.fromCharCode(8202)+String.fromCharCode(8202);
  self.draw = function()
  {
  /*
    dc.context.textAlign = "left";
    btn_intro.draw(dc);     dc.context.fillStyle = "#000000"; dc.context.fillText("Start from Intro",btn_intro.x+8,btn_intro.y+btn_intro.h-4);
    btn_particles.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("Start from Visualize Particles",btn_particles.x+8,btn_particles.y+btn_particles.h-4);
    btn_forces.draw(dc);    dc.context.fillStyle = "#000000"; dc.context.fillText("Start from Conflicting Forces",btn_forces.x+8,btn_forces.y+btn_forces.h-4);
    btn_density.draw(dc);   dc.context.fillStyle = "#000000"; dc.context.fillText("Start from Density",btn_density.x+8,btn_density.y+btn_density.h-4);
    btn_free.draw(dc);      dc.context.fillStyle = "#000000"; dc.context.fillText("Free Play",btn_free.x+8,btn_free.y+btn_free.h-4);
    btn_standard.draw(dc);  dc.context.fillStyle = "#000000"; dc.context.fillText("Standard Play (Best: "+fdisp(game.standard_best,1)+"m)",btn_standard.x+8,btn_standard.y+btn_standard.h-4);
    btn_refuel.draw(dc);    dc.context.fillStyle = "#000000"; dc.context.fillText("Refuel Play (Best: "+fdisp(game.refuel_best,1)+"m)",btn_refuel.x+8,btn_refuel.y+btn_refuel.h-4);
    btn_flappy.draw(dc);    dc.context.fillStyle = "#000000"; dc.context.fillText("Flappy Play (Best: "+fdisp(game.flappy_best,1)+"m)",btn_flappy.x+8,btn_flappy.y+btn_flappy.h-4);
    btn_meditate.draw(dc);  dc.context.fillStyle = "#000000"; dc.context.fillText("Meditate Play",btn_meditate.x+8,btn_meditate.y+btn_meditate.h-4);
    */

    dc.context.fillStyle = "#FFFFFF";
    dc.fillRoundRect(0,0,dc.width,dc.height,5);
    dc.context.fillStyle = "#000000";

    dc.context.fillStyle = "#00FF00";//blue;
    //dc.roundRectOptions(btn_tutorial.x,btn_tutorial.y,btn_tutorial.w,btn_tutorial.h,5,1,1,0,0,0,1)
    //dc.context.drawImage(crystal_img,dc.width-section_line_0_y,0,section_line_0_y,section_line_0_y);
    //dc.context.drawImage(tutorial_img,50,50,220,section_line_0_y-50);

    dc.context.fillStyle = "#333333";
    dc.context.font = "25px Open Sans";
    dc.context.fillText("The Balloon Game".split("").join(space),dc.width/2-100,100);
    dc.context.font = "Bold 16px Open Sans";
    dc.context.fillStyle = "#FFFFFF";
    dc.fillRoundRect(dc.width/2-110,120,175,30,20);
    dc.context.fillStyle = "#333333";
    dc.context.fillText("There's a lot of unnecessary text on this screen",dc.width/2-100,140);
    //dc.context.drawImage(arrow_img,dc.width/2+25,127,30,15);
    dc.context.font = "12px Open Sans";

    dc.context.lineWidth = 0.5;
    dc.context.strokeStyle = "#666666";
    dc.drawLine(0,section_line_0_y,dc.width,section_line_0_y);
    dc.drawLine(0,section_line_1_y,dc.width,section_line_1_y);

    dc.context.textAlign = "center";
    rectBtn(btn_intro,"Intro");
    rectBtn(btn_particles,"Particles");
    rectBtn(btn_forces,"Forces");
    rectBtn(btn_density,"Density");
    rectBtn(btn_free,"Free");
    rectBtn(btn_standard,"Standard");
    rectBtn(btn_refuel,"Refuel");
    rectBtn(btn_flappy,"Flappy");
    rectBtn(btn_meditate,"Meditate");

    dc.context.font = "40px Open Sans";
    dc.context.fillText("BALLOON".split("").join(space+space),dc.width/2,title_y);
  };
  var rectBtn = function(btn,lbl)
  {
    dc.context.fillStyle = "#FFFFFF";
    dc.fillRoundRect(btn.x,btn.y,btn.w,btn.h,5);
    dc.context.strokeStyle = "#000000";
    dc.strokeRoundRect(btn.x,btn.y,btn.w,btn.h,5);
    dc.context.fillStyle = "#000000";
    dc.context.fillText(lbl,btn.x+btn.w/2,btn.y+btn.h+20);
  }

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };
};

