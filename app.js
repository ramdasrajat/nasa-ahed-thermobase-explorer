const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>v==null||v===''||v==='NA'?null:Number(v);
const finite=v=>v!=null&&v!==''&&Number.isFinite(Number(v));
const fmt=(v,d=2)=>finite(v)?Number(v).toFixed(d):'—';
const normPath=s=>String(s||'').toLowerCase().trim().replace(/[\s_]+/g,'-').replace(/-+/g,'-');
const pathwaysOf=r=>String(r.metabolism_pathways||'').split(/[;,]/).map(s=>s.trim()).filter(Boolean);
const hasPath=(r,p)=>pathwaysOf(r).some(v=>normPath(v)===normPath(p)||normPath(v).includes(normPath(p)));

const DOMAIN_COLORS={Bacteria:'#3F6C63',Archaea:'#A98B4C',Eukaryota:'#7A4C6B'};
const DOMAIN_SYMBOLS={Bacteria:'circle',Archaea:'square',Eukaryota:'diamond'};
const RUST='#C1440E', GREY='#B9BBAF', VERD='#3F6C63';

let D=null;

function modelRow(pathway,predictorSet){return D.ml_model_comparison_v74?.find(x=>normPath(x.pathway)===normPath(pathway)&&x.predictor_set===predictorSet)}
function groupedRow(pathway){return D.ml_grouped_validation_v74?.find(x=>normPath(x.pathway)===normPath(pathway))}
function verdictFor(rs,gs){
  const gap=(finite(rs)&&finite(gs))?Number(rs)-Number(gs):null;
  if(gap==null)return{cls:'caution',text:'Not estimable',detail:'Too few positive cases are spread across enough phyla to run this test.'};
  if(gap>0.3)return{cls:'collapse',text:'Signal reflects lineage',detail:'Most of the apparent predictive power disappears once ancestry is controlled for.'};
  if(gap>0.08)return{cls:'caution',text:'Partly lineage-dependent',detail:'Some of the apparent signal may reflect ancestry rather than environment.'};
  return{cls:'holds',text:'Holds under scrutiny',detail:'The environment signal survives even when ancestry is controlled for.'};
}

function plotBar(id,labels,values,{highlight=[],horizontal=false,suffix='',margin}={}){
  const el=$('#'+id); if(!el||!window.Plotly)return;
  const colors=labels.map(l=>highlight.includes(l)?RUST:GREY);
  const trace=horizontal
    ? {y:labels,x:values,type:'bar',orientation:'h',marker:{color:colors},text:values.map(v=>v.toLocaleString()+suffix),textposition:'outside',hovertemplate:'%{y}<br>%{x}<extra></extra>'}
    : {x:labels,y:values,type:'bar',marker:{color:colors},text:values.map(v=>v.toLocaleString()+suffix),textposition:'outside',hovertemplate:'%{x}<br>%{y}<extra></extra>'};
  Plotly.newPlot(el,[trace],{
    margin: margin||(horizontal?{l:220,r:50,t:10,b:30}:{l:45,r:15,t:10,b:70}),
    xaxis:horizontal?{showgrid:false,zeroline:false}:{tickangle:-25,showgrid:false},
    yaxis:horizontal?{automargin:true}:{showgrid:false,zeroline:false},
    font:{family:'Inter',size:12,color:'#171C1A'},
    paper_bgcolor:'transparent',plot_bgcolor:'transparent',showlegend:false
  },{displayModeBar:false,responsive:true});
}

function renderAct1(){
  $('#statRecords').textContent=D.meta.records.toLocaleString();
  $('#statFields').textContent=D.meta.columns;
  $('#statDomains').textContent=Object.keys(D.domain_counts).length;

  const env=Object.entries(D.environment_top).sort((a,b)=>b[1]-a[1]).slice(0,7);
  plotBar('chartEnv',env.map(x=>x[0]),env.map(x=>x[1]),{highlight:['Hot spring','Hydrothermal vent']});

  const ox=Object.entries(D.oxygen_counts).sort((a,b)=>b[1]-a[1]);
  plotBar('chartOxygen',ox.map(x=>x[0]),ox.map(x=>x[1]),{highlight:['Unspecified']});

  const bsLabel={none:'No status',not_specific_biosignature:'Flagged, not specific',
    candidate_biosignature_high_false_positive_risk:'Candidate — high FP risk',
    'candidate_biosignature_high_false_positive_risk|not_specific_biosignature':'Candidate, high-risk & non-specific'};
  const counts={};D.records.forEach(r=>{const k=r.phase4_biosignature_specificity_class_v46||'none';counts[k]=(counts[k]||0)+1});
  const order=Object.keys(bsLabel).filter(k=>counts[k]);
  plotBar('chartBiosig',order.map(k=>bsLabel[k]),order.map(k=>counts[k]),{horizontal:true,highlight:order.filter(k=>k!=='none').map(k=>bsLabel[k])});
}

function renderAct2(){
  const el=$('#chartPhys');
  if(el&&window.Plotly){
    const domains=['Bacteria','Archaea','Eukaryota'];
    const traces=domains.map(d=>{
      const rows=D.records.filter(r=>r.domain===d&&num(r.avg_optimum_temp_c)!=null&&num(r.avg_optimum_ph)!=null);
      return {x:rows.map(r=>num(r.avg_optimum_temp_c)),y:rows.map(r=>num(r.avg_optimum_ph)),mode:'markers',type:'scattergl',name:d,
        marker:{size:d==='Eukaryota'?7:5,opacity:d==='Eukaryota'?.85:.55,color:DOMAIN_COLORS[d],symbol:DOMAIN_SYMBOLS[d],line:{width:d==='Eukaryota'?1:0,color:'#fff'}},hovertemplate:'%{x}°C, pH %{y}<extra>'+d+'</extra>'};
    });
    Plotly.newPlot(el,traces,{
      xaxis:{title:'Optimum temperature (°C)',showgrid:false,zeroline:false},
      yaxis:{title:'Optimum pH',showgrid:false,zeroline:false},
      margin:{l:55,r:15,t:10,b:50},legend:{orientation:'h',y:-0.22},
      font:{family:'Inter',size:12,color:'#171C1A'},paper_bgcolor:'transparent',plot_bgcolor:'transparent'
    },{displayModeBar:false,responsive:true});
  }

  const label={CLOSED_HIGH_CONFIDENCE:'High-confidence adjudication',CLOSED_PARTIAL_HIGH_CONFIDENCE_REMAINDER_UNRESOLVED:'Partially adjudicated',
    CLOSED_UNRESOLVED_CONTEXT:'Unresolved context',CLOSED_NO_COMPOUND:'No compound extracted'};
  const counts={};D.records.forEach(r=>{const k=r.chemical_role_final_disposition_v72;if(k)counts[k]=(counts[k]||0)+1});
  const order=['CLOSED_HIGH_CONFIDENCE','CLOSED_PARTIAL_HIGH_CONFIDENCE_REMAINDER_UNRESOLVED','CLOSED_UNRESOLVED_CONTEXT','CLOSED_NO_COMPOUND'].filter(k=>counts[k]);
  plotBar('chartChem',order.map(k=>label[k]),order.map(k=>counts[k]),{horizontal:true,highlight:['High-confidence adjudication']});

  renderExplorer();
}

function renderHero(){
  const hRandom=modelRow('Hydrogen oxidation','environment_only');
  const hGrouped=groupedRow('Hydrogen oxidation');
  const rs=hRandom?.ROC_AUC, gs=hGrouped?.grouped_ROC_AUC;
  $('#heroNumRandom').textContent=fmt(rs);
  $('#heroNumGrouped').textContent=fmt(gs);
  requestAnimationFrame(()=>{
    $('#heroFillRandom').style.height=(finite(rs)?Number(rs)*160:0)+'px';
    $('#heroFillGrouped').style.height=(finite(gs)?Number(gs)*160:0)+'px';
  });
}

const PREDICTOR_LABEL={environment_only:'Environment only',taxonomy_only:'Taxonomy only',environment_plus_taxonomy:'Environment + taxonomy'};

function barRow(label,value,colorClass){
  const pct=finite(value)?Math.max(2,Number(value)*100):0;
  return `<div class="bar-row"><span>${esc(label)}</span><div class="track"><div class="fill ${colorClass}" style="width:${pct}%"></div></div><span class="val mono">${fmt(value)}</span></div>`;
}

function renderExplorer(){
  const pathwaySel=$('#expPathway'), predictorSel=$('#expPredictor'), validationSel=$('#expValidation');
  if(!pathwaySel.dataset.ready){
    D.ml_random.forEach(row=>pathwaySel.insertAdjacentHTML('beforeend',`<option value="${esc(row.pathway)}">${esc(row.pathway)}</option>`));
    pathwaySel.value='Hydrogen oxidation';
    pathwaySel.dataset.ready='1';
  }

  const update=()=>{
    const pathway=pathwaySel.value;
    let predictor=predictorSel.value;
    const validation=validationSel.value;
    if(validation==='grouped'){predictor='environment_only';predictorSel.value='environment_only';predictorSel.disabled=true;$('#expNote').style.display='block'}
    else{predictorSel.disabled=false;$('#expNote').style.display='none'}

    // main score
    let score,label;
    if(validation==='random'){score=modelRow(pathway,predictor)?.ROC_AUC;label=`${PREDICTOR_LABEL[predictor]} · random 5-fold ROC-AUC`}
    else{const g=groupedRow(pathway);score=g?.grouped_ROC_AUC;label='environment only · phylum-grouped ROC-AUC'}
    $('#expScore').textContent=finite(score)?fmt(score):(score===null?'n/e':'—');
    $('#expScoreLabel').textContent=label;

    // mechanism, with real sparsity numbers
    const g=groupedRow(pathway);
    if(validation==='random'){
      const row=modelRow(pathway,predictor);
      $('#expMechanism').innerHTML=`All <b>1,238 records</b> are shuffled together into 5 folds. Close relatives of the same lineage can land on both sides of the split, so the model can partly succeed by recognizing ancestry rather than environment. ${row?`Of these records, <b>${row.positive_n}</b> are positive cases for ${esc(pathway.toLowerCase())}.`:''}`;
    }else{
      $('#expMechanism').innerHTML=g?`Each fold holds out an <b>entire phylum</b> at once — <b>${g.phylum_groups} phylum groups</b> total, <b>${g.positive_n}</b> positive cases spread across all of them. The model is tested only on organisms from lineages it never saw during training. ${g.grouped_ROC_AUC==null?'Here, too few positives fall in more than one phylum group to run the test at all.':''}`:'No grouped-validation record for this pathway.';
    }

    // persistent comparison strip: environment-only, random vs grouped, for whichever pathway is selected
    const rs=modelRow(pathway,'environment_only')?.ROC_AUC;
    const gs=g?.grouped_ROC_AUC;
    $('#compareBars').innerHTML=barRow('Random 5-fold',rs,'grey')+barRow('Phylum-grouped',gs,'rust');
    const v=verdictFor(rs,gs);
    $('#compareTag').className='tag '+v.cls;
    $('#compareTag').textContent=v.text+' — '+v.detail;

    // predictor-set mini comparison, random validation, this pathway
    const pe=modelRow(pathway,'environment_only')?.ROC_AUC;
    const pt=modelRow(pathway,'taxonomy_only')?.ROC_AUC;
    const pc=modelRow(pathway,'environment_plus_taxonomy')?.ROC_AUC;
    $('#predictorBars').innerHTML=barRow('Environment only',pe,'verd')+barRow('Taxonomy only',pt,'grey')+barRow('Environment + taxonomy',pc,'grey');
  };

  pathwaySel.onchange=update; predictorSel.onchange=update; validationSel.onchange=update;

  $$('.preset-btn').forEach(b=>b.onclick=()=>{
    const presets={
      collapse:{pathway:'Hydrogen oxidation',predictor:'environment_only',validation:'grouped'},
      holds:{pathway:'Sulfate reduction',predictor:'environment_only',validation:'grouped'},
      untestable:{pathway:'Methanogenesis',predictor:'environment_only',validation:'grouped'}
    };
    const p=presets[b.dataset.preset];
    pathwaySel.value=p.pathway; predictorSel.value=p.predictor; validationSel.value=p.validation;
    update();
    $('#stop-2-3').scrollIntoView({behavior:'smooth',block:'center'});
  });

  update();
}

function renderRawExample(){
  const rec=D.records.find(r=>String(r.name||'').includes('kandleri 116'));
  if(!rec){$('#exampleText').textContent='';return}
  $('#exampleText').innerHTML=`<b>One organism, before and after.</b> NASA's raw S1 row for <i>${esc(rec.name)}</i> has 26 fields: taxonomy, physiology ranges, a metabolism label, a literature source. The research layer used throughout this piece expands that same organism to all 337 fields — including, as original analytical additions, a chemical-role disposition of <b class="mono">${esc(rec.chemical_role_final_disposition_v72)}</b>, a QC status of <b class="mono">${esc(rec.final_qc_record_status_v71)}</b>, and an adjudicated compound role of <b class="mono">${esc(rec.extracted_compound_final_role_v71)}</b> — none of which exist in NASA's original release.`;
}

function renderAct3(){
  const meth=D.records.filter(r=>hasPath(r,'Methanogenesis'));
  const flagged=meth.filter(r=>r.phase4_biosignature_specificity_class_v46&&r.phase4_biosignature_specificity_class_v46!=='none').length;
  const risk={};meth.forEach(r=>{const k=r.max_abiotic_false_positive_risk_reconstructed_v36;if(k)risk[k]=(risk[k]||0)+1});
  const riskLabel={low_candidate:'Low risk',medium_candidate:'Medium risk',high_candidate:'High risk'};
  const order=['low_candidate','medium_candidate','high_candidate'].filter(k=>risk[k]);
  plotBar('chartEnceladus',order.map(k=>riskLabel[k]),order.map(k=>risk[k]),{highlight:['High risk']});
  $('#enceladusRead').innerHTML=`<b>Abiotic false-positive risk among the ${meth.length} terrestrial methanogenesis analogues</b> this case study leans on. Most fall in the low- or medium-risk range — but a meaningful minority don't.`;
  $('#enceladusCallout').innerHTML=`<b>Checking our own analogue:</b> of ${meth.length} ThermoBase records carrying methanogenesis, only ${flagged} carry any candidate biosignature status at all. That spread — not the pathway match alone — is why this case study is framed as a hypothesis, not a finding.`;

  const rows=D.ml_random.map(row=>{const p=row.pathway;const rs=modelRow(p,'environment_only')?.ROC_AUC;const gs=groupedRow(p)?.grouped_ROC_AUC;return{p,v:verdictFor(rs,gs)}});
  const held=rows.filter(r=>r.v.cls==='holds').map(r=>r.p);
  const collapsed=rows.filter(r=>r.v.cls==='collapse').map(r=>r.p);
  const bsCount=D.records.filter(r=>r.phase4_biosignature_specificity_class_v46&&r.phase4_biosignature_specificity_class_v46!=='none').length;
  $('#synthesisText').innerHTML=`
    <p class="held"><b>What held up:</b> ${esc(held.join(', '))} still show a measurable environment signal after controlling for which lineage the organism belongs to.</p>
    <p class="collapsed"><b>What didn't:</b> hydrogen oxidation looked strongly predictable from environment alone under random validation, then lost most of that signal once ancestry was accounted for — the single most important negative result in this dataset.</p>
    <p><b>On biosignatures specifically:</b> only ${bsCount} of ${D.records.length.toLocaleString()} records carry any candidate biosignature status at all. Every planetary claim in this piece inherits that caution.</p>
  `;
}

function initWorkbench(){
  $('#wbRun').onclick=()=>{
    const temp=num($('#wbTemp').value), ph=num($('#wbPh').value), domain=$('#wbDomain').value;
    let rows=D.records.filter(r=>num(r.avg_optimum_temp_c)!=null&&num(r.avg_optimum_ph)!=null);
    if(domain)rows=rows.filter(r=>r.domain===domain);
    rows=rows.map(r=>({r,dist:Math.abs(num(r.avg_optimum_temp_c)-temp)/45+Math.abs(num(r.avg_optimum_ph)-ph)/3}))
      .sort((a,b)=>a.dist-b.dist).slice(0,6);
    $('#wbResult').innerHTML=rows.map(({r,dist})=>`<div class="record-hit"><b>${esc(r.name||r.record_id)}</b><span>${esc(r.domain||'—')} · ${esc(r.environment||'—')} · Topt ${fmt(num(r.avg_optimum_temp_c),0)}°C, pH ${fmt(num(r.avg_optimum_ph),1)}</span></div>`).join('')
      ||'<div class="record-hit">No comparable records found.</div>';
  };
}

function initScrollTracking(){
  const progress=$('#progress');
  const update=()=>{const h=document.documentElement.scrollHeight-window.innerHeight;progress.style.width=(h>0?Math.min(100,window.scrollY/h*100):0)+'%'};
  window.addEventListener('scroll',update,{passive:true});update();

  const acts=$$('.act');
  if('IntersectionObserver' in window){
    const spy=new IntersectionObserver(entries=>{
      entries.forEach(en=>{if(en.isIntersecting){
        const id=en.target.id;
        $$('.act-rail a').forEach(a=>a.classList.toggle('active',a.dataset.act===id));
      }});
    },{rootMargin:'-40% 0px -55% 0px'});
    acts.forEach(a=>spy.observe(a));

    const stopSpy=new IntersectionObserver(entries=>{
      entries.forEach(en=>{if(en.isIntersecting){
        const tick=$(`.act-rail i[data-stop="${en.target.id}"]`);
        if(tick){$$('.act-rail i').forEach(i=>i.style.background='');tick.style.background='var(--rust)'}
      }});
    },{rootMargin:'-45% 0px -50% 0px'});
    $$('.stop').forEach(s=>stopSpy.observe(s));
  }
}

async function boot(){
  try{
    const res=await fetch('data/thermobase.json');
    D=await res.json();
  }catch(e){
    document.body.innerHTML='<p style="padding:60px;font-family:Inter">Could not load the dataset. Check that data/thermobase.json is present next to this page.</p>';
    console.error(e);return;
  }
  renderHero();
  renderRawExample();
  renderAct1();
  renderAct2();
  renderAct3();
  initWorkbench();
  initScrollTracking();
}
boot();
