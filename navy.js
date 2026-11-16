// ===== MAKHANANI 2.0 — nav.js — RANKS: Super Admin 5 > Admin 4 > Principal 3 > Librarian/HOD 2 > Teacher 1 =====
const ADMIN_WHATSAPP='27780233263'; // 0780233263
const RANKS={ 'Super Admin':5, 'Admin':4, 'Principal':3, 'Librarian':2, 'HOD':2, 'Teacher':1 };
function rankOf(role){ return RANKS[role]||0; }
function rankName(level){ return level>=5?'Super Admin':level>=4?'Admin':level>=3?'Principal':level>=2?'Librarian / HOD':'Teacher'; }

function getUser(){
  try{ return JSON.parse(localStorage.getItem('makhanani_user')||'null'); }catch(e){ return null; }
}
function getSubSettings(){
  try{ return JSON.parse(localStorage.getItem('makhanani_sub_settings')||'{}'); }catch(e){ return {}; }
}
// Menu by rank - higher rank sees more
function menuFor(role){
  let r=rankOf(role);
  let m=[];
  m.push({label:'🏠 Dashboard', href: r>=5?'super-admin.html':r>=4?'admin.html':r>=3?'principal.html':r>=2?'librarian.html':'teacher.html'});
  if(r>=5) m.push({label:'👑 Super Admin', href:'super-admin.html'});
  if(r>=4) m.push({label:'🛡️ Admin', href:'admin.html'});
  if(r>=3) m.push({label:'🏫 Principal', href:'principal.html'});
  if(r>=2) m.push({label:'📚 Librarian', href:'librarian.html'});
  m.push({label:'👩‍🏫 Teacher', href:'teacher.html'});
  if(r>=4) m.push({label:'🏫 Schools', href:'schools.html'});
  if(r>=4) m.push({label:'👥 Users', href:'users.html'});
  if(r>=3) m.push({label:'💰 Subscriptions', href:'subscriptions.html'});
  m.push({label:'📖 Books', href:'books.html'});
  m.push({label:'📚 Catalogue', href:'catalogue.html'});
  m.push({label:'📦 Stock', href:'stock.html'});
  m.push({label:'🧾 Orders', href:'orders.html'});
  m.push({label:'📚 Subjects', href:'subjects.html'});
  m.push({label:'📊 Reports', href:'reports.html'});
  m.push({label:'💰 Pricing', href:'pricing.html'});
  m.push({label:'🚪 Logout', href:'index.html', logout:true});
  return m;
}
function renderTaskbar(){
  let el=document.getElementById('taskbar');
  if(!el) return;
  let user=getUser();
  if(!user){ el.innerHTML=''; return; }
  let role=user.role||'Teacher';
  let school=user.schoolId==='ALL' ? 'ALL SCHOOLS' : (user.schoolName||user.schoolId||'');
  let rank=rankOf(role);
  let badge = rank>=5?'👑 SUPER ADMIN':rank>=4?'🛡️ ADMIN':rank>=3?'🏫 PRINCIPAL':rank>=2?'📚 LIBRARIAN / HOD':'👩‍🏫 TEACHER';
  let menu=menuFor(role);
  el.innerHTML=`<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:10px">
    <span style="background:#d4af37;color:#0a1f4d;padding:6px 10px;border-radius:20px;font-size:11px;font-weight:900">${badge} — ${String(user.name||'').toUpperCase()} — ${school} — RANK ${rank}/5</span>
    ${menu.map(x=>`<a href="${x.href}" ${x.logout?'onclick="localStorage.removeItem(\'makhanani_user\')"':''} style="background:#fff;color:#0a1f4d;padding:6px 10px;border-radius:20px;font-size:11px;font-weight:900;text-decoration:none">${x.label}</a>`).join('')}
  </div>`;
}
// guardPage(minRank, pageName) - e.g. guardPage(5,'Super Admin') = Super Admin only, guardPage(3,'Principal') = Principal+Admin+Super Admin
function guardPage(minRank, pageName){
  let user=getUser();
  if(!user){ location.href='index.html'; return false; }
  let r=rankOf(user.role);
  if(r < minRank){
    alert('⛔ ACCESS DENIED\n\nPage: '+(pageName||'')+'\nYour Rank: '+user.role+' (Rank '+r+'/5)\nRequired: Rank '+minRank+'/5 ('+rankName(minRank)+' or higher)\n\nYou will go to your dashboard.');
    location.href = r>=5?'super-admin.html':r>=4?'admin.html':r>=3?'principal.html':r>=2?'librarian.html':'teacher.html';
    return false;
  }
  // Subscription block - Super Admin bypasses, others blocked if EXPIRED/SUSPENDED
  try{ checkSubBlock(user); }catch(e){}
  return true;
}
function checkSubBlock(user){
  if(!user || user.role==='Super Admin') return;
  let settings=getSubSettings();
  let graceDays = settings.graceDays ?? 7;
  // Subscriptions are checked on login (index.html) + here on page change
  // If localStorage has a block flag from login, enforce it
  let blockUntil = localStorage.getItem('makhanani_sub_block');
  if(blockUntil && Date.now() < parseInt(blockUntil)){
    // Still blocked - will be cleared on renew
  }
  // Light check: if user was marked suspended in session, block
  if(sessionStorage.getItem('makhanani_suspended')==='1'){
    alert('⛔ SUBSCRIPTION SUSPENDED\n\nYour school subscription has expired.\nContact Super Admin (0780233263) to renew.');
    localStorage.removeItem('makhanani_user');
    location.href='index.html';
  }
}
document.addEventListener('DOMContentLoaded', renderTaskbar);
