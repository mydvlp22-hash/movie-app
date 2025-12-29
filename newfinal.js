// final.js (PURE MODULE FILE – AppCreator SAFE)

document.addEventListener("DOMContentLoaded", async () => {

  /* ===============================
     🔐 LOCK SCREEN UI
  =============================== */
  document.body.insertAdjacentHTML("beforeend", `
    <div id="lockScreen" style="
      position:fixed;
      inset:0;
      background:rgba(0,0,0,0.85);
      display:none;
      align-items:center;
      justify-content:center;
      flex-direction:column;
      z-index:999999;
      font-family:Arial,sans-serif;
    ">

      <h2 style="color:#fff;margin-bottom:15px">🔐 Subscription Required</h2>

      <a href="https://smalltoolai.blogspot.com/p/password-unlock-generate.html"
         target="_blank" style="margin-bottom:15px">
        <button style="
          background:#04AA6D;
          border:none;
          color:#fff;
          padding:10px 16px;
          font-size:16px;
          border-radius:8px;
          cursor:pointer;
        ">
          Get Subscription Key
        </button>
      </a>

      <input id="subscriptionInput"
        placeholder="Enter Subscription Key"
        style="
          padding:10px;
          width:260px;
          border-radius:6px;
          border:1px solid #ccc;
          font-size:15px;
        ">

      <button id="activateBtn"
        style="
          margin-top:15px;
          background:#2196F3;
          border:none;
          color:#fff;
          padding:10px 16px;
          font-size:16px;
          border-radius:8px;
          cursor:pointer;
        ">
        Activate Subscription
      </button>

      <div id="loading" style="
        display:none;
        color:#fff;
        margin-top:12px;
      ">⏳ Checking...</div>

      <div id="errorMsg" style="
        display:none;
        color:#ff5252;
        margin-top:12px;
        font-size:15px;
      "></div>

    </div>
  `);

  /* ===============================
     🔥 FIREBASE (MODULE MODE)
  =============================== */
  const { initializeApp } = await import(
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
  );
  const { getDatabase, ref, get } = await import(
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"
  );

  const app = initializeApp({
    apiKey: "AIzaSyCyDd6rCV7WaQe8sMF0Xmob3dpm6z6wEEQ",
    authDomain: "myapps-4a8eb.firebaseapp.com",
    databaseURL: "https://myapps-4a8eb-default-rtdb.firebaseio.com",
    projectId: "myapps-4a8eb"
  });

  const db = getDatabase(app);
  const lockScreen = document.getElementById("lockScreen");

  /* ===============================
     🔍 SILENT AUTO CHECK
  =============================== */
  async function silentCheck() {
    const savedKey = localStorage.getItem("subscription_key");

    if (!savedKey) {
      lockScreen.style.display = "flex";
      return;
    }

    try {
      const snap = await get(ref(db, "subscriptions/" + savedKey));

      if (!snap.exists()) {
        localStorage.removeItem("subscription_key");
        lockScreen.style.display = "flex";
        return;
      }

      const sub = snap.val();
      if (!sub.active || Date.now() > sub.expireAt) {
        localStorage.removeItem("subscription_key");
        lockScreen.style.display = "flex";
      }

    } catch (e) {
      lockScreen.style.display = "flex";
    }
  }

  silentCheck();

  /* ===============================
     🔓 ACTIVATE BUTTON (GLOBAL)
  =============================== */
  window.activateSubscription = async function () {
    const input = document.getElementById("subscriptionInput");
    const loading = document.getElementById("loading");
    const errorMsg = document.getElementById("errorMsg");
    const btn = document.getElementById("activateBtn");

    const key = input.value.trim();
    if (!key) return;

    btn.style.display = "none";
    loading.style.display = "block";
    errorMsg.style.display = "none";

    try {
      const snap = await get(ref(db, "subscriptions/" + key));

      if (!snap.exists()) {
        errorMsg.textContent = "❌ Invalid Subscription Key";
        errorMsg.style.display = "block";
      } else {
        const sub = snap.val();

        if (!sub.active) {
          errorMsg.textContent = "❌ Subscription Disabled";
          errorMsg.style.display = "block";
        } else if (Date.now() > sub.expireAt) {
          errorMsg.textContent = "❌ Subscription Expired";
          errorMsg.style.display = "block";
        } else {
          localStorage.setItem("subscription_key", key);
          lockScreen.style.display = "none";
          return;
        }
      }
    } catch (err) {
      errorMsg.textContent = "⚠️ Network Error";
      errorMsg.style.display = "block";
    }

    loading.style.display = "none";
    btn.style.display = "block";
  };

  // inline onclick support
  document.getElementById("activateBtn")
    .addEventListener("click", window.activateSubscription);

});
