var GamePlayScene = function(game, stage)
{
  var self = this;
  var drawCanv = stage.drawCanv;

  var Particle = function(x,y,xv,yv)
  {
    this.x = x;
    this.y = y;
    this.xv = xv;
    this.yv = yv;
  }
  var moveParticle = function(p)
  {
    p.x += p.xv;
    p.y += p.yv;
  }
  var pDistSqr = function(a,b)
  {
    var xv = b.x-a.x;
    var yv = b.y-a.y;
    return (xv*xv)+(yv*yv);
  }
  var tmpP = new Particle(0,0,0,0);
  var collideParticles = function(a,b)
  {
    tmpP.xv = a.xv;
    tmpP.yv = a.yv;
    a.xv = b.xv;
    a.yv = b.yv;
    b.xv = tmpP.xv;
    b.yv = tmpP.yv;
  }

  var Balloon = function()
  {
    var self = this;

  }

  var balloon;
  var particles;
  var n_particles;
  var p_size;
  var p_vel;

  self.ready = function()
  {
    balloon = new Balloon();
    particles = [];
    n_particles = 1000;
    p_size = 0.02;
    p_vel = 0.005;

    for(var i = 0; i < n_particles; i++)
      particles.push(new Particle(Math.random(),Math.random(),(Math.random()*p_vel*2)-p_vel,(Math.random()*p_vel*2)-p_vel));
  };

  self.tick = function()
  {
    //movement
    for(var i = 0; i < n_particles; i++)
      moveParticle(particles[i]);

    //gravity
    for(var i = 0; i < n_particles; i++)
      particles[i].yv += 0.0001;

    //collision
    var collideDistSqr = (p_size*2)*(p_size*2);
    for(var i = 0; i < n_particles; i++)
    {
      for(var j = i+1; j < n_particles; j++)
      {
        if(pDistSqr(particles[i],particles[j]) < collideDistSqr)
          collideParticles(particles[i],particles[j]);
      }
    }

    //edge detection
    var p;
    for(var i = 0; i < n_particles; i++)
    {
      p = particles[i];
      if(p.x > 1) p.xv = -Math.abs(p.xv);
      if(p.x < 0) p.xv =  Math.abs(p.xv);
      if(p.y > 1) p.yv = -Math.abs(p.yv);
      if(p.y < 0) p.yv =  Math.abs(p.yv);
      moveParticle(particles[i]);
    }
  };

  self.draw = function()
  {
    var w = drawCanv.width;
    var h = drawCanv.height;
    var pw = p_size * w;
    var ph = p_size * h;
    var hpw = pw/2;
    var hph = ph/2;
    drawCanv.context.fillStyle = "#000000";
    for(var i = 0; i < n_particles; i++)
      drawCanv.context.fillRect(particles[i].x*w-hpw,particles[i].y*h-hph,pw,ph);
  };

  self.cleanup = function()
  {
  };

};

