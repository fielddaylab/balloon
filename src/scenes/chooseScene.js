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
  var btn_meditate;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    btn_intro     = new ButtonBox(10,10, dc.width-20,30,function(evt){ game.start = 0; game.setScene(3); });
    btn_particles = new ButtonBox(10,50, dc.width-20,30,function(evt){ game.start = 1; game.setScene(3); });
    btn_forces    = new ButtonBox(10,90, dc.width-20,30,function(evt){ game.start = 2; game.setScene(3); });
    btn_density   = new ButtonBox(10,130,dc.width-20,30,function(evt){ game.start = 3; game.setScene(3); });
    btn_free      = new ButtonBox(10,170,dc.width-20,30,function(evt){ game.start = 4; game.setScene(3); });
    btn_standard  = new ButtonBox(10,210,dc.width-20,30,function(evt){ game.start = 5; game.setScene(3); });
    btn_refuel    = new ButtonBox(10,250,dc.width-20,30,function(evt){ game.start = 6; game.setScene(3); });
    btn_meditate  = new ButtonBox(10,290,dc.width-20,30,function(evt){ game.start = 7; game.setScene(3); });

    clicker.register(btn_intro);
    clicker.register(btn_particles);
    clicker.register(btn_forces);
    clicker.register(btn_density);
    clicker.register(btn_free);
    clicker.register(btn_standard);
    clicker.register(btn_refuel);
    clicker.register(btn_meditate);
  };

  self.tick = function()
  {
    clicker.flush();
  };

  self.draw = function()
  {
    dc.context.textAlign = "left";
    btn_intro.draw(dc);     dc.context.fillStyle = "#000000"; dc.context.fillText("Start from Intro",btn_intro.x+8,btn_intro.y+btn_intro.h-4);
    btn_particles.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("Start from Visualize Particles",btn_particles.x+8,btn_particles.y+btn_particles.h-4);
    btn_forces.draw(dc);    dc.context.fillStyle = "#000000"; dc.context.fillText("Start from Conflicting Forces",btn_forces.x+8,btn_forces.y+btn_forces.h-4);
    btn_density.draw(dc);   dc.context.fillStyle = "#000000"; dc.context.fillText("Start from Density",btn_density.x+8,btn_density.y+btn_density.h-4);
    btn_free.draw(dc);      dc.context.fillStyle = "#000000"; dc.context.fillText("Free Play",btn_free.x+8,btn_free.y+btn_free.h-4);
    btn_standard.draw(dc);  dc.context.fillStyle = "#000000"; dc.context.fillText("Standard Play (Best: "+fdisp(game.standard_best,1)+"m)",btn_standard.x+8,btn_standard.y+btn_standard.h-4);
    btn_refuel.draw(dc);    dc.context.fillStyle = "#000000"; dc.context.fillText("Refuel Play (Best: "+fdisp(game.refuel_best,1)+"m)",btn_refuel.x+8,btn_refuel.y+btn_refuel.h-4);
    btn_meditate.draw(dc);  dc.context.fillStyle = "#000000"; dc.context.fillText("Meditate Play",btn_meditate.x+8,btn_meditate.y+btn_meditate.h-4);
  };

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };
};

