// Makhanani LTSM — cloud.js v1.87 — Shared Firebase Helper for ALL pages
// Pages: index.html, learner-barcode.html, textbook-barcode.html, issue.html, librarian.html, admin.html, principal.html
// Requires: Firebase v10.12.2 via CDN (imported here)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ===== 1. YOUR FIREBASE CONFIG — REPLACE WITH YOUR REAL ONE =====
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPcF5zaCD6Mp9TfpiMPoc3xG0qSPwO7oA",
  authDomain: "makhanani-ltsm.firebaseapp.com",
  databaseURL: "https://makhanani-ltsm-default-rtdb.firebaseio.com",
  projectId: "makhanani-ltsm",
  storageBucket: "makhanani-ltsm.firebasestorage.app",
  messagingSenderId: "247180363183",
  appId: "1:247180363183:web:4e5a399d4e306192e01b5a",
  measurementId: "G-PEST1XFCR8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// ===== END CONFIG =====

let app, db, auth;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (e) {
  console.error("Firebase init failed — check firebaseConfig in cloud.js", e);
}

window.MAKHANANI = { app, db, auth, version: "v1.87" };

// ===== Helpers =====
function getSelectedEmis() {
  return localStorage.getItem('MAKHANANI_SELECTED_EMIS') || localStorage.getItem('MAKHANANI_SCHOOL_EMIS') || '';
}
function getSelectedSchool() {
  return localStorage.getItem('MAKHANANI_SELECTED_SCHOOL') || localStorage.getItem('MAKHANANI_SCHOOL_NAME') || '';
}
function getLoggedIn() {
  try { return JSON.parse(localStorage.getItem('MAKHANANI_LOGGED_IN') || 'null'); } catch (e) { return null; }
}
function schoolDocPath(emis) { return 'EMIS_' + emis; }

function updateCloudStatus(msg, ok = true) {
  const el = document.getElementById('cloudStatus');
  if (el) {
    el.textContent = msg;
    el.style.background = ok ? '#059669' : '#dc2626';
  }
  const label = document.getElementById('cloudIdLabel');
  if (label) {
    const emis = getSelectedEmis();
    label.textContent = emis ? 'schools/EMIS_' + emis : 'schools/...';
  }
}

// ===== Auth =====
async function firebaseLogin(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  return cred.user;
}
async function firebaseLogout() {
  try { await signOut(auth); } catch (e) {}
}
async function firebaseResetPassword(email) {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
}
window.firebaseLogin = firebaseLogin;
window.firebaseLogout = firebaseLogout;
window.firebaseResetPassword = firebaseResetPassword;

// Keep auth in sync — if Firebase signs out, clear local login
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Don't auto-clear on page load if we have a stored login — pages check Firestore staff doc
    // Only update status
    updateCloudStatus('☁️ Cloud: Connected to Firebase — ' + (getSelectedSchool() || 'Select School'));
  } else {
    updateCloudStatus('☁️ Cloud: Connected as ' + user.email);
  }
});

// ===== Audit Log =====
// Writes to schools/EMIS_xxx/logs — Rules: Create only, no Update/Delete
async function logAction(action, detail) {
  const emis = getSelectedEmis();
  if (!emis || !db) return;
  const login = getLoggedIn();
  try {
    await addDoc(collection(db, 'schools', schoolDocPath(emis), 'logs'), {
      action: String(action || ''),
      detail: String(detail || ''),
      whoName: login ? (login.name || '') : '',
      whoEmail: login ? (login.email || '') : '',
      whoRole: login ? (login.role || '') : '',
      whoUid: login ? (login.uid || '') : '',
      school: getSelectedSchool(),
      emis: emis,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn('logAction failed', e);
  }
}
window.logAction = logAction;

// ===== Learners =====
// Barcode = LRN-GRADE-NUMBER, doc ID = barcode
async function cloudAddLearner(emis, data) {
  if (!emis) throw new Error('No EMIS selected');
  if (!data.barcode) throw new Error('Learner barcode required');
  const ref = doc(db, 'schools', schoolDocPath(emis), 'learners', String(data.barcode));
  const snap = await getDoc(ref);
  if (snap.exists()) throw new Error('Duplicate Learner Barcode: ' + data.barcode);
  await setDoc(ref, {
    barcode: data.barcode,
    name: data.name || '',
    grade: data.grade || '',
    className: data.className || data.class || '',
    class: data.className || data.class || '',
    gender: data.gender || '',
    phone: data.phone || '',
    status: data.status || 'ACTIVE',
    addedBy: data.addedBy || '',
    addedByName: data.addedByName || '',
    createdAt: serverTimestamp()
  });
  await logAction('LEARNER_ADD', data.barcode + ' — ' + data.name + ' • ' + data.grade + ' • Class ' + (data.className || data.class || ''));
  return data.barcode;
}
window.cloudAddLearner = cloudAddLearner;

// ===== Books =====
// Barcode = BK-SUBJECT-GRADE-NUMBER, doc ID = barcode
async function cloudAddBook(emis, data) {
  if (!emis) throw new Error('No EMIS selected');
  if (!data.barcode) throw new Error('Book barcode required');
  const ref = doc(db, 'schools', schoolDocPath(emis), 'books', String(data.barcode));
  const snap = await getDoc(ref);
  if (snap.exists()) throw new Error('Duplicate Book Barcode: ' + data.barcode);
  await setDoc(ref, {
    barcode: data.barcode,
    title: data.title || '',
    subjectCode: data.subjectCode || '',
    subject: data.subject || '',
    grade: data.grade || '',
    publisher: data.publisher || '',
    condition: data.condition || 'Good',
    status: data.status || 'AVAILABLE',
    addedBy: data.addedBy || '',
    addedByName: data.addedByName || '',
    createdAt: serverTimestamp()
  });
  await logAction('BOOK_ADD', data.barcode + ' — ' + data.title + ' • ' + (data.subject || data.subjectCode) + ' • ' + data.grade);
  return data.barcode;
}
window.cloudAddBook = cloudAddBook;

// ===== Issue / Return =====
// Issue doc ID = auto, book status -> OUT, learner 1 Subject check is done in issue.html/librarian.html BEFORE calling this
async function cloudIssueBook(emis, data) {
  if (!emis) throw new Error('No EMIS selected');
  if (!data.learnerBarcode || !data.bookBarcode) throw new Error('Learner + Book barcode required');
  // 1. Create issue record
  const issueRef = await addDoc(collection(db, 'schools', schoolDocPath(emis), 'issues'), {
    learnerBarcode: data.learnerBarcode,
    learnerName: data.learnerName || '',
    learnerGrade: data.learnerGrade || '',
    learnerClass: data.learnerClass || '',
    bookBarcode: data.bookBarcode,
    bookTitle: data.bookTitle || '',
    subjectCode: data.subjectCode || '',
    bookGrade: data.bookGrade || '',
    issueDate: data.issueDate || new Date().toISOString().split('T')[0],
    dueDate: data.dueDate || '',
    status: 'OUT',
    issuedBy: data.issuedBy || '',
    issuedByName: data.issuedByName || '',
    createdAt: serverTimestamp()
  });
  // 2. Mark book OUT
  try {
    await updateDoc(doc(db, 'schools', schoolDocPath(emis), 'books', String(data.bookBarcode)), { status: 'OUT' });
  } catch (e) { console.warn('Could not mark book OUT', e); }
  await logAction('ISSUE', data.bookBarcode + ' — ' + data.bookTitle + ' → ' + data.learnerBarcode + ' — ' + data.learnerName + ' • Due ' + data.dueDate);
  return issueRef.id;
}
window.cloudIssueBook = cloudIssueBook;

async function cloudReturnBook(emis, issueId, returnData) {
  if (!emis) throw new Error('No EMIS selected');
  if (!issueId) throw new Error('Issue ID required');
  const issueRef = doc(db, 'schools', schoolDocPath(emis), 'issues', issueId);
  const snap = await getDoc(issueRef);
  if (!snap.exists()) throw new Error('Issue record not found');
  const issue = snap.data();
  const cond = (returnData.returnCondition || 'Good');
  // 1. Update issue to RETURNED
  await updateDoc(issueRef, {
    status: 'RETURNED',
    returnDate: returnData.returnDate || new Date().toISOString().split('T')[0],
    returnCondition: cond,
    returnedBy: returnData.returnedBy || '',
    returnedByName: returnData.returnedByName || '',
    updatedAt: serverTimestamp()
  });
  // 2. Update book status based on condition
  // Good/Fair -> AVAILABLE, Damaged -> DAMAGED, Lost -> LOST
  let bookStatus = 'AVAILABLE';
  let bookCondition = cond;
  if (cond === 'Damaged') bookStatus = 'DAMAGED';
  if (cond === 'Lost') bookStatus = 'LOST';
  try {
    await updateDoc(doc(db, 'schools', schoolDocPath(emis), 'books', String(issue.bookBarcode)), { status: bookStatus, condition: bookCondition });
  } catch (e) { console.warn('Could not update book on return', e); }
  await logAction('RETURN', issue.bookBarcode + ' — ' + issue.bookTitle + ' ← ' + issue.learnerBarcode + ' — ' + issue.learnerName + ' • Condition: ' + cond);
  return issueId;
}
window.cloudReturnBook = cloudReturnBook;

// ===== Sync Status (used by SYNC STATUS button on all pages) =====
async function pushToCloud() {
  const emis = getSelectedEmis();
  const school = getSelectedSchool();
  if (!emis) { alert('⚠️ Select school first (by EMIS)'); return; }
  updateCloudStatus('☁️ Cloud: Checking Firestore...');
  try {
    const snap = await getDoc(doc(db, 'schools', schoolDocPath(emis)));
    const sub = snap.exists() ? snap.data().subscription : null;
    let msg = '✅ Cloud OK\n\nSchool: ' + school + '\nEMIS: ' + emis + '\nPath: schools/EMIS_' + emis + '\n';
    if (sub) msg += 'Subscription: ' + (sub.plan || '-') + ' / ' + (sub.status || '-') + ' • End: ' + (sub.end || '-') + '\n';
    else msg += 'Subscription: NONE\n';
    msg += '\nLive listeners: ON\nVersion: v1.87';
    updateCloudStatus('☁️ Cloud: Connected — ' + school + ' (EMIS ' + emis + ')');
    alert(msg);
    await logAction('SYNC_CHECK', 'Checked cloud sync for EMIS ' + emis);
  } catch (e) {
    updateCloudStatus('☁️ Cloud: Error — ' + e.message, false);
    alert('❌ Cloud check failed: ' + e.message + '\n\nCheck: 1) Internet 2) Firebase config in cloud.js 3) Firestore Rules');
  }
}
window.pushToCloud = pushToCloud;

// Init status on load
document.addEventListener('DOMContentLoaded', () => {
  const emis = getSelectedEmis();
  const school = getSelectedSchool();
  if (school) updateCloudStatus('☁️ Cloud: Connected — ' + school + (emis ? ' (EMIS ' + emis + ')' : ''));
  else updateCloudStatus('☁️ Cloud: Connected to Firebase — Select School');
});
