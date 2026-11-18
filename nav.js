/* nav.js — MAKHANANI LTSM 2.0 — V2.30 — Phases Fixed: 4-6 INTERMEDIATE • 7-9 SENIOR PHASE • 10-12 FET */
/* Usage in EVERY page header: <div id="taskbar"></div><script src="nav.js"></script> */
/* Works even if user is not logged in. No firebase.js needed — uses Firebase already loaded in page. */

(function(){
  // ---- Helpers ----
  function toArray(v){ if(!v) return []; if(Array.isArray(v)) return v; if(typeof v==='string') return v.split(',').map(function(x){return x.trim();}).filter(function(x){return x;}); return []; }
  function getPhase(g){ g=Number(String(g||'').replace(/[^0-9]/g,'')); if(g>=4&&g<=6) return 'INTERMEDIATE PHASE'; if(g>=7&&g<=9) return 'SENIOR PHASE'; if(g>=10&&g<=12) return 'FET PHASE'; return ''; }
  function getPhaseShort(g){ var p=getPhase(g); if(p==='INTERMEDIATE PHASE') return 'INT 4-6'; if(p==='SENIOR PHASE') return 'SEN 7-9'; if(p==='FET PHASE') return 'FET 10-12'; return ''; }
  function go(p){ window.location.href=p; }
  window.go = go;
  window.navBack = function(){ if(window.history.length>1) window.history.back(); else window.location.href='index.html'; };
  window.doLogoutNav = async function(){
    try{ if(window.firebase && firebase.auth) await firebase.auth().signOut(); }catch(e){}
    try{ localStorage.removeItem('makhanani_user'); }catch(e){}
    window.location.href='login.html';
  };

  // ---- Styles (injected once) ----
  if(!document.getElementById('nav-css')){
    var st=document.createElement('style'); st.id='nav-css';
    st.textContent =
      '#taskbar{margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;justify-content:center}'+
      '#taskbar button{border:2px solid #d4af37;background:rgba(255,255,255,0.12);color:#fff;border-radius:20px;padding:7px 12px;font-weight:900;font-size:11px;cursor:pointer;white-space:nowrap}'+
      '#taskbar button:hover{background:#d4af37;color:#0a1f4d}'+
      '#taskbar button.active{background:#d4af37;color:#0a1f4d;border-color:#fff}'+
      '#taskbar button.nav-logout{background:#ef4444;border-color:#ef4444;color:#fff}'+
      '#taskbar button.nav-login{background:#16a34a;border-color:#16a34a;color:#fff}'+
      '#nav-who{margin-top:8px;font-size:11px;color:#d4af37;line-height:1.6;text-align:center}'+
      '#nav-who b{color:#fff}'+
      '.nav-pill{display:inline-block;background:#ea580c;color:#fff;padding:1px 7px;border-radius:20px;font-size:10px;font-weight:900;margin:1px}'+
      '@media(max-width:700px){#taskbar button{font-size:10px;padding:6px 8px}}';
    document.head.appendChild(st);
  }

  // ---- Build Bar ----
  function buildBar(user){
    var bar=document.getElementById('taskbar');
    if(!bar) return;
    var cur=(window.location.pathname||'').split('/').pop().split('?')[0].toLowerCase() || 'index.html';
    function btn(label, page, isActive){
      return '<button onclick="go(\''+page+'\')" class="'+(cur===page?'active':'')+'">'+label+'</button>';
    }
    var html='';
    // Always visible
    html += btn('🏠 HOME','index.html');
    html += btn('📖 MANUALS','manuals.html');

    if(!user || !user.email){
      html += btn('🔐 LOGIN','login.html');
      bar.innerHTML=html;
      var who=document.getElementById('nav-who');
      if(!who){ who=document.createElement('div'); who.id='nav-who'; bar.after(who); }
      who.innerHTML='❌ Not logged in — <b>Tap LOGIN</b> • CAPS: <b>4-6 INTERMEDIATE • 7-9 SENIOR PHASE • 10-12 FET</b>';
      return;
    }

    var role=user.role||'';
    var subjects=toArray(user.subjects);
    var grades=toArray(user.grades);
    var phases=[...new Set(grades.map(function(g){return getPhase(g);}))].filter(function(x){return x;});

    // Role buttons
    if(role==='TEACHER') html += btn('👩‍🏫 TEACHER','teacher.html');
    if(role==='HOD') html += btn('📚 HOD','hod.html');
    if(role==='LIBRARIAN') html += btn('📖 LIBRARIAN','librarian.html');
    if(role==='PRINCIPAL') html += btn('🏫 PRINCIPAL','principal.html');
    if(role==='SUPER_ADMIN') html += btn('👑 ADMIN','admin.html');

    // Quick links - everyone can peek, pages themselves enforce role
    html += btn('👩‍🏫 TEACHER','teacher.html');
    html += btn('📚 HOD','hod.html');
    html += btn('📖 LIBRARIAN','librarian.html');
    if(['PRINCIPAL','SUPER_ADMIN'].includes(role)){
      html += btn('🏫 PRINCIPAL','principal.html');
      html += btn('👥 USERS','users.html');
    }
    // De-duplicate: keep first occurrence of each label+page (simple)
    // Logout / Login
    html += '<button class="nav-logout" onclick="doLogoutNav()">🚪 LOGOUT</button>';

    bar.innerHTML=html;

    var who2=document.getElementById('nav-who');
    if(!who2){ who2=document.createElement('div'); who2.id='nav-who'; bar.after(who2); }
    var subjHtml = subjects.length ? subjects.map(function(s){ return '<span class="nav-pill">'+s+'</span>'; }).join(' ') : '<span class="nav-pill">ALL</span>';
    var phaseHtml = phases.length ? phases.map(function(p){
      var short = p==='INTERMEDIATE PHASE'?'INT 4-6':p==='SENIOR PHASE'?'SEN 7-9':'FET 10-12';
      return '<b>'+short+'</b>';
    }).join(' • ') : '<b>ALL PHASES</b>';
    var roleEmoji = role==='TEACHER'?'👩‍🏫':role==='HOD'?'📚':role==='LIBRARIAN'?'📖':role==='PRINCIPAL'?'🏫':role==='SUPER_ADMIN'?'👑':'👤';
    who2.innerHTML = roleEmoji+' <b>'+String(user.name||'').toUpperCase()+'</b> — '+role+' — RANK '+(user.rank||'')+' • '+subjHtml+' • Grades: <b>'+(grades.length?grades.join(', '):'4-12')+'</b> • Phases: '+phaseHtml+' • <span style="color:#fff">V2.30 ✅</span>';
  }

  // ---- Load User ----
  function loadUser(){
    // 1. Try localStorage fast (from login.html)
    var cached=null;
    try{ cached=JSON.parse(localStorage.getItem('makhanani_user')||'null'); }catch(e){}
    if(cached && cached.email){ buildBar(cached); }
    // 2. Try Firebase for fresh data (if available on page)
    try{
      if(window.firebase && firebase.auth && firebase.database){
        firebase.auth().onAuthStateChanged(function(u){
          if(!u){ if(!cached) buildBar(null); return; }
          firebase.database().ref('users/'+u.uid).once('value').then(function(s){
            var d=s.val()||{};
            d.uid=u.uid; d.email=u.email;
            d.classes=toArray(d.classes||d.className||d.class);
            d.subjects=toArray(d.subjects||d.subject);
            d.grades=toArray(d.grades||d.grade);
            if(d.classes.length===1 && d.classes[0]==='ALL'){
              d.classes=[]; ['4','5','6','7','8','9','10','11','12'].forEach(function(g){ ['A','B','C','D','E','F','G','H','I','J'].forEach(function(l){ d.classes.push(g+l); }); });
              d.grades=['4','5','6','7','8','9','10','11','12'];
            }
            if(!d.grades.length && d.classes.length){
              var gs=[]; d.classes.forEach(function(c){ var gr=c.replace(/[A-J]$/,''); if(!gs.includes(gr)) gs.push(gr); });
              d.grades=gs.sort(function(a,b){return Number(a)-Number(b);});
            }
            buildBar(d);
          }).catch(function(){ if(cached) buildBar(cached); else buildBar(null); });
        });
      } else {
        if(!cached) buildBar(null);
      }
    }catch(e){ if(!cached) buildBar(null); }
  }

  // Run when DOM ready
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', loadUser);
  else loadUser();
})();
