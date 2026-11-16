// ===== nav.js V2.7 — MAKHANANI LTSM 2.0 — Top Bar + Switch User ONLY in Demo Mode =====
// Include on EVERY page: <div id="taskbar"></div><script src="nav.js"></script>
// Then: <script>guardPage(1,'Teacher');</script>
//
// DEMO MODE:
//   Live (default):  teacher.html                → NO Switch button — Secure — Logout → Login to change user
//   Demo ON:         teacher.html?demo=1         → Switch button SHOWS — Tap to switch user in 1 tap
//   Demo OFF:        teacher.html?demo=0         → Switch button HIDES — Back to Live
//   Demo stays ON across pages once enabled (saved in localStorage makhanani_demo=1)
//   Demo is OFF by default on login.html — Login page never shows Switch button

(function(){
  var DEMO_USERS = [
    {email:'dube@wordsworth.co.za',pass:'1234',name:'MRS DUBE',role:'Teacher',rank:1,subject:'MATHEMATICS',teachingClasses:['10A','10B','11A'],schoolId:'WHS',schoolName:'WORDSWORTH HIGH SCHOOL',page:'teacher.html',icon:'👩‍🏫'},
    {email:'smith@wordsworth.co.za',pass:'1234',name:'MR SMITH',role:'Teacher',rank:1,subject:'ENGLISH',teachingClasses:['10A','10B'],schoolId:'WHS',schoolName:'WORDSWORTH HIGH SCHOOL',page:'teacher.html',icon:'👩‍🏫'},
    {email:'jones@wordsworth.co.za',pass:'1234',name:'MS JONES',role:'Teacher',rank:1,subject:'HISTORY',teachingClasses:['12A'],schoolId:'WHS',schoolName:'WORDSWORTH HIGH SCHOOL',page:'teacher.html',icon:'👩‍🏫'},
    {email:'librarian@wordsworth.co.za',pass:'1234',name:'LIBRARIAN WHS',role:'Librarian',rank:2,subject:'',schoolId:'WHS',schoolName:'WORDSWORTH HIGH SCHOOL',page:'librarian.html',icon:'📚'},
    {email:'hod.maths@wordsworth.co.za',pass:'1234',name:'HOD MATHS',role:'HOD',rank:3,subject:'MATHEMATICS',schoolId:'WHS',schoolName:'WORDSWORTH HIGH SCHOOL',page:'hod.html',icon:'👔'},
    {email:'hod.english@wordsworth.co.za',pass:'1234',name:'HOD ENGLISH',role:'HOD',rank:3,subject:'ENGLISH',schoolId:'WHS',schoolName:'WORDSWORTH HIGH SCHOOL',page:'hod.html',icon:'👔'},
    {email:'principal@wordsworth.co.za',pass:'1234',name:'PRINCIPAL WHS',role:'Principal',rank:4,subject:'ALL SUBJECTS',schoolId:'WHS',schoolName:'WORDSWORTH HIGH SCHOOL',page:'principal.html',icon:'🏫'},
    {email:'admin@wordsworth.co.za',pass:'1234',name:'ADMIN WHS',role:'Admin',rank:5,subject:'ALL SUBJECTS',schoolId:'WHS',schoolName:'WORDSWORTH HIGH SCHOOL',page:'admin.html',icon:'⚙️'},
  ];
  var ROLE_PAGES = {Teacher:'teacher.html',Librarian:'librarian.html',HOD:'hod.html',Principal:'principal.html',Admin:'admin.html'};

  // ---------- Demo Mode — ?demo=1 / ?demo=0 / localStorage ----------
  function getDemoParam(){
    try{
      var p=new URLSearchParams(window.location.search).get('demo');
      return p;
    }catch(e){ return null; }
  }
  function isDemoMode(){
    // 1. URL ?demo=1 turns ON, ?demo=0 turns OFF — URL wins, then save to localStorage
    var param=getDemoParam();
    if(param==='1'){ try{ localStorage.setItem('makhanani_demo','1'); }catch(e){} return true; }
    if(param==='0'){ try{ localStorage.setItem('makhanani_demo','0'); }catch(e){} return false; }
    // 2. No param → Use saved choice
    try{ return localStorage.getItem('makhanani_demo')==='1'; }catch(e){ return false; }
  }
  // If page is login.html, demo is OFF for Switch button — Login page uses its own 1-tap demo buttons
  function isLoginPage(){
    var cur=(location.pathname.split('/').pop()||'').toLowerCase();
    return cur==='' || cur==='login.html' || cur==='index.html';
  }
  var DEMO_ON = isDemoMode() && !isLoginPage();

  function getUser(){ try{ return JSON.parse(localStorage.getItem('makhanani_user')||'null'); }catch(e){ return null; } }
  function setUser(u){ localStorage.setItem('makhanani_user', JSON.stringify(u)); }
  function toCaps(s){ return String(s||'').trim().toUpperCase(); }

  // ---------- Enable / Disable Demo ----------
  window.enableDemo = function(){
    try{ localStorage.setItem('makhanani_demo','1'); }catch(e){}
    var u=new URL(window.location.href);
    u.searchParams.set('demo','1');
    location.href=u.toString();
  };
  window.disableDemo = function(){
    if(!confirm('🧪 Turn OFF Demo Mode?\n\n🔄 SWITCH USER button will disappear.\n\nTo change user, you will need to Logout → Login with email + password.\n\nTurn OFF demo?')) return;
    try{ localStorage.setItem('makhanani_demo','0'); }catch(e){}
    var u=new URL(window.location.href);
    u.searchParams.set('demo','0');
    location.href=u.toString();
  };
  window.toggleDemo = function(){ if(isDemoMode()){ window.disableDemo(); } else { window.enableDemo(); } };

  // ---------- Switch User — ONLY works in Demo Mode ----------
  window.switchToUser = function(email){
    if(!isDemoMode()){
      alert('⛔ Switch User is OFF in Live mode.\n\nTo switch user, Logout → Login with email + password.\n\nFor testing, add ?demo=1 to the URL — e.g. teacher.html?demo=1');
      return;
    }
    var demo=DEMO_USERS.find(function(u){ return u.email.toLowerCase()===String(email).toLowerCase(); });
    if(!demo){ location.href='login.html'; return; }
    var clean={name:demo.name,email:demo.email,role:demo.role,rank:demo.rank,subject:demo.subject||'',teachingClasses:demo.teachingClasses||[],schoolId:demo.schoolId,schoolName:demo.schoolName};
    setUser(clean);
    var target=demo.page;
    var current=location.pathname.split('/').pop()||'index.html';
    // Keep ?demo=1 when switching pages, so Demo stays ON
    var sep=target.indexOf('?')>=0?'&':'?';
    if(current===target){ location.reload(); }
    else { location.href=target+sep+'demo=1'; }
  };

  // ---------- Logout — Also turns OFF Demo? NO — Keep Demo choice, just logout ----------
  window.doLogout = function(){
    if(!confirm('🚪 Logout?\n\nYou will go back to Login page.')) return;
    localStorage.removeItem('makhanani_user');
    location.href='login.html';
  };
  window.goLogin = function(){ location.href='login.html'; };

  window.toggleSwitchMenu = function(e){
    if(e) e.stopPropagation();
    var m=document.getElementById('switchMenu');
    if(!m) return;
    m.style.display=(m.style.display==='block'?'none':'block');
  };
  document.addEventListener('click', function(){
    var m=document.getElementById('switchMenu');
    if(m) m.style.display='none';
  });

  window.guardPage = function(minRank, roleName){
    var u=getUser();
    if(!u){ location.href='login.html'; return false; }
    if(u.rank < minRank){
      alert('⛔ Access Denied\n\nThis page is for '+roleName+' (Rank '+minRank+') and above.\n\nYou are: '+u.name+' — '+u.role+' — Rank '+u.rank+'\n\nYou will be sent to your home page.');
      var key=Object.keys(ROLE_PAGES).find(function(k){ return k.toLowerCase()===(u.role||'').toLowerCase(); });
      var target=key?ROLE_PAGES[key]:'login.html';
      // Keep demo param if demo is ON
      if(isDemoMode()){ target += (target.indexOf('?')>=0?'&':'?')+'demo=1'; }
      location.href=target;
      return false;
    }
    return true;
  };

  function renderTaskbar(){
    var bar=document.getElementById('taskbar');
    if(!bar) return;
    var u=getUser();
    if(!u){
      bar.innerHTML='<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:10px"><button onclick="goLogin()" style="background:#d4af37;color:#0a1f4d;border:none;border-radius:8px;padding:10px 14px;font-weight:900;cursor:pointer;font-size:13px">🔐 LOGIN →</button></div>';
      return;
    }
    var found=DEMO_USERS.find(function(d){ return d.email.toLowerCase()===(u.email||'').toLowerCase(); });
    var icon=(found||{}).icon||'👤';
    var subjectLabel=u.subject?' — '+toCaps(u.subject):'';
    var classesLabel=(u.teachingClasses||[]).length?' — '+u.teachingClasses.join(', '):'';
    var schoolLabel=u.schoolId?' — '+u.schoolId:'';

    // LIVE MODE: No Switch button — Only User + Logout
    if(!DEMO_ON){
      bar.innerHTML=
        '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center;margin-top:10px">'
        + '<span style="background:#fff;color:#0a1f4d;border-radius:20px;padding:8px 12px;font-weight:900;font-size:12px;line-height:1.4;display:inline-block">'+icon+' '+toCaps(u.name)+' — '+toCaps(u.role)+' — RANK '+u.rank+subjectLabel+classesLabel+schoolLabel+'</span>'
        + '<button onclick="doLogout()" style="background:#ef4444;color:#fff;border:none;border-radius:8px;padding:10px 14px;font-weight:900;cursor:pointer;font-size:13px">🚪 LOGOUT</button>'
        + '</div>';
      return;
    }

    // DEMO MODE: Show Switch + Demo ON badge
    var menuItems=DEMO_USERS.map(function(d){
      var isCurrent=(d.email.toLowerCase()===(u.email||'').toLowerCase());
      return '<button onclick="switchToUser(\''+d.email+'\')" style="display:block;width:100%;text-align:left;background:'+(isCurrent?'#fef3c7':'#fff')+';border:none;border-bottom:1px solid #eee;padding:10px 12px;font-weight:900;cursor:pointer;font-size:13px;color:#0a1f4d">'
        + d.icon+' '+toCaps(d.name)+' — '+d.role.toUpperCase()+(d.subject?' — '+toCaps(d.subject):'')+(d.teachingClasses&&d.teachingClasses.length?' — '+d.teachingClasses.join(', '):'')
        + (isCurrent?' &nbsp;✅ CURRENT':' &nbsp;→ SWITCH')
        + '</button>';
    }).join('');

    bar.innerHTML=
      '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center;margin-top:10px;position:relative">'
      + '<span style="background:#fff;color:#0a1f4d;border-radius:20px;padding:8px 12px;font-weight:900;font-size:12px;line-height:1.4;display:inline-block">'+icon+' '+toCaps(u.name)+' — '+toCaps(u.role)+' — RANK '+u.rank+subjectLabel+classesLabel+schoolLabel+'</span>'
      + '<div style="position:relative;display:inline-block">'
      +   '<button onclick="toggleSwitchMenu(event)" style="background:#d4af37;color:#0a1f4d;border:none;border-radius:8px;padding:10px 14px;font-weight:900;cursor:pointer;font-size:13px">🔄 SWITCH USER ▾</button>'
      +   '<div id="switchMenu" style="display:none;position:absolute;right:0;top:44px;width:340px;max-width:90vw;background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.4);z-index:9999;overflow:hidden;text-align:left">'
      +     '<div style="background:#0a1f4d;color:#fff;padding:10px 12px;font-weight:900;font-size:12px">🔄 SWITCH USER — DEMO ONLY — Tap To Switch Instantly</div>'
      +     menuItems
      +     '<button onclick="goLogin()" style="display:block;width:100%;text-align:left;background:#e2e8f0;border:none;border-top:2px solid #d4af37;padding:10px 12px;font-weight:900;cursor:pointer;font-size:13px;color:#0a1f4d">🔐 GO TO LOGIN PAGE (Type Email)</button>'
      +     '<button onclick="doLogout()" style="display:block;width:100%;text-align:left;background:#fee2e2;border:none;padding:10px 12px;font-weight:900;cursor:pointer;font-size:13px;color:#991b1b">🚪 LOGOUT</button>'
      +   '</div>'
      + '</div>'
      + '<button onclick="disableDemo()" title="Turn OFF Demo Mode — Hide Switch User" style="background:#7c3aed;color:#fff;border:none;border-radius:8px;padding:10px 14px;font-weight:900;cursor:pointer;font-size:13px">🧪 DEMO ON — TAP TO TURN OFF</button>'
      + '<button onclick="doLogout()" style="background:#ef4444;color:#fff;border:none;border-radius:8px;padding:10px 14px;font-weight:900;cursor:pointer;font-size:13px">🚪 LOGOUT</button>'
      + '</div>'
      + '<div style="text-align:center;margin-top:6px"><small style="color:#d4af37;font-weight:900">🧪 DEMO MODE ON — Switch User is visible only in Demo. Live users will NOT see it.</small></div>';
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', renderTaskbar); }
  else { renderTaskbar(); }
})();
