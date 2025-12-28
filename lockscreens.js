import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ---------- FIREBASE CONFIG ---------- */
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

/* ---------- ELEMENTS ---------- */
const lockScreen = document.getElementById("lockScreen");
const unlockBtn  = document.getElementById("unlockBtn");
const loading    = document.getElementById("loading");
const errorMsg   = document.getElementById("errorMsg");

/* ---------- FORCE INVISIBLE FIRST ---------- */
lockScreen.style.display = "none";

/* ---------- SILENT CHECK ON LOAD ---------- */
async function silentCheck() {
  const savedKey = localStorage.getItem("subscription_key");

  // Never activated
  if (!savedKey) {
    lockScreen.style.display = "flex";
    return;
  }

  try {
    const snap = await get(ref(db, "subscriptions/" + savedKey));

    // Deleted from Firebase
    if (!snap.exists()) {
      localStorage.clear();
      lockScreen.style.display = "flex";
      return;
    }

    const item = snap.val();

    // Expired or inactive
    if (Date.now() > item.expireAt || !item.active) {
      localStorage.clear();
      lockScreen.style.display = "flex";
      return;
    }

    // ✅ VALID SUBSCRIPTION → stay invisible
  } catch (e) {
    // Network error
    lockScreen.style.display = "flex";
  }
}

silentCheck();

/* ---------- ACTIVATE SUBSCRIPTION ---------- */
unlockBtn.addEventListener("click", async () => {
  const subKey = document.getElementById("passInput").value.trim();
  if (!subKey) return;

  unlockBtn.style.display = "none";
  loading.style.display = "block";
  errorMsg.style.display = "none";

  try {
    const snap = await get(ref(db, "subscriptions"));
    const data = snap.val();

    let activated = false;

    for (let key in data) {
      const item = data[key];

      if (item.subscriptionKey === subKey) {

        if (!item.active) {
          errorMsg.innerHTML = "❌ Subscription Already Used!";
          errorMsg.style.display = "block";
          break;
        }

        if (Date.now() > item.expireAt) {
          errorMsg.innerHTML = "❌ Subscription Expired!";
          errorMsg.style.display = "block";
          break;
        }

        // Mark subscription inactive after use (one-time)
        await update(ref(db, "subscriptions/" + key), { active: false });

        localStorage.setItem("subscription_key", key);
        lockScreen.style.display = "none";
        activated = true;
        break;
      }
    }

    if (!activated && errorMsg.style.display === "none") {
      errorMsg.innerHTML = "❌ Invalid Subscription Key!";
      errorMsg.style.display = "block";
    }

  } catch (e) {
    alert("⚠️ Network Error!");
  }

  loading.style.display = "none";
  unlockBtn.style.display = "block";
});
