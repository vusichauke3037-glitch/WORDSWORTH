// Makhanani LTSM - Organized Task Bar - Grouped By Functionality + ROLE FILTER
// Add to every page: <div id="taskbar"></div> + <script src="nav.js"></script>
(function(){
  function esc(s){return String(s||'').replace(/</g,'&lt;');}
  function currentPage(){
    try{return location.pathname.split('/').pop()||'index.html';}catch(e){return 'index.html';}
  }
  function isActive(pages){ return pages.includes(currentPage()) ? ' active' : ''; }

  let user=null;
  try{ user=JSON.parse(localStorage.getItem('makhanani_user')||'null'); }catch(e){}
  let role=(user&&user.role)||'';
  let loggedIn = !!user;

  // ROLE LEVELS: Teacher=1, Librarian=2, Principal=3, Super Admin=4
  let level = 0;
  if(role==='Teacher') level=1;
  else if(role==='Librarian') level=2;
  else if(role==='Principal') level=3;
  else if(role==='Super Admin') level=4;
  else if(role==='Admin') level=3;

  let isTeacher = level>=1;
  let isLibrarian = level>=2;
  let isPrincipal = level>=3;
  let isSuper = level>=4;

  // If not logged in, show only Home + Login
  if(!loggedIn){
    let html = `
<style>
.taskbar{background:#0a1f4d;border-top:2px solid #d4af37;padding:8px 10px;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;align-items:center}
.taskbar a{color:#fff;text-decoration:none;padding:7px 11px;border-radius:20px;font-weight:900;font-size:12px;background:rgba(255,255,255,.15)}
.taskbar a:hover{background:#d4af37;color:#0a1f4d}
.taskbar a.active{background:#d4af37;color:#0a1f4d}
</style>
<div class="taskbar">
  <a href="home.html" class="${isActive(['home.html','index.html'])}">🏠 Home</a>
  <a href="index.html">🔐 Login</a>
</div>`;
    function mountLogin(){ let el=document.getElementById('taskbar'); if(el) el.innerHTML=html; }
    if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', mountLogin); } else { mountLogin(); }
    return;
  }

  // Build Dashboards dropdown - only roles user is allowed to see
  let dashItems = '';
  if(isTeacher) dashItems += `<a href="teacher.html" class="${isActive(['teacher.html'])}">👩‍🏫 Teacher <span class="desc">My Class Only — Issue / Return</span></a>`;
  if(isLibrarian) dashItems += `<a href="librarian.html" class="${isActive(['librarian.html'])}">📚 Librarian <span class="desc">All Textbooks — Issue / Return / Lost</span></a>`;
  if(isPrincipal) dashItems += `<a href="principal.html" class="${isActive(['principal.html'])}">🏫 Principal <span class="desc">Whole School — Reports / Users</span></a>`;
  if(isSuper) dashItems += `<a href="super_admin.html" class="${isActive(['super_admin.html'])}">👑 Super Admin <span class="desc">ALL Schools — ALL Users</span></a>`;

  // Learners dropdown - All logged in roles see it
  let learnersDrop = `
  <div class="taskDrop"><button class="taskDropBtn ${isActive(['learners.html','learner_barcode.html']) ? 'active' : ''}">👩‍🎓 Learners ▼</button><div class="taskDropContent">
    <div class="head">👩‍🎓 LEARNERS — FUNCTION: LEARNER RECORDS</div>
    <a href="learners.html" class="${isActive(['learners.html'])}">📋 All Learners <span class="desc">List • Search • Filter • Issue • Print</span></a>
    <a href="learners.html" onclick="sessionStorage.setItem('openTab','add')">➕ Add 1 Learner <span class="desc">Grade + Class Dropdowns — Auto ID 10A001</span></a>
    <a href="learners.html" onclick="sessionStorage.setItem('openTab','bulk')">➕➕ Add Many Learners <span class="desc">Whole Class — Paste Names — 10A001 to 10A030</span></a>
    ${isPrincipal ? `<a href="upload.html">📤 Upload Learners <span class="desc">CSV Upload — Batch — 50 per batch</span></a>` : ''}
    <a href="learner_barcode.html" class="${isActive(['learner_barcode.html'])}">🏷️ Learner Barcode <span class="desc">Print 10A001 Label — A4 3x5</span></a>
  </div></div>`;

  // Textbooks dropdown - All logged in roles see it
  let textbooksDrop = `
  <div class="taskDrop"><button class="taskDropBtn ${isActive(['books.html','book_barcode.html']) ? 'active' : ''}">📚 Textbooks ▼</button><div class="taskDropContent">
    <div class="head">📚 TEXTBOOKS — FUNCTION: TEXTBOOK STOCK</div>
    <a href="books.html" class="${isActive(['books.html'])}">📋 All Textbooks <span class="desc">List • Search • Filter • Issue / Return</span></a>
    ${isLibrarian ? `<a href="books.html" onclick="sessionStorage.setItem('openTab','add')">➕ Add 1 Textbook <span class="desc">Category + Grade Dropdowns — Auto MPS000001</span></a>
    <a href="books.html" onclick="sessionStorage.setItem('openTab','bulk')">➕➕ Add Many Copies <span class="desc">Same Title — 5 / 10 / 30 Copies</span></a>` : ''}
    <a href="books.html" onclick="sessionStorage.setItem('openTab','issue')">📕 Issue / Return <span class="desc">Pick Learner + Textbook Dropdowns</span></a>
    <a href="book_barcode.html" class="${isActive(['book_barcode.html'])}">📚 Textbook Barcode <span class="desc">Print MPS000001 Label — A4 3x5</span></a>
  </div></div>`;

  // Schools dropdown - Principal + Super Admin ONLY
  let schoolsDrop = '';
  if(isPrincipal){
    schoolsDrop = `
  <div class="taskDrop"><button class="taskDropBtn ${isActive(['add_school.html','dbe_upload.html']) ? 'active' : ''}">🏫 Schools ▼</button><div class="taskDropContent">
    <div class="head">🏫 SCHOOLS — FUNCTION: SCHOOLS & USERS</div>
    <a href="add_school.html" class="${isActive(['add_school.html'])}">🏫 Add School / User <span class="desc">Create School + Principal / Teacher Login</span></a>
    ${isSuper ? `<a href="dbe_upload.html" class="${isActive(['dbe_upload.html'])}">📤 Upload DBE Leads <span class="desc">EMIS,NAME,TOWN,PROVINCE — Contact → Convert</span></a>
    <a href="super_admin.html">👑 All Schools <span class="desc">See ALL Schools — Super Admin Only</span></a>
    <a href="upload.html">👩‍🏫 Upload Teachers <span class="desc">CSV Upload — Name, Email, Password, Role</span></a>` : ''}
  </div></div>`;
  }

  // Uploads dropdown - Super Admin ONLY (Principal sees Upload Learners inside Learners menu)
  let uploadsDrop = '';
  if(isSuper){
    uploadsDrop = `
  <div class="taskDrop"><button class="taskDropBtn ${isActive(['upload.html','dbe_upload.html']) ? 'active' : ''}">📤 Uploads ▼</button><div class="taskDropContent">
    <div class="head">📤 UPLOADS — FUNCTION: BULK IMPORT</div>
    <a href="upload.html">👩‍🎓 Upload Learners <span class="desc">Names Only — Grade/Class From Dropdowns</span></a>
    <a href="upload.html">👩‍🏫 Upload Teachers <span class="desc">Name, Email, Password — Role From Dropdown</span></a>
    <a href="dbe_upload.html">🏫 Upload DBE Schools <span class="desc">3365 Schools — Batch 100 — Leads</span></a>
  </div></div>`;
  }

  // Barcodes dropdown - All logged in roles
  let barcodesDrop = `
  <div class="taskDrop"><button class="taskDropBtn ${isActive(['barcode.html','learner_barcode.html','book_barcode.html']) ? 'active' : ''}">🏷️ Barcodes ▼</button><div class="taskDropContent">
    <div class="head">🏷️ BARCODES — FUNCTION: PRINT LABELS</div>
    <a href="barcode.html" class="${isActive(['barcode.html'])}">🏷️ All Barcodes — A4 3x5 <span class="desc">Learner + Textbook — 15 Per Page</span></a>
    <a href="learner_barcode.html">👩‍🎓 Learner Barcode <span class="desc">10A001 Label</span></a>
    <a href="book_barcode.html">📚 Textbook Barcode <span class="desc">MPS000001 Label</span></a>
  </div></div>`;

  // Reports dropdown - Librarian+ (Librarian sees only Librarian, Principal sees Principal, Super sees all)
  let reportsDrop = '';
  if(isLibrarian){
    let reportItems = '';
    if(isLibrarian) reportItems += `<a href="librarian.html">📚 Librarian Report <span class="desc">Issued / Overdue / Lost</span></a>`;
    if(isPrincipal) reportItems += `<a href="principal.html">🏫 Principal Report <span class="desc">Whole School — By Grade / Class / Category</span></a>`;
    if(isSuper) reportItems += `<a href="super_admin.html">👑 Super Admin Report <span class="desc">ALL Schools — ALL Users</span></a>`;
    reportsDrop = `
  <div class="taskDrop"><button class="taskDropBtn ${isActive(['principal.html','super_admin.html']) ? 'active' : ''}">📊 Reports ▼</button><div class="taskDropContent">
    <div class="head">📊 REPORTS — FUNCTION: SEE & EXPORT</div>
    ${reportItems}
  </div></div>`;
  }

  let html = `
<style>
.taskbar{background:#0a1f4d;border-top:2px solid #d4af37;padding:8px 10px;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;align-items:center}
.taskbar a, .taskbar button{color:#fff;text-decoration:none;padding:7px 11px;border-radius:20px;font-weight:900;font-size:12px;background:rgba(255,255,255,.15);border:none;cursor:pointer;display:inline-flex;align-items:center;gap:4px}
.taskbar a:hover, .taskbar button:hover{background:#d4af37;color:#0a1f4d}
.taskbar a.active, .taskbar button.active{background:#d4af37;color:#0a1f4d}
.taskDrop{position:relative;display:inline-block}
.taskDropBtn{background:rgba(255,255,255,.15)!important;color:#fff!important;padding:7px 11px!important;border-radius:20px!important;font-weight:900!important;font-size:12px!important;cursor:pointer!important;border:none!important}
.taskDropContent{display:none;position:absolute;left:0;top:100%;background:#fff;min-width:240px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,.35);z-index:999;overflow:hidden;margin-top:4px}
.taskDropContent a{display:block!important;color:#0a1f4d!important;text-decoration:none!important;padding:11px 13px!important;font-size:13px!important;font-weight:900!important;border-bottom:1px solid #f1f5f9!important;background:#fff!important;border-radius:0!important}
.taskDropContent a:hover{background:#fef3c7!important;color:#0a1f4d!important}
.taskDropContent a.active{background:#fef3c7!important}
.taskDropContent .head{background:#0a1f4d!important;color:#fff!important;padding:8px 13px!important;font-size:11px!important;font-weight:900!important;letter-spacing:.5px}
.taskDropContent .desc{font-size:11px!important;color:#64748b!important;font-weight:400!important;display:block;margin-top:2px}
.taskDrop:hover .taskDropContent, .taskDrop.open .taskDropContent{display:block}
.taskUser{color:#fff;font-size:11px;font-weight:900;background:rgba(255,255,255,.1);padding:7px 10px;border-radius:20px;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.taskRole{color:#d4af37;font-size:10px;font-weight:900;background:#fff;border-radius:20px;padding:4px 8px}
@media(max-width:700px){
  .taskbar{justify-content:flex-start;overflow-x:auto;flex-wrap:nowrap;padding-bottom:10px}
  .taskbar a, .taskbar button{white-space:nowrap;flex-shrink:0}
  .taskDropContent{position:fixed;left:10px;right:10px;top:auto;min-width:auto}
}
</style>
<div class="taskbar">
  <a href="home.html" class="${isActive(['home.html','index.html'])}">🏠 Home</a>

  <div class="taskDrop"><button class="taskDropBtn ${isActive(['teacher.html','librarian.html','principal.html','super_admin.html']) ? 'active' : ''}">📂 Dashboards ▼</button><div class="taskDropContent">
    <div class="head">📂 DASHBOARDS — YOUR ROLE: ${esc(role.toUpperCase())}</div>
    ${dashItems}
  </div></div>

  ${learnersDrop}
  ${textbooksDrop}
  ${schoolsDrop}
  ${uploadsDrop}
  ${barcodesDrop}
  ${reportsDrop}

  <span class="taskUser">👤 ${esc(user.name||'')} • ${esc(user.schoolName||'')}</span>
  <span class="taskRole">${esc(role.toUpperCase())}</span>
  <a href="#" onclick="event.preventDefault();localStorage.removeItem('makhanani_user');location.href='index.html';">🚪 Logout</a>
</div>
`;

  function mount(){
    let el=document.getElementById('taskbar');
    if(el){ el.innerHTML=html; }
    document.querySelectorAll('.taskDrop').forEach(function(drop){
      let btn=drop.querySelector('.taskDropBtn');
      if(btn){
        btn.addEventListener('click', function(e){
          e.stopPropagation();
          let isOpen=drop.classList.contains('open');
          document.querySelectorAll('.taskDrop').forEach(function(d){ d.classList.remove('open'); });
          if(!isOpen) drop.classList.add('open');
        });
      }
    });
    document.addEventListener('click', function(){
      document.querySelectorAll('.taskDrop').forEach(function(d){ d.classList.remove('open'); });
    });
    try{
      let tab=sessionStorage.getItem('openTab');
      if(tab && typeof showTab==='function'){ setTimeout(function(){ showTab(tab); }, 300); sessionStorage.removeItem('openTab'); }
    }catch(e){}
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', mount); } else { mount(); }
})();
