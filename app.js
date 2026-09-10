let D=null, currentML="random";
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const plotCfg={responsive:true,displaylogo:false,modeBarButtonsToRemove:["lasso2d","select2d"]};
const baseLayout={paper_bgcolor:"transparent",plot_bgcolor:"transparent",font:{family:"Inter, sans-serif",color:"#656a61",size:10},margin:{l:55,r:20,t:38,b:50},autosize:true};

const num=(v)=>v==null||v===""?null:Number(v);
const fmt=(v,d=2)=>v==null?"—":Number(v).toLocaleString(undefined,{maximumFractionDigits:d});
function plot(id,data,layout={}){
 const el=document.getElementById(id); if(!el)return;
 const merged={...baseLayout,...layout,autosize:true};
 if(el.data) Plotly.purge(el);
 Plotly.newPlot(el,data,merged,plotCfg).then(()=>Plotly.Plots.resize(el));
}
function go(id){
  if(!$("#"+id)) id="overview";
  $$(".view").forEach(v=>v.classList.remove("active"));
  $("#"+id).classList.add("active");
  $$(".nav").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
  history.replaceState(null,"","#"+id);
  window.scrollTo({top:0,left:0,behavior:"instant"});
  renderView(id);
  if(typeof updateChatContext==="function") updateChatContext();
}
function filtered(){
 let a=D.records, dom=$("#fDomain")?.value||"", env=$("#fEnvironment")?.value||"", t=num($("#fTopt")?.value), ph=num($("#fPh")?.value);
 return a.filter(r=>(!dom||r.domain===dom)&&(!env||r.environment===env)&&(t==null||num(r.avg_optimum_temp_c)>=t)&&(ph==null||num(r.avg_optimum_ph)<=ph));
}
function init(){
 $("#dataStatus").textContent=`validated release · ${D.meta.records.toLocaleString()} records`;
 $("#resetFilters").onclick=()=>{["fDomain","fEnvironment","fTopt","fPh"].forEach(id=>{let e=$("#"+id);if(e)e.value=""});renderView("physiology")};
 populateEnv(); renderView(location.hash.slice(1)||"overview"); bind();
}
function populateEnv(){let e=$("#fEnvironment");if(!e)return;Object.keys(D.environment_top).sort().forEach(x=>{let o=document.createElement("option");o.value=x;o.textContent=x;e.appendChild(o)})}
function renderView(v){
 if(v==="overview") renderOverview();
 if(v==="physiology") renderPhys();
 if(v==="environment") renderEnvironment();
 if(v==="metabolism") renderMetabolism();
 if(v==="evidence") renderEvidence();
 if(v==="analysis") renderAnalysis();
 if(v==="ml") renderML();
 if(v==="worlds") renderWorld("enceladus");
}
function renderOverview(){
 let d=Object.entries(D.domain_counts); plot("overviewDomain",[{x:d.map(x=>x[0]),y:d.map(x=>x[1]),type:"bar",hovertemplate:"%{x}: %{y}<extra></extra>"}],{yaxis:{title:"Records"},title:{text:"Records by domain",font:{size:13}}});
 let e=Object.entries(D.ecosystem_top).slice(0,10).reverse();plot("overviewEco",[{x:e.map(x=>x[1]),y:e.map(x=>x[0]),type:"bar",orientation:"h",hovertemplate:"%{y}: %{x}<extra></extra>"}],{margin:{l:150,r:10,t:32,b:40},xaxis:{title:"Records"},title:{text:"Most represented ecosystems",font:{size:13}}});
}
function renderPhys(){
 let a=filtered(), T=a.map(r=>num(r.avg_optimum_temp_c)), P=a.map(r=>num(r.avg_optimum_ph));
 $("#physKpis").innerHTML=[["Records",a.length],["Median Topt",fmt(T.filter(x=>x!=null).sort((x,y)=>x-y)[Math.floor(T.filter(x=>x!=null).length/2)],1)+" °C"],["Median pHopt",fmt(P.filter(x=>x!=null).sort((x,y)=>x-y)[Math.floor(P.filter(x=>x!=null).length/2)],1)],["With thermal optimum",T.filter(x=>x!=null).length]].map(x=>`<div><b>${x[1]}</b><span>${x[0]}</span></div>`).join("");
 let pts=a.filter(r=>num(r.avg_optimum_temp_c)!=null&&num(r.avg_optimum_ph)!=null);
 plot("physScatter",[{x:pts.map(r=>num(r.avg_optimum_temp_c)),y:pts.map(r=>num(r.avg_optimum_ph)),mode:"markers",type:"scatter",text:pts.map(r=>r.name),customdata:pts.map(r=>[r.domain,r.environment,r.metabolism_pathways]),hovertemplate:"<b>%{text}</b><br>Topt %{x} °C<br>pHopt %{y}<br>%{customdata[0]} · %{customdata[1]}<br>%{customdata[2]}<extra></extra>"}],{xaxis:{title:"Optimum temperature (°C)"},yaxis:{title:"Optimum pH"},title:{text:`${pts.length.toLocaleString()} organisms with both values`,font:{size:13}}});
 let bins=[["≤40",0],["40–60",0],["60–80",0],["80–100",0],[">100",0]];T.filter(x=>x!=null).forEach(x=>bins[x<=40?0:x<=60?1:x<=80?2:x<=100?3:4][1]++);
 plot("physThermal",[{x:bins.map(x=>x[0]),y:bins.map(x=>x[1]),type:"bar",hovertemplate:"Topt %{x}: %{y}<extra></extra>"}],{yaxis:{title:"Records"},title:{text:"Observed Topt distribution",font:{size:13}}});
 plot("tempCoverage",[{x:["Tmin","Topt","Tmax"],y:["min_temp_c","avg_optimum_temp_c","max_temp_c"].map(k=>a.filter(r=>num(r[k])!=null).length),type:"bar"}],{title:{text:"Available records",font:{size:12}}});
 plot("phCoverage",[{x:["pHmin","pHopt","pHmax"],y:["min_ph","avg_optimum_ph","max_ph"].map(k=>a.filter(r=>num(r[k])!=null).length),type:"bar"}],{title:{text:"Available records",font:{size:12}}});
 $("#physList").innerHTML=a.slice(0,20).map(r=>`<div><b>${r.name||"Unnamed"}</b><br>${r.domain||"—"} · Topt ${r.avg_optimum_temp_c??"—"} °C · pH ${r.avg_optimum_ph??"—"}</div>`).join("");
}
function renderEnvironment(){
 let e=Object.entries(D.environment_top).slice(0,12).reverse();plot("envChart",[{x:e.map(x=>x[1]),y:e.map(x=>x[0]),type:"bar",orientation:"h"}],{margin:{l:155,r:10,t:32,b:40},title:{text:"Most represented environments",font:{size:13}},xaxis:{title:"Records"}});
 let vals=[];Object.entries(D.environment_top).slice(0,10).forEach(([k])=>{let a=D.records.filter(r=>r.environment===k).map(r=>num(r.avg_optimum_temp_c)).filter(x=>x!=null);if(a.length)vals.push({k,n:a.length,m:a.reduce((x,y)=>x+y,0)/a.length})});vals.sort((a,b)=>a.m-b.m);plot("envTemp",[{x:vals.map(x=>x.m),y:vals.map(x=>x.k),type:"bar",orientation:"h",text:vals.map(x=>"n="+x.n),hovertemplate:"%{y}<br>Mean Topt %{x:.1f} °C<br>%{text}<extra></extra>"}],{margin:{l:155,r:10,t:32,b:40},title:{text:"Mean Topt by environment",font:{size:13}},xaxis:{title:"°C"}});
 let o=Object.entries(D.oxygen_counts);plot("oxygenChart",[{x:o.map(x=>x[0]),y:o.map(x=>x[1]),type:"bar"}],{title:{text:"Oxygen requirement",font:{size:12}},xaxis:{automargin:true}});
 let p=Object.entries(D.phylum_top).slice(0,12).reverse();plot("phylumChart",[{x:p.map(x=>x[1]),y:p.map(x=>x[0]),type:"bar",orientation:"h"}],{margin:{l:135,r:10,t:32,b:35},title:{text:"Top phyla",font:{size:12}}});
}
function renderMetabolism(){
 let terms=["methanogenesis","sulfate reduction","sulfur reduction","iron reduction","fermentation","hydrogen oxidation"],counts=terms.map(t=>D.records.filter(r=>(r.metabolism_pathways||"").toLowerCase().includes(t)).length);
 plot("metChart",[{x:terms,y:counts,type:"bar",hovertemplate:"%{x}: %{y} records<extra></extra>"}],{title:{text:"Metabolic capabilities represented in the release",font:{size:13}},yaxis:{title:"Records"}});
 let c=Object.entries(D.chemical_role).slice(0,10).reverse();plot("chemChart",[{x:c.map(x=>x[1]),y:c.map(x=>x[0]),type:"bar",orientation:"h",hovertemplate:"%{y}: %{x}<extra></extra>"}],{title:{text:"Chemical-role disposition",font:{size:13}},margin:{l:170,r:15,t:38,b:35},xaxis:{title:"Cells"}});
 $("#pathwayCards").innerHTML=D.pathways.map(p=>`<article class="pathway"><div class="score">${p.score}/14</div><b>${p.pathway}</b><small>${p.interpretation}</small><p>${p.why}</p></article>`).join("");
}
function renderEvidence(){
 let m=Object.entries(D.missing_counts).sort((a,b)=>b[1]-a[1]);plot("missingChart",[{x:m.map(x=>x[1]),y:m.map(x=>x[0].replaceAll("_"," ")),type:"bar",orientation:"h"}],{margin:{l:170,r:10,t:32,b:35},title:{text:"Missing records in key fields",font:{size:13}},xaxis:{title:"Missing records"}});
 let q=Object.entries(D.quality_counts).reverse();plot("qualityChart",[{x:q.map(x=>x[1]),y:q.map(x=>x[0]),type:"bar",orientation:"h"}],{title:{text:"Record-level QC status",font:{size:13}},margin:{l:205,r:15,t:38,b:35},xaxis:{title:"Records"}});
 let s=Object.entries(D.schema_groups);plot("schemaChart",[{x:s.map(x=>x[1]),y:s.map(x=>x[0]),type:"bar",orientation:"h"}],{margin:{l:180,r:10,t:10,b:30},xaxis:{title:"Fields"},title:{text:"Why the schema is 337 fields",font:{size:13}}});
}
function renderAnalysis(){
 let bins=D.thermal_bins;plot("analysisThermal",[{x:bins.map(x=>x.bin),y:bins.map(x=>x.count),type:"bar"}],{title:{text:"Observed optimum-temperature distribution",font:{size:13}},yaxis:{title:"Records"}});
 let p=D.ph;plot("analysisPh",[{x:["pHmin","pHopt","pHmax"],y:[p.pHmin.median,p.pHopt.median,p.pHmax.median],type:"bar",error_y:{type:"data",symmetric:false,array:[p.pHmin.q75-p.pHmin.median,p.pHopt.q75-p.pHopt.median,p.pHmax.q75-p.pHmax.median],arrayminus:[p.pHmin.median-p.pHmin.q25,p.pHopt.median-p.pHopt.q25,p.pHmax.median-p.pHmax.q25]}}],{title:{text:"Median pH with interquartile ranges",font:{size:13}},yaxis:{title:"pH"}});
}
function renderML(){
 let r=currentML==="random"?D.ml_random:D.ml_grouped;
 if(currentML==="random"){
  plot("mlChart",[
   {x:r.map(x=>x.pathway),y:r.map(x=>x.environment),type:"bar",name:"Environment only"},
   {x:r.map(x=>x.pathway),y:r.map(x=>x.taxonomy),type:"bar",name:"Taxonomy only"},
   {x:r.map(x=>x.pathway),y:r.map(x=>x.combined),type:"bar",name:"Environment + taxonomy"}],
   {barmode:"group",yaxis:{title:"ROC-AUC",range:[0,1]},title:{text:"Random 5-fold: model performance by pathway",font:{size:14}},margin:{l:55,r:15,t:55,b:85},xaxis:{automargin:true,tickangle:-18}});
  $("#mlHeader").innerHTML="<b>Read the comparison carefully.</b> Random folds allow related lineages in both training and test. Taxonomy can therefore carry substantial predictive information that is not independent environmental signal.";
 }else{
  let rr=r.filter(x=>x.roc!=null);plot("mlChart",[{x:rr.map(x=>x.pathway),y:rr.map(x=>x.roc),type:"bar",hovertemplate:"%{x}: %{y:.3f}<extra></extra>"}],{yaxis:{title:"Grouped ROC-AUC",range:[0,1]},title:{text:"Phylum-grouped validation: what survives lineage holdout?",font:{size:14}},xaxis:{automargin:true}});
  $("#mlHeader").innerHTML="<b>The stress test.</b> Entire phyla are held out. This asks whether environment-only relationships generalize beyond the lineage composition of the training data. Methanogenesis is not estimable because all 52 positives are Euryarchaeota.";
 }
 plot("extremeChart",[{x:["ROC-AUC","PR-AUC","Balanced accuracy"],y:[D.extreme.roc_auc,D.extreme.pr_auc,D.extreme.balanced_accuracy],type:"bar"}],{yaxis:{range:[0,1]},title:{text:"Topt ≥80 °C classifier",font:{size:12}}});
 $("#mlInsight").innerHTML="<p><b>Retained:</b> sulfate reduction, sulfur reduction, iron reduction and fermentation show useful environment-linked signal under phylum holdout.</p><p><b>Collapse:</b> H₂ oxidation falls to ROC-AUC 0.213.</p><p><b>Not estimable:</b> methanogenesis has 52 positives, all in Euryarchaeota.</p>";
}
const worlds={
enceladus:{title:"Enceladus",sub:"A chemically accessible ocean world",score:"14 / 14",label:"ordinal compatibility for hydrogenotrophic methanogenesis",text:"Enceladus is the central ThermoBase case study because environmental constraints, plume chemistry and terrestrial metabolic experiments can be placed in one evidence chain. Molecular H₂ provides a plausible reductant; CH₄ is observed; biological methanogenesis is experimentally plausible. None of this alone establishes life.",ev:[["H₂","Cassini detected molecular hydrogen in the plume."],["Carbon","CO₂/carbon chemistry provides a potential methanogenic substrate system."],["Analogue","Methanogens have produced CH₄ under putative Enceladus-like conditions."],["Guardrail","Abiotic methane remains a competing explanation."]]},
europa:{title:"Europa",sub:"An ocean-world chemistry problem",score:"—",label:"no life probability assigned",text:"Europa shifts the problem toward an ocean that is not naturally sampled by a persistent plume. Water, chemistry and energy are central constraints; the observational strategy must therefore connect remote surface measurements, interior models and future spacecraft measurements.",ev:[["Water","A subsurface ocean is a central habitability hypothesis."],["Chemistry","Salts and redox-active interfaces are important constraints."],["Energy","Hydrothermal and radiolytic sources are under investigation."],["Observation","Ocean access is the major difference from Enceladus."]]},
mars:{title:"Mars",sub:"A planetary archive rather than a simple habitable-world analogue",score:"—",label:"biosignature interpretation depends on preservation",text:"Mars demonstrates another transfer mode: the target may be ancient or extinct habitability rather than an active ocean ecosystem. ThermoBase is useful for identifying environmental niches and metabolic products, but preservation, alteration and contamination become central to biosignature interpretation.",ev:[["Water history","Past aqueous environments are central to the astrobiology case."],["Energy","Redox gradients may have supported past metabolism."],["Preservation","Mineral context controls whether evidence can survive."],["Measurement","Context and provenance are as important as molecular detection."]]},
trappist:{title:"TRAPPIST-1 e",sub:"The atmospheric branch of the framework",score:"—",label:"no definitive atmosphere/life conclusion",text:"TRAPPIST-1 e illustrates how the same reasoning framework moves from microbial physiology to remote atmospheric inference. The question is not whether the planet resembles Earth visually, but whether future observations can constrain an atmospheric chemical state that is difficult to maintain abiotically.",ev:[["Planet","Earth-sized world in the habitable zone."],["Atmosphere","Atmospheric characterization remains an active problem."],["Stellar context","Stellar activity complicates atmospheric evolution."],["Opportunity","Repeated spectroscopy can narrow competing scenarios."]]},
k218:{title:"K2-18 b",sub:"A cautionary biosignature case",score:"—",label:"molecules require planetary context",text:"K2-18 b is useful precisely because atmospheric molecules can be scientifically exciting while remaining interpretation-dependent. Methane and carbon dioxide observations motivate competing atmospheric and biological scenarios; the correct endpoint is a discriminating measurement strategy, not a binary life label.",ev:[["Observed","Methane and carbon dioxide have been reported."],["Models","Atmospheric interpretation is model-dependent."],["Abiotic","Non-biological pathways must remain explicit."],["Opportunity","Better spectra and atmospheric constraints reduce hypothesis space."]]},
earth:{title:"Earth",sub:"The known-life control",score:"—",label:"reference system",text:"Earth is the control experiment. ThermoBase's value is not that another planet must resemble Earth's surface. Its value is that known terrestrial organisms demonstrate how environmental gradients can support specific metabolisms and chemical disequilibria.",ev:[["Known life","The only world with confirmed biology."],["Extremes","Thermophiles expand the physiological meaning of habitability."],["Disequilibrium","Biology can sustain chemical states away from abiotic equilibrium."],["Benchmark","Mechanisms matter more than visual resemblance."]]}
};
function renderWorld(k){
 let w=worlds[k];$("#worldPanel").innerHTML=`<article class="world-card"><div><span class="tag">${w.sub}</span><h3>${w.title}</h3><p>${w.text}</p><div class="world-evidence">${w.ev.map(e=>`<div><b>${e[0]}</b>${e[1]}</div>`).join("")}</div></div><div><div class="world-score">${w.score}<small>${w.label}</small></div></div></article>`;
 let vals=D.pathways;plot("worldPathways",[{x:vals.map(x=>x.score).reverse(),y:vals.map(x=>x.pathway).reverse(),type:"bar",orientation:"h",hovertemplate:"%{y}: %{x}/14<extra></extra>"}],{xaxis:{range:[0,14],title:"Ordinal compatibility / 14"},margin:{l:175,r:10,t:32,b:45},title:{text:k==="enceladus"?"Enceladus pathway comparison":"Pathway framework shown as reference; not a planetary probability",font:{size:13}}});
}
function bind(){
 $$(".nav").forEach(b=>b.onclick=()=>go(b.dataset.view));
 $$("[data-jump]").forEach(b=>b.onclick=()=>go(b.dataset.jump));
 $$("[data-ml]").forEach(b=>b.onclick=()=>{$$(".segmented button").forEach(x=>x.classList.remove("active"));b.classList.add("active");currentML=b.dataset.ml;renderML()});
 $$("[data-world]").forEach(b=>b.onclick=()=>{$$(".world-tabs button").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderWorld(b.dataset.world)});
 ["fDomain","fEnvironment","fTopt","fPh"].forEach(id=>$("#"+id)?.addEventListener("input",()=>{renderPhys();updateChatContext()}));
 window.addEventListener("scroll",()=>$("#progress").style.width=(scrollY/(document.body.scrollHeight-innerHeight)*100)+"%");
}
fetch("data/thermobase.json").then(r=>r.json()).then(d=>{D=d;init()}).catch(e=>{console.error(e);$("#dataStatus").textContent="data unavailable"});


/* ===================== THERMOBASE RESEARCH CHAT ===================== */
/* This is intentionally local/retrieval-based: it does not call an external AI service. */

function updateChatContext(){
 const active=document.querySelector(".nav.active");
 const n=(typeof filtered==="function"?filtered():D?.records||[]).length;
 const el=$("#chatContext");
 if(el) el.textContent="Current context: "+(active?.textContent?.replace(/^\s*\d+\s*/,"").trim()||"Overview")+" · "+n.toLocaleString()+" records";
}

function chatOpen(){
  $("#researchChat").classList.add("open"); $("#researchChat").setAttribute("aria-hidden","false"); $("#chatFab").style.display="none";
  updateChatContext();
  setTimeout(()=>$("#chatQuestion").focus(),50);
}
function chatClose(){ $("#researchChat").classList.remove("open"); $("#researchChat").setAttribute("aria-hidden","true"); $("#chatFab").style.display=""; }
function addChat(role,text){
  const d=document.createElement("div"); d.className="chat-msg "+role;
  d.innerHTML=`<b>${role==="user"?"You":"ThermoBase"}</b><p>${text}</p>`;
  $("#chatBody").appendChild(d); $("#chatBody").scrollTop=$("#chatBody").scrollHeight;
}
function localRecords(){
  return typeof filtered==="function" ? filtered() : (D?.records||[]);
}
function localChatAnswer(question){
  const q=question.toLowerCase(), a=localRecords(), total=a.length;
  const cite=(label)=>`<small><b>Research layer:</b> ${label}</small>`;
  const vals=k=>a.map(r=>num(r[k])).filter(x=>x!=null);
  const med=k=>median(vals(k));
  if(/how many|number of|dataset size|records/.test(q)&&/organism|record|thermobase|dataset/.test(q))
    return `<strong>${total.toLocaleString()}</strong> records are currently in the active dataset context. The full ThermoBase release contains <strong>1,238 organisms</strong> and <strong>337 structured fields</strong>. ${cite("integrated ThermoBase release")}`;
  if(/domain|bacteria|archaea|eukary/.test(q))
    return `The release contains <strong>836 Bacteria</strong>, <strong>373 Archaea</strong> and <strong>29 Eukaryota</strong>. The row-level database count is the primary database evidence. ${cite("S1 row-level domain counts")}`;
  if(/thermal|temperature/.test(q)&&/complete|coverage|missing|qc/.test(q))
    return `<strong>1,137</strong> records have complete thermal envelopes. Missing values are <strong>93 Tmin</strong>, <strong>21 Topt</strong> and <strong>37 Tmax</strong>. There are <strong>0</strong> Tmin>Topt or Topt>Tmax violations. ${cite("ThermoBase QC v70/v74")}`;
  if(/ph|acid|alkal/.test(q)&&/complete|coverage|missing|qc/.test(q))
    return `<strong>468</strong> records have complete pH envelopes. Missing values are <strong>738 pHmin</strong>, <strong>706 pHopt</strong> and <strong>741 pHmax</strong>, with <strong>0</strong> complete-envelope ordering violations. ${cite("ThermoBase QC layer")}`;
  if(/chemical|compound|donor|acceptor|product|metabol/.test(q)&&/role|evidence|unresolved|ambig/.test(q))
    return `The chemical layer explicitly retains context rather than assigning every compound a role automatically. The final QC layer has <strong>170 chemical-role-unresolved records</strong>; unresolved context is retained rather than silently promoted. ${cite("chemical-role adjudication layer")}`;
  if(/methanogenesis|methanogen/.test(q)&&/ml|predict|model|auc|lineage|phylum|stress/.test(q))
    return `Random 5-fold environment-only ROC-AUC for methanogenesis is <strong>0.953</strong>, but this is not lineage-independent evidence. In phylum-grouped validation, methanogenesis is <strong>not estimable</strong> because all <strong>52 positives</strong> occur in one phylum. The result should therefore not be presented as proof of environment-driven methanogenesis. ${cite("final ML validation")}`;
  if(/lineage|grouped|stress test|generaliz/.test(q))
    return `Under phylum-grouped environment-only validation, ROC-AUC is <strong>0.838</strong> for sulfate reduction, <strong>0.835</strong> for sulfur reduction, <strong>0.852</strong> for iron reduction and <strong>0.858</strong> for fermentation. H₂ oxidation falls to <strong>0.213</strong>. This separates relationships that retain useful environment signal from those strongly dependent on lineage composition. ${cite("final lineage-controlled ML")}`;
  if(/h2|hydrogen oxidation/.test(q)&&/ml|model|predict|lineage/.test(q))
    return `H₂ oxidation looks strong in random cross-validation (environment-only ROC-AUC <strong>0.815</strong>) but collapses under phylum-grouped validation to <strong>0.213</strong>. That is an important negative result: the apparent random-fold signal does not generalize when lineage structure is controlled. ${cite("final ML stress test")}`;
  if(/extreme|80.?°?c|80 c|high temperature/.test(q)&&/model|classifier|ml|predict/.test(q))
    return `The Topt ≥80°C classifier uses <strong>1,217</strong> records, with <strong>161 positives</strong>. ROC-AUC is <strong>0.937</strong>, PR-AUC <strong>0.614</strong> and balanced accuracy <strong>0.873</strong>. ${cite("extreme thermal niche model")}`;
  if(/enceladus/.test(q))
    return `Enceladus is the central ThermoBase planetary case because plume chemistry and inferred ocean/hydrothermal conditions can be connected to terrestrial metabolic experiments. The pathway matrix gives hydrogenotrophic methanogenesis <strong>14/14</strong>, the highest ordinal compatibility score. That is <strong>not a probability of life</strong>; CH₄ alone is not a biosignature and abiotic methane remains a competing explanation. ${cite("Enceladus case study; Waite 2017; Taubner 2018; Affholder 2021; Postberg 2023; Higgins 2024/2026")}`;
  if(/sulfate reduction/.test(q)&&/environment|ml|predict|auc/.test(q))
    return `Sulfate reduction has random-fold environment-only ROC-AUC <strong>0.877</strong> and phylum-grouped environment-only ROC-AUC <strong>0.838</strong>. The retained signal under lineage holdout supports a cautious interpretation that environmental characteristics carry useful information beyond the random-fold lineage mixture. ${cite("final ML validation")}`;
  if(/what.*temperature|median|topt|optimum temperature/.test(q)){
    const v=med("avg_optimum_temp_c"); return `For the current filtered records, the median available optimum temperature is <strong>${fmt(v,1)} °C</strong>. ${cite("ThermoBase-derived from avg_optimum_temp_c")}`;
  }
  if(/what.*ph|median ph|optimum ph/.test(q)){
    const v=med("avg_optimum_ph"); return `For the current filtered records, the median available optimum pH is <strong>${fmt(v,1)}</strong>. ${cite("ThermoBase-derived from avg_optimum_ph")}`;
  }
  if(/show|plot|graph|visual|chart/.test(q)&&/temperature|temp|ph/.test(q))
    return `I can generate an interactive chart from the current ThermoBase records. Use the suggestion below to visualize the filtered temperature × pH space.`;
  if(/337|columns|fields|schema|architecture/.test(q))
    return `ThermoBase is structured around <strong>337 fields</strong> in the final ML release. The architecture separates source/S1 values, normalized fields, derived analytical features, evidence/provenance and model-ready variables rather than collapsing everything into one undifferentiated table. ${cite("ThermoBase final release architecture")}`;
  if(/unknown|missing|halluc/.test(q))
    return `The research layer does not fill unsupported values. Missing values are retained, literature augmentation is distinguished from original S1, and unresolved cases remain explicitly flagged. ${cite("ThermoBase data-integrity policy")}`;
  return `I could not find a sufficiently specific answer in the current ThermoBase research layer. Try asking about <strong>thermal/pH coverage, environments, metabolism, chemistry, QC, the ML stress test, or Enceladus</strong>. I will not manufacture an answer when the project data do not support one.`;
}
function chatVisual(){
  const a=localRecords().filter(r=>num(r.avg_optimum_temp_c)!=null&&num(r.avg_optimum_ph)!=null);
  $("#chatVisual").classList.add("active");
  $("#chatVisual").innerHTML='<div id="chatPlot" class="plot"></div>';
  plot("chatPlot",[{x:a.map(r=>num(r.avg_optimum_temp_c)),y:a.map(r=>num(r.avg_optimum_ph)),mode:"markers",type:"scatter",text:a.map(r=>r.name),hovertemplate:"<b>%{text}</b><br>Topt %{x} °C<br>pHopt %{y}<extra></extra>"}],{xaxis:{title:"Optimum temperature (°C)"},yaxis:{title:"Optimum pH"},title:{text:`ThermoBase physiological space · ${a.length} records`,font:{size:13}}});
}
function submitChat(q){
  q=q.trim(); if(!q)return;
  addChat("user",esc(q));
  const ans=localChatAnswer(q); addChat("assistant",ans);
  const l=q.toLowerCase();
  if(/show|plot|graph|visual|chart/.test(l)&&/temperature|temp|ph/.test(l)) chatVisual();
}
document.addEventListener("DOMContentLoaded",()=>{
  $("#chatFab").onclick=chatOpen; $("#chatClose").onclick=chatClose;
  $("#chatForm").onsubmit=e=>{e.preventDefault();const q=$("#chatQuestion");submitChat(q.value);q.value=""};
  document.addEventListener("click",e=>{const b=e.target.closest("[data-chatq]");if(b){chatOpen();submitChat(b.dataset.chatq)}});
});

window.addEventListener("resize",()=>document.querySelectorAll(".js-plotly-plot").forEach(el=>{try{Plotly.Plots.resize(el)}catch(e){}}));
document.addEventListener("keydown",e=>{
  if(e.target===document.getElementById("chatQuestion") && e.key==="Enter" && !e.shiftKey){
    e.preventDefault(); document.getElementById("chatForm")?.requestSubmit();
  }
});

document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("#researchChat")?.classList.contains("open"))chatClose()});
