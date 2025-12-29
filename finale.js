// final.js (PURE MODULE FILE – AppCreator SAFE)

document.addEventListener("DOMContentLoaded", async () => {

  /* 🔐 LOCKSCREEN UI */
  document.body.insertAdjacentHTML("beforeend", `
  <div id="lockScreen" style="
    position:fixed; inset:0;
    background:#000000cc;
    display:none;
    justify-content:center;
    align-items:center;
    flex-direction:column;
    z-index:999999;
  ">

    <a href="https://smalltoolai.blogspot.com/p/password-unlock-generate.html" target="_blank">
      <button style="background:#04AA6D;border:none;color:#fff;
        padding:8px 12px;font-size:16px;border-radius:8px;">
        <b>Get Subscription Key</b>
      </button>
    </a>

    <br>

    <input id="subscriptionInput"
      placeholder="Enter Subscription Key"
      style="padding:10px;width:250px;border-radius:5px;border:1px solid #ccc">

    <button onclick="activateSubscription()" id="activateBtn"
      style="margin-top:15px;background:#04AA6D;border:none;color:#fff;
      padding:8px 12px;font-size:16px;border-radius:8px;">
      Activate Subscription
    </button>

    <div id="loading" style="display:none;color:white;margin-top:10px">
      ⏳ Checking...
    </div>

    <div id="errorMsg" style="display:none;color:#ff4444;margin-top:10px"></div>

  </div>
  `);

  /* 🔥 FIREBASE */
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
  const { getDatabase, ref, get } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");

  const app = initializeApp({
    apiKey: "AIzaSyCyDd6rCV7WaQe8sMF0Xmob3dpm6z6wEEQ",
    authDomain: "myapps-4a8eb.firebaseapp.com",
    databaseURL: "https://myapps-4a8eb-default-rtdb.firebaseio.com",
    projectId: "myapps-4a8eb"
  });

  const db = getDatabase(app);

  const lockScreen = document.getElementById("lockScreen");

  /* 🔍 SILENT CHECK */
  async function silentCheck(){
    const key = localStorage.getItem("subscription_key");

    if(!key){
      lockScreen.style.display = "flex";
      return;
    }

    try{
      const snap = await get(ref(db, "subscriptions/" + key));

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

  /* 🔓 GLOBAL FUNCTION (INLINE CLICK WORKS 100%) */
  window.activateSubscription = async function () {

    const input = document.getElementById("subscriptionInput");
    const loading = document.getElementById("loading");
    const errorMsg = document.getElementById("errorMsg");
    const btn = document.getElementById("activateBtn");

    const key = input.value.trim();
    if(!key) return;

    btn.style.display = "none";
    loading.style.display = "block";
    errorMsg.style.display = "none";

    try{
      const snap = await get(ref(db, "subscriptions/" + key));

      if(!snap.exists()){
        errorMsg.textContent = "❌ Invalid Subscription Key";
        errorMsg.style.display = "block";
      } else {
        const sub = snap.val();

        if(!sub.active){
          errorMsg.textContent = "❌ Subscription Disabled";
          errorMsg.style.display = "block";
        } else if(Date.now() > sub.expireAt){
          errorMsg.textContent = "❌ Subscription Expired";
          errorMsg.style.display = "block";
        } else {
          localStorage.setItem("subscription_key", key);
          lockScreen.style.display = "none";
          return;
        }
      }
    }catch(e){
      errorMsg.textContent = "⚠️ Network Error";
      errorMsg.style.display = "block";
    }

    loading.style.display = "none";
    btn.style.display = "block";
  };

});
