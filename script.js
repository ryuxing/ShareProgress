authInfo = null;
NO_IMAGE = "";
roomId="testroom"
window.onload = async()=>{
    authInfo = Firebase.Auth.auth.currentUser;
    initAccountStatus("",true);
    document.getElementById("account").addEventListener("click",initAccountStatus);
    window.q = new ProgressQueue(1000);
    document.querySelector("#viewer").src="./pdfjs/web/viewer.html?file=IPSJ-HCI09133009.pdf";
    document.querySelector("#viewer").addEventListener("load",()=>{
        document.querySelector("#viewer").contentDocument.querySelector("#viewerContainer").addEventListener("scroll",(e)=>{
            window.q.set(Math.round((e.target.scrollTop/e.target.scrollHeight)*1000)/10);
            window.q.name = document.querySelector("#viewer").contentWindow.PDFViewerApplication._docFilename;
        });
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
        new ProgressArea(authInfo.uid,{progress:0,file:""});
        Firebase.RTDB.onDisconnect("progress/"+roomId+"/"+authInfo.uid,null);
        Firebase.RTDB.onValue("progress/"+roomId,ProgressArea.receive);
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
    name="";
    last_number=-1;
    interval
    interval_id=0;
    constructor(interval=1000){
        this.interval = interval
    }
    start(){
        this.interval_id = setInterval(this.do.bind(this),this.interval);
    }
    set(num,name="File"){
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
        Firebase.RTDB.set("progress/"+roomId+"/"+authInfo.uid,{progress:this.number,file:this.name});
        console.log("Set.");
    }
    clear(){
        clearInterval(interval_id);
    }
}
function getKeys(obj){
    var list = [];
    for (let key in obj){
        list.push(key);
    }
    return list;
}
class ProgressArea{
    static list={};
    static receive(res){
        var rcvKey = []
        for (let key in res){
            rcvKey.push(key);
        }
        var listkey = [];
        for (let key in ProgressArea.list){
            listkey.push(key);
        }

        console.log({"_/_/":"receive",res:res,rcvKey:rcvKey,listkey:listkey});
        for(let rcv of rcvKey){
            console.log({"_/_/":"loop",rcv:rcv,resrcv:res[rcv]});

            if(listkey.indexOf(rcv)==-1){
                new ProgressArea(rcv,res[rcv]);
                listkey.push(rcv);
            }
            ProgressArea.list[rcv].update(rcv,res[rcv]);

        }
        console.log({"_/_/":"receive",res:res,rcvKey:rcvKey,listkey:listkey});
        let removekey = [];
        for(let l of listkey){
            if(rcvKey.indexOf(l)==-1){
                removekey.push(l);
            }
        }
        console.log({rmvkey:removekey});
        for(let rmv of removekey){
            ProgressArea.list[rmv].remove(rmv);
        }
    }
    elem;
    constructor(uid,obj){
        console.log({"_/_/":"constructor",uid:uid,obj:obj});
        var wrapper = document.createElement("div");
        wrapper.classList.add("member");
        wrapper.classList.add(uid);
        document.querySelector(".progressWrapper").appendChild(wrapper);
        //svg
        var svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
        svg.setAttribute("version","1.1");
        svg.setAttribute("width","40");
        svg.setAttribute("height","40");
        svg.classList.add("icon");
        wrapper.appendChild(svg);
        //.member svg circle
        var circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
        circle.classList.add("ratio");
        circle.setAttribute("width",40);
        circle.setAttribute("height",40);
        circle.setAttribute("r","17.5");
        circle.setAttribute("transform","rotate(-90 20 20)");
        circle.setAttribute("stroke-dashoffset",""+(100 - obj.progress)*1.1);
        svg.appendChild(circle);
        //.member svg image
        var svgimg = document.createElementNS("http://www.w3.org/2000/svg","image");
        svgimg.setAttribute("x","5");
        svgimg.setAttribute("y","5");
        svgimg.setAttribute("width","30");
        svgimg.setAttribute("height","30");
        svgimg.setAttribute("clip-path","url(#round-icon)");
        svgimg.setAttribute("href","");//URL指定
        svg.appendChild(svgimg);
        //.member .option
        var opt  = document.createElement("div");
        opt.classList.add("option");
        wrapper.appendChild(opt);
        //.member .option .progress
        var progressEle  = document.createElement("span");
        progressEle.classList.add("progress");
        progressEle.innerText=obj.progress+"%";
        opt.appendChild(progressEle);
        //.member .option .doc
        var doc =  document.createElement("span");
        doc.classList.add("doc");
        doc.innerText = obj.file;
        opt.appendChild(doc);
        //.member .option .name
        var name =  document.createElement("span");
        name.classList.add("name");
        name.innerText = "";
        opt.appendChild(name);

        //後処理
        this.elem = wrapper;
        ProgressArea.list[uid] = this;
        this.getProfile(uid);

    }
    async getProfile(uid){
        var info = await Firebase.RTDB.get("profile/"+uid);
        console.log(ProgressArea.list);
        var elem = ProgressArea.list[uid].elem;
        //写真
        var svgimg = elem.querySelector("image");
        svgimg.setAttribute("href",info.photoURL);//URL指定
        //名前
        elem.querySelector(".name").innerText = info.name;
    }
    remove(uid){
        ProgressArea.list[uid].elem.remove();
        delete ProgressArea.list[uid];
    }
    update(uid,obj){
        console.log(obj);
        var elem = document.querySelector(".member."+uid);
        var svgprog = elem.querySelector("svg circle");
        var txtprog = elem.querySelector(".option .progress");
        var txtdoc = elem.querySelector(".option .doc");        
        svgprog.setAttribute("stroke-dashoffset",(101-obj.progress)*1.1);
        txtprog.innerText= obj.progress + "%";
        txtdoc.innerText = obj.file;
    }
}