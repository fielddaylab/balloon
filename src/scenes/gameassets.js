var char_imgs;
var tank_img;
var can_img;
var alert_target_img;
var alert_gas_img;
var alert_danger_img;
var alert_bg_img;
var bubble_img;
var basket_img;
var rope_cut_img;
var rope_img;
var fire_img;
var balloon_back_img;
var balloon_img;
var needle_img;
var gauge_img;
var grass_img;
var tree_2_img;
var tree_1_img;
var tree_0_img;
var tree_imgs;
var cloud_4_img;
var cloud_3_img;
var cloud_2_img;
var cloud_1_img;
var cloud_0_img;
var cloud_imgs;
var rope_btn_red_img;
var rope_btn_img;
var flap_btn_red_img;
var flap_btn_img;
var burn_btn_red_img;
var burn_btn_img;
var down_arrows_canv;
var right_arrow_canv;
var left_arrow_canv;
var down_arrow_canv;
var up_arrow_canv;
var speed_canv;
var gauge_canv;
var part_canv;
var part_canvs;
var carbon_img;
var nitrogen_img;
var oxygen_img;
var tree_canv;
var mountain_canv;
var cloud_canv;
var balloon_canv;
var basket_canv;
var flame_canv;
var shadow_canv;
var stream_img;
var arrow_down_img;
var arrow_up_img;
var arrows_small_img;
var pipe_img;

var bake = function()
{
shadow_canv = document.createElement('canvas');
shadow_canv.width = 100;
shadow_canv.height = 100;
shadow_canv.context = shadow_canv.getContext('2d');
shadow_canv.context.fillStyle = "#FF0000";
shadow_canv.context.globalAlpha=0.1;
shadow_canv.context.beginPath();
shadow_canv.context.arc(shadow_canv.width/2,shadow_canv.height/2,shadow_canv.width/2,0,2*pi);
shadow_canv.context.fill();

flame_canv = document.createElement('canvas');
flame_canv.width = 100;
flame_canv.height = 100;
flame_canv.context = flame_canv.getContext('2d');
flame_canv.context.fillStyle = "#FF7700";
flame_canv.context.globalAlpha=0.8;
flame_canv.context.beginPath();
flame_canv.context.arc(flame_canv.width/2,flame_canv.height/2,flame_canv.width/2,0,2*pi);
flame_canv.context.fill();

basket_canv = document.createElement('canvas');
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

balloon_canv = document.createElement('canvas');
balloon_canv.width = 250;
balloon_canv.height = 250;
balloon_canv.context = balloon_canv.getContext('2d');
balloon_canv.context.fillStyle = "#FF0000";
balloon_canv.context.beginPath();
balloon_canv.context.arc(balloon_canv.width/2,balloon_canv.height/2,balloon_canv.width/2,0,2*pi);
balloon_canv.context.fill();

cloud_canv = document.createElement('canvas');
cloud_canv.width = 100;
cloud_canv.height = 100;
cloud_canv.context = cloud_canv.getContext('2d');
cloud_canv.context.fillStyle = "#FFFFFF";
cloud_canv.context.beginPath();
cloud_canv.context.arc(cloud_canv.width/2,cloud_canv.height/2,cloud_canv.width/2,0,2*pi);
cloud_canv.context.fill();

mountain_canv = document.createElement('canvas');
mountain_canv.width = 200;
mountain_canv.height = 200;
mountain_canv.context = mountain_canv.getContext('2d');
mountain_canv.context.fillStyle = "#888888";
mountain_canv.context.beginPath();
mountain_canv.context.moveTo(0,mountain_canv.height);
mountain_canv.context.lineTo(mountain_canv.width/2,0);
mountain_canv.context.lineTo(mountain_canv.width,mountain_canv.height);
mountain_canv.context.fill();

tree_canv = document.createElement('canvas');
tree_canv.width = 200;
tree_canv.height = 200;
tree_canv.context = tree_canv.getContext('2d');
tree_canv.context.fillStyle = "#996655";
tree_canv.context.fillRect(tree_canv.width/2-tree_canv.width/10,tree_canv.height/5,tree_canv.width/5,tree_canv.width*0.8);
tree_canv.context.fillStyle = "#00FF00";
tree_canv.context.beginPath();
tree_canv.context.arc(tree_canv.width/2,tree_canv.height/3,tree_canv.width/3,0,2*pi);
tree_canv.context.fill();

oxygen_img = new Image();
oxygen_img.src = "assets/oxygen.png";
nitrogen_img = new Image();
nitrogen_img.src = "assets/nitrogen.png";
carbon_img = new Image();
carbon_img.src = "assets/carbon.png";

part_canvs = [];
part_canv = document.createElement('canvas');
part_canv.width = 2;
part_canv.height = 2;
part_canv.context = part_canv.getContext('2d');
part_canv.context.fillStyle = "#FFFFFF";
part_canv.context.beginPath();
part_canv.context.arc(part_canv.width/2,part_canv.height/2,part_canv.width/2,0,2*pi);
part_canv.context.fill();
part_canvs.push(part_canv);

for(var i = 0; i < 10; i++)
{
  var r0 = 0.53333333333;
  var g0 = 0.6;
  var b0 = 0.73333333333;

  var r1 = 0.51764705882;
  var g1 = 0.85098039215;
  var b1 = 0.97647058823;

  part_canv = document.createElement('canvas');
  part_canv.width = 5;
  part_canv.height = 5;
  part_canv.context = part_canv.getContext('2d');
  //part_canv.context.fillStyle = "#84D9F9";
  part_canv.context.fillStyle = "rgba("+Math.floor(lerp(r0,r1,i/10)*256)+","+Math.floor(lerp(g0,g1,i/10)*256)+","+Math.floor(lerp(b0,b1,i/10)*256)+",1)";
  part_canv.context.beginPath();
  part_canv.context.arc(part_canv.width/2,part_canv.height/2,part_canv.width/2,0,2*pi);
  part_canv.context.fill();
  part_canvs.push(part_canv);
}

part_canv = document.createElement('canvas');
part_canv.width = 40;
part_canv.height = 40;
part_canv.context = part_canv.getContext('2d');
part_canv.context.drawImage(oxygen_img,0,0,part_canv.width,part_canv.height);
part_canvs.push(part_canv);
part_canv = document.createElement('canvas');
part_canv.width = 40;
part_canv.height = 40;
part_canv.context = part_canv.getContext('2d');
part_canv.context.drawImage(nitrogen_img,0,0,part_canv.width,part_canv.height);
part_canvs.push(part_canv);
part_canv = document.createElement('canvas');
part_canv.width = 40;
part_canv.height = 40;
part_canv.context = part_canv.getContext('2d');
part_canv.context.drawImage(carbon_img,0,0,part_canv.width,part_canv.height);
part_canvs.push(part_canv);

gauge_canv = document.createElement('canvas');
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

speed_canv = document.createElement('canvas');
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

up_arrow_canv = document.createElement('canvas');
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

down_arrow_canv = document.createElement('canvas');
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

left_arrow_canv = document.createElement('canvas');
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

right_arrow_canv = document.createElement('canvas');
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

down_arrows_canv = document.createElement('canvas');
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

stream_img = new Image();
stream_img.src = "assets/stream.png";
arrow_down_img = new Image();
arrow_down_img.src = "assets/arrow_down.png";
arrow_up_img = new Image();
arrow_up_img.src = "assets/arrow_up.png";
arrows_small_img = new Image();
arrows_small_img.src = "assets/arrows_small.png";
pipe_img = new Image();
pipe_img.src = "assets/pipe.png";

burn_btn_img = new Image();
burn_btn_img.src = "assets/btn_burn.png";
burn_btn_red_img = new Image();
burn_btn_red_img.src = "assets/btn_burn_red.png";

flap_btn_img = new Image();
flap_btn_img.src = "assets/btn_flap.png";
flap_btn_red_img = new Image();
flap_btn_red_img.src = "assets/btn_flap_red.png";

rope_btn_img = new Image();
rope_btn_img.src = "assets/btn_rope.png";
rope_btn_red_img = new Image();
rope_btn_red_img.src = "assets/btn_rope_red.png";

cloud_imgs = [];
cloud_0_img = new Image();
cloud_0_img.src = "assets/cloud_0.png";
cloud_imgs.push(cloud_0_img);
cloud_1_img = new Image();
cloud_1_img.src = "assets/cloud_1.png";
cloud_imgs.push(cloud_1_img);
cloud_2_img = new Image();
cloud_2_img.src = "assets/cloud_2.png";
cloud_imgs.push(cloud_2_img);
cloud_3_img = new Image();
cloud_3_img.src = "assets/cloud_3.png";
cloud_imgs.push(cloud_3_img);
cloud_4_img = new Image();
cloud_4_img.src = "assets/cloud_4.png";
cloud_imgs.push(cloud_4_img);

tree_imgs = [];
tree_0_img = new Image();
tree_0_img.src = "assets/tree_0.png";
tree_imgs.push(tree_0_img);
tree_1_img = new Image();
tree_1_img.src = "assets/tree_1.png";
tree_imgs.push(tree_1_img);
tree_2_img = new Image();
tree_2_img.src = "assets/tree_2.png";
tree_imgs.push(tree_2_img);

grass_img = new Image();
grass_img.src = "assets/grass.png";

gauge_img = new Image();
gauge_img.src = "assets/gauge.png";
needle_img = new Image();
needle_img.src = "assets/needle.png";

balloon_img = new Image();
balloon_img.src = "assets/balloon.png";
balloon_back_img = new Image();
balloon_back_img.src = "assets/balloon_back.png";

fire_img = new Image();
fire_img.src = "assets/fire.png";

rope_img = new Image();
rope_img.src = "assets/rope.png";
rope_cut_img = new Image();
rope_cut_img.src = "assets/rope_cut.png";

basket_img = new Image();
basket_img.src = "assets/basket.png";

bubble_img = new Image();
bubble_img.src = "assets/bubble.png";

alert_bg_img = new Image();
alert_bg_img.src = "assets/alert_bg.png";
alert_danger_img = new Image();
alert_danger_img.src = "assets/alert_danger.png";
alert_gas_img = new Image();
alert_gas_img.src = "assets/alert_gas.png";
alert_target_img = new Image();
alert_target_img.src = "assets/alert_target.png";

can_img = new Image();
can_img.src = "assets/can.png";
tank_img = new Image();
tank_img.src = "assets/tank.png";

eye_img = new Image();
eye_img.src = "assets/eye.png";

char_imgs = [];
for(var i = 0; i < 6; i++)
{
  char_imgs[i] = [];
  for(var j = 0; j < 3; j++)
  {
    char_imgs[i][j] = new Image();
    char_imgs[i][j].src = "assets/char_"+i+"_"+j+".png";
  }
  if(i < 3)
  {
    char_imgs[i][3] = new Image();
    char_imgs[i][3].src = "assets/char_"+i+"_icon.png";
  }
}

}

