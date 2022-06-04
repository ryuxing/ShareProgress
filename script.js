authInfo = null;
NO_IMAGE = "";
window.onload = async()=>{
    authInfo = Firebase.Auth.auth.currentUser;
    initAccountStatus("",true);
    document.getElementById("account").addEventListener("click",initAccountStatus);
    window.q = new ProgressQueue(1000);
    document.querySelector("iframe").contentDocument.querySelector("#viewerContainer").addEventListener("scroll",(e)=>{
        //console.warn({_scroll:e.target.scrollTop,_height:e.target. scrollHeight,ratio :Math.round((e.target.scrollTop/e.target.scrollHeight)*1000)/10});
        window.q.set(Math.round((e.target.scrollTop/e.target.scrollHeight)*1000)/10);
    });
}
function onScrollPdfViewer(e){
    
}
async function initAccountStatus(elem, onlyDisplay){
    if(Firebase.Auth.auth.currentUser==null){
        //サインイン
        if(!onlyDisplay)authInfo = await Firebase.Auth.signIn();
        //エラー発生時は何もしない
        if(authInfo ==null){return;}
        //ログイン情報を表示
        document.querySelector("#account div").style.backgroundImage = `url("${authInfo.photoURL}")`;
        document.querySelector("#account span").innerText = authInfo.name;

        document.getElementById("join").addEventListener("click",joinRoom);
        let digits = 36 ** 5;
        peerId = authInfo.uid + "-"+ (new Date().getTime()).toString(36)+ (Math.floor(Math.random())*digits).toString(36);
        let profile = await Firebase.RTDB.get("profile/"+authInfo.uid);
        console.log(!("name" in profile));
        if(!("name" in profile)){
            profile = authInfo;
        }
        console.log(authInfo);
        console.log(profile);
        document.getElementById("input-name").value = profile.name;
        console.log(`[type=radio][value=${authInfo.color}]`);
        document.querySelector(`[type=radio][value=${profile.color}]`).checked=true;

        console.log(profile);

        //RTDBで進捗共有
        q.start();
        Firebase.RTDB.onDisconnect("progress/"+authInfo.uid,null);
    }else{
        await Firebase.Auth.signOut(Firebase.Auth.auth);
        document.querySelector("#account div").style.backgroundImage = `url("${NO_IMAGE}")`;
        document.querySelector("#account span").innerText = "ログイン";
        document.getElementById("join").removeEventListener("click",joinRoom);
        if(window.peer != undefined){
            peer.destroy();
            delete peer;
        }
        authInfo = null;
        q.clear();
    }
}
function joinRoom(){}

 class ProgressQueue{
    number;
    last_number=-1;
    interval
    interval_id=0;
    constructor(interval=1000){
        this.interval = interval
    }
    start(){
        this.interval_id = setInterval(this.do.bind(this),this.interval);
    }
    set(num){
        this.number=num;
    }
    do(){
        console.log({auth:(authInfo==null),continue:(this.number == this.last_number),num:this.number,num_last:this.last_number});
        if(authInfo==null){
            this.clear();
            return;
        }
        if(this.number == this.last_number){return;}
        this.last_number = this.number;
        Firebase.RTDB.set("progress/"+authInfo.uid,this.number);
        console.log("Set.");
    }
    clear(){
        clearInterval(interval_id);
    }
}