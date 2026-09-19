const base = [
  {name:"Complex Reasoning Agent",monthlyTasks:24000,valuePerSuccess:42,requiredSuccess:.90,latencySlaMs:5000,controlRequired:3,humanMinutes:6,humanRate:85,
   frontier:{successRate:.94,latencyMs:2400,control:3,varCost:0.42,reviewRate:.06,annualOps:45000,implementation:90000},
   open:{successRate:.84,latencyMs:1500,control:5,varCost:0.11,reviewRate:.20,annualOps:260000,implementation:320000},
   hybrid:{successRate:.92,latencyMs:1900,control:4,varCost:0.20,reviewRate:.09,annualOps:155000,implementation:210000}},
  {name:"Software Engineering Copilot",monthlyTasks:48000,valuePerSuccess:18,requiredSuccess:.86,latencySlaMs:4000,controlRequired:3,humanMinutes:5,humanRate:110,
   frontier:{successRate:.91,latencyMs:2100,control:3,varCost:0.31,reviewRate:.10,annualOps:55000,implementation:85000},
   open:{successRate:.86,latencyMs:1200,control:5,varCost:0.09,reviewRate:.13,annualOps:240000,implementation:280000},
   hybrid:{successRate:.90,latencyMs:1600,control:4,varCost:0.16,reviewRate:.10,annualOps:145000,implementation:180000}},
  {name:"Document Extraction",monthlyTasks:220000,valuePerSuccess:2.40,requiredSuccess:.93,latencySlaMs:2500,controlRequired:4,humanMinutes:3,humanRate:48,
   frontier:{successRate:.96,latencyMs:1800,control:3,varCost:0.12,reviewRate:.04,annualOps:40000,implementation:70000},
   open:{successRate:.94,latencyMs:750,control:5,varCost:0.025,reviewRate:.06,annualOps:190000,implementation:230000},
   hybrid:{successRate:.96,latencyMs:950,control:5,varCost:0.045,reviewRate:.04,annualOps:130000,implementation:160000}},
  {name:"Enterprise Search / RAG",monthlyTasks:160000,valuePerSuccess:3.80,requiredSuccess:.88,latencySlaMs:2200,controlRequired:4,humanMinutes:2,humanRate:65,
   frontier:{successRate:.91,latencyMs:1700,control:3,varCost:0.14,reviewRate:.05,annualOps:42000,implementation:75000},
   open:{successRate:.88,latencyMs:800,control:5,varCost:0.035,reviewRate:.08,annualOps:205000,implementation:245000},
   hybrid:{successRate:.91,latencyMs:1050,control:5,varCost:0.065,reviewRate:.05,annualOps:125000,implementation:150000}},
  {name:"Customer Service Assistant",monthlyTasks:310000,valuePerSuccess:5.50,requiredSuccess:.87,latencySlaMs:1800,controlRequired:3,humanMinutes:4,humanRate:42,
   frontier:{successRate:.91,latencyMs:1550,control:3,varCost:0.16,reviewRate:.08,annualOps:50000,implementation:85000},
   open:{successRate:.87,latencyMs:700,control:5,varCost:0.04,reviewRate:.12,annualOps:230000,implementation:270000},
   hybrid:{successRate:.90,latencyMs:950,control:4,varCost:0.075,reviewRate:.07,annualOps:145000,implementation:165000}},
  {name:"High-Volume Classification",monthlyTasks:950000,valuePerSuccess:.42,requiredSuccess:.92,latencySlaMs:900,controlRequired:4,humanMinutes:1,humanRate:38,
   frontier:{successRate:.95,latencyMs:1100,control:3,varCost:0.045,reviewRate:.02,annualOps:35000,implementation:60000},
   open:{successRate:.93,latencyMs:260,control:5,varCost:0.006,reviewRate:.03,annualOps:175000,implementation:220000},
   hybrid:{successRate:.95,latencyMs:500,control:5,varCost:0.013,reviewRate:.02,annualOps:110000,implementation:135000}}
];
let workloads = structuredClone(base);
const $ = id=>document.getElementById(id); const money=n=>"$"+Math.round(n).toLocaleString(); const pct=n=>(n*100).toFixed(0)+"%"; const mult=n=>n.toFixed(2)+"x";

function evalRoute(w, route, name){
  const annualTasks=w.monthlyTasks*12, successful=annualTasks*route.successRate;
  const modelCost=annualTasks*route.varCost;
  const reviewCost=annualTasks*route.reviewRate*(w.humanMinutes/60)*w.humanRate;
  const steadyTco=modelCost+reviewCost+route.annualOps;
  const year1Tco=steadyTco+route.implementation;
  const businessValue=successful*w.valuePerSuccess;
  const netValue=businessValue-year1Tco;
  const roi=year1Tco?netValue/year1Tco:0;
  const cps=successful?year1Tco/successful:0;
  const monthlySteadyNet=(businessValue-steadyTco)/12;
  const paybackMonths=monthlySteadyNet>0?route.implementation/monthlySteadyNet:null;
  const capabilityFit=route.successRate>=w.requiredSuccess, latencyFit=route.latencyMs<=w.latencySlaMs, controlFit=route.control>=w.controlRequired;
  const eligible=capabilityFit&&latencyFit&&controlFit;
  return {name,...route,annualTasks,successful,modelCost,reviewCost,steadyTco,year1Tco,businessValue,netValue,roi,costPerSuccess:cps,paybackMonths,eligible,capabilityFit,latencyFit,controlFit};
}
function evaluate(w){
  const routes=[evalRoute(w,w.frontier,"Frontier API"),evalRoute(w,w.open,"Open Weight / VPC"),evalRoute(w,w.hybrid,"Hybrid Routing")];
  const eligible=routes.filter(r=>r.eligible);
  const recommended=(eligible.length?eligible:routes).sort((a,b)=>b.netValue-a.netValue)[0];
  return {...w,annualTasks:w.monthlyTasks*12,routes,recommended};
}
function portfolio(){
  const ws=workloads.map(evaluate); let annualTasks=0,year1Tco=0,netValue=0,success=0,fc=0,oc=0,hc=0;
  ws.forEach(w=>{annualTasks+=w.annualTasks;year1Tco+=w.recommended.year1Tco;netValue+=w.recommended.netValue;success+=w.recommended.successful;if(w.recommended.name.startsWith("Frontier"))fc+=w.annualTasks;else if(w.recommended.name.startsWith("Open"))oc+=w.annualTasks;else hc+=w.annualTasks});
  return {workloads:ws,summary:{annualTasks,year1Tco,netValue,roi:year1Tco?netValue/year1Tco:0,costPerSuccess:success?year1Tco/success:0,frontierShare:annualTasks?fc/annualTasks:0,openShare:annualTasks?oc/annualTasks:0,hybridShare:annualTasks?hc/annualTasks:0}};
}
function routeBox(r, cls){
  const fit=r.eligible?"✓ clears constraints":`⚠ ${[!r.capabilityFit?"capability":"",!r.latencyFit?"latency":"",!r.controlFit?"control":""].filter(Boolean).join(", ")}`;
  return `<div class="route ${cls}"><b>${r.name.replace(" / VPC","")}</b><small>${pct(r.successRate)} success · ${r.latencyMs}ms · control ${r.control}/5</small><small>${money(r.year1Tco)} Y1 TCO · ${money(r.costPerSuccess)}/success</small><small>${fit}</small></div>`;
}
function render(){
  const p=portfolio();
  $("metrics").innerHTML=[
    ["Annual workload",Math.round(p.summary.annualTasks).toLocaleString()+" tasks","portfolio scale"],
    ["Year-1 TCO",money(p.summary.year1Tco),"recommended routing"],
    ["Net annual value",money(p.summary.netValue),"modeled business value − TCO"],
    ["Portfolio ROI",mult(p.summary.roi),"year 1"],
    ["Cost / successful task",money(p.summary.costPerSuccess),"blended"],
    ["Hybrid-routed volume",pct(p.summary.hybridShare),"of annual tasks"]
  ].map(([l,v,s])=>`<div class="metric"><label>${l}</label><strong>${v}</strong><div class="sub">${s}</div></div>`).join("");

  $("body").innerHTML=p.workloads.map((w,i)=>{
    const [f,o,h]=w.routes; const cls=w.recommended.name.startsWith("Frontier")?"frontier":w.recommended.name.startsWith("Open")?"open":"hybrid";
    return `<tr>
      <td class="workload"><input class="input" data-i="${i}" data-k="name" value="${w.name}"></td>
      <td><input class="input" type="number" data-i="${i}" data-k="monthlyTasks" value="${w.monthlyTasks}"></td>
      <td><input class="input" type="number" step=".01" data-i="${i}" data-k="valuePerSuccess" value="${w.valuePerSuccess}"></td>
      <td><input class="input" type="number" step=".01" min="0" max="1" data-i="${i}" data-k="requiredSuccess" value="${w.requiredSuccess}"></td>
      <td><input class="input" type="number" data-i="${i}" data-k="latencySlaMs" value="${w.latencySlaMs}"></td>
      <td><input class="input" type="number" min="1" max="5" data-i="${i}" data-k="controlRequired" value="${w.controlRequired}"></td>
      <td>${routeBox(f,"frontier")}</td><td>${routeBox(o,"open")}</td><td>${routeBox(h,"hybrid")}</td>
      <td><span class="pill ${cls}">${w.recommended.name}</span></td><td>${money(w.recommended.netValue)}</td><td>${mult(w.recommended.roi)}</td><td>${money(w.recommended.costPerSuccess)}</td>
    </tr>`}).join("");

  document.querySelectorAll(".input").forEach(el=>el.addEventListener("change",e=>{const i=+e.target.dataset.i,k=e.target.dataset.k;workloads[i][k]=k==="name"?e.target.value:+e.target.value;render()}));

  const noFit=p.workloads.filter(w=>!w.recommended.eligible); const biggest=p.workloads.toSorted((a,b)=>b.recommended.netValue-a.recommended.netValue)[0];
  const frontier=p.workloads.filter(w=>w.recommended.name.startsWith("Frontier")).map(w=>w.name); const open=p.workloads.filter(w=>w.recommended.name.startsWith("Open")).map(w=>w.name); const hybrid=p.workloads.filter(w=>w.recommended.name.startsWith("Hybrid")).map(w=>w.name);
  $("signals").innerHTML=`
    <div class="signal"><strong>Frontier-worthy</strong><span>${frontier.length?frontier.join(", "):"No workload is currently routed exclusively to frontier."}</span></div>
    <div class="signal"><strong>Open-weight fit</strong><span>${open.length?open.join(", "):"No workload is currently routed exclusively to open weight."}</span></div>
    <div class="signal"><strong>Hybrid fit</strong><span>${hybrid.length?hybrid.join(", "):"No workload is currently routed to hybrid."}</span></div>
    <div class="signal"><strong>Largest value pool</strong><span>${biggest.name} produces the highest modeled net value at ${money(biggest.recommended.netValue)} under its recommended route.</span></div>
    <div class="signal"><strong>Constraint watch</strong><span>${noFit.length?noFit.map(w=>w.name).join(", ")+" have no route that clears every requirement under current assumptions.":"Every workload has at least one route that clears capability, latency, and control requirements."}</span></div>`;
}
async function analyze(){const btn=$("askBtn"),ans=$("answer");btn.disabled=true;btn.textContent="Analyzing…";ans.textContent="Generating model-strategy insight…";try{const r=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({portfolio:portfolio(),question:$("question").value})});const d=await r.json();ans.textContent=d.text||d.error||"No response returned."}catch(e){ans.textContent="Could not reach the API. Confirm the server is running and OPENAI_API_KEY is configured."}btn.disabled=false;btn.textContent="Analyze Model Portfolio"}
$("askBtn").onclick=analyze;$("readoutBtn").onclick=()=>{$("question").scrollIntoView({behavior:"smooth"});analyze()};$("resetBtn").onclick=()=>{workloads=structuredClone(base);render()};render();
