// nav.js — Makhanani LTSM 2.0 — V2.16 — Taskbar + Guard + Back — SUBSCRIPTIONS BUTTON ADDED
function toCapsNav(s){ return String(s||'').trim().toUpperCase(); }
function getNavUser(){ try{ return JSON.parse(localStorage.getItem('makhanani_user')||'null'); }catch(e){ return null; } }
function go(page){ window.location.href=page; }
function navBack(){ if(window.history.length>1){ window.history.back(); } else { window.location.href='index.html'; } }
function navLogout(){
  if(confirm('Logout?')){ localStorage.removeItem('makhanani_user'); window.location.href='login.html'; }
}
function renderTaskbar(active){
  let el=document.getElementById('taskbar'); if(!el) return;
  let u=getNavUser();
  let who = u ? '👤 <b>'+toCapsNav(u.name)+'</b> — '+toCapsNav(u.role)+' — RANK '+(u.rank||'') : '🔒 NOT LOGGED IN';
  let btn='display:inline-block;padding:10px 10px;margin:3px;border:none;border-radius:8px;font-weight:900;cursor:pointer;font-size:12px;';
  el.innerHTML =
  '<div style="background:#0a1f4d;border:2px solid #d4af37;border-radius:10px;padding:10px;margin-top:10px;text-align:center">'
    + '<div style="color:#fff;font-size:12px;margin-bottom:8px">'+who+'</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center">'
    + '<button style="'+btn+'background:#334155;color:#fff" onclick="navBack()">⬅️ BACK</button>'
    + '<button style="'+btn+'background:#d4af37;color:#0a1f4d" onclick="go(\'index.html\')">🏠 HOME</button>'
    + '<button style="'+btn+'background:#f59e0b;color:#0a1f4d" onclick="go(\'subscriptions.html\')">💰 SUBSCRIPTIONS</button>'
    + '<button style="'+btn+'background:#0d9488;color:#fff" onclick="go(\'teacher.html\')">👩‍🏫 TEACHER</button>'
    + '<button style="'+btn+'background:#2563eb;color:#fff" onclick="go(\'librarian.html\')">📚 LIBRARIAN</button>'
    + '<button style="'+btn+'background:#16a34a;color:#fff" onclick="go(\'hod.html\')">✅ HOD</button>'
    + '<button style="'+btn+'background:#7c3aed;color:#fff" onclick="go(\'principal.html\')">👑 PRINCIPAL</button>'
    + '<button style="'+btn+'background:#ea580c;color:#fff" onclick="go(\'users.html\')">👥 USERS</button>'
    + '<button style="'+btn+'background:#64748b;color:#fff" onclick="go(\'cleanup.html\')">🧹 CLEANUP</button>'
    + '<button style="'+btn+'background:#7c3aed;color:#fff" onclick="go(\'superadmin.html\')">👑 SUPER ADMIN</button>'
    + '<button style="'+btn+'background:#ef4444;color:#fff" onclick="navLogout()">🚪 LOGOUT</button>'
    + '</div></div>';
  // Show roleInfoTop if page has it — V2.13.1 fix
  let r=document.getElementById('roleInfoTop');
  if(r && u){ r.innerHTML='👤 <b>'+toCapsNav(u.name)+'</b> — '+toCapsNav(u.role)+' — RANK '+(u.rank||'')+' — School: <b>'+toCapsNav(u.schoolName)+'</b> ('+(u.schoolId||'')+')'; }
}
function guardPage(minRank, pageName){
  renderTaskbar(pageName);
  let u=getNavUser();
  if(!u){ alert('🔒 Please login first.'); window.location.href='login.html'; return false; }
  let rank=parseInt(u.rank||'0');
  // SUPER_ADMIN (6) can open everything
  // Others must meet minRank
  if(rank < minRank && String(u.role||'').toUpperCase()!=='SUPER_ADMIN'){
    alert('⛔ Access denied to '+pageName+'\n\nYour Rank: '+rank+' — Required Rank: '+minRank+'\n\nGoing Home.');
    window.location.href='index.html'; return false;
  }
  return true;
}
