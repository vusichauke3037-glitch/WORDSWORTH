// ===== MAKHANANI LTSM - NAV.JS V3 - TASKBAR + GUARD + AUTO-SUSPEND + GRACE 7 DAYS + DAY 1 ALERT =====
// Settings: Grace 7 days | Day 1 Reminder Only | Auto-Suspend ON | WhatsApp 0780233263 -> 27780233263 | Trial: No Grace
const ADMIN_WHATSAPP = '27780233263'; // 0780233263 - Vusi Chauke - Super Admin
const GRACE_DAYS_DEFAULT = 7;

function getGraceDays(){
  try{
    let s = JSON.parse(localStorage.getItem('makhanani_sub_settings')||'{}');
    return s.graceDays ?? GRACE_DAYS_DEFAULT;
  }catch(e){ return GRACE_DAYS_DEFAULT; }
}
function fmtR(n){ return 'R'+Math.round(n||0).toLocaleString('en-ZA'); }
function toCaps(s){ return String(s||'').trim().toUpperCase(); }

// ===== TASKBAR - Shows On Every Page =====
(function buildTaskbar(){
  let user = null;
  try{ user = JSON.parse(localStorage.getItem('makhanani_user')||'null'); }catch(e){}
  if(!user) return;
  let bar = document.getElementById('taskbar');
  if(!bar) return;
  let name = toCaps(user.name || 'USER');
  let role = toCaps(user.role || '');
  let school = toCaps(user.schoolName || user.schoolId || '');
  let prefix = toCaps(user.prefix || user.schoolId || '');
  let btn = (label, href) => `<button onclick="location.href='${href}'" style="background:#d4af37;color:#0a1f4d;border:none;border-radius:6px;padding:8px 10px;font-weight:900;cursor:pointer;font-size:12px">${label}</button>`;
  let btnWhite = (label, href) => `<button onclick="location.href='${href}'" style="background:#fff;color:#0a1f4d;border:none;border-radius:6px;padding:8px 10px;font-weight:900;cursor:pointer;font-size:12px">${label}</button>`;
  let btnRed = (label, href) => `<button onclick="location.href='${href}'" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:8px 10px;font-weight:900;cursor:pointer;font-size:12px">${label}</button>`;
  let html = `<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;align-items:center;margin-top:10px;padding:8px;background:rgba(255,255,255,.1);border-radius:8px;font-size:12px">`;
  html += `<span style="font-weight:900">👤 ${name} • ${role} • ${school} (${prefix})</span>`;
  html += btn('🏠 HOME','home.html');
  if(role==='SUPER ADMIN'){
    html += btn('👑 SUPER ADMIN','super-admin.html');
    html += btn('🏫 SCHOOLS','schools.html');
    html += btn('👥 USERS','users.html');
    html += btn('💰 SUBSCRIPTIONS','subscriptions.html');
    html += btn('💰 PRICING','pricing.html');
    html += btn('📚 SUBJECTS','subjects.html');
    html += btn('📖 BOOKS','books.html');
    html += btn('📦 STOCK','stock.html');
    html += btn('🧾 ORDERS','orders.html');
    html += btn('📊 REPORTS','reports.html');
  } else if(role==='PRINCIPAL'){
    html += btn('👑 PRINCIPAL','principal.html');
    html += btn('👥 TEACHERS','users.html');
    html += btn('📚 SUBJECTS','subjects.html');
    html += btn('📖 BOOKS','books.html');
    html += btn('📦 STOCK','stock.html');
    html += btn('🧾 ORDERS','orders.html');
    html += btn('📊 REPORTS','reports.html');
  } else if(role==='LIBRARIAN'){
    html += btn('📚 LIBRARIAN','librarian.html');
    html += btn('📖 BOOKS','books.html');
    html += btn('📦 STOCK','stock.html');
    html += btn('🧾 ORDERS','orders.html');
  } else {
    html += btn('👨‍🏫 TEACHER','teacher.html');
    html += btn('📖 BOOKS','books.html');
    html += btn('📦 STOCK','stock.html');
    html += btn('🧾 ORDERS','orders.html');
  }
  html += btnWhite('📚 CATALOGUE','catalogue.html');
  html += btnRed('🚪 LOGOUT','index.html');
  html += `</div>`;
  bar.innerHTML = html;
  // Logout button needs to clear user - fix it
  let logoutBtn = bar.querySelector('button:last-child');
  if(logoutBtn){
    logoutBtn.onclick = function(){
      if(confirm('Logout?')){
        localStorage.removeItem('makhanani_user');
        sessionStorage.removeItem('expiryWarnShown');
        location.href='index.html';
      }
    };
  }
})();

// ===== SAVE GRACE DAY 1 ALERT FOR SUPER ADMIN =====
async function saveGraceDay1Alert(sub, user, graceEnd){
  try{
    let owe = Math.max(0, ((sub.setupDue||0)-(sub.setupPaid||0)) + ((sub.subDue||0)-(sub.subPaid||0)));
    await firebase.database().ref('graceAlerts').push().set({
      schoolId: sub.schoolId,
      schoolName: sub.schoolName || sub.schoolId,
      plan: sub.plan,
      payType: sub.payType,
      endDate: sub.endDate,
      graceEnds: graceEnd,
      amountOwe: owe,
      contact: sub.contact || '',
      phone: sub.phone || '',
      triggeredBy: (user && (user.email || user.name)) || '',
      createdAt: Date.now(),
      dateStr: new Date().toLocaleDateString('en-ZA'),
      seen: false
    });
  }catch(e){ console.log('Grace alert save failed', e); }
}

// ===== GUARD + AUTO-SUSPEND + GRACE 7 DAYS + DAY 1 REMINDER =====
// Usage on every page: <script>guardPage(4,'Subscriptions');</script>
// Roles: Teacher=1, Librarian=2, Principal=3, Super Admin=4
async function guardPage(minRole, pageName){
  let user = null;
  try{ user = JSON.parse(localStorage.getItem('makhanani_user')||'null'); }catch(e){}
  if(!user){
    alert('⛔ Please login first.');
    location.href='index.html';
    return;
  }
  // Super Admin BYPASSES everything - role + subscription
  if(user.role==='Super Admin') return;

  let roles = { 'Teacher':1, 'Librarian':2, 'Principal':3, 'Super Admin':4 };
  let myRole = roles[user.role] || 0;
  if(myRole < minRole){
    alert('⛔ ACCESS DENIED — Required: ' + pageName + ' or higher.\nYou are: ' + user.role);
    location.href='home.html';
    return;
  }

  // ===== AUTO-SUSPEND CHECK - On every page load =====
  try{
    let schoolId = user.schoolId;
    if(schoolId && schoolId!=='ALL'){
      let snap = await firebase.database().ref('subscriptions').once('value');
      let subs = Object.entries(snap.val()||{}).map(([id,v])=>({id,...v}));
      let list = subs.filter(s=>s.schoolId===schoolId);
      if(list.length){
        list.sort((a,b)=>(b.endDate||0)-(a.endDate||0));
        let sub = list[0];
        let now = Date.now();
        let graceDays = getGraceDays(); // 7 days
        let graceEnd = sub.endDate + (graceDays*24*60*60*1000);
        let isTrial = sub.plan==='DEMO' || sub.payType==='Trial';
        // Trial: NO grace - expired = blocked immediately
        // Paid: Grace 7 days - expired only after Grace Ends
        let isExpired = isTrial ? (sub.endDate < now) : (graceEnd < now);
        let isSuspended = !!sub.suspended;
        let autoSuspendOn = true;
        try{ autoSuspendOn = JSON.parse(localStorage.getItem('makhanani_sub_settings')||'{}').autoSuspend ?? true; }catch(e){}

        if((isExpired || isSuspended) && autoSuspendOn){
          // Clear login so they cannot bypass by going back
          localStorage.removeItem('makhanani_user');
          alert('⛔ SUBSCRIPTION ' + (isSuspended?'SUSPENDED':'EXPIRED') + '\n\nSchool: ' + schoolId + '\nPlan: ' + sub.plan + ' — ' + sub.payType + '\nEnded: ' + new Date(sub.endDate).toLocaleDateString('en-ZA') + (isTrial ? '' : '\nGrace Ended: ' + new Date(graceEnd).toLocaleDateString('en-ZA')) + '\n\nYour school is SUSPENDED until payment.\nContact Super Admin (0780233263) to renew.\n\nYou will be logged out.');
          location.href='index.html';
          return;
        }

        // ===== GRACE DAY 1 REMINDER ONLY =====
        if(!isTrial && sub.endDate < now && now <= graceEnd){
          let daysSinceEnd = Math.floor((now - sub.endDate)/(1000*60*60*24)) + 1; // 1 = Day 1
          if(daysSinceEnd === 1){
            let key = 'graceDay1_'+schoolId+'_'+new Date().toDateString();
            if(!sessionStorage.getItem(key)){
              sessionStorage.setItem(key,'1');
              let owe = Math.max(0, ((sub.setupDue||0)-(sub.setupPaid||0)) + ((sub.subDue||0)-(sub.subPaid||0)));
              // Save alert for Super Admin
              await saveGraceDay1Alert(sub, user, graceEnd);
              alert('🟡 GRACE DAY 1 REMINDER\n\nYour '+sub.plan+' subscription expired yesterday ('+new Date(sub.endDate).toLocaleDateString('en-ZA')+').\n\nYou have '+graceDays+' days grace left to pay.\nGrace Ends: '+new Date(graceEnd).toLocaleDateString('en-ZA')+'\nAmount Owe: '+fmtR(owe)+'\n\nSuper Admin (0780233263) has been notified.\nPlease pay today to avoid suspension on '+new Date(graceEnd).toLocaleDateString('en-ZA')+'.');
            }
          }
          // Day 2-7: No alert - quiet - do NOT spam user
        }

        // ===== EXPIRING SOON WARNING - ≤7 days left, once per session =====
        if(!isTrial && sub.endDate >= now){
          let daysLeft = Math.ceil((sub.endDate - now)/(1000*60*60*24));
          if(daysLeft <= 7 && daysLeft >= 0){
            if(!sessionStorage.getItem('expiryWarnShown')){
              sessionStorage.setItem('expiryWarnShown','1');
              alert('⚠️ SUBSCRIPTION EXPIRING SOON\n\n' + sub.plan + ' ends in ' + daysLeft + ' days (' + new Date(sub.endDate).toLocaleDateString('en-ZA') + ').\nGrace after expiry: ' + graceDays + ' days.\n\nPay now to avoid suspension. Tell your Principal. Contact: 0780233263');
            }
          }
        }

        // ===== TRIAL EXPIRING WARNING - ≤3 days left =====
        if(isTrial && sub.endDate >= now){
          let daysLeft = Math.ceil((sub.endDate - now)/(1000*60*60*24));
          if(daysLeft <= 3 && daysLeft >= 0){
            if(!sessionStorage.getItem('trialWarnShown')){
              sessionStorage.setItem('trialWarnShown','1');
              alert('🆓 TRIAL ENDING SOON\n\nYour DEMO trial ends in ' + daysLeft + ' days (' + new Date(sub.endDate).toLocaleDateString('en-ZA') + ').\nTrial has NO grace - it will block on expiry.\n\nUpgrade to STANDARD / PREMIUM now. Contact: 0780233263');
            }
          }
        }
      }
    }
  }catch(e){ console.log('Guard sub check failed', e); }
}

// ===== HELPER: Logout from any page =====
function doLogout(){
  if(confirm('Logout?')){
    localStorage.removeItem('makhanani_user');
    sessionStorage.removeItem('expiryWarnShown');
    sessionStorage.removeItem('trialWarnShown');
    location.href='index.html';
  }
}
