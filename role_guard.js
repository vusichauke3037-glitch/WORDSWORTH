// Makhanani LTSM - Role Guard - Block unauthorized pages
// Add to top of <head> in protected pages: <script src="role_guard.js"></script>
// Then in <body> add: <script>guardPage(3, 'Principal');</script>  - or use data attribute below
(function(){
  // Role levels: Teacher=1, Librarian=2, Principal=3, Super Admin=4
  function getLevel(role){
    if(role==='Teacher') return 1;
    if(role==='Librarian') return 2;
    if(role==='Principal') return 3;
    if(role==='Super Admin') return 4;
    if(role==='Admin') return 3;
    return 0;
  }
  function getUser(){
    try{ return JSON.parse(localStorage.getItem('makhanani_user')||'null'); }catch(e){ return null; }
  }
  // Global function - call it on each protected page
  // guardPage(minLevel, pageName, redirectPage)
  // Example: guardPage(3, 'Principal Dashboard', 'teacher.html')
  window.guardPage = function(minLevel, pageName, redirectPage){
    let user = getUser();
    // Not logged in -> go to login
    if(!user){
      // Don't block if already on login/home - those pages don't call guardPage
      location.href='index.html';
      return false;
    }
    let level = getLevel(user.role);
    if(level >= minLevel) return true; // Allowed

    // BLOCKED - Replace whole page with blocked message
    let needName = minLevel===4 ? 'Super Admin' : minLevel===3 ? 'Principal' : minLevel===2 ? 'Librarian' : 'Teacher';
    let homeForRole = level===1 ? 'teacher.html' : level===2 ? 'librarian.html' : level===3 ? 'principal.html' : 'super_admin.html';
    let target = redirectPage || homeForRole;

    // Stop all other scripts from loading data by hiding body and showing block
    document.addEventListener('DOMContentLoaded', function(){
      document.body.innerHTML = `
<div style="font-family:Arial,sans-serif;background:#f1f5f9;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px">
  <div style="background:#fff;border-radius:12px;padding:24px;max-width:480px;width:100%;text-align:center;box-shadow:0 2px 10px rgba(0,0,0,.2)">
    <div style="font-size:48px">🚫</div>
    <h2 style="color:#0a1f4d;margin:10px 0">You Don't Have Permission</h2>
    <p style="line-height:1.6;font-size:14px">You are logged in as <b>${user.name||''}</b> — Role: <b>${user.role||''}</b><br><br>
    This page <b>${pageName||''}</b> is for <b>${needName} and above</b> only.<br>
    Your role cannot see this data.</p>
    <div style="background:#fef3c7;border:2px solid #d4af37;border-radius:8px;padding:10px;line-height:1.6;font-size:13px;margin:12px 0">
      <b>Where to go instead:</b><br>
      Teacher → Teacher Dashboard<br>
      Librarian → Librarian Dashboard<br>
      Principal → Principal Dashboard<br>
      Super Admin → Super Admin Dashboard
    </div>
    <button onclick="location.href='${target}'" style="width:100%;padding:12px;border:none;border-radius:8px;background:#0a1f4d;color:#fff;font-weight:900;font-size:14px;cursor:pointer;margin-top:8px">✅ Go To My Dashboard →</button>
    <button onclick="location.href='home.html'" style="width:100%;padding:12px;border:none;border-radius:8px;background:#d4af37;color:#0a1f4d;font-weight:900;font-size:14px;cursor:pointer;margin-top:8px">🏠 Go To Home →</button>
    <button onclick="localStorage.removeItem('makhanani_user');location.href='index.html'" style="width:100%;padding:12px;border:none;border-radius:8px;background:#e2e8f0;color:#0a1f4d;font-weight:900;font-size:14px;cursor:pointer;margin-top:8px">🚪 Logout + Login As Different User</button>
  </div>
</div>`;
      // Stop any further loading - hide everything else
      document.title = 'Blocked - No Permission';
    });
    // Also immediately hide body to prevent flash of data
    if(document.body){ document.body.style.visibility='hidden'; }
    return false;
  };

  // Auto-guard via data attribute: <body data-min-level="3" data-page-name="Principal">
  // If page uses this, no need to call guardPage() manually
  window.addEventListener('DOMContentLoaded', function(){
    let body = document.body;
    if(!body) return;
    let min = body.getAttribute('data-min-level');
    let name = body.getAttribute('data-page-name');
    if(min){
      window.guardPage(parseInt(min), name||document.title);
    }
  });
})();
