// cloud.js — Makhanani LTSM v1.71
// Uses YOUR Firebase Realtime Database: makhanani-ltsm
// Path: schools/<SCHOOL_NAME>/data
// Syncs: Books, Learners, Staff, Issues, School Name, Notifications

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPcF5zaCD6Mp9TfpiMPoc3xG0qSPwO7oA",
  authDomain: "makhanani-ltsm.firebaseapp.com",
  databaseURL: "https://makhanani-ltsm-default-rtdb.firebaseio.com",
  projectId: "makhanani-ltsm",
  storageBucket: "makhanani-ltsm.firebasestorage.app",
  messagingSenderId: "247180363183",
  appId: "1:247180363183:web:760b5163fdf421bae01b5a",
  measurementId: "G-TDFSSF6NTB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics = null;
try { analytics = getAnalytics(app); } catch(e){ console.log("Analytics skipped", e); }
const db = getDatabase(app);

function getSchoolName(){
  return localStorage.getItem('MAKHANANI_SCHOOL_NAME') || 'MAKHANANI PRIMARY SCHOOL';
}
function getCloudId(){
  return 'schools/' + getSchoolName().toUpperCase().replace(/[^A-Z0-9]+/g,'_');
}
function getCloudPath(){
  return getCloudId() + '/data';
}
function getAllData(){
  let login = null;
  try { login = JSON.parse(localStorage.getItem('MAKHANANI_LOGGED_IN')||'null'); } catch(e){}
  return {
    version: '1.71',
    school: getSchoolName(),
    updatedAt: new Date().toISOString(),
    updatedBy: login ? login.name + ' (' + login.role + ')' : 'System',
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
  if(el){ el.textContent = msg; }
  let lbl = document.getElementById('cloudIdLabel');
  if(lbl) lbl.textContent = getCloudId();
  let lbl2 = document.getElementById('cloudIdLabel2');
  if(lbl2) lbl2.textContent = getCloudId();
}

// PUSH: This phone -> Cloud
async function pushToCloud(){
  let data = getAllData();
  setStatus('☁️ Syncing to cloud...', '#f59e0b');
  try{
    await set(ref(db, getCloudPath()), data);
    localStorage.setItem('MAKHANANI_CLOUD_UPDATED', new Date().toISOString());
    setStatus('☁️ Cloud: Synced ✅ ' + new Date().toLocaleTimeString() + ' — ' + getCloudId(), '#059669');
  } catch(e){
    setStatus('☁️ Cloud Error: ' + e.message, '#dc2626');
    alert('Cloud sync failed: ' + e.message + '\n\nCheck Firebase Console > Realtime Database > Rules — must allow read/write for testing.');
  }
}

// PULL: Cloud -> This phone
async function pullFromCloud(){
  setStatus('⬇️ Downloading from cloud...', '#f59e0b');
  try{
    let snap = await get(ref(db, getCloudPath()));
    if(!snap.exists()){
      setStatus('☁️ Cloud: No data for ' + getCloudId(), '#dc2626');
      return alert('No cloud data for ' + getCloudId() + '\n\n1. Check school name matches Admin phone exactly\n2. Admin must click SYNC TO CLOUD first');
    }
    let d = snap.val();
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

// LIVE LISTENER: Auto-update when another phone syncs
function startLiveListener(){
  try{
    onValue(ref(db, getCloudPath()), (snap)=>{
      if(!snap.exists()) return;
      let d = snap.val();
      let last = localStorage.getItem('MAKHANANI_CLOUD_UPDATED')||'';
      // Only auto-apply if cloud is newer and not from this sync
      if(d.updatedAt && d.updatedAt !== last){
        // Do NOT auto-overwrite if user is typing, just show badge
        setStatus('☁️ Cloud: New data from ' + (d.updatedBy||'another phone') + ' — Click DOWNLOAD', '#f59e0b');
      }
    });
  } catch(e){ console.log('Listener error', e); }
}

window.pushToCloud = pushToCloud;
window.pullFromCloud = pullFromCloud;
window.getAllData = getAllData;
window.applyData = applyData;
window.getCloudId = getCloudId;

document.addEventListener('DOMContentLoaded', ()=>{
  setStatus('☁️ Cloud: Ready — ' + getCloudId(), '#059669');
  startLiveListener();
});
setTimeout(()=>{ setStatus('☁️ Cloud: Ready — ' + getCloudId(), '#059669'); startLiveListener(); }, 800);
