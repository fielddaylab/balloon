var LoadingScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var canvas = dc.canvas;
  var ctx = dc.context;

  var pad;
  var barw;
  var progress;

  var n_loading_imgs_loaded = 0;
  var loading_img_srcs = [];
  var loading_imgs = [];
  var n_imgs_loaded = 0;
  var img_srcs = [];
  var imgs = [];

  var draw_t = 0;
  var max_draw_t = 100;

  var loadingImageLoaded = function()
  {
    n_loading_imgs_loaded++;
  };
  var imageLoaded = function()
  {
    n_imgs_loaded++;
  };

  self.ready = function()
  {
    pad = 20;
    barw = (dc.width-(2*pad));
    progress = 0;
    ctx.fillStyle = "#000000";
    ctx.font = "12px Open Sans"; //put font that nees loading here
    ctx.fillText(".",0,0);// funky way to encourage any custom font to load

    //put asset paths in loading_img_srcs (for assets used on loading screen itself)
    loading_img_srcs.push("../../test.png");
    for(var i = 0; i < loading_img_srcs.length; i++)
    {
      loading_imgs[i] = new Image();
      loading_imgs[i].onload = loadingImageLoaded;
      loading_imgs[i].src = loading_img_srcs[i];
    }
    loadingImageLoaded(); //call once to prevent 0/0 != 100% bug

    //put asset paths in img_srcs
    img_srcs.push("assets/btn_burn.png");
    img_srcs.push("assets/btn_burn_red.png");
    img_srcs.push("assets/btn_flap.png");
    img_srcs.push("assets/btn_flap_red.png");
    img_srcs.push("assets/btn_rope.png");
    img_srcs.push("assets/btn_rope_red.png");
    img_srcs.push("assets/cloud_0.png");
    img_srcs.push("assets/cloud_1.png");
    img_srcs.push("assets/cloud_2.png");
    img_srcs.push("assets/cloud_3.png");
    img_srcs.push("assets/cloud_4.png");
    img_srcs.push("assets/tree_0.png");
    img_srcs.push("assets/tree_1.png");
    img_srcs.push("assets/tree_2.png");
    img_srcs.push("assets/grass.png");
    img_srcs.push("assets/gauge.png");
    img_srcs.push("assets/needle.png");
    img_srcs.push("assets/balloon.png");
    img_srcs.push("assets/balloon_back.png");
    img_srcs.push("assets/fire.png");
    img_srcs.push("assets/rope.png");
    img_srcs.push("assets/rope_cut.png");
    img_srcs.push("assets/basket.png");
    img_srcs.push("assets/bubble.png");
    img_srcs.push("assets/alert_bg.png");
    img_srcs.push("assets/alert_danger.png");
    img_srcs.push("assets/alert_gas.png");
    img_srcs.push("assets/alert_target.png");
    img_srcs.push("assets/can.png");
    img_srcs.push("assets/tank.png");
    img_srcs.push("assets/oxygen.png");
    img_srcs.push("assets/nitrogen.png");
    img_srcs.push("assets/carbon.png");
    img_srcs.push("assets/eye.png");
    for(var i = 0; i < 6; i++)
    {
      for(var j = 0; j < 3; j++)
        img_srcs.push("assets/char_"+i+"_"+j+".png");
      if(i < 3)
        img_srcs.push("assets/char_"+i+"_icon.png");
    }

    for(var i = 0; i < img_srcs.length; i++)
    {
      imgs[i] = new Image();
      imgs[i].onload = imageLoaded;
      imgs[i].src = img_srcs[i];
    }
    imageLoaded(); //call once to prevent 0/0 != 100% bug
  };

  self.tick = function()
  {
    //note- assets used on loading screen itself NOT included in wait
    var p = n_imgs_loaded/(img_srcs.length+1);
    if(progress <= p) progress += 0.01;
    //if(progress >= 1.0) game.nextScene(); //use this to wait for bar
    if(p >= 1.0 && draw_t >= max_draw_t) { bake(); game.nextScene(); }
  };

  self.draw = function()
  {
    ctx.fillRect(pad,dc.height/2,progress*barw,1);
    ctx.strokeRect(pad-1,(dc.height/2)-1,barw+2,3);

    var p = n_loading_imgs_loaded/(loading_img_srcs.length+1);
    if(p >= 1.0) //assets used in loading screen itself have been loaded
    {
      //do any special drawing here
      draw_t++;
      var f = draw_t/20;
      if(f > 1) f = 1;
      ctx.globalAlpha = f;
      ctx.drawImage(loading_imgs[0],dc.width/2-100,dc.height/2-100,200,200);
      ctx.globalAlpha = 1;

      if(draw_t > max_draw_t-10)
      {
        f = (draw_t-(max_draw_t-10))/10;
        if(f > 1) f = 1;
        if(f < 0) f = 0;
        ctx.globalAlpha = f;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0,0,dc.width,dc.height);
        ctx.globalAlpha = 1;
      }
    }
  };

  self.cleanup = function()
  {
    imgs = [];//just used them to cache assets in browser; let garbage collector handle 'em.
    loading_imgs = [];//just used them to cache assets in browser; let garbage collector handle 'em.
  };
};

