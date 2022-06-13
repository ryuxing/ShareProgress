// Import the functions from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, setPersistence, browserSessionPersistence} from "https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js";
import { getDatabase, ref, set, get, child, onDisconnect, onValue} from "https://www.gstatic.com/firebasejs/9.6.6/firebase-database.js"

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

//Authorization
const auth = getAuth();
const provider = new GoogleAuthProvider();
async function GoogleAuth(){
  if(auth.currentUser != null){
    let userInfo = auth.currentUser;
    return {
      name: userInfo.displayName,
      photoURL: userInfo.photoURL,
      uid : userInfo.uid
    }
  }else{
    try{
      let res = await setPersistence(auth,browserSessionPersistence)
        .then(()=>{return signInWithPopup(auth,provider)});
      console.log(res);
      let userInfo = res.user;
      return {
        name: userInfo.displayName,
        photoURL: userInfo.photoURL,
        uid : userInfo.uid
      }
    }catch(err){
      console.error(err);
      return {}
    }
  
  }
}

//realtime database
const db = getDatabase();
const dbRef = ref(db);
async function getSnapshot(path){
  let value = {};
  try{
    let snapshot = await get(child(dbRef,path));
    if(snapshot.exists()){
      value = snapshot.val();
    }else{
      console.log("There is no value in '"+path+"' .");
    }
  }catch(e){
    console.error(e)
    return {};
  }
  return value;
}
async function trackValue(
  path,
  callback = (s)=>{
    return s.val();
  },
  once=false){
  let value = {};
  try{
    callback(snapshot);
  }catch(e){
    console.error(e)
    return {};
  }
}
function myOnValue(path,callback){
  onValue(ref(db,path),(snapshot)=>{
    const rcv = snapshot.val();
    callback(rcv);
  });
}

async function setData(path,obj){
  set(ref(db,path),obj);
}
function disconnect(path,obj){
  console.log(ref(db,path));
  onDisconnect(ref(db,path)).set(obj);
}

window.Firebase = {
  Auth:{
    auth: auth,
    signIn:GoogleAuth,
    signOut:signOut
  },
  RTDB:{
    get:getSnapshot,
    track:trackValue,
    set:setData,
    onDisconnect:disconnect,
    onValue:myOnValue
    /*update:
  */}
}
