// nav.js - V2.43 Fixed - One Button Per Role - No Duplicates
(function(){
  var bar = document.getElementById('taskbar');
  if(!bar) return;
  var user = null;
  try{ user = JSON.parse(localStorage.getItem('makhanani_user')||'null'); }catch(e){}
  var role = user ? String(user.role||'').toUpperCase() : '';
  if(window.location.href.includes('hod.html')) role = 'HOD';
  var seen = {};
  var links = [];
  function add(label, href){ if(seen[href]) return; seen[href]=true; links.push({label:label, href:href}); }
  add('🏠 HOME','index.html');
  add('📖 MANUALS','manuals.html');
  if(role==='TEACHER') add('👩‍🏫 TEACHER','teacher.html');
  if(role==='HOD') add('👑 HOD','hod.html');
  if(role==='PRINCIPAL') add('🏫 PRINCIPAL','principal.html');
  if(role==='LIBRARIAN') add('📖 LIBRARIAN','librarian.html');
  if(role==='SUPER_ADMIN') add('👑 SUPER ADMIN','super_admin.html');
  if(role==='ADMIN') add('⚙️ ADMIN','admin.html');
  if(role==='PRINCIPAL' || role==='SUPER_ADMIN') add('💳 SUBSCRIPTIONS','subscriptions.html');
  bar.innerHTML = '<div style="display:flex;gap:6px;overflow-x:auto;padding:8px 0;justify-content:center;flex-wrap:wrap">'
    + links.map(function(l){ return '<button onclick="window.location.href=\''+l.href+'\'" style="border:none;border-radius:20px;padding:8px 12px;font-weight:900;cursor:pointer;font-size:11px;background:#1e3a8a;color:#fff;white-space:nowrap">'+l.label+'</button>'; }).join('')
    + '</div>';
})();
