/* ===============================
   BUILD PLAYLIST UI
===============================*/
playlistData.forEach((song,i)=>{
  const div = document.createElement("div");
  div.className="track";
  div.textContent = song.title;
  div.onclick=()=>{ index=i; loadSong(true); setPauseIcon(); };
  playlistEl.appendChild(div);
});

/* ===============================
   LOAD SONG + SCROLL PLAYLIST
===============================*/
function loadSong(play=false){
  audio.src = playlistData[index].url;
  songTitle.textContent = playlistData[index].title;

  const tracks = document.querySelectorAll(".track");
  tracks.forEach((t,i)=> t.classList.toggle("active",i===index));

  // SCROLL ACTIVE SONG INTO VIEW
  const activeTrack = tracks[index];
  if(activeTrack){
    const playlistRect = playlistEl.getBoundingClientRect();
    const trackRect = activeTrack.getBoundingClientRect();
    if(trackRect.top < playlistRect.top || trackRect.bottom > playlistRect.bottom){
      playlistEl.scrollTop = activeTrack.offsetTop - playlistEl.offsetTop - playlistEl.clientHeight/4;
    }
  }

  if(play){ audio.play(); resumeVisuals(); setPauseIcon(); }
}

/* ===============================
   OPEN/CLOSE POPUP
===============================*/
function openPlayer(){ popup.classList.add("active"); loadSong(true); document.body.style.overflow="hidden"; }
function closePlayer(){ popup.classList.remove("active"); audio.pause(); setPlayIcon(); document.body.style.overflow=""; }

/* ===============================
   BUTTON CONTROLS (SVG)
===============================*/
playBtn.onclick = ()=>{
  if(audio.paused){ audio.play(); resumeVisuals(); setPauseIcon(); } 
  else { audio.pause(); stopVisuals(); setPlayIcon(); }
};
nextBtn.onclick = ()=>{ index=(index+1)%playlistData.length; loadSong(true); };
prevBtn.onclick = ()=>{ index=(index-1+playlistData.length)%playlistData.length; loadSong(true); };
audio.onended = ()=> nextBtn.click();

/* ===============================
   TIMELINE
===============================*/
audio.addEventListener("timeupdate",()=>{
  timeline.max=audio.duration;
  timeline.value=audio.currentTime;
  currentTime.textContent=format(audio.currentTime);
  totalTime.textContent=format(audio.duration);
});
timeline.addEventListener("input",()=>{ audio.currentTime=timeline.value; });
function format(sec){ if(isNaN(sec)) return "0:00"; let m=Math.floor(sec/60); let s=Math.floor(sec%60); if(s<10) s="0"+s; return m+":"+s; }

/* ===============================
   VISUALIZER
===============================*/
const canvas=document.getElementById("ledCanvas");
const ctx=canvas.getContext("2d");
function resize(){ canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight; }
resize(); window.onresize=resize;
const AudioCtx=new (window.AudioContext||window.webkitAudioContext)();
const analyser=AudioCtx.createAnalyser(); analyser.fftSize=512;
const data=new Uint8Array(analyser.frequencyBinCount);
const src=AudioCtx.createMediaElementSource(audio);
src.connect(analyser); analyser.connect(AudioCtx.destination);
function draw(){ requestAnimationFrame(draw); analyser.getByteFrequencyData(data); ctx.clearRect(0,0,canvas.width,canvas.height);
const cx=canvas.width/2, cy=canvas.height/2; const outer=Math.min(cx,cy)-8; const base=outer*0.72; const max=outer-base; const bars=72;
for(let i=0;i<bars;i++){ const v=Math.pow(data[i]/255,.7)*max; const a=i*(Math.PI*2/bars)-Math.PI/2;
const x1=cx+Math.cos(a)*base; const y1=cy+Math.sin(a)*base; const x2=cx+Math.cos(a)*(base+v); const y2=cy+Math.sin(a)*(base+v);
const h=(performance.now()*0.04+i*6)%360; ctx.strokeStyle=`hsl(${h},100%,60%)`; ctx.lineWidth=canvas.width*0.012; ctx.lineCap="round"; ctx.shadowBlur=8; ctx.shadowColor=ctx.strokeStyle; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); } }
draw();

/* ===============================
   VISUALS ON/OFF
===============================*/
function resumeVisuals(){ disc.style.animationPlayState="running"; shadow.style.animationPlayState="running"; }
function stopVisuals(){ disc.style.animationPlayState="paused"; shadow.style.animationPlayState="paused"; }

/* ===============================
   PLAY/PAUSE ICON SVG
===============================*/
function setPauseIcon(){
  playBtn.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="#fff"><path d="M6 19h4V5H6v14zM14 5v14h4V5h-4z"/></svg>`;
}
function setPlayIcon(){
  playBtn.innerHTML = `<svg width="50" height="50" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>`;
}

/* ===============================
   BACKDROP CLICK CLOSE
===============================*/
popup.addEventListener("click",(e)=>{ if(e.target===popup) closePlayer(); });

/* ===============================
   USER GESTURE UNLOCK
===============================*/
document.addEventListener("click",()=>{ if(AudioCtx.state==="suspended"){ AudioCtx.resume(); } });