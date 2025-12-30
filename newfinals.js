// newfinal.js (PURE MODULE FILE – AppCreator SAFE)

document.addEventListener("DOMContentLoaded", async () => {

  /* ===============================
     🔐 LOCK SCREEN UI (INJECT)
  =============================== */
  document.body.insertAdjacentHTML("beforeend", `
    <div id="lockScreen" style="
      position:fixed; inset:0;
      background:#000000cc;
      display:none;
      justify-content:center;
      align-items:center;
      flex-direction:column;
      z-index:999999;
      font-family:Arial,sans-serif;
    ">

      <center>
        <a href="https://smalltoolai.blogspot.com/p/password-unlock-generate.html"
           target="_blank">
          <button style="
            background:#04AA6D;
            border:none;
            color:white;
            padding:10px 20px;
            font-size:16px;
            border-radius:8px;
            width:250px;
            cursor:pointer;
          "><b>Get Subscribe Key</b></button>
        </a>
      </center>

      <br>

      <input id="passInput" type="text" placeholder="Enter Subscribe Key"
        style="
          padding:10px 20px;
          width:250px;
          border-radius:5px;
          border:1px solid #ccc;
          font-size:15px;
        ">

      <button id="unlockBtn"
        style="
          margin-top:15px;
          padding:10px 20px;
          font-size:16px;
          color:white;
          background:red;
          border:none;
          border-radius:8px;
          width:250px;
          cursor:pointer;
        ">
        Activate Subscribe
      </button>

      <div id="loading"
        style="display:none;color:white;margin-top:10px">
        ⏳ Checking...
      </div>

      <div id="errorMsg"
        style="display:none;color:#ff4444;margin-top:10px">
        ❌ Invalid or Expired Password!
      </div>

    </div>
  `);

  /* ===============================
     🔥 FIREBASE (MODULE)
  =============================== */
  const { initializeApp } = await import(
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
  );
  const { getDatabase, ref, get, update } = await import(
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"
  );

  const app = initializeApp({
    apiKey: "AIzaSyCyDd6rCV7WaQe8sMF0Xmob3dpm6z6wEEQ",
  authDomain: "myapps-4a8eb.firebaseapp.com",
  databaseURL: "https://myapps-4a8eb-default-rtdb.firebaseio.com",
  projectId: "myapps-4a8eb",
  storageBucket: "myapps-4a8eb.appspot.com",
  messagingSenderId: "342267842050",
  appId: "1:342267842050:web:4749870bb18b05ed94611b"
  });

  const db = getDatabase(app);
  const lockScreen = document.getElementById("lockScreen");

  /* ===============================
     🔍 AUTO CHECK ON REFRESH
  =============================== */
  async function checkValidityOnRefresh() {
    const savedKey = localStorage.getItem("unlocked_key");

    if (!savedKey) {
      lockScreen.style.display = "flex";
      return;
    }

    try {
      const snap = await get(ref(db, "passwords/" + savedKey));

      if (!snap.exists()) {
        localStorage.clear();
        lockScreen.style.display = "flex";
        return;
      }

      const item = snap.val();

      if (Date.now() > item.expireAt || !item.used) {
        localStorage.clear();
        lockScreen.style.display = "flex";
      }

    } catch {
      lockScreen.style.display = "flex";
    }
  }

  checkValidityOnRefresh();

  /* ===============================
     🔓 UNLOCK BUTTON
  =============================== */
  const unlockBtn = document.getElementById("unlockBtn");
  const loading = document.getElementById("loading");
  const errorMsg = document.getElementById("errorMsg");

  unlockBtn.addEventListener("click", async () => {
    const pass = document.getElementById("passInput").value.trim();
    if (!pass) return;

    unlockBtn.style.display = "none";
    loading.style.display = "block";
    errorMsg.style.display = "none";

    try {
      const snapshot = await get(ref(db, "passwords"));
      const data = snapshot.val() || {};
      let success = false;

      for (const key in data) {
        const item = data[key];

        if (item.password === pass) {

          if (item.used) {
            errorMsg.textContent = "❌ This Password is Already Used!";
            errorMsg.style.display = "block";
            break;
          }

          if (Date.now() > item.expireAt) {
            errorMsg.textContent = "❌ Password Expired!";
            errorMsg.style.display = "block";
            break;
          }

          await update(ref(db, "passwords/" + key), { used: true });

          localStorage.setItem("unlocked_key", key);
          lockScreen.style.display = "none";
          success = true;
          break;
        }
      }

      if (!success && errorMsg.style.display === "none") {
        errorMsg.textContent = "❌ Invalid or Expired Password!";
        errorMsg.style.display = "block";
      }

    } catch (e) {
      alert("⚠️ Network Error!");
    }

    loading.style.display = "none";
    unlockBtn.style.display = "block";
  });

});
