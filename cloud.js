// cloud.js — Makhanani LTSM v1.70
// Syncs: Books, Learners, Staff, Issues, School Name, Notifications
// Cloud ID = schools/<SCHOOL_NAME> — changes when Admin changes school name
// Works with Firebase Firestore if configured, else falls back to local only

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- PASTE YOUR FIREBASE CONFIG HERE (from Firebase Console > Project Settings) ---
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_ID",
  appId: "PASTE_APP_ID"
};

let db = null;
try {
  if (firebaseConfig.apiKey !== "PASTE_YOUR_API_KEY") {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch(e){ console.warn("Firebase not configured, using local only", e); }

function getSchoolName(){
  return localStorage.getItem('MAKHANANI_SCHOOL_NAME') || 'MAKHANANI PRIMARY SCHOOL';
}
function getCloudId(){
  return 'schools/' + getSchoolName().toUpperCase().replace(/[^A-Z0-9]+/g,'_');
}
function getAllData(){
  return {
    version: '1.70',
    school: getSchoolName(),
    updatedAt: new Date().toISOString(),
    updatedBy: (()=>{ try{ let l=JSON.parse(localStorage.getItem('MAKHANANI_LOGGED_IN')||'null'); return l?l.name+' ('+l.role+')':'System'; }catch(e){ return 'System'; } })(),
    books: JSON.parse(localStorage.getItem('LTSM_BARCODES_TEXTBOOK_v158')||'[]'),
    learners: JSON.parse(localStorage.getItem('LTSM_BARCODES_LEARNER_v158')||'[]'),
    staff: JSON.parse(localStorage.getItem('MAKHANANI_STAFF')||'[]'),
    issues: JSON.parse(localStorage.getItem('MAKHANANI_ISSUES')||'[]'),
    notifications: JSON.parse(localStorage.getItem('MAKHANANI_NOTIF_LOG')||'[]'),
  };
}
function applyData(d){
  if(!d) return;
  if(d.books) localStorage.setItem('LTSM_BARCODES_TEXTBOOK_v158', JSON.stringify(d.books));
  if(d.learners) localStorage.setItem('LTSM_BARCODES_LEARNER_v158', JSON.stringify(d.learners));
  if(d.staff) localStorage.setItem('MAKHANANI_STAFF', JSON.stringify(d.staff));
  if(d.issues) localStorage.setItem('MAKHANANI_ISSUES', JSON.stringify(d.issues));
  if(d.notifications) localStorage.setItem('MAKHANANI_NOTIF_LOG', JSON.stringify(d.notifications));
  if(d.school) localStorage.setItem('MAKHANANI_SCHOOL_NAME', d.school);
  localStorage.setItem('MAKHANANI_CLOUD_UPDATED', new Date().toISOString());
}
function setStatus(msg, color){
  let el = document.getElementById('cloudStatus');
  if(el){ el.textContent = msg; el.style.background = color || '#059669'; }
  let lbl = document.getElementById('cloudIdLabel');
  if(lbl) lbl.textContent = getCloudId();
}

// --- PUSH: This phone -> Cloud ---
async function pushToCloud(){
  let data = getAllData();
  setStatus('☁️ Syncing to cloud...', '#f59e0b');
  try{
    if(db){
      await setDoc(doc(db, getCloudId(), 'data'), data);
      setStatus('☁️ Cloud: Synced ✅ ' + new Date().toLocaleTimeString(), '#059669');
    } else {
      setStatus('☁️ Cloud: Not configured — Saved Locally (paste Firebase config in cloud.js)', '#dc2626');
      console.log('Cloud payload (no Firebase):', data);
    }
    localStorage.setItem('MAKHANANI_CLOUD_UPDATED', new Date().toISOString());
  } catch(e){
    setStatus('☁️ Cloud Error: ' + e.message, '#dc2626');
    alert('Cloud sync failed: ' + e.message);
  }
}

// --- PULL: Cloud -> This phone ---
async function pullFromCloud(){
  setStatus('⬇️ Downloading from cloud...', '#f59e0b');
  try{
    if(!db){ setStatus('☁️ Cloud: Not configured — Paste Firebase config in cloud.js', '#dc2626'); return alert('Paste your Firebase config in cloud.js first'); }
    let snap = await getDoc(doc(db, getCloudId(), 'data'));
    if(!snap.exists()){ setStatus('☁️ Cloud: No data for ' + getCloudId(), '#dc2626'); return alert('No cloud data for ' + getCloudId() + '\nCheck school name matches Admin phone'); }
    let d = snap.data();
    if(!confirm('Download will REPLACE local data with cloud data from ' + (d.updatedAt||'') + ' by ' + (d.updatedBy||'') + '. Continue?')) return;
    applyData(d);
    setStatus('⬇️ Downloaded ✅ ' + new Date().toLocaleTimeString(), '#059669');
    alert('✅ Downloaded from cloud!\nSchool: ' + d.school + '\nBooks: ' + (d.books||[]).length + ' • Learners: ' + (d.learners||[]).length + ' • Issues: ' + (d.issues||[]).length);
    location.reload();
  } catch(e){
    setStatus('☁️ Cloud Error: ' + e.message, '#dc2626');
    alert('Download failed: ' + e.message);
  }
}

// Make available to onclick buttons
window.pushToCloud = pushToCloud;
window.pullFromCloud = pullFromCloud;
window.getAllData = getAllData;
window.applyData = applyData;
window.getCloudId = getCloudId;

// Auto status on load
document.addEventListener('DOMContentLoaded', ()=>{
  setStatus(db ? '☁️ Cloud: Ready — ' + getCloudId() : '☁️ Cloud: Not configured — Paste Firebase config in cloud.js', db ? '#059669' : '#dc2626');
});
setTimeout(()=>{ setStatus(db ? '☁️ Cloud: Ready — ' + getCloudId() : '☁️ Cloud: Not configured — Paste Firebase config in cloud.js', db ? '#059669' : '#dc2626'); }, 500);
