// 🔐 LOCKSCREEN MODULE
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
    <button style="background:#04AA6D;border:none;color:#fff;padding:8px 12px;font-size:16px;border-radius:8px;cursor:pointer"><b>Get Subscription Key</b></button>
  </a>

  <br>

  <input id="passInput" placeholder="Enter Subscription Key"
    style="padding:10px;width:250px;border-radius:5px;border:1px solid #ccc">

  <button id="unlockBtn" style="margin-top:15px;background:#04AA6D;border:none;color:#fff;padding:8px 12px;font-size:16px;border-radius:8px;cursor:pointer">Activate Subscription</button>

  <div id="loading" style="display:none;color:white;margin-top:10px">⏳ Checking...</div>
  <div id="errorMsg" style="display:none;color:#ff4444;margin-top:10px"></div>
</div>
`;

// DOM-এ inject করা
document.body.insertAdjacentHTML('beforeend', lockScreenHtml);

// 🔐 Firebase / Subscription Key Logic
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
const db = getDatabase(app);

const lockScreen  = document.getElementById("lockScreen");
const unlockBtn   = document.getElementById("unlockBtn");
const loading     = document.getElementById("loading");
const errorMsg    = document.getElementById("errorMsg");

// force invisible
lockScreen.style.display = "none";

// silent check
async function silentCheck() {
  const savedKey = localStorage.getItem("unlocked_key");
  if (!savedKey) { lockScreen.style.display = "flex"; return; }
  try {
    const snap = await get(ref(db, "passwords/" + savedKey));
    if (!snap.exists() || Date.now() > snap.val().expireAt || !snap.val().used) {
      localStorage.clear();
      lockScreen.style.display = "flex";
    }
  } catch(e) {
    lockScreen.style.display = "flex";
  }
}
silentCheck();

// unlock button
unlockBtn.addEventListener("click", async () => {
  const key = document.getElementById("passInput").value.trim();
  if (!key) return;
  unlockBtn.style.display = "none";
  loading.style.display = "block";
  errorMsg.style.display = "none";
  try {
    const snapshot = await get(ref(db, "passwords"));
    const data = snapshot.val();
    let unlocked = false;
    for (let k in data) {
      const item = data[k];
      if (item.password === key) {
        if(item.used){ errorMsg.textContent="❌ Already Used"; errorMsg.style.display="block"; break; }
        if(Date.now() > item.expireAt){ errorMsg.textContent="❌ Expired"; errorMsg.style.display="block"; break; }
        await update(ref(db, "passwords/"+k), {used:true});
        localStorage.setItem("unlocked_key", k);
        lockScreen.style.display = "none";
        unlocked = true;
        break;
      }
    }
    if(!unlocked && errorMsg.style.display==="none"){ errorMsg.textContent="❌ Invalid Key"; errorMsg.style.display="block"; }
  } catch(e){ alert("⚠️ Network Error"); }
  loading.style.display = "none";
  unlockBtn.style.display = "block";
});
