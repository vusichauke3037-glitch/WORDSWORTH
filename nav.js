// ============================================================
// nav.js — V2.16 — Makhanani LTSM 2.0
// Taskbar + Guard + Back + Home + Subscriptions + Logout
// WhatsApp: 078 023 3263
// ============================================================

// ===== GET USER FROM LOCALSTORAGE =====
function getUser(){
  try{ return JSON.parse(localStorage.getItem('makhanani_user')||'null'); }catch(e){ return null; }
}
function getUserRole(){ let u=getUser(); return u?String(u.role||'').toUpperCase():''; }
function getUserRank(){ let u=getUser(); return u?Number(u.rank||0):0; }
function getUserSchool(){ let u=getUser(); return u?String(u.schoolId||'WHS').toUpperCase():'WHS'; }

// ===== GO / BACK =====
function go(page){ window.location.href=page; }
function navBack(){
  if(window.history.length>1){ window.history.back(); }
  else { window.location.href='index.html'; }
}
function navHome(){ window.location.href='index.html'; }

// ===== LOGOUT =====
function doLogout(){
  try{ if(typeof firebase!=='undefined' && firebase.auth){ firebase.auth().signOut(); } }catch(e){}
  try{ localStorage.removeItem('makhanani_user'); localStorage.removeItem('makhanani_uid'); }catch(e){}
  window.location.href='login.html';
}
function logout(){ doLogout(); }

// ===== WHATSAPP — 078 023 3263 =====
const WA_NUMBER='27780233263';
function requestPkgGlobal(pkg){
  let u=getUser();
  let p=String(pkg||'STANDARD').toUpperCase();
  let prices={DEMO:'Setup: FREE — Monthly: FREE — Once-off: FREE — 7 days free trial',STARTER:'Setup: R3 000 — Monthly: R350 / month — Once-off: R4 500 / year',STANDARD:'Setup: R4 500 — Monthly: R500 / month — Once-off: R7 500 / year',PREMIUM:'Setup: R5 500 — Monthly: R600 / month — Once-off: R9 000 / year'};
  let msg='Hello Makhanani LTSM 2.0 👋\n\nI want to REQUEST: '+p+'\n'+(prices[p]||'')+'\nSchool: '+((u&&u.schoolName)||'MY SCHOOL')+'\nName: '+((u&&u.name)||'')+'\n\nPlease activate my package.';
  window.open('https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(msg), '_blank');
}

// ===== CAN USER OPEN PAGE? — RANK LOGIC =====
// Principal Rank 1 = Highest in school — Can open all school pages
// Teacher 2 — Librarian 3 — HOD 4 — Admin 5 — Super Admin 6 = Highest overall
function canOpen(minRank){
  let u=getUser();
  if(!u) return false;
  let role=String(u.role||'').toUpperCase();
  let rank=Number(u.rank||0);
  // Super Admin can open everything
  if(role==='SUPER_ADMIN' || rank===6) return true;
  // Principal can open all school pages (1-5) but NOT Super Admin (6)
  if(role==='PRINCIPAL' || rank===1){
    if(minRank===6) return false;
    return true;
  }
  // Normal rank check: User rank must be >= minRank, except Principal is special above
  // Teacher 2 cannot open Librarian 3, HOD 4, etc.
  // Librarian 3 cannot open HOD 4, etc.
  // Admin 5 can open Teacher / Librarian / HOD / Users / Cleanup
  return rank>=minRank;
}

// ===== GUARD PAGE — CALLED AT TOP OF EVERY DASHBOARD =====
// Usage in HTML: <script>guardPage(3,'Librarian Dashboard');</script>
// guardPage(2,'Teacher') — guardPage(3,'Librarian') — guardPage(4,'HOD')
// guardPage(1,'Principal') — Special: Principal + Admin + Super Admin only
// guardPage(5,'Users') — guardPage(6,'Super Admin')
function guardPage(minRank, pageName){
  let u=getUser();
  let name=pageName||'This Page';
  // Not logged in → Login
  if(!u){
    alert('🔒 Please LOGIN first to open '+name+'.');
    window.location.href='login.html';
    return false;
  }
  // Principal special: guardPage(1) means Principal + Admin + Super Admin only
  // Teacher / Librarian / HOD cannot open Principal page even though their rank > 1
  if(minRank===1){
    let role=String(u.role||'').toUpperCase();
    let rank=Number(u.rank||0);
    if(role==='PRINCIPAL' || role==='SUPER_ADMIN' || role==='ADMIN' || rank===1 || rank===5 || rank===6){
      return true;
    } else {
      alert('⛔ Access Denied — '+name+' is for Principal / Admin / Super Admin only.\n\nYou are '+String(u.role||'').toUpperCase()+' — RANK '+(u.rank||'')+'.\n\nGoing HOME.');
      window.location.href='index.html';
      return false;
    }
  }
  // Normal guard
  if(!canOpen(minRank)){
    alert('⛔ Access Denied — '+name+' needs Rank '+minRank+'+.\n\nYou are '+String(u.role||'').toUpperCase()+' — RANK '+(u.rank||'')+'.\n\nGoing HOME.');
    window.location.href='index.html';
    return false;
  }
  return true;
}

// ===== RENDER TASKBAR — CALLED ON EVERY PAGE =====
// Usage in HTML: <div id="taskbar"></div><script src="nav.js"></script>
// Some pages also call renderTaskbar('Manuals') manually — Safe to call twice
function renderTaskbar(active){
  let bar=document.getElementById('taskbar');
  if(!bar) return;
  let u=getUser();
  let role=u?String(u.role||'').toUpperCase():'VISITOR';
  let rank=u?Number(u.rank||0):0;
  let name=u?String(u.name||'').toUpperCase():'NOT LOGGED IN';
  let school=u?String(u.schoolName||'').toUpperCase():'';
  // Decide which buttons are enabled
  function btn(label, page, minRank, emoji){
    let can=true;
    if(minRank===6){ can=(role==='SUPER_ADMIN'||rank===6); }
    else if(minRank===1){ can=(role==='PRINCIPAL'||role==='ADMIN'||role==='SUPER_ADMIN'||rank===1||rank===5||rank===6); }
    else if(minRank===5){ can=canOpen(5); }
    else if(minRank===4){ can=canOpen(4); }
    else if(minRank===3){ can=canOpen(3); }
    else if(minRank===2){ can=canOpen(2); }
    else { can=true; }
    let isActive=(active && String(active).toUpperCase().includes(label.toUpperCase()))?'background:#d4af37;color:#0a1f4d;':'background:#1e3a5f;color:#fff;';
    if(!can){
      return `<button style="background:#475569;color:#cbd5e1;border:none;border-radius:8px;padding:8px 10px;font-weight:900;cursor:not-allowed;font-size:11px;opacity:.6" onclick="alert('⛔ Access Denied — ${label} needs Rank ${minRank}+. You are ${role} — RANK ${rank}.')">🔒 ${label}</button>`;
    }
    return `<button style="${isActive}border:none;border-radius:8px;padding:8px 10px;font-weight:900;cursor:pointer;font-size:11px" onclick="go('${page}')">${emoji||''} ${label}</button>`;
  }
  bar.innerHTML=`
  <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:10px;background:rgba(255,255,255,.1);padding:8px;border-radius:8px">
    <button style="background:#fff;color:#0a1f4d;border:none;border-radius:8px;padding:8px 10px;font-weight:900;cursor:pointer;font-size:11px" onclick="navBack()">⬅️ BACK</button>
    <button style="background:#fff;color:#0a1f4d;border:none;border-radius:8px;padding:8px 10px;font-weight:900;cursor:pointer;font-size:11px" onclick="go('index.html')">🏠 HOME</button>
    <button style="background:#d4af37;color:#0a1f4d;border:none;border-radius:8px;padding:8px 10px;font-weight:900;cursor:pointer;font-size:11px" onclick="go('subscriptions.html')">💰 SUBSCRIPTIONS</button>
    ${btn('TEACHER','teacher.html',2,'👩‍🏫')}
    ${btn('LIBRARIAN','librarian.html',3,'📚')}
    ${btn('HOD','hod.html',4,'✅')}
    ${btn('PRINCIPAL','principal.html',1,'👑')}
    ${btn('USERS','users.html',5,'👥')}
    ${btn('CLEANUP','cleanup.html',5,'🧹')}
    ${btn('SUPER ADMIN','superadmin.html',6,'👑')}
    ${btn('MANUALS','manuals.html',0,'📖')}
    ${u?`<button style="background:#ef4444;color:#fff;border:none;border-radius:8px;padding:8px 10px;font-weight:900;cursor:pointer;font-size:11px" onclick="doLogout()">🚪 LOGOUT (${name})</button>`:`<button style="background:#22c55e;color:#fff;border:none;border-radius:8px;padding:8px 10px;font-weight:900;cursor:pointer;font-size:11px" onclick="go('login.html')">🔐 LOGIN</button>`}
  </div>
  <div style="text-align:center;font-size:11px;color:#d4af37;margin-top:6px;font-weight:900">${u?`👤 ${name} — ${role} — RANK ${rank} — ${school} — V2.18`:'👤 VISITOR — NOT LOGGED IN — Tap LOGIN — V2.18'}</div>
  `;
}

// Auto-render taskbar on page load if #taskbar exists
document.addEventListener('DOMContentLoaded', function(){
  try{ renderTaskbar(); }catch(e){}
  // Auto-add BACK button if navBack is used but no taskbar — Do nothing
});

// Also render immediately if DOM already loaded (for pages that load nav.js at bottom)
if(document.readyState!=='loading'){
  try{ renderTaskbar(); }catch(e){}
}
