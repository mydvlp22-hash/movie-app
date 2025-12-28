<script type="module">
/* 🔐 LOCKSCREEN MODULE UI */
const lockScreenHtml = `
<div id="lockScreen" style="
  position:fixed;
  top:0;left:0;
  width:100%;height:100%;
  background:#000000cc;
  display:none;
  justify-content:center;
  align-items:center;
  flex-direction:column;
  z-index:999999;
">
  <a href="https://smalltoolai.blogspot.com/p/password-unlock-generate.html" target="_blank">
    <button style="background:#04AA6D;border:none;color:#fff;padding:8px 12px;font-size:16px;border-radius:8px;cursor:pointer">
      <b>Get Subscription Key</b>
    </button>
  </a>

  <br>

  <input id="subscriptionInput" placeholder="Enter Subscription Key"
    style="padding:10px;width:250px;border-radius:5px;border:1px solid #ccc">

  <button id="activateBtn" style="margin-top:15px;background:#04AA6D;border:none;color:#fff;padding:8px 12px;font-size:16px;border-radius:8px;cursor:pointer">
    Activate Subscription
  </button>

  <div id="loading" style="display:none;color:white;margin-top:10px">⏳ Checking...</div>
  <div id="errorMsg" style="display:none;color:#ff4444;margin-top:10px"></div>
</div>
`;

document.body.insertAdjacentHTML("beforeend", lockScreenHtml);

const lockScreen = document.getElementById("lockScreen");
const activateBtn = document.getElementById("activateBtn");
const loading = document.getElementById("loading");
const errorMsg = document.getElementById("errorMsg");

/* Force invisible init */
lockScreen.style.display = "none";

/* ---------- CHECK IF FILE EXISTS ON GITHUB ---------- */
async function githubFileExists(url){
  try{
    const resp = await fetch(url, { method: "HEAD" });
    return resp.ok;
  }catch(e){
    return false;
  }
}

/* ---------- INIT LOCKSCREEN IF FILE EXISTS ---------- */
(async function initLockScreen(){
  const fileUrl = "https://cdn.jsdelivr.net/gh/mydvlp22-hash/movie-app@main/final.js";
  const exists = await githubFileExists(fileUrl);

  if(!exists){
    console.log("LockScreen disabled (file missing).");
    return; // exit → LockScreen will not show
  }

  // LockScreen enabled
  lockScreen.style.display = "flex";

  /* 🔐 FIREBASE CONFIG */
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCyDd6rCV7WaQe8sMF0Xmob3dpm6z6wEEQ",
    authDomain: "myapps-4a8eb.firebaseapp.com",
    databaseURL: "https://myapps-4a8eb-default-rtdb.firebaseio.com",
    projectId: "myapps-4a8eb",
    storageBucket: "myapps-4a8eb.appspot.com",
    messagingSenderId: "342267842050",
    appId: "1:342267842050:web:4749870bb18b05ed94611b"
  };

  const app = initializeApp(firebaseConfig);
  const db  = getDatabase(app);

  /* ---------- SILENT CHECK ---------- */
  const savedKey = localStorage.getItem("subscription_key");
  if(savedKey){
    try{
      const snap = await get(ref(db, "subscriptions/" + savedKey));
      const sub = snap.val();
      if(snap.exists() && Date.now() <= sub.expireAt && sub.active){
        lockScreen.style.display = "none"; // valid subscription
      }
    }catch(e){}
  }

  /* ---------- ACTIVATE SUBSCRIPTION ---------- */
  activateBtn.addEventListener("click", async ()=>{
    const enteredKey = document.getElementById("subscriptionInput").value.trim();
    if(!enteredKey) return;

    activateBtn.style.display = "none";
    loading.style.display = "block";
    errorMsg.style.display = "none";

    try{
      const snapshot = await get(ref(db, "subscriptions"));
      const data = snapshot.val();
      let activated = false;

      for(const id in data){
        const sub = data[id];

        if(sub.subscriptionKey === enteredKey){
          if(!sub.active){ errorMsg.textContent="❌ Already Used!"; errorMsg.style.display="block"; break; }
          if(Date.now() > sub.expireAt){ errorMsg.textContent="❌ Expired!"; errorMsg.style.display="block"; break; }

          await update(ref(db, "subscriptions/" + id), { active:false });
          localStorage.setItem("subscription_key", id);
          lockScreen.style.display = "none";
          activated = true;
          break;
        }
      }

      if(!activated && errorMsg.style.display==="none"){
        errorMsg.textContent="❌ Invalid Key!"; errorMsg.style.display="block";
      }
    }catch(e){
      alert("⚠️ Network Error!");
    }

    loading.style.display = "none";
    activateBtn.style.display = "block";
  });

})();
</script>
