var Game = function(init)
{
  var default_init =
  {
    width:640,
    height:320,
    container:"stage_container"
  }

  var self = this;
  doMapInitDefaults(init,init,default_init);

  self.intro_complete = false;
  self.particles_complete = false;
  self.forces_complete = false;
  self.density_complete = false;

  self.start = 0;
  self.standard_best = 0;
  self.refuel_best = 0;
  self.flappy_best = 0;

  var stage = new Stage({width:init.width,height:init.height,container:init.container});
  var scenes = [
    new NullScene(self, stage),
    new LoadingScene(self, stage),
    new ComicScene(self, stage),
    //new TestScene(self, stage),
    //new ExperimentScene(self, stage),
    new ChooseScene(self, stage),
    new GamePlayScene(self, stage),
    ];
  var cur_scene = 0;
  var old_cur_scene = -1;

  self.begin = function()
  {
    self.nextScene();
    tick();
  };

  var tick = function()
  {
    requestAnimFrame(tick,stage.dispCanv.canvas);
    scenes[cur_scene].tick();
    if(old_cur_scene == cur_scene) //still in same scene- draw
    {
      stage.clear();
      scenes[cur_scene].draw();
      stage.draw(); //blits from offscreen canvas to on screen one
    }
    old_cur_scene = cur_scene;
  };

  self.nextScene = function()
  {
    self.setScene(cur_scene+1);
  };

  self.setScene = function(i)
  {
    if (i == 3) {
      scenes[4].endLevel();
    }
    scenes[cur_scene].cleanup();
    cur_scene = i;
    scenes[cur_scene].ready();
  }

  self.logLevel = function(i) {
    var levelType;
    switch(i) {
      case 5: levelType = "STANDARD"; break;
      case 6: levelType = "REFUEL"; break;
      case 7: levelType = "FLAPPY"; break;
      case 8: levelType = "MEDITATE"; scenes[4].startTime = new Date().getTime(); break;
      case 4: levelType = "FREE"; scenes[4].startTime = new Date().getTime(); break;
    }
    var completion = {intro:self.intro_complete, particles:self.particles_complete, forces:self.forces_complete, density:self.density_complete};
    scenes[4].log_level_begin(levelType, completion);
  }
};

