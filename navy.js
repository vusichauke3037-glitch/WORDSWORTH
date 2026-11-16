// ===== GUARD + AUTO-SUSPEND ON EVERY PAGE =====
async function guardPage(minRole, pageName) {
  let user = JSON.parse(localStorage.getItem('makhanani_user') || 'null');
  if (!user) { alert('⛔ Please login first.'); location.href='index.html'; return; }
  // Super Admin BYPASSES everything
  if (user.role === 'Super Admin') return;
  let roles = { 'Teacher':1, 'Librarian':2, 'Principal':3, 'Super Admin':4 };
  let myRole = roles[user.role] || 0;
  if (myRole < minRole) {
    alert('⛔ ACCESS DENIED — Required: ' + pageName + ' or higher.\nYou are: ' + user.role);
    location.href='home.html';
    return;
  }
  // AUTO-SUSPEND CHECK - On every page load, check if school subscription expired
  // If expired, kick to login with message - except Super Admin (already returned above)
  try {
    let schoolId = user.schoolId;
    if (schoolId && schoolId !== 'ALL') {
      let snap = await firebase.database().ref('subscriptions').once('value');
      let subs = Object.entries(snap.val() || {}).map(([id,v])=>({id,...v}));
      let list = subs.filter(s=>s.schoolId===schoolId);
      if (list.length) {
        list.sort((a,b)=>(b.endDate||0)-(a.endDate||0));
        let sub = list[0];
        let now = Date.now();
        let isExpired = sub.endDate < now;
        let isSuspended = !!sub.suspended;
        if (isExpired || isSuspended) {
          // Clear login so they cannot bypass by going back
          localStorage.removeItem('makhanani_user');
          alert('⛔ SUBSCRIPTION ' + (isSuspended?'SUSPENDED':'EXPIRED') + '\n\nSchool: ' + schoolId + '\nPlan: ' + sub.plan + ' — ' + sub.payType + '\nEnded: ' + new Date(sub.endDate).toLocaleDateString('en-ZA') + '\n\nYour school is SUSPENDED until payment.\nContact Super Admin to renew.\n\nYou will be logged out.');
          location.href='index.html';
          return;
        }
        // Warn if expiring in ≤7 days - do NOT block
        let daysLeft = Math.ceil((sub.endDate - now)/(1000*60*60*24));
        if (daysLeft <= 7 && daysLeft >= 0) {
          // Show once per session - not every page
          if (!sessionStorage.getItem('expiryWarnShown')) {
            sessionStorage.setItem('expiryWarnShown','1');
            alert('⚠️ SUBSCRIPTION EXPIRING SOON\n\n' + sub.plan + ' ends in ' + daysLeft + ' days (' + new Date(sub.endDate).toLocaleDateString('en-ZA') + ').\n\nPay now to avoid suspension. Tell your Principal.');
          }
        }
      }
    }
  } catch(e) { console.log('Guard sub check failed', e); }
}
