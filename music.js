/* ===============================
   ELEMENTS
===============================*/
const audio = document.getElementById("audio");
const timeline = document.getElementById("timeline");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const disc = document.getElementById("disc");
const shadow = document.getElementById("shadow");
const songTitle = document.getElementById("songTitle");
const playlistEl = document.getElementById("playlist");

/* ===============================
   BUILD PLAYLIST UI
===============================*/
playlistData.forEach((song,i)=>{
  const div = document.createElement("div");
  div.className="track";
  div.textContent = song.title;
  div.onclick=()=>{ index=i; loadSong(true); };
  playlistEl.appendChild(div);
});

/* ===============================
   LOAD SONG
===============================*/
function loadSong(play=false){
  audio.src = playlistData[index].url;
  songTitle.textContent = playlistData[index].title;

  document.querySelectorAll(".track").forEach((t,i)=>{
    t.classList.toggle("active",i===index);
  });

  if(play){
    audio.play();
    resumeVisuals();
  }
}
loadSong();

/* ===============================
   BUTTON CONTROLS
===============================*/
playBtn.onclick=()=>{
  if(audio.paused){
    audio.play();
    resumeVisuals();
  }else{
    audio.pause();
    stopVisuals();
  }
};

nextBtn.onclick=()=>{ index=(index+1)%playlistData.length; loadSong(true); };
prevBtn.onclick=()=>{ index=(index-1+playlistData.length)%playlistData.length; loadSong(true); };
audio.onended=()=>nextBtn.click();

/* ===============================
   TIMELINE
===============================*/
audio.addEventListener("timeupdate",()=>{
  timeline.max = audio.duration;
  timeline.value = audio.currentTime;
  currentTime.textContent = format(audio.currentTime);
  totalTime.textContent = format(audio.duration);
});

timeline.addEventListener("input",()=>{
  audio.currentTime = timeline.value;
});

function format(sec){
  if(isNaN(sec)) return "0:00";
  let m = Math.floor(sec/60);
  let s = Math.floor(sec%60);
  if(s < 10) s = "0"+s;
  return m+":"+s;
}

/* ===============================
   VISUALIZER
===============================*/
const canvas = document.getElementById("ledCanvas");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resize(); window.onresize=resize;

const AudioCtx = new (window.AudioContext||window.webkitAudioContext)();
const analyser = AudioCtx.createAnalyser();
analyser.fftSize = 512;
const data = new Uint8Array(analyser.frequencyBinCount);
const src = AudioCtx.createMediaElementSource(audio);
src.connect(analyser);
analyser.connect(AudioCtx.destination);

function draw(){
  requestAnimationFrame(draw);
  analyser.getByteFrequencyData(data);
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const cx=canvas.width/2, cy=canvas.height/2;
  const outer=Math.min(cx,cy)-8;
  const base=outer*0.72;
  const max=outer-base;
  const bars=72;

  for(let i=0;i<bars;i++){
    const v=Math.pow(data[i]/255,.7)*max;
    const a=i*(Math.PI*2/bars)-Math.PI/2;
    const x1=cx+Math.cos(a)*base;
    const y1=cy+Math.sin(a)*base;
    const x2=cx+Math.cos(a)*(base+v);
    const y2=cy+Math.sin(a)*(base+v);

    const h=(performance.now()*0.04+i*6)%360;
    ctx.strokeStyle=`hsl(${h},100%,60%)`;
    ctx.lineWidth=canvas.width*0.012;
    ctx.lineCap="round";
    ctx.shadowBlur=8;
    ctx.shadowColor=ctx.strokeStyle;

    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
  }
}
draw();

/* ===============================
   VISUALS ON/OFF
===============================*/
function resumeVisuals(){
  playBtn.textContent="⏸";
  disc.style.animationPlayState="running";
  shadow.style.animationPlayState="running";
}

function stopVisuals(){
  playBtn.textContent="▶";
  disc.style.animationPlayState="paused";
  shadow.style.animationPlayState="paused";
}

/* ===============================
   BACKGROUND / SCREEN OFF PLAY
===============================*/
document.addEventListener("visibilitychange",()=>{
   audio.play();
   resumeVisuals();
});
setInterval(()=>{
   if(audio.paused){
      audio.play();
      resumeVisuals();
   }
},1500);

/* ===============================
   MEDIA SESSION
===============================*/
if ("mediaSession" in navigator){
  navigator.mediaSession.setActionHandler("previoustrack",()=>{ prevBtn.click(); });
  navigator.mediaSession.setActionHandler("nexttrack",()=>{ nextBtn.click(); });
  navigator.mediaSession.setActionHandler("pause",()=>{});
  navigator.mediaSession.setActionHandler("stop",()=>{});
}

/* WAKE LOCK */
let lock=null;
async function wakeOn(){
  try{ lock = await navigator.wakeLock.request("screen"); }
  catch(e){}
}
wakeOn();
setInterval(()=>wakeOn(),10000);

/* USER GESTURE UNLOCK */
document.addEventListener("click",()=>{
  if(AudioCtx.state === "suspended"){ AudioCtx.resume(); }
});
