// 🔥 GLOBAL GITHUB LOCK SWITCH
async function isLockEnabled() {
  try {
    const res = await fetch(
      "https://cdn.jsdelivr.net/gh/mydvlp22-hash/movie-app@main/lock.json?ts=" + Date.now()
    );
    const data = await res.json();
    return data.enabled === true;
  } catch (e) {
    console.log("Lock check failed, unlocking");
    return false; // fail-safe = unlock
  }
}

// final.js (PURE MODULE FILE)

document.addEventListener("DOMContentLoaded", async () => {

  const ENABLED = await isLockEnabled();
  if (!ENABLED) {
    console.log("🔓 Lock disabled from GitHub");
    return;
  }

  // ⬇️ এখানেই তোমার আগের পুরো lockscreen + Firebase code থাকবে
});


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

  /* 🔥 FIREBASE IMPORTS */
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
  const { getDatabase, ref, get, update } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");

  const app = initializeApp({
    apiKey: "AIzaSyCyDd6rCV7WaQe8sMF0Xmob3dpm6z6wEEQ",
    authDomain: "myapps-4a8eb.firebaseapp.com",
    databaseURL: "https://myapps-4a8eb-default-rtdb.firebaseio.com",
    projectId: "myapps-4a8eb"
  });

  const db = getDatabase(app);

  const lockScreen = document.getElementById("lockScreen");
  const activateBtn = document.getElementById("activateBtn");
  const loading = document.getElementById("loading");
  const errorMsg = document.getElementById("errorMsg");

  async function silentCheck(){
    const savedSubscriptionKey = localStorage.getItem("subscription_key");

    if(!savedSubscriptionKey){
      lockScreen.style.display = "flex";
      return;
    }

    try{
      const snap = await get(ref(db, "subscriptions/" + savedSubscriptionKey));

      if(!snap.exists()){
        localStorage.clear();
        lockScreen.style.display = "flex";
        return;
      }

      const sub = snap.val();

      if(Date.now() > sub.expireAt || !sub.active){
        localStorage.clear();
        lockScreen.style.display = "flex";
      }
    }catch{
      lockScreen.style.display = "flex";
    }
  }

  silentCheck();

});
