//utils
var shadow_canv = document.createElement('canvas');
shadow_canv.width = 100;
shadow_canv.height = 100;
shadow_canv.context = shadow_canv.getContext('2d');
shadow_canv.context.fillStyle = "#FF0000";
shadow_canv.context.globalAlpha=0.1;
shadow_canv.context.beginPath();
shadow_canv.context.arc(shadow_canv.width/2,shadow_canv.height/2,shadow_canv.width/2,0,2*pi);
shadow_canv.context.fill();

var flame_canv = document.createElement('canvas');
flame_canv.width = 100;
flame_canv.height = 100;
flame_canv.context = flame_canv.getContext('2d');
flame_canv.context.fillStyle = "#FF7700";
flame_canv.context.globalAlpha=0.8;
flame_canv.context.beginPath();
flame_canv.context.arc(flame_canv.width/2,flame_canv.height/2,flame_canv.width/2,0,2*pi);
flame_canv.context.fill();

var basket_canv = document.createElement('canvas');
basket_canv.width = 200;
basket_canv.height = 200;
basket_canv.context = basket_canv.getContext('2d');
basket_canv.context.fillStyle = "#AA8833";
basket_canv.context.fillRect(basket_canv.width/3,basket_canv.height*3/4,basket_canv.width/3,basket_canv.height/4);
basket_canv.context.lineWidth = 3;
basket_canv.context.beginPath();
basket_canv.context.moveTo(basket_canv.width/3,basket_canv.height*3/4);
basket_canv.context.lineTo(basket_canv.width/5,basket_canv.height/3);
basket_canv.context.moveTo(basket_canv.width*2/3,basket_canv.height*3/4);
basket_canv.context.lineTo(basket_canv.width*4/5,basket_canv.height/3);
basket_canv.context.stroke();

var balloon_canv = document.createElement('canvas');
balloon_canv.width = 250;
balloon_canv.height = 250;
balloon_canv.context = balloon_canv.getContext('2d');
balloon_canv.context.fillStyle = "#FF0000";
balloon_canv.context.beginPath();
balloon_canv.context.arc(balloon_canv.width/2,balloon_canv.height/2,balloon_canv.width/2,0,2*pi);
balloon_canv.context.fill();

var cloud_canv = document.createElement('canvas');
cloud_canv.width = 100;
cloud_canv.height = 100;
cloud_canv.context = cloud_canv.getContext('2d');
cloud_canv.context.fillStyle = "#FFFFFF";
cloud_canv.context.beginPath();
cloud_canv.context.arc(cloud_canv.width/2,cloud_canv.height/2,cloud_canv.width/2,0,2*pi);
cloud_canv.context.fill();

var mountain_canv = document.createElement('canvas');
mountain_canv.width = 200;
mountain_canv.height = 200;
mountain_canv.context = mountain_canv.getContext('2d');
mountain_canv.context.fillStyle = "#888888";
mountain_canv.context.beginPath();
mountain_canv.context.moveTo(0,mountain_canv.height);
mountain_canv.context.lineTo(mountain_canv.width/2,0);
mountain_canv.context.lineTo(mountain_canv.width,mountain_canv.height);
mountain_canv.context.fill();

var tree_canv = document.createElement('canvas');
tree_canv.width = 200;
tree_canv.height = 200;
tree_canv.context = tree_canv.getContext('2d');
tree_canv.context.fillStyle = "#996655";
tree_canv.context.fillRect(tree_canv.width/2-tree_canv.width/10,tree_canv.height/5,tree_canv.width/5,tree_canv.width*0.8);
tree_canv.context.fillStyle = "#00FF00";
tree_canv.context.beginPath();
tree_canv.context.arc(tree_canv.width/2,tree_canv.height/3,tree_canv.width/3,0,2*pi);
tree_canv.context.fill();

var part_canv = document.createElement('canvas');
part_canv.width = 40;
part_canv.height = 40;
part_canv.context = part_canv.getContext('2d');
part_canv.context.fillStyle = "#FFFFFF";
part_canv.context.beginPath();
part_canv.context.arc(part_canv.width/2,part_canv.height/2,part_canv.width/2,0,2*pi);
part_canv.context.fill();

var gauge_canv = document.createElement('canvas');
gauge_canv.width = 150;
gauge_canv.height = 150;
gauge_canv.context = gauge_canv.getContext('2d');
gauge_canv.context.fillStyle = "#000000";
gauge_canv.context.beginPath();
gauge_canv.context.arc(gauge_canv.width/2,gauge_canv.height/2,gauge_canv.width/2,0,2*pi);
gauge_canv.context.fill();
var mint = pi*(3/4);
var maxt = pi*(9/4);
gauge_canv.context.fillStyle = "#FF0000";
gauge_canv.context.beginPath();
gauge_canv.context.arc(gauge_canv.width/2,gauge_canv.height/2,gauge_canv.width/2*0.9,0,2*pi);
gauge_canv.context.fill();
gauge_canv.context.fillStyle = "#FFFFFF";
gauge_canv.context.beginPath();
gauge_canv.context.moveTo(gauge_canv.width/2,gauge_canv.height/2)
gauge_canv.context.arc(gauge_canv.width/2,gauge_canv.height/2,gauge_canv.width/2,mint,maxt);
gauge_canv.context.fill();
gauge_canv.context.strokeStyle = "#000000";
gauge_canv.context.lineWidth = 10;
gauge_canv.context.beginPath();
gauge_canv.context.arc(gauge_canv.width/2,gauge_canv.height/2,gauge_canv.width/2-gauge_canv.context.lineWidth/2,0,2*pi);
gauge_canv.context.stroke();

var speed_canv = document.createElement('canvas');
speed_canv.width = 100;
speed_canv.height = 100;
speed_canv.context = speed_canv.getContext('2d');
speed_canv.context.strokeStyle = "#00FF00";
speed_canv.context.lineWidth = 20;
var speed_w = 30;
var speed_n = 3;
speed_canv.context.beginPath();
for(var i = 0; i < speed_n; i++)
{
speed_canv.context.moveTo(i*speed_w,0);
speed_canv.context.lineTo(speed_canv.width-((speed_n-1-i)*speed_w),speed_canv.height/2);
speed_canv.context.lineTo(i*speed_w,speed_canv.height);
}
speed_canv.context.stroke();

var up_arrow_canv = document.createElement('canvas');
up_arrow_canv.width = 100;
up_arrow_canv.height = 100;
up_arrow_canv.context = up_arrow_canv.getContext('2d');
up_arrow_canv.context.fillStyle = "#00FF00";
up_arrow_canv.context.fillRect(up_arrow_canv.width/4,up_arrow_canv.height/4,up_arrow_canv.width/2,up_arrow_canv.height*3/4);
up_arrow_canv.context.beginPath();
up_arrow_canv.context.moveTo(0,up_arrow_canv.height/4);
up_arrow_canv.context.lineTo(up_arrow_canv.width/2,0);
up_arrow_canv.context.lineTo(up_arrow_canv.width,up_arrow_canv.height/4);
up_arrow_canv.context.fill();

var down_arrow_canv = document.createElement('canvas');
down_arrow_canv.width = 100;
down_arrow_canv.height = 100;
down_arrow_canv.context = down_arrow_canv.getContext('2d');
down_arrow_canv.context.fillStyle = "#00FF00";
down_arrow_canv.context.fillRect(down_arrow_canv.width/4,0,down_arrow_canv.width/2,down_arrow_canv.height*3/4);
down_arrow_canv.context.beginPath();
down_arrow_canv.context.moveTo(0,down_arrow_canv.height*3/4);
down_arrow_canv.context.lineTo(down_arrow_canv.width/2,down_arrow_canv.height);
down_arrow_canv.context.lineTo(down_arrow_canv.width,down_arrow_canv.height*3/4);
down_arrow_canv.context.fill();

var left_arrow_canv = document.createElement('canvas');
left_arrow_canv.width = 100;
left_arrow_canv.height = 100;
left_arrow_canv.context = left_arrow_canv.getContext('2d');
left_arrow_canv.context.fillStyle = "#00FF00";
left_arrow_canv.context.fillRect(left_arrow_canv.width/4,left_arrow_canv.height/4,left_arrow_canv.width*3/4,left_arrow_canv.height/2);
left_arrow_canv.context.beginPath();
left_arrow_canv.context.moveTo(left_arrow_canv.width/4,left_arrow_canv.height);
left_arrow_canv.context.lineTo(0,left_arrow_canv.height/2);
left_arrow_canv.context.lineTo(left_arrow_canv.width/4,0);
left_arrow_canv.context.fill();

var right_arrow_canv = document.createElement('canvas');
right_arrow_canv.width = 100;
right_arrow_canv.height = 100;
right_arrow_canv.context = right_arrow_canv.getContext('2d');
right_arrow_canv.context.fillStyle = "#00FF00";
right_arrow_canv.context.fillRect(0,right_arrow_canv.height/4,right_arrow_canv.width*3/4,right_arrow_canv.height/2);
right_arrow_canv.context.beginPath();
right_arrow_canv.context.moveTo(right_arrow_canv.width*3/4,0);
right_arrow_canv.context.lineTo(right_arrow_canv.width,right_arrow_canv.height/2);
right_arrow_canv.context.lineTo(right_arrow_canv.width*3/4,right_arrow_canv.height);
right_arrow_canv.context.fill();

var down_arrows_canv = document.createElement('canvas');
down_arrows_canv.width = 100;
down_arrows_canv.height = 100;
down_arrows_canv.context = down_arrows_canv.getContext('2d');
down_arrows_canv.context.drawImage(down_arrow_canv,0,down_arrow_canv.height/4,25,25);
down_arrows_canv.context.drawImage(down_arrow_canv,0,down_arrow_canv.height*3/4,25,25);
down_arrows_canv.context.drawImage(down_arrow_canv,down_arrow_canv.width/4,0,25,25);
down_arrows_canv.context.drawImage(down_arrow_canv,down_arrow_canv.width/4,down_arrow_canv.height/2,25,25);
down_arrows_canv.context.drawImage(down_arrow_canv,down_arrow_canv.width/2,down_arrow_canv.height/4,25,25);
down_arrows_canv.context.drawImage(down_arrow_canv,down_arrow_canv.width/2,down_arrow_canv.height*3/4,25,25);
down_arrows_canv.context.drawImage(down_arrow_canv,down_arrow_canv.width*3/4,0,25,25);
down_arrows_canv.context.drawImage(down_arrow_canv,down_arrow_canv.width*3/4,down_arrow_canv.height/2,25,25);

var burn_btn_img = new Image();
burn_btn_img.src = "assets/btn_burn.png";
var burn_btn_red_img = new Image();
burn_btn_red_img.src = "assets/btn_burn_red.png";

var flap_btn_img = new Image();
flap_btn_img.src = "assets/btn_flap.png";
var flap_btn_red_img = new Image();
flap_btn_red_img.src = "assets/btn_flap_red.png";

var rope_btn_img = new Image();
rope_btn_img.src = "assets/btn_rope.png";
var rope_btn_red_img = new Image();
rope_btn_red_img.src = "assets/btn_rope_red.png";

var cloud_0_img = new Image();
cloud_0_img.src = "assets/cloud_0.png";
var cloud_1_img = new Image();
cloud_1_img.src = "assets/cloud_1.png";
var cloud_2_img = new Image();
cloud_2_img.src = "assets/cloud_2.png";

var tree_0_img = new Image();
tree_0_img.src = "assets/tree_0.png";
var tree_1_img = new Image();
tree_1_img.src = "assets/tree_1.png";

var grass_img = new Image();
grass_img.src = "assets/grass.png";

var gauge_img = new Image();
gauge_img.src = "assets/gauge.png";
var needle_img = new Image();
needle_img.src = "assets/needle.png";

var balloon_img = new Image();
balloon_img.src = "assets/balloon.png";
var balloon_back_img = new Image();
balloon_back_img.src = "assets/balloon_back.png";

var fire_img = new Image();
fire_img.src = "assets/fire.png";

var rope_img = new Image();
rope_img.src = "assets/rope.png";
var rope_cut_img = new Image();
rope_cut_img.src = "assets/rope_cut.png";

var basket_img = new Image();
basket_img.src = "assets/basket.png";

var char_imgs = [];
for(var i = 0; i < 6; i++)
{
  char_imgs[i] = [];
  for(var j = 0; j < 3; j++)
  {
    char_imgs[i][j] = new Image();
    char_imgs[i][j].src = "assets/char_"+i+"_"+j+".png";
  }
}

