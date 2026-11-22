// STRICTER VERSION — put in subscription_guard.js, replaces old enforceSubscriptionLock
async function enforceSubscriptionLock(ME, pageName){
  let role = (ME.role||"").toLowerCase();
  // Super Admin + Finance NEVER locked
  if(role.includes("super admin") || role.includes("finance")) return false;
  // Global Admin (schoolId ALL / blank) NEVER locked — can fix all schools
  if(role==="admin" && (!ME.schoolId || ME.schoolId==="ALL")) return false;
  // School Admin (Admin + specific school) IS locked like other school roles
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
