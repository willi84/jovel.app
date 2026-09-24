
const FILES=["events","ideas","projects","links","skills","rooms"]; let DB={}, floorSVG="";
const $=s=>document.querySelector(s), esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const norm=s=>String(s??"").toLocaleLowerCase("de"); const hay=o=>norm(JSON.stringify(o));
const PAGES=[["home","🏠 Start"],["events","🗓️ Ablauf"],["ideas","💡 Ideen"],["projects","🚀 Projekte"],["skills","🧑‍💻 Skills"],["links","🔗 Links"],["rooms","🗺️ Räume"],["teams","👥 Teams"]];
const params=()=>new URLSearchParams(location.search), page=()=>params().get("page")||"home";
function setUrl(o={}){let p=params();Object.entries(o).forEach(([k,v])=>v==null?p.delete(k):p.set(k,v));history.pushState({},"","?"+p);render()}
async function share(o){let u=new URL(location.href);Object.entries(o).forEach(([k,v])=>u.searchParams.set(k,v));try{await navigator.share({title:"jovel.app",url:u.href})}catch{await navigator.clipboard.writeText(u.href);alert("🔗 Share-Link kopiert")}}
function hi(t,q){let s=esc(t);if(!q)return s;let x=esc(q).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return s.replace(new RegExp(`(${x})`,"ig"),"<mark>$1</mark>")}
function card(t,b="",m="",q=""){return `<article class="card"><h3>${hi(t,q)}</h3>${m?`<div class=meta>${hi(m,q)}</div>`:""}${b}</article>`}
function nav(){$("#nav").innerHTML=PAGES.map(([id,t])=>`<button class="${page()==id?"active":""}" data-page="${id}">${t}</button>`).join("");document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>setUrl({page:b.dataset.page,room:null,team:null}))}
function list(title,a,fmt,q){let x=q?a.filter(v=>hay(v).includes(norm(q))):a;return `<div class=sectionhead><h1>${title}</h1><span class=meta>${x.length}</span></div><div class=grid>${x.map(v=>fmt(v,q)).join("")||"<div class=empty>🤷 Nichts gefunden.</div>"}</div>`}
function home(){return `<section class=hero><h1>Jovel durch den<br>MÜNSTERHACK. 🎉</h1><p>Alles Wichtige schnell finden – und dank gecachter JSON-Daten auch offline. Suche nach Team oder Raum und der passende Bereich wird direkt auf dem Plan markiert. 🗺️</p></section><div class=grid>${[["🗓️ Ablauf",DB.events.events.length,"events"],["💡 Ideen",DB.ideas.ideas.length,"ideas"],["🚀 Projekte",DB.projects.projects.length,"projects"],["🧑‍💻 Skills",DB.skills.participants.length,"skills"],["🔗 Links",DB.links.links.length,"links"],["🗺️ Räume",DB.rooms.rooms.length,"rooms"]].map(x=>`<article class=card><h2>${x[0]}</h2><p>${x[1]} Einträge</p><button class=small onclick="setUrl({page:'${x[2]}'})">Öffnen →</button></article>`).join("")}</div>`}

function eventStart(e){return new Date(`${e.date}T${e.start}:00+02:00`)}
function eventEnd(e,next){
 if(e.end)return new Date(`${e.date}T${e.end}:00+02:00`);
 if(next&&next.date===e.date)return eventStart(next);
 return new Date(`${e.date}T23:59:59+02:00`)
}
function renderTimetable(q=""){
 const all=DB.events.events.filter(e=>!q||hay(e).includes(norm(q)));
 const now=new Date(), sorted=[...DB.events.events].sort((a,b)=>eventStart(a)-eventStart(b));
 let current=null,next=null;
 for(let i=0;i<sorted.length;i++){
   const e=sorted[i], end=eventEnd(e,sorted[i+1]);
   if(now>=eventStart(e)&&now<end) current=e;
   if(eventStart(e)>now&&!next) next=e;
 }
 const days=[...new Set(all.map(e=>e.date))];
 const status=current?`🟢 Jetzt: <b>${esc(current.title)}</b> · seit ${current.start} Uhr`
   :next?`⏭️ Als Nächstes: <b>${esc(next.title)}</b> · ${esc(next.day)} ${next.start} Uhr`
   :`🏁 Der Zeitplan ist beendet.`;
 return `<div class=sectionhead><h1>🗓️ Timetable</h1><span class=meta>${all.length} Termine</span></div>
 <div class="nowbar">${status}<span id=liveClock></span></div>
 <div class=timetable>${days.map(d=>{let es=all.filter(e=>e.date===d);return `<section class=day><h2>${esc(es[0]?.day||d)} <small>${d.split("-").reverse().join(".")}</small></h2><div class=timeline>${es.map((e,i)=>{let isNow=current===e,isPast=eventEnd(e,sorted[sorted.indexOf(e)+1])<=now;return `<article class="slot ${isNow?"current":isPast?"past":""}"><div class=time>${e.start}${e.end?`<small>–${e.end}</small>`:""}</div><div class=dot></div><div class=slotbody><h3>${isNow?"▶️ ":""}${hi(e.title,q)}</h3>${e.description?`<p>${hi(e.description,q)}</p>`:""}${e.location?`<p class=meta>📍 ${hi(e.location.name,q)}${e.location.address?" · "+hi(e.location.address,q):""}</p>`:""}${e.locations?`<p class=meta>📍 ${e.locations.map(x=>hi(x.name,q)).join(" · ")}</p>`:""}${e.topics?(e.topics||[]).map(t=>`<span class=pill>${hi(t,q)}</span>`).join(""):""}</div></article>`}).join("")}</div></section>`}).join("")}</div>`
}
const views={
 events:q=>renderTimetable(q),
 ideas:q=>list("💡 Ideen",DB.ideas.ideas,(x,q)=>card(x.firstName,`<p>${hi(x.idea,q)}</p>`,x.alias||"",q),q),
 projects:q=>list("🚀 Projekte",DB.projects.projects,(x,q)=>card(x.title,`<p>${hi(x.description,q)}</p>${(x.tags||[]).map(t=>`<span class=pill>${hi(t,q)}</span>`).join("")}${x.url?`<p><a target=_blank rel=noopener href="${esc(x.url)}">Projekt öffnen ↗</a></p>`:""}`,x.year,q),q),
 skills:q=>list("🧑‍💻 Skills",DB.skills.participants,(x,q)=>card(x.firstName,(x.skills||[]).length?(x.skills||[]).map(s=>`<span class=pill>${hi(s,q)}</span>`).join(""):"<span class=meta>Keine Skills hinterlegt.</span>","",q),q),
 links:q=>list("🔗 Links",DB.links.links,(x,q)=>card(x.title,`<p><a target=_blank rel=noopener href="${esc(x.url)}">${hi(x.url,q)} ↗</a></p>`,x.category||"",q),q)
};

function resultCard(kind,title,body="",meta="",q=""){
 const labels={events:"🗓️ Ablauf",ideas:"💡 Idee 2026",projects:"🏛️ Altes Projekt",skills:"🧑‍💻 Person / Skill",links:"🔗 Link",rooms:"🗺️ Raum",facility:"📍 Infrastruktur"};
 return `<article class="card result-card type-${kind}"><div class="result-kind">${labels[kind]||kind}</div><h3>${hi(title,q)}</h3>${meta?`<div class=meta>${hi(meta,q)}</div>`:""}${body}</article>`
}
function matchedFacilities(q){
 if(!q)return [];
 return (DB.rooms.facilities||[]).filter(f=>hay(f).includes(norm(q)))
}
function markFacilities(items){
 requestAnimationFrame(()=>{
   const map=document.querySelector(".mapwrap svg"); if(!map)return;
   map.querySelectorAll(".facility-hit").forEach(x=>x.classList.remove("facility-hit"));
   items.flatMap(f=>f.svgIds||[]).forEach(id=>{let e=map.querySelector(`#${CSS.escape(id)}`);if(e)e.classList.add("facility-hit")});
 })
}
function matchedRooms(q){if(!q)return [];return DB.rooms.rooms.filter(r=>hay(r).includes(norm(q))).map(r=>r.id)}
function markRooms(ids){requestAnimationFrame(()=>{const map=document.querySelector(".mapwrap svg");if(!map)return;const rooms=[...map.querySelectorAll("[id^='ROOM_']")];map.classList.toggle("has-room-hit",ids.length>0);rooms.forEach(x=>x.classList.remove("room-hit"));ids.forEach(id=>{let e=map.querySelector(`#${CSS.escape(id)}`);if(e)e.classList.add("room-hit")})})}
function rooms(q){
 let selected=params().get("room"), team=params().get("team");let hits=matchedRooms(q);
 if(team){let r=DB.rooms.rooms.find(x=>norm(x.team)==norm(team));if(r)hits.push(r.id)}
 if(selected)hits.push(selected); hits=[...new Set(hits)];
 let rs=q?DB.rooms.rooms.filter(r=>hay(r).includes(norm(q))):DB.rooms.rooms; let facilities=matchedFacilities(q); markRooms(hits);
 setTimeout(()=>markFacilities(facilities),0);
 return `<div class=sectionhead><h1>🗺️ Räume</h1><span class=meta>${rs.length}</span></div><div class=mapwrap>${floorSVG}</div>${facilities.length?`<h2>📍 Infrastruktur</h2><div class=grid>${facilities.map(f=>resultCard("facility",`${f.emoji} ${f.label}`,`<p>Auf dem Raumplan gefunden.</p>`,"",q)).join("")}</div>`:""}<div class="grid roomlist">${rs.map(r=>`<article class="card room ${hits.includes(r.id)?"selected":""}"><h3>${hi(r.name,q)}</h3><div class=meta>${r.id}</div><p>${r.team?`👥 <b>${hi(r.team,q)}</b> <span class=meta>(fiktiv)</span>`:"Noch kein Beispiel-Team"}</p><div class=actions><button class=small onclick="setUrl({page:'rooms',room:'${r.id}',team:${r.team?`'${esc(r.team)}'`:"null"}})">📍 Markieren</button><button class=small onclick="share({page:'rooms',room:'${r.id}'})">🔗 Teilen</button></div></article>`).join("")}</div>`
}
function teams(q){let a=DB.rooms.rooms.filter(r=>r.team).map(r=>({team:r.team,room:r.id,name:r.name}));return list("👥 Teams · fiktive Beispiele",a,(x,q)=>`<article class=card><h3>${hi(x.team,q)}</h3><p>📍 ${hi(x.name,q)} · <span class=meta>${x.room}</span></p><div class=actions><button class=small onclick="setUrl({page:'rooms',room:'${x.room}',team:'${esc(x.team)}'})">🗺️ Auf Karte</button><button class=small onclick="share({page:'teams',team:'${esc(x.team)}'})">🔗 Teilen</button></div></article>`,q)}
function search(q){
 const facilities=matchedFacilities(q);
 const teamRooms=DB.rooms.rooms.filter(r=>hay(r).includes(norm(q)));
 const roomIds=teamRooms.map(r=>r.id).concat(facilities.flatMap(f=>f.roomIds||[]));
 markRooms([...new Set(roomIds)]); setTimeout(()=>markFacilities(facilities),0);

 const groups=[
  ["events",DB.events.events,"events",x=>x.title,x=>`${x.day||""} ${x.start||""}`],
  ["ideas",DB.ideas.ideas,"ideas",x=>x.firstName,x=>"MÜNSTERHACK 2026"],
  ["projects",DB.projects.projects,"projects",x=>x.title,x=>`MÜNSTERHACK ${x.year} · historisches Projekt`],
  ["skills",DB.skills.participants,"skills",x=>x.firstName,x=>"Teilnehmende 2026"],
  ["links",DB.links.links,"links",x=>x.title,x=>x.category||"Link"]
 ];
 let out=[];
 groups.forEach(([kind,a,p,t,m])=>a.filter(x=>hay(x).includes(norm(q))).slice(0,12).forEach(x=>out.push({kind,p,title:t(x),meta:m(x),x})));
 const mapHits=teamRooms.length||facilities.length;
 return `<div class=sectionhead><h1>🔎 Suche</h1><span class=meta>${out.length+teamRooms.length+facilities.length} Treffer</span></div>
 ${mapHits?`<div class=mapwrap>${floorSVG}</div>`:""}
 ${(teamRooms.length||facilities.length)?`<h2>🗺️ Räume & Infrastruktur</h2><div class=grid>
 ${teamRooms.map(r=>resultCard("rooms",r.team||r.name,`<p>📍 ${hi(r.name,q)} · ${r.id}</p><button class=small onclick="setUrl({page:'rooms',room:'${r.id}',team:${r.team?`'${esc(r.team)}'`:"null"}})">Auf Karte zeigen</button>`,"",q)).join("")}
 ${facilities.map(f=>resultCard("facility",`${f.emoji} ${f.label}`,`<p>Auf dem Raumplan markiert.</p>`,"",q)).join("")}</div>`:""}
 ${out.length?`<h2>Weitere Treffer</h2>`:""}<div class=grid>${out.map(o=>{
   let body=o.kind==="projects"?`<p>${hi(o.x.description||"",q)}</p>${(o.x.tags||[]).map(t=>`<span class=pill>${hi(t,q)}</span>`).join("")}`:
            o.kind==="ideas"?`<p>${hi(o.x.idea||"",q)}</p>`:
            o.kind==="events"?`<p>${hi(o.x.description||"",q)}</p>`:
            o.kind==="links"?`<p>${hi(o.x.url||"",q)}</p>`:
            `<p>${(o.x.skills||[]).map(s=>hi(s,q)).join(", ")||"Teilnehmende:r"}</p>`;
   return resultCard(o.kind,o.title,body+`<div class=actions><button class=small onclick="setUrl({page:'${o.p}'})">Öffnen →</button></div>`,o.meta,q)
 }).join("")||(!mapHits?"<div class=empty>🤷 Nichts gefunden.</div>":"")}</div>`
}
function render(){nav();let q=$("#q").value.trim();$("#app").innerHTML=q?search(q):(page()=="home"?home():page()=="rooms"?rooms(""):page()=="teams"?teams(""):(views[page()]||home)(""))}
async function boot(){let vals=await Promise.all(FILES.map(n=>fetch(`data/${n}.json`).then(r=>r.json())));FILES.forEach((n,i)=>DB[n]=vals[i]);floorSVG=await fetch("assets/floor-1-hub.svg").then(r=>r.text());render()}
$("#q").oninput=render;window.onpopstate=render;
let promptEvent;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();promptEvent=e});
$("#installBtn").onclick=async()=>{if(promptEvent){promptEvent.prompt();await promptEvent.userChoice;promptEvent=null}else alert("📲 Nutze im Browsermenü „App installieren“ oder „Zum Startbildschirm hinzufügen“.")};
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");
boot().catch(e=>$("#app").innerHTML=`<div class=empty>⚠️ Daten konnten nicht geladen werden.<br><small>${esc(e.message)}</small></div>`);
