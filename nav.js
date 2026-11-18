// nav.js — MAKHANANI LTSM 2.0 — V2.22 — Taskbar for ALL pages
// Put this file in SAME folder as index.html — Same name: nav.js — all small letters
(function(){
  try{
    var u=null; try{ u=JSON.parse(localStorage.getItem('makhanani_user')||'null'); }catch(e){}
    var name = u && u.name ? String(u.name).toUpperCase() : 'NOT LOGGED IN';
    var role = u && u.role ? String(u.role).toUpperCase() : '';
    var rank = u && u.rank ? u.rank : '-';
    var school = u && u.schoolName ? String(u.schoolName).toUpperCase() : 'NO SCHOOL';
    var el = document.getElementById('taskbar');
    if(!el) return;

    // Styles — injected once
    var css = '<style>#taskbar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:12px}'+
    '#taskbar button{border:none;border-radius:8px;padding:10px 12px;font-weight:900;cursor:pointer;font-size:12px;background:#1e3a8a;color:#fff}'+
    '#taskbar button.gold{background:#d4af37;color:#0a1f4d}'+
    '#taskbar button.red{background:#ef4444;color:#fff}'+
    '#taskbar button.green{background:#22c55e;color:#fff}'+
    '#taskbar button.teal{background:#0d9488;color:#fff}'+
    '#taskbar button.purple{background:#7c3aed;color:#fff}'+
    '#taskbarInfo{width:100%;text-align:center;font-size:12px;color:#d4af37;font-weight:900;margin-top:6px}'+
    '@media(max-width:600px){#taskbar button{flex:1 1 40%;font-size:11px;padding:9px 6px}}</style>';
    if(!document.getElementById('taskbarCss')){ var s=document.createElement('div'); s.id='taskbarCss'; s.innerHTML=css; document.head.appendChild(s); }

    function btn(label, page, cls){
      return '<button class="'+(cls||'')+'" onclick="window.location.href=\''+page+'\'">'+label+'</button>';
    }

    var html = '';
    html += btn('⬅️ BACK', 'javascript:history.back()', '');
    html += btn('🏠 HOME', 'index.html', '');
    html += btn('💰 SUBSCRIPTIONS', 'subscriptions.html', 'gold');
    html += btn('👩‍🏫 TEACHER', 'teacher.html', '');
    html += btn('📚 LIBRARIAN', 'librarian.html', '');
    html += btn('✅ HOD', 'hod.html', 'green');
    html += btn('🏫 PRINCIPAL', 'principal.html', '');
    html += btn('👥 USERS', 'users.html', '');
    html += btn('🧹 CLEANUP', 'cleanup.html', '');
    html += btn('👑 SUPER ADMIN', 'superadmin.html', 'gold');
    html += btn('📖 MANUALS', 'manuals.html', 'purple');
    // Logout only if logged in
    if(u && u.email){
      html += '<button class="red" onclick="localStorage.removeItem(\'makhanani_user\');window.location.href=\'login.html\'">🚪 LOGOUT ('+name+')</button>';
    } else {
      html += btn('🔐 LOGIN', 'login.html', 'red');
    }
    html += '<div id="taskbarInfo">👤 '+name+' — '+role+' — RANK '+rank+' — '+school+' — V2.22</div>';
    el.innerHTML = html;
  }catch(e){ console.log('nav.js error: '+e.message); }
})();
