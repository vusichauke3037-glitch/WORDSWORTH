// cloud.js — v1.86 Firebase + Firestore + Auth — Makhanani LTSM
// Project: makhanani-ltsm
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where, orderBy, limit, addDoc, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration — makhanani-ltsm
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
try { analytics = getAnalytics(app); } catch(e){ console.warn('Analytics not available', e); }
export const auth = getAuth(app);
export const db = getFirestore(app);

window.MAKHANANI = window.MAKHANANI || {};
window.MAKHANANI.db = db;
window.MAKHANANI.auth = auth;
window.MAKHANANI.app = app;

// --- Current School (EMIS is the key) ---
window.getCurrentEmis = () => localStorage.getItem('MAKHANANI_SELECTED_EMIS') || '';
window.getCurrentSchool = () => localStorage.getItem('MAKHANANI_SELECTED_SCHOOL') || '';
window.schoolRef = (emis) => doc(db, 'schools', 'EMIS_' + emis);
window.booksCol = (emis) => collection(db, 'schools', 'EMIS_' + emis, 'books');
window.learnersCol = (emis) => collection(db, 'schools', 'EMIS_' + emis, 'learners');
window.issuesCol = (emis) => collection(db, 'schools', 'EMIS_' + emis, 'issues');
window.staffCol = (emis) => collection(db, 'schools', 'EMIS_' + emis, 'staff');
window.logsCol = (emis) => collection(db, 'schools', 'EMIS_' + emis, 'logs');

// --- Audit Log (Cannot be edited) ---
window.logAction = async (action, detail) => {
  let emis = window.getCurrentEmis();
  let user = auth.currentUser;
  if(!emis || !user) return;
  try {
    await addDoc(window.logsCol(emis), {
      who: user.uid, whoName: user.displayName || user.email,
      action, detail, emis, createdAt: serverTimestamp()
    });
  } catch(e){ console.warn('Log failed', e); }
};

// --- Auth ---
window.firebaseLogin = async (email, password) => {
  let cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};
window.firebaseRegisterStaff = async (email, password, staffData) => {
  let emis = window.getCurrentEmis();
  if(!emis) throw new Error('Select school first');
  let cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'schools', 'EMIS_' + emis, 'staff', cred.user.uid), {
    ...staffData, email, emis, createdAt: serverTimestamp()
  });
  await window.logAction('STAFF_ADD', 'Added ' + staffData.name + ' (' + staffData.role + ')');
  return cred.user;
};
window.firebaseLogout = async () => { await signOut(auth); };
window.firebaseResetPassword = async (email) => { await sendPasswordResetEmail(auth, email); };

// --- Cloud Status — Firestore is LIVE, no bulk push needed ---
window.pushToCloud = async () => {
  let el = document.getElementById('cloudStatus');
  if(el) el.textContent = '☁️ Cloud: Live — Firestore • ' + (auth.currentUser ? auth.currentUser.email : 'Not logged in');
  return true;
};
window.pullFromCloud = async () => {
  if(typeof renderAll === 'function') renderAll();
};

// --- Live Listeners ---
window.listenBooks = (emis, cb) => {
  return onSnapshot(query(window.booksCol(emis), orderBy('barcode')), (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (err)=>{ console.error('listenBooks', err); });
};
window.listenLearners = (emis, cb) => {
  return onSnapshot(query(window.learnersCol(emis), orderBy('barcode')), (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (err)=>{ console.error('listenLearners', err); });
};
window.listenIssues = (emis, cb) => {
  return onSnapshot(query(window.issuesCol(emis), orderBy('createdAt', 'desc'), limit(100)), (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (err)=>{ console.error('listenIssues', err); });
};

// --- CRUD Helpers (Always enforce EMIS) ---
window.cloudAddBook = async (emis, book) => {
  await setDoc(doc(db, 'schools', 'EMIS_' + emis, 'books', String(book.barcode)), { ...book, emis, createdAt: serverTimestamp() });
  await window.logAction('BOOK_ADD', book.barcode + ' — ' + book.title);
};
window.cloudAddLearner = async (emis, learner) => {
  await setDoc(doc(db, 'schools', 'EMIS_' + emis, 'learners', String(learner.barcode)), { ...learner, emis, createdAt: serverTimestamp() });
  await window.logAction('LEARNER_ADD', learner.barcode + ' — ' + learner.name);
};
window.cloudIssueBook = async (emis, issue) => {
  let ref = await addDoc(window.issuesCol(emis), { ...issue, emis, createdAt: serverTimestamp() });
  await window.logAction('ISSUE', issue.bookBarcode + ' to ' + issue.learnerName);
  return ref.id;
};
window.cloudReturnBook = async (emis, issueId, returnData) => {
  await updateDoc(doc(db, 'schools', 'EMIS_' + emis, 'issues', issueId), { ...returnData, status: 'RETURNED', returnedAt: serverTimestamp() });
  await window.logAction('RETURN', returnData.bookBarcode + ' from ' + returnData.learnerName + ' — Cond: ' + (returnData.returnCondition || ''));
};

// Auth state → update UI
onAuthStateChanged(auth, (user) => {
  let el = document.getElementById('cloudStatus');
  if(el) el.textContent = user ? '☁️ Cloud: Live — ' + user.email : '☁️ Cloud: Not logged in';
  window.MAKHANANI.currentUser = user;
  // If page has updateLoginUI, let it know auth changed — don't auto-logout on refresh
  if(user && typeof updateLoginUI === 'function'){
    // Keep existing local login if present, don't overwrite
  }
});
