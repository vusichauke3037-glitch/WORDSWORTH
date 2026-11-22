// subscription_guard.js — Lock school activities based on subscription
// Include AFTER firebase scripts, BEFORE page logic
// Usage: <script src="subscription_guard.js"></script>
// Then in onAuthStateChanged: await enforceSubscriptionLock(ME, "books")

async function getSchoolSubscriptionStatus(schoolId){
  if(!schoolId || schoolId==="ALL") return {locked:false, reason:"ALL / Admin school"};
  let snap = await db.ref("subscriptions").once("value");
  let subs = [];
  if(snap.exists()) snap.forEach(c=>subs.push({key:c.key, ...c.val()}));
  // School subscription = subscription where schoolId matches OR schoolName matches
  let mine = subs.filter(s => (s.schoolId===schoolId) || (s.schoolName===schoolId) || (s.school===schoolId));
  // If no subscription record at all for this school -> locked
  if(!mine.length) return {locked:true, reason:"No subscription found for this school", subs:[]};
  // Active = status Active AND renewal not passed
  let today = new Date(); today.setHours(0,0,0,0);
  let active = mine.filter(s=>{
    if(s.status!=="Active") return false;
    if(s.renewal){
      let r = new Date(s.renewal); r.setHours(0,0,0,0);
      if(r < today) return false; // expired
    }
    return true;
  });
  if(active.length) return {locked:false, reason:"Active", subs:active};
  // Has subs but none active
  let paused = mine.find(s=>s.status==="Paused");
  if(paused) return {locked:true, reason:"Subscription Paused", subs:mine};
  let cancelled = mine.find(s=>s.status==="Cancelled");
  if(cancelled) return {locked:true, reason:"Subscription Cancelled", subs:mine};
  let expired = mine.find(s=>s.renewal && new Date(s.renewal) < today);
  if(expired) return {locked:true, reason:"Subscription Expired on "+expired.renewal, subs:mine};
  return {locked:true, reason:"No Active subscription", subs:mine};
}

async function enforceSubscriptionLock(ME, pageName){
  // Finance / Super Admin / Admin NEVER locked — they fix subscriptions
  let role = (ME.role||"").toLowerCase();
  if(role.includes("finance") || role.includes("super admin") || role==="admin") return false;
  // If page is already the locked page / login / subscriptions page, don't loop
  let path = location.pathname.toLowerCase();
  if(path.includes("subscription_locked") || path.includes("login") || path.includes("subscriptions")) return false;
  let check = await getSchoolSubscriptionStatus(ME.schoolId || ME.schoolName);
  if(check.locked){
    sessionStorage.setItem("lockReason", check.reason);
    sessionStorage.setItem("lockSchool", ME.schoolName || ME.schoolId || "");
    sessionStorage.setItem("lockPage", pageName || "");
    location.href = "subscription_locked.html";
    return true;
  }
  return false;
}

// Helper for UI: show banner if locked, but don't redirect (for Finance page)
async function getLockBanner(ME){
  let check = await getSchoolSubscriptionStatus(ME.schoolId);
  return check;
}
