// nav.js - Makhanani LTSM - WORDSWORTH - Taskbar + Role Guard - ALL CAPS
// Levels: 0 = Anyone / Not logged in, 1 = Librarian+, 2 = Teacher+, 3 = Principal only
// Roles: Principal = 3, Teacher = 2, Librarian = 1, Super Admin = 4

function toCapsNav(s){ return String(s||'').trim().toUpperCase(); }

function getCurrentUser(){
  try{ return JSON.parse(localStorage.getItem('makhanani_user')||'null'); }catch(e){ return null; }
}

function getUserLevel(role){
  role = toCapsNav(role);
  if(role==='SUPER ADMIN' || role==='SUPERADMIN' || role==='ADMIN') return 4;
  if(role==='PRINCIPAL') return 3;
  if(role==='TEACHER') return 2;
  if(role==='LIBRARIAN') return 1;
  return 0;
}

function getSchoolInfo(){
  let u = getCurrentUser();
  return {
    schoolId: (u && u.schoolId) || 'WHS',
    prefix: (u && u.prefix) || 'WHS',
    schoolName: (u && u.schoolName) || 'WORDSWORTH HIGH SCHOOL (WHS)',
    name: (u && u.name) || '',
    role: (u && u.role) || '',
    email: (u && u.email) || '',
    subject: (u && u.subject) || '',
    teachingClasses: (u && u.teachingClasses) || null,
    teachingGrades: (u && u.teachingGrades) || null
  };
}

// Build top taskbar - shows on every page that has <div id="taskbar"></div>
function buildTaskbar(){
  let bar = document.getElementById('taskbar');
  if(!bar) return;
  let u = getCurrentUser();
  let info = getSchoolInfo();

  // Not logged in - show Login only
  if(!u){
    bar.innerHTML = `
    <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:10px">
      <button onclick="location.href='index.html'" style="background:#d4af37;color:#0a1f4d;border:none;border-radius:8px;padding:10px 14px;font-weight:900;cursor:pointer;font-size:13px">🔐 LOGIN</button>
      <button onclick="location.href='home.html'" style="background:#fff;color:#0a1f4d;border:none;border-radius:8px;padding:10px 14px;font-weight:900;cursor:pointer;font-size:13px">🏠 HOME</button>
    </div>
    <div style="margin-top:8px;font-size:11px;color:#d4af37;font-weight:700">WORDSWORTH HIGH SCHOOL (WHS) • EMIS 700310854 • PREFIX WHS • GRADES 8-12</div>`;
    return;
  }

  let role = toCapsNav(u.role);
  let level = getUserLevel(role);
  let name = toCapsNav(u.name);

  // Teacher extra info - classes
  let teacherLine = '';
  if(role==='TEACHER' && u.teachingClasses){
    teacherLine = `<div style="margin-top:6px;font-size:11px;color:#fff;font-weight:700">👩‍🏫 YOU TEACH: ${u.teachingClasses.join(' • ')} ${u.subject ? ' • SUBJECT: '+toCapsNav(u.subject) : ''}</div>`;
  }
  if(role==='LIBRARIAN' || role==='PRINCIPAL'){
    teacherLine = `<div style="margin-top:6px;font-size:11px;color:#fff;font-weight:700">✅ ALL CLASSES — WHOLE SCHOOL — ALL GRADES 8-12 — ALL SUBJECTS</div>`;
  }

  // Buttons by role - Librarian / Teacher / Principal
  let buttons = '';
  // Everyone logged in sees these
  buttons += `<button onclick="location.href='home.html'" style="background:#fff;color:#0a1f4d;border:none;border-radius:8px;padding:10px 12px;font-weight:900;cursor:pointer;font-size:13px">🏠 HOME</button>`;
  buttons += `<button onclick="location.href='learners.html'" style="background:#fff;color:#0a1f4d;border:none;border-radius:8px;padding:10px 12px;font-weight:900;cursor:pointer;font-size:13px">👩‍🎓 LEARNERS</button>`;
  buttons += `<button onclick="location.href='books.html'" style="background:#fff;color:#0a1f4d;border:none;border-radius:8px;padding:10px 12px;font-weight:900;cursor:pointer;font-size:13px">📚 TEXTBOOKS</button>`;

  // Teacher only
  if(level >= 2){
    buttons += `<button onclick="location.href='teacher.html'" style="background:#d4af37;color:#0a1f4d;border:none;border-radius:8px;padding:10px 12px;font-weight:900;cursor:pointer;font-size:13px">👩‍🏫 TEACHER</button>`;
  }
  // Librarian only (Librarian + Principal see Librarian)
  if(level === 1 || level >= 3){
    buttons += `<button onclick="location.href='librarian.html'" style="background:#d4af37;color:#0a1f4d;border:none;border-radius:8px;padding:10px 12px;font-weight:900;cursor:pointer;font-size:13px">📚 LIBRARIAN</button>`;
  }
  // Principal only
  if(level >= 3){
    buttons += `<button onclick="location.href='principal.html'" style="background:#d4af37;color:#0a1f4d;border:none;border-radius:8px;padding:10px 12px;font-weight:900;cursor:pointer;font-size:13px">🏫 PRINCIPAL</button>`;
  }

  buttons += `<button onclick="doLogoutNav()" style="background:#ef4444;color:#fff;border:none;border-radius:8px;padding:10px 12px;font-weight:900;cursor:pointer;font-size:13px">🚪 LOGOUT</button>`;

  bar.innerHTML = `
  <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:10px">${buttons}</div>
  <div style="margin-top:8px;font-size:12px;color:#fff;font-weight:900">👤 ${name} • ${role} • ${info.schoolName} • PREFIX ${info.prefix}</div>
  ${teacherLine}`;
}

function doLogoutNav(){
  if(confirm('Logout?')){
    localStorage.removeItem('makhanani_user');
    location.href = 'index.html';
  }
}

// Guard - call at top of each page: guardPage(LEVEL, 'Page Name')
// guardPage(1,'Textbooks') = Librarian+ can enter, Teacher+ can enter, Principal can enter
// guardPage(2,'Teacher Dashboard') = Teacher+ only - Librarian BLOCKED
// guardPage(3,'Principal Dashboard') = Principal only - Teacher + Librarian BLOCKED
function guardPage(requiredLevel, pageName){
  // Build taskbar first so user
