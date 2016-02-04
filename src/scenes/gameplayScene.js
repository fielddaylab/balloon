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
  var Mass = function(x,y,xv,yv,m)
  {
    this.x = x;
    this.y = y;
    this.xv = xv;
    this.yv = yv;
    this.m = m;
  }
  var moveMass = function(m)
  {
    m.x += m.xv;
    m.y += m.yv;
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
  var tmpM = new Mass(0,0,0,0,0);
  var collideParticleMass = function(p,m)
  {
    tmpP.xv = p.xv-m.xv;
    tmpP.yv = p.yv-m.yv;
    tmpM.xv = tmpP.xv*2/(1+m.m);
    tmpM.yv = tmpP.yv*2/(1+m.m);
    tmpP.xv = (tmpP.xv*(1-m.m))/(1+m.m);
    tmpP.yv = (tmpP.yv*(1-m.m))/(1+m.m);

    p.xv = tmpP.xv+m.xv;
    p.yv = tmpP.yv+m.yv;
    m.xv = m.xv+tmpM.xv;
    m.yv = m.yv+tmpM.yv;
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
  var m_size;
  var m_vel;
  var m_m;

  self.ready = function()
  {
    particles = [];
    n_particles = 1;
    p_size = 0.02;
    p_vel = 0.005;
    m_size = 0.1;
    m_vel = 0.005;
    m_m = 10;

    for(var i = 0; i < n_particles; i++)
      particles.push(new Particle(Math.random(),Math.random(),(Math.random()*p_vel*2)-p_vel,(Math.random()*p_vel*2)-p_vel));
    balloon = new Mass(Math.random(),Math.random(),(Math.random()*m_vel*2)-m_vel,(Math.random()*m_vel*2)-m_vel,m_m);
  };

  self.tick = function()
  {
    //movement
    for(var i = 0; i < n_particles; i++)
      moveMass(particles[i]);
    moveMass(balloon);

    //gravity
    for(var i = 0; i < n_particles; i++)
      particles[i].yv += 0.0001;
    balloon.yv += 0.0001;

    //collision
    var collideDistSqr = p_size; collideDistSqr *= collideDistSqr;
    for(var i = 0; i < n_particles; i++)
    {
      for(var j = i+1; j < n_particles; j++)
      {
        if(pDistSqr(particles[i],particles[j]) < collideDistSqr)
          collideParticles(particles[i],particles[j]);
      }
    }
    collideDistSqr = (p_size+m_size)/2; collideDistSqr *= collideDistSqr;
    for(var i = 0; i < n_particles; i++)
    {
      if(pDistSqr(particles[i],balloon) < collideDistSqr)
        collideParticleMass(particles[i],balloon);
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
    }
    if(balloon.x > 1) balloon.xv = -Math.abs(balloon.xv);
    if(balloon.x < 0) balloon.xv =  Math.abs(balloon.xv);
    if(balloon.y > 1) balloon.yv = -Math.abs(balloon.yv);
    if(balloon.y < 0) balloon.yv =  Math.abs(balloon.yv);
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
    var mw = m_size * w;
    var mh = m_size * h;
    var hmw = mw/2;
    var hmh = mh/2;
    drawCanv.context.fillRect(balloon.x*w-hmw,balloon.y*h-hmh,mw,mh);
  };

  self.cleanup = function()
  {
  };

};

