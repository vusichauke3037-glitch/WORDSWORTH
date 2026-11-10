// cloud.js — Makhanani LTSM v1.73
// Firebase Realtime Database: makhanani-ltsm
// Path: schools/<SCHOOL_NAME>/data
// Syncs: Books, Learners, Staff, Issues, School Name, Notifications
//        + DBE Schools, Subscriptions, Subscription Requests
// No demo passwords shown in UI. Logo is in HTML header as logo.png

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

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
function safeParse(key){
  try { return JSON.parse(localStorage.getItem(key)||'[]'); } catch(e){ return []; }
}
function getAllData(){
  let login = null;
  try { login = JSON.parse(localStorage.getItem('MAKHANANI_LOGGED_IN')||'null'); } catch(e){}
  return {
    version: '1.73',
    school: getSchoolName(),
    updatedAt: new Date().toISOString(),
    updatedBy: login ? login.name + ' (' + login.role + ')' : 'System',
    books: safeParse('LTSM_BARCODES_TEXTBOOK_v158'),
    learners: safeParse('LTSM_BARCODES_LEARNER_v158'),
    staff: safeParse('MAKHANANI_STAFF'),
    issues: safeParse('MAKHANANI_ISSUES'),
    notifications: safeParse('MAKHANANI_NOTIF_LOG'),
    // v1.73 — DBE + Subscription
    dbeSchools: safeParse('MAKHANANI_DBE_SCHOOLS'),
    subscriptions: safeParse('MAKHANANI_SUBSCRIPTIONS'),
    subRequests: safeParse('MAKHANANI_SUB_REQUESTS'),
    // Logo is NOT stored in cloud — it lives as logo.png in repo
    hasLogo: true
  };
}
function applyData(d){
  if(!d) return;
  if(d.books) localStorage.setItem('LTSM_BARCODES_TEXTBOOK_v158', JSON.stringify(d.books));
  if(d.learners) localStorage.setItem('LTSM_BARCODES_LEARNER_v158', JSON.stringify(d.learners));
  if(d.staff) localStorage.setItem('MAKHANANI_STAFF', JSON.stringify(d.staff));
  if(d.issues) localStorage.setItem('MAKHANANI_ISSUES', JSON.stringify(d.issues));
  if(d.notifications) localStorage.setItem('MAKHANANI_NOTIF_LOG', JSON.stringify(d.notifications));
  // v1.73
  if(d.dbeSchools) localStorage.setItem('MAKHANANI_DBE_SCHOOLS', JSON.stringify(d.dbeSchools));
  if(d.subscriptions) localStorage.setItem('MAKHANANI_SUBSCRIPTIONS', JSON.stringify(d.subscriptions));
  if(d.subRequests) localStorage.setItem('MAKHANANI_SUB_REQUESTS', JSON.stringify(d.subRequests));
  if(d.school) localStorage.setItem('MAKHANANI_SCHOOL_NAME', d.school);
  localStorage.setItem('MAKHANANI_CLOUD_UPDATED', new Date().toISOString());
  // Update school title + cloud labels if they exist on this page
  let t = document.getElementById('schoolTitle');
  if(t && d.school) t.textContent = d.school;
  let lbl = document.getElementById('cloudIdLabel');
  if(lbl) lbl.textContent = getCloudId();
  let lbl2 = document.getElementById('cloudIdLabel2');
  if(lbl2) lbl2.textContent = getCloudId();
  let inp = document.getElementById('schoolNameInput');
  if(inp && d.school) inp.value = d.school;
  let reqSchool = document.getElementById('reqSchool');
  if(reqSchool && d.school) reqSchool.value = d.school;
}
function setStatus(msg){
  let el = document.getElementById('cloudStatus');
  if(el) el.textContent = msg;
  let lbl = document.getElementById('cloudIdLabel');
  if(lbl) lbl.textContent = getCloudId();
  let lbl2 = document.getElementById('cloudIdLabel2');
  if(lbl2) lbl2.textContent = getCloudId();
}

async function pushToCloud(){
  let data = getAllData();
  setStatus('☁️ Syncing to cloud...');
  try{
    await set(ref(db, getCloudPath()), data);
    localStorage.setItem('MAKHANANI_CLOUD_UPDATED', new Date().toISOString());
    setStatus('☁️ Cloud: Synced ✅ ' + new Date().toLocaleTimeString() + ' — ' + getCloudId());
  } catch(e){
    setStatus('☁️ Cloud Error: ' + e.message);
    alert('Cloud sync failed: ' + e.message + '\n\nCheck Firebase Console > Realtime Database > Rules — must allow read/write for testing.');
  }
}

async function pullFromCloud(){
  setStatus('⬇️ Downloading from cloud...');
  try{
    let snap = await get(ref(db, getCloudPath()));
    if(!snap.exists()){
      setStatus('☁️ Cloud: No data for ' + getCloudId());
      return alert('No cloud data for ' + getCloudId() + '\n\n1. Check school name matches Admin phone exactly\n2. Admin must click SYNC TO CLOUD first');
    }
    let d = snap.val();
    if(!confirm('Download will REPLACE local data with cloud data from ' + (d.updatedAt||'') + ' by ' + (d.updatedBy||'') + '. Continue?')) return;
    applyData(d);
    setStatus('⬇️ Downloaded ✅ ' + new Date().toLocaleTimeString());
    alert('✅ Downloaded from cloud!\nSchool: ' + d.school + '\nBooks: ' + (d.books||[]).length + ' • Learners: ' + (d.learners||[]).length + ' • Issues: ' + (d.issues||[]).length + ' • DBE Schools: ' + (d.dbeSchools||[]).length + ' • Subscriptions: ' + (d.subscriptions||[]).length + ' • Requests: ' + (d.subRequests||[]).length);
    location.reload();
  } catch(e){
    setStatus('☁️ Cloud Error: ' + e.message);
    alert('Download failed: ' + e.message);
  }
}

function startLiveListener(){
  try{
    onValue(ref(db, getCloudPath()), (snap)=>{
      if(!snap.exists()) return;
      let d = snap.val();
      let last = localStorage.getItem('MAKHANANI_CLOUD_UPDATED')||'';
      if(d.updatedAt && d.updatedAt !== last){
        setStatus('☁️ Cloud: New data from ' + (d.updatedBy||'another phone') + ' — Click DOWNLOAD');
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
  setStatus('☁️ Cloud: Ready — ' + getCloudId());
  startLiveListener();
});
setTimeout(()=>{ setStatus('☁️ Cloud: Ready — ' + getCloudId()); startLiveListener(); }, 800);
