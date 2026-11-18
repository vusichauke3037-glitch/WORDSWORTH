// ============================================
// MAKHANANI LTSM 2.0 — NAV.JS V2.15 — FINAL
// Guard + Navy Taskbar + Back + Logout — All 14 Files
// Super Admin Rank 6 — Manuals NOT Public — Back Button
// No Demo — Real Users Only — Firebase Login V2.13
// ============================================

// ===== ALL PAGES — 14 FILES =====
const NAV_PAGES = [
  { page: 'index.html', label: '🏠 HOME', rank: 0, show: 'all' },
  { page: 'teacher.html', label: '👩‍🏫 TEACHER', rank: 1, show: 'all' },
  { page: 'librarian.html', label: '📚 LIBRARIAN', rank: 1, show: 'all' },
  { page: 'hod.html', label: '✅ HOD', rank: 1, show: 'all' },
  { page: 'principal.html', label: '👑 PRINCIPAL', rank: 1, show: 'all' },
  { page: 'users.html', label: '👥 USERS', rank: 5, show: 'admin' },
  { page: 'stock.html', label: '📦 STOCK', rank: 1, show: 'all' },
  { page: 'barcode.html', label: '🖨️ BARCODE', rank: 0, show: 'all' },
  { page: 'manuals.html', label: '📖 MANUALS', rank: 0, show: 'all' },
  { page: 'bulk_upload.html', label: '📥 BULK LEARNERS', rank: 1, show: 'all' },
  { page: 'bulk_book_upload.html', label: '📥 BULK BOOKS', rank: 1, show: 'all' },
  { page: 'cleanup.html', label: '🧹 CLEANUP', rank: 5, show: 'admin' },
  { page: 'superadmin.html', label: '👑 SUPER ADMIN', rank: 6, show: 'superadmin' },
  { page: 'login.html', label: '🔐 LOGIN', rank: 0, show: 'all' },
];

// Pages that can be opened WITHOUT login
// MANUALS IS NOT PUBLIC — V1.3 — Must login to read manuals — Rank decides which sections you see
const PUBLIC_PAGES = ['login.html'];

// ===== HELPERS =====
function navToCaps(s){ return String(s||'').trim().toUpperCase(); }

function navGetUser(){
  try{ return JSON.parse(localStorage.getItem('makhanani_user')||'null'); }catch(e){ return null; }
}

function navGetCurrentPage(){
  let p = window.location.pathname || '';
  let parts = p.split('/');
  return parts[parts.length-1] || 'index.html';
}

function navIsPublicPage(){
  let cur = navGetCurrentPage();
  return PUBLIC_PAGES.indexOf(cur) !== -1;
}

function navSchoolPrefix(schoolName){
  let words = navToCaps(schoolName||'WORDSWORTH HIGH SCHOOL').split(/\s+/).filter(w=>/[A-Z]/.test(w));
  if(words.length===1) return words[0].replace(/[^A-Z]/g,'').slice(0,3).padEnd(3,'X');
  return words.map(w=>w.replace(/[^A-Z]/g,'')[0]).join('').slice(0,4);
}

// ===== BACK — 1 Tap Back — If no history, go Home =====
// Manuals override: if in a section (#sec-2), Back goes to TOC top first
function navBack(){
  let hash = window.location.hash || '';
  if(hash && hash.startsWith('#sec-')){
    window.location.hash = '';
    window.scrollTo({top:0, behavior:'smooth'});
    return;
  }
  if(window.history.length > 1){
    window.history.back();
  } else {
    window.location.href = 'index.html';
  }
}
// For pages that call back() / goBack() directly
function goBack(){ navBack(); }
function back(){ navBack(); }

// ===== LOGOUT — Clears session + Firebase Auth =====
async function navLogout(){
  try{
    if(typeof firebase !== 'undefined' && firebase.auth){
      await firebase.auth().signOut();
    }
  }catch(e){}
  localStorage.removeItem('makhanani_user');
  localStorage.removeItem('makhanani_uid');
  localStorage.removeItem('makhanani_email');
  window.location.href = 'login.html';
}

// For pages that call logout() directly
function logout(){ navLogout(); }

// ===== GUARD — Call at top of every page: guardPage(minRank, pageName) =====
// minRank: 0 = any logged in user, 1 = Teacher+, 5 = Admin only, 6 = Super Admin only
function guardPage(minRank, pageName){
  let user = navGetUser();
  let cur = navGetCurrentPage();

  // 1. Not logged in?
  if(!user){
    if(navIsPublicPage()){
      renderTaskbar(null);
      return;
    }
    if(cur !== 'login.html'){
      window.location.href = 'login.html';
    }
    return;
  }

  // 2. Logged in but rank too low?
  let rank = user.rank || 0;
  if(minRank && rank < minRank){
    if(cur !== 'index.html'){
      alert('⛔ Access denied for ' + navToCaps(user.role||'GUEST') + ' — Rank ' + rank + ' < Required Rank ' + minRank + ' — For ' + (pageName||cur) + ' — Going to Home.');
      window.location.href = 'index.html';
    }
    return;
  }

  // 3. OK — Show navy taskbar
  renderTaskbar(user);
}

// ===== NAVY TASKBAR — Shows on every page in <div id="taskbar"> =====
function renderTaskbar(user){
  let tb = document.getElementById('taskbar');
  if(!tb) return;

  // Navy taskbar style
  tb.style.cssText = 'background:#0a1f4d;border:2px solid #d4af37;border-radius:10px;padding:10px;margin-top:10px';

  if(!user){
    tb.innerHTML = `<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;font-size:12px;align-items:center">
      <a href="#" onclick="navBack();return false;" style="background:#d4af37;color:#0a1f4d;padding:6px 12px;border-radius:20px;font-weight:900;text-decoration:none">⬅️ BACK</a>
      <span style="background:#d4af37;color:#0a1f4d;padding:6px 12px;border-radius:20px;font-weight:900">🔒 NOT LOGGED IN — LOGIN TO USE MAKHANANI</span>
      <a href="login.html" style="color:#fff;font-weight:900;text-decoration:none;padding:6px 10px;background:#2563eb;border-radius:20px">🔐 LOGIN →</a>
    </div>`;
    return;
  }

  let role = navToCaps(user.role||'GUEST');
  let rank = user.rank || 0;
  let schoolName = user.schoolName || 'WORDSWORTH HIGH SCHOOL';
  let schoolId = user.schoolId || 'WHS';
  let prefix = navSchoolPrefix(schoolName);
  let myClasses = (user.teachingClasses||user.classes||user.myClasses||[]).map(c=>navToCaps(c)).filter(Boolean);
  let mySubjects = (user.subjects||user.teachingSubjects||[]).map(s=>navToCaps(s)).filter(Boolean);
  let isSuperAdmin = (role==='SUPER_ADMIN' && rank>=6);
  let isAdmin = (role==='ADMIN' && rank>=5);

  // Build links — Admin sees Users + Cleanup, Super Admin sees Super Admin, others do not
  let links = NAV_PAGES.filter(p=>{
    if(p.show==='admin' && !isAdmin && !isSuperAdmin) return false;
    if(p.show==='superadmin' && !isSuperAdmin) return false;
    if(p.page==='login.html') return false;
    return true;
  }).map(p=>{
    let isCur = (navGetCurrentPage() === p.page);
    let style = isCur
      ? 'background:#d4af37;color:#0a1f4d;padding:6px 10px;border-radius:20px;font-weight:900;text-decoration:none'
      : 'color:#fff;font-weight:900;text-decoration:none;padding:6px 10px;background:rgba(255,255,255,.08);border-radius:20px';
    return `<a href="${p.page}" style="${style}">${p.label}</a>`;
  }).join('');

  let classInfo = '';
  if(role==='TEACHER'){
    if(myClasses.length){
      classInfo = `<span style="background:#0d9488;color:#fff;padding:6px 10px;border-radius:20px;font-weight:900">🏫 ${myClasses.join(', ')}</span>`;
    } else {
      classInfo = `<span style="background:#ef4444;color:#fff;padding:6px 10px;border-radius:20px;font-weight:900">⛔ NO CLASSES — ASK ADMIN</span>`;
    }
    if(mySubjects.length){
      classInfo += `<span style="background:#7c3aed;color:#fff;padding:6px 10px;border-radius:20px;font-weight:900">📖 ${mySubjects.join(', ')}</span>`;
    } else {
      classInfo += `<span style="background:#ef4444;color:#fff;padding:6px 10px;border-radius:20px;font-weight:900">⛔ NO SUBJECTS — ASK ADMIN</span>`;
    }
  } else if(role==='HOD'){
    if(mySubjects.length){
      classInfo = `<span style="background:#7c3aed;color:#fff;padding:6px 10px;border-radius:20px;font-weight:900">📖 HOD: ${mySubjects.join(', ')}</span>`;
    } else {
      classInfo = `<span style="background:#ef4444;color:#fff;padding:6px 10px;border-radius:20px;font-weight:900">⛔ NO SUBJECTS — ASK ADMIN</span>`;
    }
  } else if(role==='LIBRARIAN'){
    classInfo = `<span style="background:#0d9488;color:#fff;padding:6px 10px;border-radius:20px;font-weight:900">📚 ALL CLASSES 4A-12J — ALL SUBJECTS</span>`;
  } else if(role==='PRINCIPAL'){
    classInfo = `<span style="background:#d4af37;color:#0a1f4d;padding:6px 10px;border-radius:20px;font-weight:900">👑 ALL — GRADES 4-12 — CLASSES 4A-12J</span>`;
  } else if(role==='ADMIN'){
    classInfo = `<span style="background:#dc2626;color:#fff;padding:6px 10px;border-radius:20px;font-weight:900">⚙️ ADMIN — ALL — EXCEPT SUPER ADMIN</span>`;
  } else if(isSuperAdmin){
    classInfo = `<span style="background:#7c3aed;color:#fff;padding:6px 10px;border-radius:20px;font-weight:900">👑 SUPER ADMIN — ALL + FOUNDER / MARKETING / FINANCIAL / EMPLOYMENT</span>`;
  }

  tb.innerHTML = `<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;font-size:12px;align-items:center">
    <a href="#" onclick="navBack();return false;" style="background:#d4af37;color:#0a1f4d;padding:6px 12px;border-radius:20px;font-weight:900;text-decoration:none">⬅️ BACK</a>
    <span style="background:#d4af37;color:#0a1f4d;padding:6px 10px;border-radius:20px;font-weight:900">👤 ${navToCaps(user.name||'GUEST')} — ${role} — RANK ${rank}</span>
    <span style="background:#fff;color:#0a1f4d;padding:6px 10px;border-radius:20px;font-weight:900">🏫 ${navToCaps(schoolName)} (${navToCaps(schoolId)}) — Prefix ${prefix}</span>
    ${classInfo}
    ${links}
    <a href="#" onclick="navLogout();return false;" style="color:#fca5a5;font-weight:900;text-decoration:none;padding:6px 10px;background:#7f1d1d;border-radius:20px">🚪 LOGOUT</a>
  </div>`;
}

// ===== GO — Helper for buttons: go('teacher.html') =====
function go(page){ window.location.href = page; }

// ===== CHECK — Is user Admin? =====
function isAdminUser(){
  let u = navGetUser();
  return u && navToCaps(u.role)==='ADMIN' && (u.rank||0)>=5;
}

// ===== CHECK — Is user Super Admin? =====
function isSuperAdminUser(){
  let u = navGetUser();
  return u && navToCaps(u.role)==='SUPER_ADMIN' && (u.rank||0)>=6;
}

// ===== CHECK — Is user Teacher with class? =====
function teacherHasClass(className){
  let u = navGetUser();
  if(!u) return false;
  if(navToCaps(u.role)==='ADMIN' || navToCaps(u.role)==='SUPER_ADMIN' || navToCaps(u.role)==='LIBRARIAN' || navToCaps(u.role)==='PRINCIPAL') return true;
  let classes = (u.teachingClasses||u.classes||u.myClasses||[]).map(c=>navToCaps(c));
  return classes.indexOf(navToCaps(className)) !== -1;
}

function teacherHasSubject(subject){
  let u = navGetUser();
  if(!u) return false;
  if(navToCaps(u.role)==='ADMIN' || navToCaps(u.role)==='SUPER_ADMIN' || navToCaps(u.role)==='LIBRARIAN' || navToCaps(u.role)==='PRINCIPAL') return true;
  let subs = (u.subjects||u.teachingSubjects||[]).map(s=>navToCaps(s));
  return subs.indexOf(navToCaps(subject)) !== -1;
}
