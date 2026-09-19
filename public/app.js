
const example = [
 {name:"Customer Support Copilot",function:"Customer Operations",stage:"Live / Scale",status:"On Track",adoption:.72,monthlyVolume:18000,benefitPerUnit:3.24,confidence:.90,platformCost:420000,implementationCost:300000,strategicFit:4,valuePotential:4,executionRisk:2},
 {name:"Software Engineering Assistant",function:"Engineering",stage:"Live / Scale",status:"On Track",adoption:.78,monthlyVolume:12000,benefitPerUnit:23.87,confidence:.90,platformCost:650000,implementationCost:250000,strategicFit:5,valuePotential:5,executionRisk:2},
 {name:"Sales Proposal Agent",function:"Sales",stage:"Pilot / Validation",status:"At Risk",adoption:.48,monthlyVolume:900,benefitPerUnit:1163.20,confidence:.70,platformCost:300000,implementationCost:220000,strategicFit:4,valuePotential:5,executionRisk:3},
 {name:"Finance Close Automation",function:"Finance",stage:"Implementation",status:"On Track",adoption:.60,monthlyVolume:2400,benefitPerUnit:23.83,confidence:.70,platformCost:180000,implementationCost:260000,strategicFit:4,valuePotential:4,executionRisk:3},
 {name:"Enterprise Knowledge Search",function:"Enterprise",stage:"Live / Scale",status:"On Track",adoption:.55,monthlyVolume:30000,benefitPerUnit:4.40,confidence:.90,platformCost:520000,implementationCost:400000,strategicFit:5,valuePotential:4,executionRisk:2},
 {name:"Contract Review Agent",function:"Legal / Procurement",stage:"Pilot / Validation",status:"At Risk",adoption:.42,monthlyVolume:650,benefitPerUnit:157.78,confidence:.70,platformCost:160000,implementationCost:180000,strategicFit:3,valuePotential:4,executionRisk:4}
];

let items = JSON.parse(JSON.stringify(example));

const money = n => "$" + Math.round(n).toLocaleString();
const pct = n => (n*100).toFixed(0)+"%";
const x = n => n.toFixed(2)+"x";

function compute(u){
  const annualVolume = u.monthlyVolume * 12;
  const gross = annualVolume * u.adoption * u.benefitPerUnit;
  const risk = gross * u.confidence;
  const y1Cost = u.platformCost + u.implementationCost;
  const y1Net = risk - y1Cost;
  const y1ROI = y1Cost ? y1Net/y1Cost : 0;
  const steadyNet = risk - u.platformCost;
  const steadyROI = u.platformCost ? steadyNet/u.platformCost : 0;
  const payback = risk > 0 ? y1Cost/(risk/12) : 0;
  const npv = -u.implementationCost + [1,2,3].reduce((s,yr)=>s+steadyNet/Math.pow(1.10,yr),0);
  const score = u.strategicFit*.25 + u.valuePotential*.25 + (6-u.executionRisk)*.20 + Math.min(Math.max(steadyROI,0),5)*.15 + u.confidence*5*.15;
  const action = u.status==="Off Track" ? "Hold / Remediate" :
    (steadyROI>=2 && payback<=12 && score>=3.5 ? "Scale / Invest" :
     (steadyROI>0 && score>=2.75 ? "Optimize / Validate" : "Hold / Reassess"));
  return {...u,annualVolume,gross,riskAdjustedBenefit:risk,year1Cost:y1Cost,year1Net:y1Net,year1ROI:y1ROI,steadyNet,steadyROI,paybackMonths:payback,npv,priorityScore:score,action};
}

function portfolio(){
  const useCases = items.map(compute);
  const s = useCases.reduce((a,u)=>{
    a.riskAdjustedAnnualBenefit+=u.riskAdjustedBenefit;a.year1TotalCost+=u.year1Cost;
    a.year1NetBenefit+=u.year1Net;a.platformCost+=u.platformCost;a.npv3yr+=u.npv;
    a.weightedAdoptionNumer+=u.adoption*u.monthlyVolume;a.weightedAdoptionDenom+=u.monthlyVolume;
    return a;
  },{useCases:useCases.length,riskAdjustedAnnualBenefit:0,year1TotalCost:0,year1NetBenefit:0,platformCost:0,npv3yr:0,weightedAdoptionNumer:0,weightedAdoptionDenom:0});
  s.blendedYear1ROI = s.year1TotalCost ? s.year1NetBenefit/s.year1TotalCost : 0;
  const steadyNet = s.riskAdjustedAnnualBenefit-s.platformCost;
  s.steadyStateROI = s.platformCost ? steadyNet/s.platformCost : 0;
  s.weightedAdoption = s.weightedAdoptionDenom ? s.weightedAdoptionNumer/s.weightedAdoptionDenom : 0;
  return {summary:s,useCases};
}

function statusClass(s){return s==="On Track"?"good":s==="At Risk"?"warn":"bad"}

function render(){
  const p=portfolio();
  document.getElementById("metrics").innerHTML = [
    ["Risk-Adj Annual Benefit",money(p.summary.riskAdjustedAnnualBenefit)],
    ["Year 1 Net Benefit",money(p.summary.year1NetBenefit)],
    ["Blended Year 1 ROI",x(p.summary.blendedYear1ROI)],
    ["Steady-State ROI",x(p.summary.steadyStateROI)],
    ["Weighted Adoption",pct(p.summary.weightedAdoption)],
    ["3-Year NPV",money(p.summary.npv3yr)],
    ["Use Cases",p.summary.useCases],
    ["Annual Platform Cost",money(p.summary.platformCost)]
  ].map(([l,v])=>`<div class="metric"><label>${l}</label><strong>${v}</strong></div>`).join("");

  document.getElementById("portfolioBody").innerHTML=p.useCases.map((u,i)=>`
    <tr>
      <td><input class="cell-input" data-i="${i}" data-k="name" value="${u.name}"/></td>
      <td><input class="cell-input" data-i="${i}" data-k="function" value="${u.function}"/></td>
      <td><input class="cell-input" data-i="${i}" data-k="stage" value="${u.stage}"/></td>
      <td><span class="status ${statusClass(u.status)}">${u.status}</span></td>
      <td><input class="cell-input" type="number" step=".01" min="0" max="1" data-i="${i}" data-k="adoption" value="${u.adoption}"/></td>
      <td><input class="cell-input" type="number" data-i="${i}" data-k="monthlyVolume" value="${u.monthlyVolume*12}"/></td>
      <td><input class="cell-input" type="number" step=".01" data-i="${i}" data-k="benefitPerUnit" value="${u.benefitPerUnit}"/></td>
      <td><input class="cell-input" type="number" step=".01" min="0" max="1" data-i="${i}" data-k="confidence" value="${u.confidence}"/></td>
      <td><input class="cell-input" type="number" data-i="${i}" data-k="platformCost" value="${u.platformCost}"/></td>
      <td><input class="cell-input" type="number" data-i="${i}" data-k="implementationCost" value="${u.implementationCost}"/></td>
      <td>${money(u.riskAdjustedBenefit)}</td><td>${x(u.year1ROI)}</td><td>${x(u.steadyROI)}</td>
      <td>${u.paybackMonths.toFixed(1)} mo</td><td>${u.priorityScore.toFixed(2)}</td><td><strong>${u.action}</strong></td>
    </tr>`).join("");

  document.querySelectorAll(".cell-input").forEach(el=>el.addEventListener("change",e=>{
    const i=+e.target.dataset.i,k=e.target.dataset.k;
    if(k==="monthlyVolume") items[i][k]=(+e.target.value)/12;
    else if(["adoption","benefitPerUnit","confidence","platformCost","implementationCost"].includes(k)) items[i][k]=+e.target.value;
    else items[i][k]=e.target.value;
    render();
  }));

  const ranked=[...p.useCases].sort((a,b)=>b.priorityScore-a.priorityScore);
  const weakestAdoption=[...p.useCases].sort((a,b)=>a.adoption-b.adoption)[0];
  const longestPayback=[...p.useCases].sort((a,b)=>b.paybackMonths-a.paybackMonths)[0];
  const concentration=ranked[0].riskAdjustedBenefit/p.summary.riskAdjustedAnnualBenefit;
  document.getElementById("signals").innerHTML=`
    <div class="signal"><strong>Top priority</strong><span>${ranked[0].name} (${ranked[0].priorityScore.toFixed(2)} score) based on strategic fit, economics, confidence and execution risk.</span></div>
    <div class="signal"><strong>Adoption gap</strong><span>${weakestAdoption.name} has the lowest adoption at ${pct(weakestAdoption.adoption)}.</span></div>
    <div class="signal"><strong>Slow payback</strong><span>${longestPayback.name} has the longest modeled payback at ${longestPayback.paybackMonths.toFixed(1)} months.</span></div>
    <div class="signal"><strong>Concentration</strong><span>${ranked[0].name} contributes ${(concentration*100).toFixed(0)}% of modeled risk-adjusted portfolio benefit. Challenge the assumptions behind concentrated value.</span></div>`;
}

async function analyze(){
  const btn=document.getElementById("askBtn"), answer=document.getElementById("answer");
  btn.disabled=true;btn.textContent="Analyzing…";answer.textContent="Generating decision-quality executive insight…";
  try{
    const r=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({portfolio:portfolio(),question:document.getElementById("question").value})});
    const data=await r.json();
    answer.textContent=data.text||data.error||"No response returned.";
  }catch(e){answer.textContent="Could not reach the API. Confirm the server is running and OPENAI_API_KEY is configured."}
  btn.disabled=false;btn.textContent="Analyze Portfolio";
}
document.getElementById("askBtn").onclick=analyze;
document.getElementById("analyzeBtn").onclick=()=>{document.getElementById("question").scrollIntoView({behavior:"smooth"});analyze();}
document.getElementById("resetBtn").onclick=()=>{items=JSON.parse(JSON.stringify(example));render();}
render();
