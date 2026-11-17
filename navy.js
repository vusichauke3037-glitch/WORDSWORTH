// ============================================
// MAKHANANI LTSM 2.0 — NAV.JS V2.13 — FINAL
// Guard + Taskbar + Logout — All 13 Files
// No Demo — Real Users Only — Firebase Login V2.13
// ============================================

// ===== ALL PAGES — 13 FILES =====
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
  { page: 'login.html', label: '🔐 LOGIN', rank: 0, show: 'all' },
];

// Pages that can be opened WITHOUT login
const PUBLIC_PAGES = ['login.html', 'manuals.html'];

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
// minRank: 0 = any logged in user, 1 = Teacher+, 2 = Librarian+, 3 = HOD+, 4 = Principal+, 5 = Admin only
// pageName: for alert message, e.g. 'Users', 'Cleanup', 'Teacher'
function guardPage(minRank, pageName){
  let user = navGetUser();
  let cur = navGetCurrentPage();

  // 1. Not logged in?
  if(!user){
    // Public pages can be opened without login
    if(navIsPublicPage()){
      renderTaskbar(null);
      return;
    }
    // Not public + not logged in -> Go to login
    if(cur !== 'login.html'){
      window.location.href = 'login.html';
    }
    return;
  }

  // 2. Logged in but rank too low?
  let rank = user.rank || 0;
  if(minRank && rank < minRank){
    // If already on Home, don't loop
    if(cur !== 'index.html'){
      alert('⛔ Access denied for ' + navToCaps(user.role||'GUEST') + ' — Rank ' + rank + ' < Required Rank ' + minRank + ' — For ' + (pageName||cur) + ' — Going to Home.');
      window.location.href = 'index.html';
    }
    return;
  }

  // 3. OK — Show taskbar
  renderTaskbar(user);
}

// ===== TASKBAR — Shows on every page in <div id="taskbar"> =====
function renderTaskbar(user){
  let tb = document.getElementById('taskbar');
  if(!tb) return;

  if(!user){
    tb.innerHTML = `<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:10px;font-size:12px">
      <a href="login.html" style="color:#fff;font-weight:900">🔐 LOGIN</a>
      <a href="manuals.html" style="color:#d4af37;font-weight:900">📖 MANUALS</a>
      <a href="index.html" style="color:#fff;font-weight:900">🏠 HOME</a>
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

  // Build links — Admin sees Users + Cleanup, others do not
  let links = NAV_PAGES.filter(p=>{
    if(p.show==='admin' && !(role==='ADMIN' && rank>=5)) return false;
    if(p.page==='login.html') return false; // Logout handled separately
    return true;
  }).map(p=>{
    let isCur = (navGetCurrentPage() === p.page);
    let style = isCur
      ? 'background:#d4af37;color:#0a1f4d;padding:6px 10px;border-radius:20px;font-weight:900;text-decoration:none'
      : 'color:#fff;font-weight:900;text-decoration:none;padding:6px 10px';
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
    }
  } else if(role==='LIBRARIAN'){
    classInfo = `<span style="background:#0d9488;color:#fff;padding:6px 10px;border-radius:20px;font-weight:900">📚 ALL CLASSES 4A-12J — ALL SUBJECTS</span>`;
  } else if(role==='PRINCIPAL'){
    classInfo = `<span style="background:#d4af37;color:#0a1f4d;padding:6px 10px;border-radius:20px;font-weight:900">👑 ALL — GRADES 4-12 — CLASSES 4A-12J</span>`;
  } else if(role==='ADMIN'){
    classInfo = `<span style="background:#dc2626;color:#fff;padding:6px 10px;border-radius:20px;font-weight:900">⚙️ ADMIN — ALL — CAN DO EVERYTHING</span>`;
  }

  tb.innerHTML = `<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:10px;font-size:12px;align-items:center">
    <span style="background:#d4af37;color:#0a1f4d;padding:6px 10px;border-radius:20px;font-weight:900">👤 ${navToCaps(user.name||'GUEST')} — ${role} — RANK ${rank}</span>
    <span style="background:#fff;color:#0a1f4d;padding:6px 10px;border-radius:20px;font-weight:900">🏫 ${navToCaps(schoolName)} (${navToCaps(schoolId)}) — Prefix ${prefix}</span>
    ${classInfo}
    ${links}
    <a href="#" onclick="navLogout();return false;" style="color:#fca5a5;font-weight:900;text-decoration:none;padding:6px 10px">🚪 LOGOUT</a>
  </div>`;
}

// ===== GO — Helper for buttons: go('teacher.html') =====
function go(page){ window.location.href = page; }

// ===== CHECK — Is user Admin? — Use in any page =====
function isAdminUser(){
  let u = navGetUser();
  return u && navToCaps(u.role)==='ADMIN' && (u.rank||0)>=5;
}

// ===== CHECK — Is user Teacher with class? — Use in teacher.html / bulk_upload.html =====
function teacherHasClass(className){
  let u = navGetUser();
  if(!u) return false;
  if(navToCaps(u.role)==='ADMIN' || navToCaps(u.role)==='LIBRARIAN' || navToCaps(u.role)==='PRINCIPAL') return true;
  let classes = (u.teachingClasses||u.classes||u.myClasses||[]).map(c=>navToCaps(c));
  return classes.indexOf(navToCaps(className)) !== -1;
}

function teacherHasSubject(subject){
  let u = navGetUser();
  if(!u) return false;
  if(navToCaps(u.role)==='ADMIN' || navToCaps(u.role)==='LIBRARIAN' || navToCaps(u.role)==='PRINCIPAL') return true;
  let subs = (u.subjects||u.teachingSubjects||[]).map(s=>navToCaps(s));
  return subs.indexOf(navToCaps(subject)) !== -1;
}
