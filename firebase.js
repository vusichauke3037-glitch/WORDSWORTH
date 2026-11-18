<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
<script>
  // MAKHANANI-LTSM — Real Config — V2.24
  const firebaseConfig = {
    apiKey: "AIzaSyDPcF5zaCD6Mp9TfpiMPoc3xG0qSPwO7oA",
    authDomain: "makhanani-ltsm.firebaseapp.com",
    databaseURL: "https://makhanani-ltsm-default-rtdb.firebaseio.com",
    projectId: "makhanani-ltsm",
    storageBucket: "makhanani-ltsm.firebasestorage.app",
    messagingSenderId: "247180363183",
    appId: "1:247180363183:web:4e5a399d4e306192e01b5a",
    measurementId: "G-PEST1XFCR8"
  };
  if(!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.database();
  function getCurrentUser(){
    return new Promise(function(res){
      auth.onAuthStateChanged(function(u){
        if(!u) return res(null);
        db.ref('users/'+u.uid).once('value').then(function(s){
          var d = s.val() || {};
          d.uid = u.uid; d.email = u.email;
          if(!d.classes && d.className) d.classes = d.className.split(',').map(function(x){return x.trim();});
          res(d);
        }).catch(function(){ res({uid:u.uid, email:u.email}); });
      });
    });
  }
</script>
