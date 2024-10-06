var c = document.getElementById("c");
var ctx = c.getContext("2d");
var cH;
var cW;
var bgColor = "#FFFFFF";
var animations = [];
var circles = [];

var colorPicker = (function() {
  var colors = ["#FFFFFF","#000000"];

  var index = 0;
  function next() {
    index = index++ < colors.length - 1 ? index : 0;
    return colors[index];
  }
  function current() {
    return colors[index];
  }
  return {
    next: next,
    current: current
  };
})();

function removeAnimation(animation) {
  var index = animations.indexOf(animation);
  if (index > -1) animations.splice(index, 1);
}

function calcPageFillRadius(x, y) {
  var l = Math.max(x - 0, cW - x);
  var h = Math.max(y - 0, cH - y);
  return Math.sqrt(Math.pow(l, 2) + Math.pow(h, 2));
}

function addClickListeners() {
  document.addEventListener("touchstart", handleEvent);
  document.addEventListener("mousedown", handleEvent);
}

function handleEvent(e) {
  // Prevent effect if clicking within #signup-form
  if (e.target.closest('#signup-form')) {
    return; // Exit function early if the event occurs within #signup-form
  }

  // Set colors for ripple effect based on theme
  let currentColor = document.body.classList.contains('invert') ? "#ffffff" : "#000000";
  let nextColor = document.body.classList.contains('invert') ? "#000000" : "#ffffff";

  var targetR = calcPageFillRadius(e.pageX, e.pageY);
  var rippleSize = Math.max(window.innerWidth, window.innerHeight) * 1.2; // Larger ripple
  var minCoverDuration = 750;

  // Create the ripple animation effect
  var ripple = new Circle({
    x: e.pageX,
    y: e.pageY,
    r: 0,
    fill: currentColor,
    stroke: {
      width: 3,
      color: currentColor
    },
    opacity: 1
  });

  var rippleAnimation = anime({
    targets: ripple,
    r: rippleSize,
    opacity: 0,
    easing: "easeOutExpo",
    duration: 1200, // Adjust duration for smooth expansion
    complete: removeAnimation
  });

  // Create the page fill effect
  var pageFill = new Circle({
    x: e.pageX,
    y: e.pageY,
    r: 0,
    fill: nextColor
  });

  var fillAnimation = anime({
    targets: pageFill,
    r: targetR,
    duration: Math.max(targetR / 2, minCoverDuration),
    easing: "easeOutQuart",
    complete: function() {
      bgColor = pageFill.fill;
      removeAnimation(fillAnimation);
    }
  });

  animations.push(fillAnimation, rippleAnimation);
}

function extend(a, b) {
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
}

var Circle = function(opts) {
  extend(this, opts);
};

Circle.prototype.draw = function() {
  ctx.globalAlpha = this.opacity || 1;
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
  if (this.stroke) {
    ctx.strokeStyle = this.stroke.color;
    ctx.lineWidth = this.stroke.width;
    ctx.stroke();
  }
  if (this.fill) {
    ctx.fillStyle = this.fill;
    ctx.fill();
  }
  ctx.closePath();
  ctx.globalAlpha = 1;
  console.log("Drawing circle at:", this.x, this.y, "with radius:", this.r); // Debug draw method
};

var animate = anime({
  duration: Infinity,
  update: function() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cW, cH);
    animations.forEach(function(anim) {
      anim.animatables.forEach(function(animatable) {
        animatable.target.draw();
      });
    });
  }
});

var resizeCanvas = function() {
  cW = window.innerWidth;
  cH = window.innerHeight;
  c.width = cW * devicePixelRatio;
  c.height = cH * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
};

(function init() {
  resizeCanvas();
  if (window.CP) {
    window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 6000;
  }
  window.addEventListener("resize", resizeCanvas);
  addClickListeners();
  if (!!window.location.pathname.match(/fullcpgrid/)) {
    startFauxClicking();
  }
  handleInactiveUser();
})();

function handleInactiveUser() {
  var inactive = setTimeout(function() {
    fauxClick(cW / 2, cH / 2);
  }, 2000);

  function clearInactiveTimeout() {
    clearTimeout(inactive);
    document.removeEventListener("mousedown", clearInactiveTimeout);
    document.removeEventListener("touchstart", clearInactiveTimeout);
  }

  document.addEventListener("mousedown", clearInactiveTimeout);
  document.addEventListener("touchstart", clearInactiveTimeout);
}

function startFauxClicking() {
  setTimeout(function() {
    fauxClick(
      anime.random(cW * 0.2, cW * 0.8),
      anime.random(cH * 0.2, cH * 0.8)
    );
    startFauxClicking();
  }, anime.random(200, 900));
}

function fauxClick(x, y) {
  var fauxClick = new Event("mousedown");
  fauxClick.pageX = x;
  fauxClick.pageY = y;
  document.dispatchEvent(fauxClick);
}

var st,st_vol;
var audio = document.getElementById("audio");
var new_vol=1;

$(window).on( { "touchstart mousedown" : onInteraction,
                                "mouseup" : onInteractionEnd }
                      );

function onInteraction(e) {
    $(window).off( "touchstart mousedown" );
    clearTimeout(st);

    audio.volume = 1;
    audio.play();
}

function onInteractionEnd(e) {
    $(window).on( { "touchstart mousedown" : onInteraction } );
    clearTimeout(st);
    clearTimeout(st_vol);
    VolumeDown(0.9);
    st=setTimeout(function(){
      audio.pause();
    },1100);
}

function VolumeDown(vol){
  audio.volume = vol;
  new_vol=vol-0.1;
  if(new_vol<0){
    new_vol=0;
  }
  st_vol=setTimeout(function(){
    VolumeDown(new_vol);
  },100);
}