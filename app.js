const KEY="recalldeck-v4";let cards=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem("recalldeck-v3")||localStorage.getItem("recalldeck-v2")||"[]"),queue=[],pos=0,cur=null,rev=false,pending=null,sessions=+localStorage.getItem("recalldeck-sessions")||0;
const $=x=>document.getElementById(x),today=()=>new Date().toISOString().slice(0,10),due=c=>!c.next||c.next<=today(),newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2);
function toast(x){$("toast").textContent=x;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)}
function save(){localStorage.setItem(KEY,JSON.stringify(cards));stats();list()}
function stats(){let r=cards.reduce((a,c)=>a+(c.reviews||0),0),g=cards.reduce((a,c)=>a+(c.good||0),0),m=cards.length?Math.round(cards.reduce((a,c)=>a+Math.min(100,(c.level||0)*20),0)/cards.length):0;$("due").textContent=cards.filter(due).length;$("learned").textContent=cards.filter(c=>(c.level||0)>=4).length;$("accuracy").textContent=r?Math.round(g/r*100)+"%":"0%";$("total").textContent=cards.length;$("reviews").textContent=r;$("important").textContent=cards.filter(c=>c.star).length;$("sessions").textContent=sessions;$("mastery").textContent=m+"%";$("bar").style.width=m+"%"}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function start(){let d=cards.filter(due);if(!d.length){$("studyArea").classList.add("hidden");$("empty").classList.remove("hidden");return}let v=$("limit").value,n=v==="all"?d.length:v==="custom"?Math.max(1,+$("customLimit").value||1):+v;queue=($("random").checked?shuffle(d):d).slice(0,Math.min(n,d.length));pos=0;$("sessionInfo").classList.remove("hidden");next()}
function next(){if(pos>=queue.length){sessions++;localStorage.setItem("recalldeck-sessions",sessions);stats();toast("Session complete 🎉");$("sessionInfo").classList.add("hidden");return}cur=queue[pos];rev=false;$("sessionPos").textContent=(pos+1)+" / "+queue.length;$("sessionMode").textContent=$("random").checked?"🔀 Random":"Sequential";$("front").textContent=cur.q;$("back").textContent=cur.a;$("front").classList.remove("hidden");$("back").classList.add("hidden");$("ratings").classList.add("hidden");$("hint").textContent="Tap to reveal";$("tag").textContent=cur.star?"⭐ IMPORTANT":cur.tag||cur.deck;$("count").textContent=cards.filter(due).length+" due";$("studyArea").classList.remove("hidden");$("empty").classList.add("hidden")}
function days(n){let d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function rate(k){let c=cur;c.reviews=(c.reviews||0)+1;c.good=(c.good||0)+(k==="again"?0:1);c.level=Math.max(0,(c.level||0)+(k==="again"?-1:k==="hard"?0:k==="good"?1:2));c.next=k==="again"?new Date(Date.now()+600000).toISOString().slice(0,16):days({hard:1,good:3,easy:7}[k]);save();pos++;next()}
function add(){let q=$("q").value.trim(),a=$("a").value.trim();if(!q||!a){alert("Enter both question and answer.");return}cards.push({id:newId(),q,a,deck:$("deck").value.trim()||"General",tag:$("tagInput").value.trim(),star:$("star").checked,level:0,reviews:0,good:0,next:today()});$("q").value="";$("a").value="";$("tagInput").value="";$("star").checked=false;save();go("study");toast("Card added")}
function list(){let q=($("search").value||"").toLowerCase(),a=cards.filter(c=>(c.q+" "+c.a+" "+c.deck+" "+c.tag).toLowerCase().includes(q));$("list").innerHTML=a.map(c=>`<div class="listCard"><main><b>${c.star?"⭐ ":""}${esc(c.q)}</b><small>${esc(c.deck)}${c.tag?" • "+esc(c.tag):""} • ${due(c)?"Due now":"Next "+c.next}</small></main><button class="mini" data-s="${c.id}">Study</button><button class="mini" data-x="${c.id}">×</button></div>`).join("");$("none").classList.toggle("hidden",a.length>0);document.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{cur=cards.find(c=>c.id===b.dataset.s);queue=[cur];pos=0;go("study");next()});document.querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>{if(confirm("Delete card?")){cards=cards.filter(c=>c.id!==b.dataset.x);save()}})}
function esc(s){return String(s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]))}
function go(t){document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===t));document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));$(t).classList.remove("hidden");if(t==="cards")list()}
function cleanText(v){
  if(v==null)return "";
  if(typeof v==="string"||typeof v==="number"||typeof v==="boolean")return String(v);
  if(Array.isArray(v))return v.map(cleanText).filter(Boolean).join("\n");
  if(typeof v==="object"){
    return Object.entries(v).map(([k,val])=>`${k}: ${cleanText(val)}`).filter(Boolean).join("\n");
  }
  return String(v);
}
function norm(x){
  if(x==null)return null;
  if(typeof x!=="object")return null;

  // Accept many common flashcard/word-list JSON schemas.
  let q=x.front??x.question??x.prompt??x.word??x.term??x.concept??x.title??x.q??x.english??x.en??x.Word;
  let a=x.back??x.answer??x.meaning??x.definition??x.explanation??x.response??x.a??x.meanings??x.translation??x.translations;

  // Some generated banks store the actual card inside nested fields.
  if((q==null||a==null) && x.card && typeof x.card==="object") return norm({...x.card,deck:x.deck??x.card.deck,tag:x.tag??x.card.tag});
  if((q==null||a==null) && x.flashcard && typeof x.flashcard==="object") return norm({...x.flashcard,deck:x.deck??x.flashcard.deck,tag:x.tag??x.flashcard.tag});

  // Language vocabulary: English/Marathi/Hindi fields become a useful answer.
  if(q==null) q=x.English??x.english_word??x.word_en??x.term_en;
  if(a==null){
    let parts=[];
    for(const [label,key] of [["English", "English"],["Marathi","Marathi"],["Hindi","Hindi"],["Example","example"],["Explanation","explanation"]]){
      if(x[key]!=null) parts.push(label+": "+cleanText(x[key]));
    }
    if(parts.length)a=parts.join("\n");
  }

  if(q==null||a==null){
    // Last-resort: if an object has exactly two meaningful scalar fields,
    // use the first as front and the second as back.
    const vals=Object.entries(x).filter(([k,v])=>!["id","deck","category","tag","topic","important","star","level","reviews","good","next"].includes(k)&&v!=null);
    if(vals.length>=2){q=vals[0][1];a=vals.slice(1).map(([k,v])=>`${k}: ${cleanText(v)}`).join("\n");}
  }

  q=cleanText(q); a=cleanText(a);
  if(!q||!a)return null;
  return {
    id:String(x.id||newId()),q,a,
    deck:String(x.deck??x.category??x.subject??"General"),
    tag:String(x.tag??x.topic??x.tags??""),star:Boolean(x.star??x.important??false),
    level:+x.level||0,reviews:+x.reviews||0,good:+x.good||0,next:x.next||today()
  };
}
function extractItems(raw){
  if(Array.isArray(raw))return raw;
  if(!raw||typeof raw!=="object")return [];
  for(const k of ["cards","flashcards","questions","items","data","words","vocabulary","bank"]){
    if(Array.isArray(raw[k]))return raw[k];
  }
  // Support { "term": {...}, "another term": {...} } style dictionaries.
  const vals=Object.values(raw);
  if(vals.length && vals.every(v=>v&&typeof v==="object"&&!Array.isArray(v)))return vals;
  return [raw];
}
$("limit").onchange=()=>$("customLimit").classList.toggle("hidden",$("limit").value!=="custom");$("startSession").onclick=start;document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>go(b.dataset.tab));$("goAdd").onclick=()=>go("add");$("saveCard").onclick=add;$("search").oninput=list;
$("flash").onclick=()=>{if(!cur)return;rev=!rev;$("front").classList.toggle("hidden",rev);$("back").classList.toggle("hidden",!rev);$("ratings").classList.toggle("hidden",!rev);$("hint").textContent=rev?"Tap to hide":"Tap to reveal"};document.querySelectorAll(".ratings button").forEach(b=>b.onclick=()=>rate(b.dataset.r));
$("exportBtn").onclick=()=>{let b=new Blob([JSON.stringify(cards,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="recalldeck-"+today()+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);$("exportInfo").textContent=cards.length+" cards exported.";toast("JSON backup downloaded")};
$("importFile").onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let raw=JSON.parse(r.result),arr=extractItems(raw);if(!arr.length)throw Error("No card items were found in this JSON.");let valid=arr.map(norm).filter(Boolean);pending=valid;$("importPreview").textContent=`Found ${arr.length} items. Valid flashcards: ${valid.length}. ${arr.length-valid.length} skipped.`;$("importBtn").disabled=!valid.length}catch(e){pending=null;$("importPreview").textContent="Invalid JSON: "+e.message;$("importBtn").disabled=true}};r.readAsText(f)};
$("importBtn").onclick=()=>{if(!pending||!pending.length){toast("No valid flashcards to import. Check the JSON format.");return;}if($("importMode").value==="replace")cards=pending;else{let seen=new Set(cards.map(c=>(c.q+"\n"+c.a).toLowerCase()));let n=0;pending.forEach(c=>{let k=(c.q+"\n"+c.a).toLowerCase();if(!seen.has(k)){seen.add(k);cards.push(c);n++}});toast(n+" new cards imported")}if($("importMode").value==="replace")toast(pending.length+" cards imported");pending=null;$("importFile").value="";$("importBtn").disabled=true;$("importPreview").textContent="No file selected.";save();go("cards")};
stats();list();
