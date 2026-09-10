#!/usr/bin/env python3
"""ThermoBase Web Release Audit System.

Standard-library-only release gate. Run from the repository root:
  python WEB_AUDIT/audit_webapp.py .
Optionally compare against the frozen ML CSV:
  python WEB_AUDIT/audit_webapp.py . --source /path/to/ThermoBase_clean_v74_ML_FINAL_RELEASE.csv

The audit is intentionally conservative: it never converts missing values to zeros,
and numeric source-vs-JSON comparisons account for IEEE-754 serialization rounding.
"""
from __future__ import annotations
import argparse,csv,json,math,re,sys,hashlib
from decimal import Decimal,InvalidOperation
from html.parser import HTMLParser
from pathlib import Path

EXPECTED_RECORDS=1238
EXPECTED_FIELDS=337
EXPECTED_TARGETS={
 'methanogenesis':52,'sulfate reduction':77,'sulfur reduction':113,
 'iron reduction':26,'fermentation':152,'hydrogen oxidation':23}
EXPECTED_SECTIONS=['overview','physiology','environment','metabolism','evidence','analysis','ml','sandbox','worlds','synthesis']
DYNAMIC_PLOTS={'modalPlot','chatPlot'}
REQUIRED_CONTROLS=['fDomain','fEnvironment','fTopt','fPh','fMet','mlPathway','mlPredictors','mlValidation','mlThreshold',
 'sbTemp','sbPH','sbSal','sbPressure','sbO2','sbH2','sbCO2','sbSulfate','sbSulfur','sbIron','chatQuestion']

class HTMLInfo(HTMLParser):
 def __init__(self):
  super().__init__(); self.ids=[]; self.tags=[]; self.links=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs); self.tags.append((tag,a))
  if 'id' in a:self.ids.append(a['id'])
  if tag=='a' and a.get('href'):self.links.append(a['href'])

def norm(v):
 if v is None:return None
 s=str(v).strip()
 if s=='' or s.lower() in {'nan','none','null','na','n/a'}:return None
 return s

def num_equal(a,b):
 a,b=norm(a),norm(b)
 if a==b:return True
 if a is None or b is None:return False
 try:
  x,y=float(a),float(b)
  if not(math.isfinite(x) and math.isfinite(y)):return False
  # JSON numeric serialization can differ by one or a few ulps from the CSV text.
  return math.isclose(x,y,rel_tol=1e-14,abs_tol=1e-15)
 except (ValueError,TypeError):return False

def cell_equal(a,b):
 a,b=norm(a),norm(b)
 if a==b:return True
 if a is None or b is None:return False
 if num_equal(a,b):return True
 # booleans commonly appear as Python bool in JSON and textual booleans in CSV.
 if a.lower() in {'true','false'} or b.lower() in {'true','false'}:return a.lower()==b.lower()
 return False

def read_json(p):return json.loads(p.read_text(encoding='utf-8'))

def has_path(s,target):
 target=re.sub(r'-+','-',re.sub(r'[\s_]+','-',str(target).lower().strip()))
 vals=[re.sub(r'-+','-',re.sub(r'[\s_]+','-',x.lower().strip())) for x in re.split(r'[,;|]',str(s or '')) if x.strip()]
 return any(v==target or target in v or v in target for v in vals)

def audit(root,source=None):
 root=Path(root); h=root/'index.html'; js=root/'app.js'; css=root/'styles.css'; data=root/'data'/'thermobase.json'
 out=[]
 def add(g,test,ok,detail='',severity='FAIL'):
  out.append({'gate':g,'test':test,'status':'PASS' if ok else ('WARN' if severity=='WARN' else 'FAIL'),'severity': '' if ok else severity,'detail':detail})
 # A: package/data integrity
 for p in [h,js,css,data]:add('A',f'file exists: {p.relative_to(root)}',p.exists(),str(p))
 if not data.exists(): return out
 try:d=read_json(data);add('A','valid JSON',True,'standards-compliant JSON')
 except Exception as e:add('A','valid JSON',False,repr(e));return out
 rec=d.get('records',[]); schema=d.get('schema_fields',[]); names=[x.get('name') for x in schema]
 add('A','record count',len(rec)==EXPECTED_RECORDS,str(len(rec))); add('A','field count',len(schema)==EXPECTED_FIELDS,str(len(schema)))
 add('A','schema names unique',len(names)==len(set(names)),f'{len(set(names))} unique names')
 counts=sorted({len(r) for r in rec});add('A','every record exposes full schema',counts==[EXPECTED_FIELDS],f'key counts={counts}')
 miss=[n for n in names if any(n not in r for r in rec)];add('A','all schema fields present',not miss,f'missing={miss[:10]}')
 ids=[str(r.get('record_id')) for r in rec];add('A','record IDs unique',len(ids)==len(set(ids)),f'{len(set(ids))} unique')
 bad=[]
 def walk(x,path=''):
  if isinstance(x,float) and not math.isfinite(x):bad.append(path)
  elif isinstance(x,dict):
   for k,v in x.items():walk(v,path+'/'+str(k))
  elif isinstance(x,list):
   for i,v in enumerate(x):walk(v,path+'/'+str(i))
 walk(d);add('A','no NaN/Infinity in JSON',not bad,f'bad={bad[:10]}')
 meta=d.get('meta',{}); add('A','metadata dimensions agree',meta.get('records')==len(rec) and meta.get('columns')==len(schema),str({k:meta.get(k) for k in ['records','columns','version','frozen_dataset','analysis_release','integration_release']}))
 manifest=root/'WEB_AUDIT'/'release_manifest.json'
 if manifest.exists():
  try:
   m=json.loads(manifest.read_text(encoding='utf-8')); sha=hashlib.sha256(data.read_bytes()).hexdigest()
   add('A','frozen web data SHA256 matches release manifest',sha==m.get('data_sha256'),f'actual={sha} expected={m.get("data_sha256")}')
   add('A','release manifest dimensions agree',m.get('records')==len(rec) and m.get('fields')==len(schema),f'manifest={m.get("records")}×{m.get("fields")}')
  except Exception as e:add('A','release manifest valid',False,repr(e))
 else:add('A','release manifest present',False,'WEB_AUDIT/release_manifest.json missing')
 # B: source equivalence
 if source and Path(source).exists():
  with open(source,newline='',encoding='utf-8-sig') as f:
   reader=csv.DictReader(f); rows=list(reader); fields=reader.fieldnames or []
  add('B','source dimensions',len(rows)==len(rec) and len(fields)==len(schema),f'{len(rows)}×{len(fields)}')
  add('B','source/web column order identical',fields==names,'mismatch index='+str(next((i for i,(a,b) in enumerate(zip(fields,names)) if a!=b),None)))
  mism=[]; numeric_max=0.0
  for i,(row,r) in enumerate(zip(rows,rec),1):
   for f in fields:
    a,b=norm(row.get(f)),norm(r.get(f))
    if a==b:continue
    if a is not None and b is not None:
     try:numeric_max=max(numeric_max,abs(float(a)-float(b)))
     except:pass
    if not cell_equal(a,b):
     mism.append((i,f,row.get(f),r.get(f)))
     if len(mism)>=10:break
   if len(mism)>=10:break
  add('B','source/web values equivalent',not mism,f'mismatches={mism}; max numeric serialization delta={numeric_max:.3g}')
 else: out.append({'gate':'B','test':'source/web equivalence','status':'WARN','severity':'WARN','detail':'source not supplied; structural release checks still run'})
 # C: HTML/JS wiring
 hi=HTMLInfo();hi.feed(h.read_text(encoding='utf-8')); ids=hi.ids; jsx=js.read_text(encoding='utf-8'); cssx=css.read_text(encoding='utf-8')
 add('C','HTML IDs unique',len(ids)==len(set(ids)),f'{len(ids)} IDs')
 # Only explicit #id selectors / getElementById are considered DOM ID references.
 refs=set(re.findall(r"(?:getElementById\(['\"]|querySelector(?:All)?\(['\"]#)([A-Za-z0-9_-]+)",jsx))
 add('C','static JS DOM references resolve',not(refs-set(ids)),f'missing={sorted(refs-set(ids))}')
 add('C','scientific journey sections present',all(x in ids for x in EXPECTED_SECTIONS),f'missing={[x for x in EXPECTED_SECTIONS if x not in ids]}')
 add('C','data path is local JSON','data/thermobase.json' in jsx,'client data path')
 add('C','free-form chat wired','chatQuestion' in ids and 'onsubmit' in jsx and 'submitChat' in jsx,'chat form')
 add('C','navigation history wired','pushState' in jsx and 'popstate' in jsx,'browser history')
 add('C','collapsible/mobile navigation wired','sidebarToggle' in ids and 'mobileNavToggle' in ids and 'sidebar-collapsed' in jsx,'navigation controls')
 # D: charts
 static=[]
 for tag,a in hi.tags:
  if 'plot' in a.get('class','').split() and a.get('id'):static.append(a['id'])
 calls=set(re.findall(r"\bplot\(\s*['\"]([^'\"]+)['\"]",jsx))
 add('D','all static chart containers have render paths',not(set(static)-calls),f'missing={sorted(set(static)-calls)}')
 add('D','dynamic chart targets explicitly handled','modalPlot' in ids and 'chatPlot' in jsx and 'modalPlot' in jsx,'modalPlot is a static modal mount; chatPlot is created dynamically by chatVisual()')
 add('D','chart maximize contract','openModal' in jsx and 'expand-chart' in jsx and 'modalPlot' in ids,'maximize/fullscreen')
 add('D','no-data contract','function noData' in jsx and 'NO RELIABLE PLOT' in jsx,'evidence-aware empty state')
 calls_with_args=re.findall(r"\bplot\(\s*['\"]([^'\"]+)['\"]\s*,\s*\[.*?\]\s*,\s*\{.*?\}\s*,\s*",jsx,re.S)
 add('D','plot calls include explanation argument',len(calls_with_args)>=len(static)-len(DYNAMIC_PLOTS),f'calls_with_explanation={len(calls_with_args)} static={len(static)}')
 add('D','explanation contract','ensureGuide' in jsx and 'How to read' in jsx and 'What it tells us' in jsx,'universal guide injection')
 guide_start=jsx.find('function guideText(id)')
 guide_end=jsx.find('}[id]',guide_start)
 guide_blob=jsx[guide_start:guide_end] if guide_start>=0 and guide_end>=0 else ''
 gkeys=set(re.findall(r'(?m)^\s*([A-Za-z0-9_]+):',guide_blob))
 missing_guides=sorted((set(static)-DYNAMIC_PLOTS)-gkeys)
 add('D','every static chart has a guide entry',not missing_guides,f'missing={missing_guides}')
 # E controls / interactions
 for c in REQUIRED_CONTROLS:add('E',f'control exists: {c}',c in ids,f'present={c in ids}')
 add('E','field explorer drilldown','showField(' in jsx and 'schemaDetail' in ids and '[data-field]' in jsx,'field detail path')
 add('E','record drilldown','showRecord(' in jsx and '[data-record]' in jsx,'record detail path')
 add('E','metabolism search','metSearch' in ids and 'renderMetabolism' in jsx,'search path')
 add('E','environment scenario updates inputs','runSandbox' in jsx and all(x in jsx for x in ['sbH2','sbCO2','sbSulfate','sbSulfur','sbIron']),'scenario logic')
 add('E','environment → metabolism relationship drilldown','envMetSankey' in ids and 'envMetSankeyDetail' in ids and 'supporting records' in jsx,'record-backed flow map')
 add('E','pathway → chemistry relationship drilldown','chemSankey' in ids and 'extracted_compound_final_role_v71' in jsx and 'compoundRoleCounts' in jsx,'record-backed chemistry map')
 add('E','planetary content uses selected-world title','worldChainTitle' in ids and 'chainTitle.textContent' in jsx and 'chains[w]' in jsx,'world-specific content binding')
 add('E','ML transparency panel present','mlFeatureMap' in ids and 'What enters the model?' in jsx and 'Leakage control' in jsx,'predictor/methodology explanation')
 add('E','chat searches full web record','Object.values(r).some' in jsx and 'full 337-field web release' in jsx,'full-record retrieval')
 # F scientific release consistency
 for label,expected in EXPECTED_TARGETS.items():
  n=sum(has_path(r.get('metabolism_pathways'),label) for r in rec);add('F',f'ML target count: {label}',n==expected,f'web={n} expected={expected}')
 add('F','model comparison release present',bool(d.get('ml_model_comparison_v74')) and len(d['ml_model_comparison_v74'])>=18,f"rows={len(d.get('ml_model_comparison_v74',[]))}")
 add('F','grouped validation release present',bool(d.get('ml_grouped_validation_v74')),f"rows={len(d.get('ml_grouped_validation_v74',[]))}")
 add('F','OOF row count',len(d.get('ml_environment_oof_v74',[]))==EXPECTED_RECORDS,f"rows={len(d.get('ml_environment_oof_v74',[]))}")
 # G scientific wording/links
 lower=(h.read_text(encoding='utf-8')+'\n'+jsx).lower()
 score_mentions=re.findall(r'14\s*/\s*14',lower)
 negated=bool(re.search(r'14\s*/\s*14.{0,180}(not\s+(?:a\s+)?probability|ordinal\s+compatibility)',lower,re.S))
 add('G','14/14 has non-probabilistic framing',not score_mentions or negated,f'mentions={len(score_mentions)}, explicit_negation={negated}')
 http=[x for x in hi.links if x.startswith('http:')];add('G','external links use HTTPS',not http,str(http))
 add('G','original NASA dataset link present',any('ahed.nasa.gov' in x for x in hi.links),'NASA/AHED link')
 # H visual/accessibility contracts
 add('H','responsive CSS present','@media' in cssx,'media queries','WARN')
 add('H','horizontal overflow guarded','overflow-x:hidden' in cssx,'overflow protection','WARN')
 add('H','focus states present',':focus' in cssx,'keyboard focus','WARN')
 add('H','theme support present','dataset.theme' in jsx and 'data-theme=dark' in cssx,'light/dark mode')
 add('H','payload size under 35 MB',data.stat().st_size < 35*1024*1024,f'{data.stat().st_size/1024/1024:.2f} MB','WARN')
 return out

def write_reports(root,results):
 out=root/'WEB_AUDIT';out.mkdir(exist_ok=True)
 (out/'audit_results.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
 with open(out/'audit_results.csv','w',newline='',encoding='utf-8') as f:
  w=csv.DictWriter(f,fieldnames=['gate','test','status','severity','detail']);w.writeheader();w.writerows(results)
 fails=[r for r in results if r['status']=='FAIL'];warns=[r for r in results if r['status']=='WARN'];passes=len(results)-len(fails)-len(warns)
 lines=[f'# ThermoBase Web Audit Report', '',f'**PASS:** {passes}  **FAIL:** {len(fails)}  **WARN:** {len(warns)}','',f'## Release gate', '**STATUS: PASS — release gate clean**' if not fails else '**STATUS: FAIL — release must not be deployed**','', '| Gate | Test | Status | Detail |','|---|---|---|---|']
 for r in results:lines.append(f"| {r['gate']} | {r['test']} | {r['status']} | {r['detail'].replace('|','\\|')} |")
 lines += ['', '## Audit principle', 'This is a release gate, not a visual substitute for live-browser inspection. New failure modes should become new automated checks rather than relying on memory.']
 (out/'audit_report.md').write_text('\n'.join(lines),encoding='utf-8')
 return passes,len(fails),len(warns)

if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('root');ap.add_argument('--source');a=ap.parse_args();res=audit(a.root,a.source);p,f,w=write_reports(Path(a.root),res)
 print(f'THERMOBASE WEB AUDIT SYSTEM v2\nPASS={p} FAIL={f} WARN={w}\n')
 for r in res:print(f"[{r['status']}] {r['gate']} | {r['test']} | {r['detail']}")
 sys.exit(1 if f else 0)
