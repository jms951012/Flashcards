const KEY="recalldeck-v4";let cards=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem("recalldeck-v3")||localStorage.getItem("recalldeck-v2")||"[]"),queue=[],pos=0,cur=null,rev=false,pending=null,sessions=+localStorage.getItem("recalldeck-sessions")||0;
const $=x=>document.getElementById(x),today=()=>new Date().toISOString().slice(0,10),due=c=>!c.next||c.next<=today(),newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2);
function toast(x){$("toast").textContent=x;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)}
function save(){localStorage.setItem(KEY,JSON.stringify(cards));stats();list()}
function stats(){let r=cards.reduce((a,c)=>a+(c.reviews||0),0),g=cards.reduce((a,c)=>a+(c.good||0),0),m=cards.length?Math.round(cards.reduce((a,c)=>a+Math.min(100,(c.level||0)*20),0)/cards.length):0;$("due").textContent=cards.filter(due).length;$("learned").textContent=cards.filter(c=>(c.level||0)>=4).length;$("accuracy").textContent=r?Math.round(g/r*100)+"%":"0%";$("total").textContent=cards.length;$("reviews").textContent=r;$("important").textContent=cards.filter(c=>c.star).length;$("sessions").textContent=sessions;$("mastery").textContent=m+"%";$("bar").style.width=m+"%"}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function start(){let d=cards.filter(due);if(!d.length){$("studyArea").classList.add("hidden");$("empty").classList.remove("hidden");return}let v=$("limit").value,n=v==="all"?d.length:v==="custom"?Math.max(1,+$("customLimit").value||1):+v;queue=($("random").checked?shuffle(d):d).slice(0,Math.min(n,d.length));pos=0;next()}
function next(){
  if(pos>=queue.length){
    sessions++;localStorage.setItem("recalldeck-sessions",sessions);stats();
    $("studyArea").classList.add("hidden");
    $("empty").classList.remove("hidden");
    $("empty").innerHTML="<h2>Session complete 🎉</h2><p>You finished "+queue.length+" cards.</p>";
    return;
  }
  cur=queue[pos];rev=false;
  $("sessionPos").textContent=(pos+1)+" / "+queue.length;
  $("sessionMode").textContent=$("random").checked?"🔀 Random":"Sequential";
  $("front").textContent=cur.q;
  $("back").textContent=cleanMeaning(cur);
  $("front").classList.remove("hidden");$("back").classList.add("hidden");
  $("studyArea").classList.remove("hidden");$("empty").classList.add("hidden");
  $("prevCard").disabled=pos===0;
}
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
function cleanMeaning(c){
  if(c.lang && typeof c.lang==="object"){
    const parts=[];
    if(c.lang.english) parts.push("English: "+c.lang.english);
    if(c.lang.marathi) parts.push("Marathi: "+c.lang.marathi);
    if(c.lang.hindi) parts.push("Hindi: "+c.lang.hindi);
    if(parts.length) return parts.join("\n");
  }
  let s=String(c.a||"");
  s=s.replace(/(?:^|\n)\s*(?:tags?|deck|category)\s*:.*$/ig,"").trim();
  s=s.replace(/(?:^|\s)easy[_ ]english\s*:/ig,"\nEnglish: ")
       .replace(/(?:^|\s)english(?: meaning)?\s*:/ig,"\nEnglish: ")
       .replace(/(?:^|\s)marathi\s*:/ig,"\nMarathi: ")
       .replace(/(?:^|\s)hindi\s*:/ig,"\nHindi: ");
  return s.replace(/^\s+/,"").replace(/\n{2,}/g,"\n").trim();
}
function norm(x){
  if(!x || typeof x!=="object" || Array.isArray(x)) return null;

  let q=x.front??x.question??x.prompt??x.word??x.term??x.concept??x.title??x.q??x.Word??x.English??x.english_word??x.word_en??x.term_en;
  let english=x.easy_english??x.easyEnglish??x.EnglishMeaning??x.english_meaning??x.englishMeaning??x.english_definition??x.englishDefinition;
  let marathi=x.marathi??x.Marathi??x.marathi_meaning??x.marathiMeaning;
  let hindi=x.hindi??x.Hindi??x.hindi_meaning??x.hindiMeaning;
  let a=x.back??x.answer??x.meaning??x.definition??x.explanation??x.response??x.a;

  if((q==null || (a==null && english==null && marathi==null && hindi==null)) && x.card && typeof x.card==="object"){
    return norm({...x.card,deck:x.deck??x.card.deck,tag:x.tag??x.card.tag});
  }
  if((q==null || (a==null && english==null && marathi==null && hindi==null)) && x.flashcard && typeof x.flashcard==="object"){
    return norm({...x.flashcard,deck:x.deck??x.flashcard.deck,tag:x.tag??x.flashcard.tag});
  }

  const lang={};
  if(english!=null) lang.english=cleanText(english);
  if(marathi!=null) lang.marathi=cleanText(marathi);
  if(hindi!=null) lang.hindi=cleanText(hindi);

  if(q==null || (a==null && !Object.keys(lang).length)){
    const vals=Object.entries(x).filter(([k,v])=>{
      const lk=k.toLowerCase();
      return v!=null && !["id","deck","category","subject","tag","tags","topic","important","star","level","reviews","good","next","easy_english","easyenglish","marathi","hindi"].includes(lk);
    });
    if(q==null && vals.length) q=vals[0][1];
    if(a==null && vals.length>=2) a=vals.slice(1).map(([k,v])=>`${k}: ${cleanText(v)}`).join("\n");
  }

  q=cleanText(q).trim();
  if(Object.keys(lang).length){
    a=Object.entries(lang).map(([k,v])=>`${k==="english"?"English":k==="marathi"?"Marathi":"Hindi"}: ${v}`).join("\n");
  }else{
    a=cleanText(a).trim();
  }
  if(!q || !a) return null;

  return {
    id:String(x.id||newId()), q:q, a:a,
    lang:Object.keys(lang).length?lang:null,
    deck:String(x.deck??x.category??x.subject??"General"),
    tag:String(x.tag??x.topic??x.tags??""),
    star:Boolean(x.star??x.important??false),
    level:+x.level||0, reviews:+x.reviews||0, good:+x.good||0,
    next:x.next||today()
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
const vocabFlash=document.querySelector(".vocabFlash");
if(vocabFlash){
  vocabFlash.onclick=()=>{
    if(!cur)return;
    rev=!rev;
    $("front").classList.toggle("hidden",rev);
    $("back").classList.toggle("hidden",!rev);
  };
}
$("prevCard").onclick=()=>{
  if(pos>0){pos--;next();}
};
$("nextCard").onclick=()=>{
  if(pos<queue.length-1){pos++;next();}
  else{pos=queue.length;next();}
};
$("exportBtn").onclick=()=>{let b=new Blob([JSON.stringify(cards,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="recalldeck-"+today()+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);$("exportInfo").textContent=cards.length+" cards exported.";toast("JSON backup downloaded")};
$("importFile").addEventListener("change",e=>{
  const f=e.target.files && e.target.files[0];
  if(!f){
    $("importPreview").textContent="No file selected.";
    $("importBtn").disabled=true;
    return;
  }
  $("importPreview").textContent="Reading "+f.name+"…";
  const r=new FileReader();
  r.onload=()=>{
    try{
      const raw=JSON.parse(String(r.result));
      const arr=extractItems(raw);
      if(!arr.length) throw Error("No card items were found in this JSON.");
      const valid=arr.map(norm).filter(Boolean);
      pending=valid;
      $("importPreview").textContent=`Selected: ${f.name}\nFound ${arr.length} items. Valid flashcards: ${valid.length}. ${arr.length-valid.length} skipped.`;
      $("importBtn").disabled=!valid.length;
      if(valid.length) toast(valid.length+" cards ready to import");
    }catch(e){
      pending=null;
      $("importPreview").textContent="Invalid JSON: "+e.message;
      $("importBtn").disabled=true;
    }
  };
  r.onerror=()=>{
    pending=null;
    $("importPreview").textContent="Could not read this file. Please try again.";
    $("importBtn").disabled=true;
  };
  r.readAsText(f);
});
$("importBtn").onclick=()=>{if(!pending||!pending.length){toast("No valid flashcards to import. Check the JSON format.");return;}if($("importMode").value==="replace")cards=pending;else{let seen=new Set(cards.map(c=>(c.q+"\n"+c.a).toLowerCase()));let n=0;pending.forEach(c=>{let k=(c.q+"\n"+c.a).toLowerCase();if(!seen.has(k)){seen.add(k);cards.push(c);n++}});toast(n+" new cards imported")}if($("importMode").value==="replace")toast(pending.length+" cards imported");pending=null;$("importFile").value="";$("importBtn").disabled=true;$("importPreview").textContent="No file selected.";save();go("cards")};
stats();list();
