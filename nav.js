// Makhanani LTSM 2.0 - nav.js V2.50 - Top nav bar injected into #taskbar on every page
(function(){
  try{
    var el = document.getElementById('taskbar');
    if(!el) return;
    var user = null;
    try{ user = JSON.parse(localStorage.getItem('makhanani_user')||'null'); }catch(e){}
    var role = user && user.role ? String(user.role).toUpperCase() : '';
    var rolePage = 'index.html';
    if(role==='TEACHER') rolePage='teacher.html';
    else if(role==='HOD') rolePage='hod.html';
    else if(role==='LIBRARIAN') rolePage='librarian.html';
    else if(role==='PRINCIPAL') rolePage='principal.html';
    else if(role==='SUPER_ADMIN'||role==='ADMIN') rolePage='super_admin.html';
    el.innerHTML = '<div style="display:flex;gap:6px;overflow-x:auto;padding:6px 8px 10px;flex-wrap:wrap">'
      + '<a href="index.html" style="background:#fff;color:#0a1f4d;padding:8px 12px;border-radius:20px;font-weight:900;font-size:12px;text-decoration:none">🏠 HOME</a>'
      + '<a href="'+rolePage+'" style="background:#d4af37;color:#0a1f4d;padding:8px 12px;border-radius:20px;font-weight:900;font-size:12px;text-decoration:none">🚀 MY PAGE ('+(role||'USER')+')</a>'
      + '<a href="issue.html" style="background:#ea580c;color:#fff;padding:8px 12px;border-radius:20px;font-weight:900;font-size:12px;text-decoration:none">📦 ISSUE</a>'
      + '<a href="stock.html" style="background:#0d9488;color:#fff;padding:8px 12px;border-radius:20px;font-weight:900;font-size:12px;text-decoration:none">📦 STOCK</a>'
      + '<a href="barcode.html" style="background:#7c3aed;color:#fff;padding:8px 12px;border-radius:20px;font-weight:900;font-size:12px;text-decoration:none">🏷️ BARCODE</a>'
      + '<a href="bulk_upload.html" style="background:#fff;color:#0a1f4d;padding:8px 12px;border-radius:20px;font-weight:900;font-size:12px;text-decoration:none">📤 BULK</a>'
      + '<a href="checklist.html" style="background:#fff;color:#0a1f4d;padding:8px 12px;border-radius:20px;font-weight:900;font-size:12px;text-decoration:none">✅ CHECKLIST</a>'
      + '<a href="login.html" style="background:#ef4444;color:#fff;padding:8px 12px;border-radius:20px;font-weight:900;font-size:12px;text-decoration:none">🔑 LOGIN</a>'
      + '</div>';
  }catch(e){}
})();
