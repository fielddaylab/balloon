var LoadingScene = function(game, stage)
{
  var self = this;
  var pad;
  var barw;
  var progress;
  var canv = stage.drawCanv;

  var imagesloaded = 0;
  var img_srcs = [];
  var images = [];

  var imageLoaded = function()
  {
    imagesloaded++;
  };

  self.ready = function()
  {
    pad = 20;
    barw = (canv.width-(2*pad));
    progress = 0;
    canv.context.fillStyle = "#000000";
    canv.context.fillText(".",0,0);// funky way to encourage any custom font to load

    //put strings in 'img_srcs' as separate array to get "static" count
    img_srcs.push("assets/btn_burn.png");
    img_srcs.push("assets/btn_burn_red.png");
    img_srcs.push("assets/btn_flap.png");
    img_srcs.push("assets/btn_flap_red.png");
    img_srcs.push("assets/btn_rope.png");
    img_srcs.push("assets/btn_rope_red.png");
    img_srcs.push("assets/cloud_0.png");
    img_srcs.push("assets/cloud_1.png");
    img_srcs.push("assets/cloud_2.png");
    img_srcs.push("assets/tree_0.png");
    img_srcs.push("assets/tree_1.png");
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
    for(var i = 0; i < 6; i++) for(var j = 0; j < 3; j++) img_srcs.push("assets/char_"+i+"_"+j+".png");
    for(var i = 0; i < img_srcs.length; i++)
    {
      images[i] = new Image();
      images[i].onload = imageLoaded; 
      images[i].src = img_srcs[i];
    }
    imageLoaded(); //call once to prevent 0/0 != 100% bug
  };

  self.tick = function()
  {
    if(progress <= imagesloaded/(img_srcs.length+1)) progress += 100;//0.01;
    if(progress >= 1.0) game.nextScene();
  };

  self.draw = function()
  {
    canv.context.fillRect(pad,canv.height/2,progress*barw,1);
    canv.context.strokeRect(pad-1,(canv.height/2)-1,barw+2,3);
  };

  self.cleanup = function()
  {
    progress = 0;
    imagesloaded = 0;
    images = [];//just used them to cache assets in browser; let garbage collector handle 'em.
    canv.context.fillStyle = "#FFFFFF";
    canv.context.fillRect(0,0,canv.width,canv.height);
  };
};
