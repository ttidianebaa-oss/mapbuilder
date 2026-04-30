import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getProject, saveProject } from '../../lib/storage';

const FONTS = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap';

const MODULES_META = [
  { id: 1, key: 'm1', label: 'Idée',       short: '01' },
  { id: 2, key: 'm2', label: 'Validation',  short: '02' },
  { id: 3, key: 'm3', label: 'Structure',   short: '03' },
  { id: 4, key: 'm4', label: 'Modèle',      short: '04' },
  { id: 5, key: 'm5', label: 'Lancement',   short: '05' },
  { id: 6, key: 'm6', label: 'Suivi',       short: '06' },
  { id: 7, key: 'm7', label: 'Stack',       short: '07' },
  { id: 8, key: 'm8', label: 'Croissance',  short: '08' },
];

const CATEGORIES      = ['SaaS','Média','E-commerce','App mobile','Service','Marketplace','Autre'];
const CURRENCIES      = ['CAD','USD','EUR','XOF','GBP','CHF'];
const FOUNDER_COUNTRIES = ["Canada (Québec)","Canada (autre)","France","Sénégal","Côte d'Ivoire","Maroc","Belgique","Suisse","États-Unis","Autre"];
const TARGET_COUNTRIES  = ['Canada','France','Afrique francophone','États-Unis','Europe','Mondial','Autre'];

// ─── Shared styles ──────────────────────────────────────────────────────────

const inputStyle = {
  width:'100%', background:'#18181f', border:'1px solid #2a2a38',
  borderRadius:8, padding:'10px 14px', color:'#f0f0f5', fontSize:14,
  outline:'none', fontFamily:"'DM Sans',sans-serif",
};
const selectStyle = { ...inputStyle, cursor:'pointer' };

// ─── Root page ───────────────────────────────────────────────────────────────

export default function ProjectPage() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState(null);
  const [activeModule, setActiveModule] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!id || !mounted) return;
    const p = getProject(id);
    if (!p) { router.replace('/'); return; }
    setProject(p);
    // Jump to first non-locked module
    const first = MODULES_META.find(m => {
      const s = p.modules[m.key]?.status;
      return s === 'available' || s === 'in_progress' || s === 'complete';
    });
    if (first) setActiveModule(first.id);
  }, [id, mounted]);

  function updateProject(updated) {
    const saved = saveProject(updated);
    setProject(saved);
    return saved;
  }

  if (!mounted || !project) {
    return (
      <div style={{background:'#0a0a0f',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{width:20,height:20,border:'2px solid #2a2a38',borderTop:'2px solid #7c5cfc',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} />
      </div>
    );
  }

  const currentMeta   = MODULES_META.find(m => m.id === activeModule);
  const currentStatus = project.modules[currentMeta.key]?.status;

  return (
    <>
      <Head>
        <title>{project.name} · MapBuilder</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link href={FONTS} rel="stylesheet" />
      </Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0a0a0f;color:#f0f0f5;font-family:'DM Sans',sans-serif;min-height:100vh}
        button{cursor:pointer}
        textarea,input,select{font-family:'DM Sans',sans-serif}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade{animation:fadeIn 0.35s ease both}
        input:focus,textarea:focus,select:focus{border-color:#7c5cfc !important;outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#2a2a38;border-radius:2px}
      `}</style>

      {/* Glow */}
      <div style={{position:'fixed',top:-200,left:'50%',transform:'translateX(-50%)',width:800,height:500,background:'radial-gradient(ellipse,#7c5cfc0e 0%,transparent 70%)',pointerEvents:'none',zIndex:0}} />

      {/* Sticky header */}
      <div style={{borderBottom:'1px solid #2a2a38',background:'rgba(10,10,15,0.9)',backdropFilter:'blur(12px)',position:'sticky',top:0,zIndex:20}}>
        <div style={{maxWidth:960,margin:'0 auto',padding:'0 24px',display:'flex',alignItems:'center',height:54,gap:14}}>
          <button onClick={() => router.push('/')} style={{background:'transparent',border:'none',color:'#8b8b9a',fontFamily:'DM Mono',fontSize:11,letterSpacing:'0.05em',display:'flex',alignItems:'center',gap:6,padding:0,flexShrink:0}}>
            ← retour
          </button>
          <div style={{width:1,height:18,background:'#2a2a38'}} />
          <div style={{fontFamily:'Syne',fontWeight:700,fontSize:15,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{project.name}</div>
          <div style={{fontFamily:'DM Mono',fontSize:10,color:'#8b8b9a',letterSpacing:'0.1em',flexShrink:0}}>
            {['m1','m2','m3','m4','m5','m6','m7','m8'].filter(k => project.modules[k]?.status === 'complete').length}/8
          </div>
        </div>
      </div>

      {/* Module tabs */}
      <div style={{borderBottom:'1px solid #2a2a38',background:'#0a0a0f',overflowX:'auto',position:'sticky',top:54,zIndex:19}}>
        <div style={{maxWidth:960,margin:'0 auto',padding:'0 24px',display:'flex',gap:0}}>
          {MODULES_META.map(m => {
            const status   = project.modules[m.key]?.status;
            const isActive = activeModule === m.id;
            const isLocked = status === 'locked';
            const isDone   = status === 'complete';
            return (
              <button
                key={m.id}
                onClick={() => !isLocked && setActiveModule(m.id)}
                style={{
                  background:'transparent', border:'none',
                  borderBottom: isActive ? '2px solid #7c5cfc' : '2px solid transparent',
                  padding:'12px 14px', display:'flex', flexDirection:'column', alignItems:'center',
                  gap:2, cursor:isLocked?'not-allowed':'pointer',
                  opacity:isLocked?0.3:1, flexShrink:0, transition:'opacity 0.2s',
                }}
              >
                <span style={{fontFamily:'DM Mono',fontSize:9,color:isDone?'#22d3a0':isActive?'#a78bfa':'#8b8b9a',letterSpacing:'0.15em'}}>{m.short}</span>
                <span style={{fontFamily:'Syne',fontSize:12,fontWeight:700,color:isDone?'#22d3a0':isActive?'#f0f0f5':'#8b8b9a',whiteSpace:'nowrap'}}>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:820,margin:'0 auto',padding:'40px 24px 80px',position:'relative',zIndex:1}}>
        {activeModule === 1 && (
          <Module1 project={project} onUpdate={updateProject} onNavigate={() => setActiveModule(2)} />
        )}
        {activeModule === 2 && currentStatus === 'locked' && (
          <LockedModule label="Validation" prev="Idée" />
        )}
        {activeModule === 2 && currentStatus !== 'locked' && (
          <Module2 project={project} onUpdate={updateProject} onNavigate={() => setActiveModule(3)} />
        )}
        {activeModule === 3 && currentStatus === 'locked' && (
          <LockedModule label="Structure" prev="Validation" />
        )}
        {activeModule === 3 && currentStatus !== 'locked' && (
          <Module3 project={project} onUpdate={updateProject} onNavigate={() => setActiveModule(4)} />
        )}
        {activeModule === 4 && currentStatus === 'locked' && (
          <LockedModule label="Modèle" prev="Structure" />
        )}
        {activeModule === 4 && currentStatus !== 'locked' && (
          <Module4 project={project} onUpdate={updateProject} onNavigate={() => setActiveModule(5)} />
        )}
        {activeModule === 5 && currentStatus === 'locked' && (
          <LockedModule label="Lancement" prev="Modèle" />
        )}
        {activeModule === 5 && currentStatus !== 'locked' && (
          <Module5 project={project} onUpdate={updateProject} onNavigate={() => setActiveModule(6)} />
        )}
        {activeModule === 6 && currentStatus === 'locked' && (
          <LockedModule label="Suivi" prev="Lancement" />
        )}
        {activeModule === 6 && currentStatus !== 'locked' && (
          <Module6 project={project} onUpdate={updateProject} onNavigate={() => setActiveModule(7)} />
        )}
        {activeModule === 7 && currentStatus === 'locked' && (
          <LockedModule label="Stack" prev="Suivi" />
        )}
        {activeModule === 7 && currentStatus !== 'locked' && (
          <Module7 project={project} onUpdate={updateProject} onNavigate={() => setActiveModule(8)} />
        )}
        {activeModule === 8 && currentStatus === 'locked' && (
          <Module8Locked project={project} />
        )}
        {activeModule === 8 && currentStatus !== 'locked' && (
          <Module8 project={project} onUpdate={updateProject} />
        )}
      </div>
    </>
  );
}

// ─── Module 1 — Idée ─────────────────────────────────────────────────────────

function Module1({ project, onUpdate, onNavigate }) {
  const m1   = project.modules.m1;
  const saved = m1.data || {};

  const [form, setForm] = useState({
    projectName:   saved.projectName   || project.name || '',
    category:      saved.category      || 'SaaS',
    currency:      saved.currency      || 'CAD',
    founderCountry:saved.founderCountry|| 'Canada (Québec)',
    targetCountry: saved.targetCountry || 'Canada',
    description:   saved.description   || '',
    targetMarket:  saved.targetMarket  || '',
    problem:       saved.problem       || '',
  });
  const [phase,    setPhase]    = useState(m1.status === 'complete' ? 'done' : 'form');
  const [aiResult, setAiResult] = useState(saved.aiResult || null);
  const [error,    setError]    = useState('');

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const isValid = form.projectName.trim().length >= 2
    && form.description.trim().length >= 50
    && form.targetMarket.trim().length >= 5
    && form.problem.trim().length >= 5;

  async function analyze() {
    if (!isValid) return;
    setError(''); setPhase('loading');
    try {
      const res  = await fetch('/api/m1', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur API');
      setAiResult(data);
      setPhase('result');
    } catch (e) { setError(e.message); setPhase('form'); }
  }

  function validate() {
    const updated = {
      ...project,
      name: form.projectName,
      modules: {
        ...project.modules,
        m1: { status:'complete', data:{ ...form, aiResult } },
        m2: { ...project.modules.m2, status:'available' },
      },
    };
    onUpdate(updated);
    setPhase('done');
  }

  const complexColor = aiResult?.complexite === 'Simple' ? '#22d3a0'
    : aiResult?.complexite === 'Moyen' ? '#fbbf24' : '#f87171';

  return (
    <div>
      <ModuleHeader number="01" title="Idée" subtitle="Décris ton projet — l'IA le structure et identifie les hypothèses clés." status={m1.status} />

      {/* ── Form ── */}
      {(phase === 'form' || phase === 'loading') && (
        <div className="fade">
          <Section title="Informations de base">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div style={{gridColumn:'1 / -1'}}>
                <Field label="Nom du projet" required>
                  <input value={form.projectName} onChange={e => setField('projectName', e.target.value)} placeholder="Ex: FinanceApp" style={inputStyle} />
                </Field>
              </div>
              <Field label="Catégorie" required>
                <select value={form.category} onChange={e => setField('category', e.target.value)} style={selectStyle}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Devise">
                <select value={form.currency} onChange={e => setField('currency', e.target.value)} style={selectStyle}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Pays fondateur">
                <select value={form.founderCountry} onChange={e => setField('founderCountry', e.target.value)} style={selectStyle}>
                  {FOUNDER_COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Marché cible (pays)">
                <select value={form.targetCountry} onChange={e => setField('targetCountry', e.target.value)} style={selectStyle}>
                  {TARGET_COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Description du projet">
            <Field label="Description" hint={`${form.description.length} car. (min. 50)`} required>
              <textarea value={form.description} onChange={e => setField('description', e.target.value)}
                placeholder="Décris ton projet en détail : la solution, le contexte, la technologie envisagée..."
                style={{...inputStyle, minHeight:110, resize:'vertical'}} />
            </Field>
            <Field label="Marché cible" hint="Qui sont tes clients ?" required>
              <input value={form.targetMarket} onChange={e => setField('targetMarket', e.target.value)}
                placeholder="Ex: PME africaines sans accès bancaire, freelances tech en France..."
                style={inputStyle} />
            </Field>
            <Field label="Problème résolu" hint="Une phrase directe." required>
              <input value={form.problem} onChange={e => setField('problem', e.target.value)}
                placeholder="Ex: Les freelances perdent 2h/semaine à gérer leur facturation..."
                style={inputStyle} />
            </Field>
          </Section>

          {error && <ErrorBox msg={error} />}

          <button
            onClick={analyze}
            disabled={!isValid || phase === 'loading'}
            style={{width:'100%',background:isValid&&phase!=='loading'?'#7c5cfc':'#2a2a38',color:isValid&&phase!=='loading'?'white':'#8b8b9a',border:'none',borderRadius:12,padding:16,fontFamily:'Syne',fontSize:15,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:10,transition:'background 0.2s',boxShadow:isValid?'0 4px 24px #7c5cfc30':undefined}}
          >
            {phase === 'loading'
              ? <><Spinner />Analyse en cours...</>
              : 'Analyser avec IA →'}
          </button>
        </div>
      )}

      {/* ── AI Results ── */}
      {(phase === 'result' || phase === 'done') && aiResult && (
        <div className="fade">
          {phase === 'done' && (
            <div style={{background:'#22d3a010',border:'1px solid #22d3a025',borderRadius:12,padding:'12px 18px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:7,height:7,background:'#22d3a0',borderRadius:'50%'}} />
                <span style={{color:'#22d3a0',fontFamily:'DM Mono',fontSize:11,letterSpacing:'0.05em'}}>Module complété</span>
              </div>
              <button onClick={() => setPhase('form')} style={{background:'transparent',border:'1px solid #2a2a38',color:'#8b8b9a',borderRadius:8,padding:'6px 14px',fontFamily:'DM Mono',fontSize:11}}>
                Modifier
              </button>
            </div>
          )}

          {/* Project summary */}
          <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:16,padding:24,marginBottom:14}}>
            <SectionTitle>Résumé</SectionTitle>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
              <Badge color="#7c5cfc">{form.category}</Badge>
              <Badge color="#22d3a0">{form.currency}</Badge>
              <Badge color="#8b8b9a">{form.founderCountry}</Badge>
              <Badge color="#8b8b9a">{form.targetCountry}</Badge>
            </div>
            <p style={{fontSize:13,color:'#8b8b9a',lineHeight:1.6,marginBottom:12}}>{form.description}</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <MiniCard label="Marché cible" value={form.targetMarket} />
              <MiniCard label="Problème résolu" value={form.problem} />
            </div>
          </div>

          {/* Reformulation */}
          <div style={{background:'#111118',border:'1px solid #7c5cfc28',borderRadius:16,padding:24,marginBottom:14}}>
            <SectionTitle accent="#a78bfa">Reformulation IA</SectionTitle>
            <p style={{fontSize:15,lineHeight:1.75,color:'#e0e0ec'}}>{aiResult.reformulation}</p>
          </div>

          {/* Complexité + Hypothèses */}
          <div style={{display:'grid',gridTemplateColumns:'160px 1fr',gap:12,marginBottom:14}}>
            <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:14,padding:20,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,textAlign:'center'}}>
              <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'#8b8b9a'}}>Complexité</div>
              <div style={{fontFamily:'Syne',fontSize:26,fontWeight:800,color:complexColor}}>{aiResult.complexite}</div>
              {aiResult.complexite_note && <div style={{fontSize:11,color:'#8b8b9a',lineHeight:1.4}}>{aiResult.complexite_note}</div>}
            </div>
            <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:14,padding:20}}>
              <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'#8b8b9a',marginBottom:12}}>3 hypothèses critiques</div>
              {(aiResult.hypotheses || []).map((h, i) => (
                <div key={i} style={{display:'flex',gap:10,fontSize:13,color:'#c0c0d0',lineHeight:1.5,marginBottom:8}}>
                  <span style={{color:'#a78bfa',fontFamily:'DM Mono',fontSize:11,flexShrink:0,marginTop:1}}>{i+1}.</span>{h}
                </div>
              ))}
            </div>
          </div>

          {/* Risques */}
          <div style={{background:'#111118',border:'1px solid #f8717115',borderRadius:16,padding:22,marginBottom:20}}>
            <SectionTitle accent="#f87171">3 risques identifiés</SectionTitle>
            {(aiResult.risques || []).map((r, i) => (
              <div key={i} style={{display:'flex',gap:10,fontSize:13,color:'#c0c0d0',lineHeight:1.5,marginBottom:8}}>
                <span style={{color:'#f87171',flexShrink:0}}>!</span>{r}
              </div>
            ))}
          </div>

          {phase === 'result' && (
            <button onClick={validate} style={{width:'100%',background:'#22d3a0',color:'#0a0a0f',border:'none',borderRadius:12,padding:16,fontFamily:'Syne',fontSize:15,fontWeight:800,boxShadow:'0 4px 24px #22d3a030'}}>
              Valider et passer à la Validation →
            </button>
          )}
          {phase === 'done' && (
            <button onClick={onNavigate} style={{width:'100%',background:'#7c5cfc',color:'white',border:'none',borderRadius:12,padding:16,fontFamily:'Syne',fontSize:15,fontWeight:700,boxShadow:'0 4px 24px #7c5cfc30'}}>
              Aller à la Validation →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Module 2 — Validation ────────────────────────────────────────────────────

const M2_STEPS = [
  { n:1, label:'Recherche marché',       sub:'taille · croissance · sources 2024-2025' },
  { n:2, label:'Concurrents & arguments', sub:'pour · contre · web search' },
  { n:3, label:'Score final',             sub:'synthèse · dimensions · verdict' },
];

function Module2({ project, onUpdate, onNavigate }) {
  const m1Data = project.modules.m1.data;
  const m2     = project.modules.m2;

  const idea    = `${m1Data.projectName}: ${m1Data.description} Marché cible: ${m1Data.targetMarket}. Problème résolu: ${m1Data.problem}.`;
  const context = { currency:m1Data.currency, founderCountry:m1Data.founderCountry, targetCountry:m1Data.targetCountry, category:m1Data.category };

  const [phase,     setPhase]     = useState(m2.status === 'complete' ? 'done' : 'ready');
  const [countdown, setCountdown] = useState(0);
  const [marche,    setMarche]    = useState(m2.data?.marche    || null);
  const [s2Data,    setS2Data]    = useState(m2.data?.step2     || null);
  const [finalData, setFinalData] = useState(m2.data?.result    || null);
  const [error,     setError]     = useState('');

  const activeStep = { step1:1, pause1:1, step2:2, pause2:2, step3:3, done:3 }[phase] || 0;
  const isPause    = phase === 'pause1' || phase === 'pause2';
  const isWorking  = phase === 'step1'  || phase === 'step2'  || phase === 'step3';
  const inProgress = isWorking || isPause || (phase === 'done' && !finalData);

  useEffect(() => {
    if (phase !== 'pause1' && phase !== 'pause2') return;
    const capMarche = marche;
    const capS2     = s2Data;
    let rem = 70;
    setCountdown(rem);
    const iv = setInterval(() => {
      rem--;
      setCountdown(rem);
      if (rem <= 0) {
        clearInterval(iv);
        if (phase === 'pause1') runStep2(capMarche);
        else runStep3(capMarche, capS2);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  async function post(step, extra) {
    const res  = await fetch('/api/m2', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ step, idea, context, ...extra }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur API');
    return data;
  }

  async function start() {
    setError(''); setMarche(null); setS2Data(null); setFinalData(null);
    setPhase('step1');
    try {
      const d1 = await post(1, {});
      setMarche(d1);
      setPhase('pause1');
    } catch (e) { setError(e.message); setPhase('ready'); }
  }

  async function runStep2(marcheDat) {
    setPhase('step2');
    try {
      const d2 = await post(2, { marche:marcheDat });
      setS2Data(d2);
      setPhase('pause2');
    } catch (e) { setError(e.message); setPhase('ready'); }
  }

  async function runStep3(marcheDat, s2) {
    setPhase('step3');
    try {
      const d3 = await post(3, { marche:marcheDat, step2Data:s2 });
      const full = { ...d3, marche:marcheDat, concurrents:s2.concurrents, pour:s2.pour, contre:s2.contre };
      setFinalData(full);
      const updated = {
        ...project,
        modules: {
          ...project.modules,
          m2: { status:'complete', data:{ marche:marcheDat, step2:s2, result:full } },
          m3: { ...project.modules.m3, status:'available' },
        },
      };
      onUpdate(updated);
      setPhase('done');
    } catch (e) { setError(e.message); setPhase('ready'); }
  }

  const vc = v => v === 'GO' ? '#22d3a0' : v === 'MAYBE' ? '#fbbf24' : '#f87171';
  const dc = s => s >= 7 ? '#22d3a0' : s >= 5 ? '#fbbf24' : '#f87171';

  return (
    <div>
      <ModuleHeader number="02" title="Validation" subtitle="Pipeline 3 étapes avec recherche web — données de marché, concurrents, score final." status={m2.status} />

      {/* Context from Module 1 */}
      <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:14,padding:18,marginBottom:20,display:'flex',gap:10,alignItems:'flex-start'}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'#8b8b9a',marginBottom:6}}>Idée analysée</div>
          <p style={{fontSize:13,color:'#c0c0d0',lineHeight:1.5,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{idea}</p>
        </div>
        <div style={{display:'flex',gap:6,flexShrink:0}}>
          <Badge color="#7c5cfc">{context.category}</Badge>
          <Badge color="#22d3a0">{context.currency}</Badge>
        </div>
      </div>

      {/* Ready state */}
      {phase === 'ready' && (
        <div className="fade">
          {error && <ErrorBox msg={error} />}
          <button onClick={start} style={{width:'100%',background:'#7c5cfc',color:'white',border:'none',borderRadius:12,padding:16,fontFamily:'Syne',fontSize:15,fontWeight:700,boxShadow:'0 4px 24px #7c5cfc30'}}>
            Lancer la validation →
          </button>
          <div style={{textAlign:'center',marginTop:14,fontFamily:'DM Mono',fontSize:10,color:'#8b8b9a'}}>
            3 étapes · 2 pauses de 70s · ~5 min au total
          </div>
        </div>
      )}

      {/* Pipeline in progress */}
      {(isWorking || isPause || (phase !== 'ready' && phase !== 'done')) && (
        <div className="fade">
          <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:16,padding:24,marginBottom:16}}>
            {M2_STEPS.map(({ n, label, sub }) => {
              const done          = activeStep > n || phase === 'done';
              const active        = activeStep === n && phase !== 'done';
              const isPauseAfter  = (phase === 'pause1' && n === 1) || (phase === 'pause2' && n === 2);
              return (
                <div key={n} style={{display:'flex',alignItems:'center',gap:14,marginBottom:n < 3 ? 16 : 0}}>
                  <div style={{width:28,height:28,borderRadius:8,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'DM Mono',fontSize:11,background:done?'#22d3a015':active?'#7c5cfc':'#18181f',border:`1px solid ${done?'#22d3a050':active?'#7c5cfc':'#2a2a38'}`,color:done?'#22d3a0':active?'white':'#8b8b9a'}}>
                    {done ? '✓' : n}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,color:done?'#22d3a0':active?'#f0f0f5':'#8b8b9a',fontWeight:active?500:400}}>{label}</div>
                    <div style={{fontFamily:'DM Mono',fontSize:10,color:'#8b8b9a',marginTop:2}}>{sub}</div>
                  </div>
                  {active && !isPauseAfter && <Spinner />}
                  {isPauseAfter && (
                    <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                      <div style={{fontFamily:'DM Mono',fontSize:22,fontWeight:700,color:'#fbbf24',minWidth:32,textAlign:'right'}}>{countdown}</div>
                      <div style={{fontFamily:'DM Mono',fontSize:9,color:'#8b8b9a',lineHeight:1.4}}>sec<br/>pause</div>
                    </div>
                  )}
                </div>
              );
            })}
            {isPause && (
              <div style={{marginTop:20,paddingTop:16,borderTop:'1px solid #2a2a38'}}>
                <div style={{fontFamily:'DM Mono',fontSize:10,color:'#fbbf24',marginBottom:8}}>
                  Pause {phase === 'pause1' ? '1' : '2'}/2 — respect limite 30K tokens/min
                </div>
                <div style={{height:3,background:'#2a2a38',borderRadius:2,overflow:'hidden'}}>
                  <div style={{height:'100%',background:'#fbbf24',borderRadius:2,width:`${((70 - countdown) / 70) * 100}%`,transition:'width 1s linear'}} />
                </div>
              </div>
            )}
          </div>

          {/* Partial: marché (dès step2) */}
          {marche && (
            <div className="fade" style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:16,padding:24,marginBottom:14}}>
              <SectionTitle>Marché</SectionTitle>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                {[
                  { val:marche.taille,    label:'Taille',     color:'#a78bfa', src:marche.source_url, srcLabel:marche.source_nom },
                  { val:marche.croissance,label:'Croissance',  color:'#22d3a0' },
                  { val:marche.maturite,  label:'Maturité',    color:'#fbbf24' },
                ].map((s,i) => (
                  <div key={i} style={{background:'#18181f',borderRadius:10,padding:14,textAlign:'center'}}>
                    <div style={{fontFamily:'Syne',fontSize:16,fontWeight:700,marginBottom:4,color:s.color,wordBreak:'break-word'}}>{s.val || '—'}</div>
                    <div style={{fontSize:9,color:'#8b8b9a',fontFamily:'DM Mono',textTransform:'uppercase',letterSpacing:'0.1em'}}>{s.label}</div>
                    {s.src && s.src !== 'N/A' && (
                      <a href={s.src.startsWith('http') ? s.src : '#'} target="_blank" rel="noreferrer"
                        style={{display:'inline-block',marginTop:6,border:'1px solid #2a2a38',borderRadius:4,padding:'2px 8px',fontFamily:'DM Mono',fontSize:9,color:'#8b8b9a',textDecoration:'none'}}>
                        {s.srcLabel || '↗'}
                      </a>
                    )}
                  </div>
                ))}
              </div>
              {marche.tendance && marche.tendance !== 'N/A' && (
                <div style={{marginTop:12,padding:'10px 14px',background:'#18181f',borderRadius:8,fontFamily:'DM Mono',fontSize:11,color:'#8b8b9a',lineHeight:1.5}}>
                  {marche.tendance}
                </div>
              )}
            </div>
          )}

          {/* Partial: concurrents + pour/contre (dès step3) */}
          {s2Data && (
            <div className="fade">
              {(s2Data.concurrents || []).length > 0 && (
                <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:16,padding:24,marginBottom:14}}>
                  <SectionTitle>Concurrents</SectionTitle>
                  {s2Data.concurrents.map((c, i) => (
                    <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'10px 14px',background:'#18181f',borderRadius:8,marginBottom:6,gap:12}}>
                      <span style={{fontWeight:500,fontSize:14,flexShrink:0}}>{c.nom}</span>
                      <span style={{color:'#8b8b9a',fontSize:12,textAlign:'right'}}>{c.detail}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
                <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:14,padding:18}}>
                  <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'#22d3a0',marginBottom:12}}>Pour</div>
                  {(s2Data.pour || []).map((a, i) => (
                    <div key={i} style={{display:'flex',gap:8,fontSize:13,color:'#8b8b9a',lineHeight:1.5,marginBottom:7}}>
                      <span style={{color:'#22d3a0',flexShrink:0}}>+</span>{a}
                    </div>
                  ))}
                </div>
                <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:14,padding:18}}>
                  <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'#f87171',marginBottom:12}}>Contre</div>
                  {(s2Data.contre || []).map((a, i) => (
                    <div key={i} style={{display:'flex',gap:8,fontSize:13,color:'#8b8b9a',lineHeight:1.5,marginBottom:7}}>
                      <span style={{color:'#f87171',flexShrink:0}}>!</span>{a}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {error && <ErrorBox msg={error} />}
        </div>
      )}

      {/* Done: full results */}
      {phase === 'done' && finalData && (
        <div className="fade">
          {/* Score hero */}
          {(() => {
            const color = vc(finalData.verdict);
            const conf  = finalData.confiance || 3;
            return (
              <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:20,padding:40,textAlign:'center',marginBottom:14,position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:-60,left:'50%',transform:'translateX(-50%)',width:300,height:200,background:`radial-gradient(ellipse,${color}18,transparent 70%)`,pointerEvents:'none'}} />
                <div style={{display:'inline-flex',alignItems:'center',padding:'5px 14px',borderRadius:20,fontFamily:'DM Mono',fontSize:10,letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:18,background:`${color}12`,color,border:`1px solid ${color}28`}}>
                  {finalData.verdict}
                </div>
                <div style={{fontFamily:'Syne',fontSize:72,fontWeight:800,lineHeight:1,color,marginBottom:6}}>{finalData.score_final}</div>
                <div style={{fontSize:12,color:'#8b8b9a',marginBottom:18,fontFamily:'DM Mono'}}>score / 100</div>
                <p style={{fontSize:15,lineHeight:1.65,maxWidth:520,margin:'0 auto'}}>{finalData.recommendation}</p>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginTop:18,paddingTop:18,borderTop:'1px solid #2a2a38'}}>
                  <span style={{fontFamily:'DM Mono',fontSize:10,color:'#8b8b9a',letterSpacing:'0.1em'}}>CONFIANCE</span>
                  <div style={{display:'flex',gap:4}}>
                    {[1,2,3,4,5].map(i => <div key={i} style={{width:8,height:8,borderRadius:'50%',background:i<=conf?'#a78bfa':'#2a2a38'}} />)}
                  </div>
                  <span style={{fontSize:12,color:'#8b8b9a'}}>{finalData.note_confiance}</span>
                </div>
              </div>
            );
          })()}

          {/* Dimensions */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
            {Object.entries(finalData.dimensions || {}).map(([name, d]) => (
              <div key={name} style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:12,padding:18}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'#8b8b9a'}}>{name}</span>
                  <span style={{fontFamily:'Syne',fontWeight:700,fontSize:17,color:dc(d.score)}}>{d.score}/10</span>
                </div>
                <div style={{height:3,background:'#2a2a38',borderRadius:2,marginBottom:8,overflow:'hidden'}}>
                  <div style={{height:'100%',borderRadius:2,background:dc(d.score),width:`${d.score * 10}%`}} />
                </div>
                <div style={{fontSize:12,color:'#8b8b9a'}}>{d.note}</div>
              </div>
            ))}
          </div>

          {/* Marché full */}
          {finalData.marche && (
            <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:16,padding:24,marginBottom:14}}>
              <SectionTitle>Données de marché</SectionTitle>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:finalData.marche.tendance !== 'N/A' ? 12 : 0}}>
                {[
                  { val:finalData.marche.taille,    label:'Taille',    color:'#a78bfa', src:finalData.marche.source_url, srcLabel:finalData.marche.source_nom },
                  { val:finalData.marche.croissance, label:'Croissance', color:'#22d3a0' },
                  { val:finalData.marche.maturite,   label:'Maturité',   color:'#fbbf24' },
                ].map((s,i) => (
                  <div key={i} style={{background:'#18181f',borderRadius:10,padding:14,textAlign:'center'}}>
                    <div style={{fontFamily:'Syne',fontSize:16,fontWeight:700,marginBottom:4,color:s.color,wordBreak:'break-word'}}>{s.val || '—'}</div>
                    <div style={{fontSize:9,color:'#8b8b9a',fontFamily:'DM Mono',textTransform:'uppercase',letterSpacing:'0.1em'}}>{s.label}</div>
                    {s.src && s.src !== 'N/A' && (
                      <a href={s.src.startsWith('http') ? s.src : '#'} target="_blank" rel="noreferrer"
                        style={{display:'inline-block',marginTop:5,border:'1px solid #2a2a38',borderRadius:4,padding:'2px 8px',fontFamily:'DM Mono',fontSize:9,color:'#8b8b9a',textDecoration:'none'}}>
                        {s.srcLabel || '↗'}
                      </a>
                    )}
                  </div>
                ))}
              </div>
              {finalData.marche.tendance && finalData.marche.tendance !== 'N/A' && (
                <div style={{padding:'10px 14px',background:'#18181f',borderRadius:8,fontFamily:'DM Mono',fontSize:11,color:'#8b8b9a',lineHeight:1.5}}>
                  {finalData.marche.tendance}
                </div>
              )}
            </div>
          )}

          {/* Concurrents */}
          {(finalData.concurrents || []).length > 0 && (
            <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:16,padding:24,marginBottom:14}}>
              <SectionTitle>Concurrents</SectionTitle>
              {finalData.concurrents.map((c, i) => (
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'10px 14px',background:'#18181f',borderRadius:8,marginBottom:6,gap:12}}>
                  <span style={{fontWeight:500,fontSize:14,flexShrink:0}}>{c.nom}</span>
                  <span style={{color:'#8b8b9a',fontSize:12,textAlign:'right'}}>{c.detail}</span>
                </div>
              ))}
            </div>
          )}

          {/* Pour / Contre */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
            <div style={{background:'#111118',border:'1px solid #22d3a015',borderRadius:14,padding:18}}>
              <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'#22d3a0',marginBottom:12}}>Pour ({(finalData.pour||[]).length})</div>
              {(finalData.pour || []).map((a, i) => (
                <div key={i} style={{display:'flex',gap:8,fontSize:13,color:'#8b8b9a',lineHeight:1.5,marginBottom:7}}>
                  <span style={{color:'#22d3a0',flexShrink:0}}>+</span>{a}
                </div>
              ))}
            </div>
            <div style={{background:'#111118',border:'1px solid #f8717115',borderRadius:14,padding:18}}>
              <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'#f87171',marginBottom:12}}>Contre ({(finalData.contre||[]).length})</div>
              {(finalData.contre || []).map((a, i) => (
                <div key={i} style={{display:'flex',gap:8,fontSize:13,color:'#8b8b9a',lineHeight:1.5,marginBottom:7}}>
                  <span style={{color:'#f87171',flexShrink:0}}>!</span>{a}
                </div>
              ))}
            </div>
          </div>

          {/* Score gate */}
          {finalData.score_final < 50 && (
            <div style={{background:'#fbbf2410',border:'1px solid #fbbf2428',borderRadius:12,padding:'14px 18px',marginBottom:16}}>
              <div style={{fontFamily:'DM Mono',fontSize:11,color:'#fbbf24',marginBottom:4}}>Score en dessous de 50 — passage déconseillé</div>
              <div style={{fontSize:13,color:'#8b8b9a'}}>Tu peux tout de même continuer, mais considère de retravailler ton idée.</div>
            </div>
          )}

          <button onClick={onNavigate} style={{width:'100%',background:'#7c5cfc',color:'white',border:'none',borderRadius:12,padding:16,fontFamily:'Syne',fontSize:15,fontWeight:700,boxShadow:'0 4px 24px #7c5cfc30'}}>
            Aller à la Structure →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Module 3 — Structure ────────────────────────────────────────────────────

const PRIORITY_COLOR = { Critique:'#f87171', Haute:'#fbbf24', Moyenne:'#22d3a0' };
const COMPLEXITY_COLOR = { Simple:'#22d3a0', Moyen:'#fbbf24', Complexe:'#f87171' };

function Module3({ project, onUpdate, onNavigate }) {
  const m3     = project.modules.m3;
  const m1Data = project.modules.m1.data;
  const m2Data = project.modules.m2.data;

  const [phase,   setPhase]   = useState(m3.status === 'complete' ? 'done' : 'ready');
  const [result,  setResult]  = useState(m3.data || null);
  const [edited,  setEdited]  = useState(null); // edited v1 list
  const [error,   setError]   = useState('');

  const display = edited !== null ? { ...result, v1: edited } : result;

  async function generate() {
    setError(''); setPhase('loading');
    try {
      const res  = await fetch('/api/m3', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ m1Data, m2Data }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur API');
      setResult(data); setEdited(null); setPhase('result');
    } catch (e) { setError(e.message); setPhase('ready'); }
  }

  function validate() {
    const finalData = display;
    const updated = {
      ...project,
      modules: {
        ...project.modules,
        m3: { status:'complete', data:finalData },
        m4: { ...project.modules.m4, status:'available' },
      },
    };
    onUpdate(updated);
    setPhase('done');
  }

  function removeV1Feature(i) {
    const list = [...(display.v1 || [])];
    list.splice(i, 1);
    setEdited(list);
  }

  return (
    <div>
      <ModuleHeader number="03" title="Structure" subtitle="L'IA définit ton brief produit, V1 MVP (max 6 features) et la roadmap V2/V3." status={m3.status} />

      {phase === 'ready' && (
        <div className="fade">
          <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:14,padding:18,marginBottom:20}}>
            <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'#8b8b9a',marginBottom:6}}>Contexte</div>
            <p style={{fontSize:13,color:'#c0c0d0',lineHeight:1.5}}>{m1Data.aiResult?.reformulation}</p>
          </div>
          {error && <ErrorBox msg={error} />}
          <button onClick={generate} style={{width:'100%',background:'#7c5cfc',color:'white',border:'none',borderRadius:12,padding:16,fontFamily:'Syne',fontSize:15,fontWeight:700,boxShadow:'0 4px 24px #7c5cfc30'}}>
            Générer la structure →
          </button>
        </div>
      )}

      {phase === 'loading' && (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,padding:'60px 0',color:'#8b8b9a',fontSize:13}}>
          <Spinner />Génération en cours...
        </div>
      )}

      {(phase === 'result' || phase === 'done') && display && (
        <div className="fade">
          {phase === 'done' && (
            <div style={{background:'#22d3a010',border:'1px solid #22d3a025',borderRadius:12,padding:'12px 18px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:7,height:7,background:'#22d3a0',borderRadius:'50%'}} />
                <span style={{color:'#22d3a0',fontFamily:'DM Mono',fontSize:11,letterSpacing:'0.05em'}}>Module complété</span>
              </div>
              <button onClick={() => setPhase('result')} style={{background:'transparent',border:'1px solid #2a2a38',color:'#8b8b9a',borderRadius:8,padding:'6px 14px',fontFamily:'DM Mono',fontSize:11}}>
                Modifier
              </button>
            </div>
          )}

          {/* Brief */}
          <div style={{background:'#111118',border:'1px solid #7c5cfc28',borderRadius:16,padding:24,marginBottom:14}}>
            <SectionTitle accent="#a78bfa">Brief produit</SectionTitle>
            <p style={{fontSize:15,lineHeight:1.75,color:'#e0e0ec'}}>{display.brief}</p>
          </div>

          {/* V1 MVP */}
          <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:16,padding:24,marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <SectionTitle>V1 MVP — {(display.v1||[]).length} fonctionnalités</SectionTitle>
              {(display.v1||[]).length > 6 && (
                <span style={{fontFamily:'DM Mono',fontSize:10,color:'#f87171'}}>! max 6</span>
              )}
            </div>
            {(display.v1 || []).map((f, i) => (
              <div key={i} style={{background:'#18181f',borderRadius:10,padding:16,marginBottom:8,display:'flex',gap:14,alignItems:'flex-start'}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',gap:6,marginBottom:6,flexWrap:'wrap',alignItems:'center'}}>
                    <span style={{fontFamily:'Syne',fontSize:14,fontWeight:700}}>{f.nom}</span>
                    <span style={{padding:'2px 8px',background:`${PRIORITY_COLOR[f.priorite]}15`,border:`1px solid ${PRIORITY_COLOR[f.priorite]}30`,borderRadius:4,fontFamily:'DM Mono',fontSize:9,textTransform:'uppercase',letterSpacing:'0.1em',color:PRIORITY_COLOR[f.priorite]}}>{f.priorite}</span>
                    <span style={{padding:'2px 8px',background:`${COMPLEXITY_COLOR[f.complexite]}15`,border:`1px solid ${COMPLEXITY_COLOR[f.complexite]}30`,borderRadius:4,fontFamily:'DM Mono',fontSize:9,textTransform:'uppercase',letterSpacing:'0.1em',color:COMPLEXITY_COLOR[f.complexite]}}>{f.complexite}</span>
                  </div>
                  <p style={{fontSize:13,color:'#8b8b9a',lineHeight:1.5,marginBottom:4}}>{f.description}</p>
                  {f.hypothese_liee && (
                    <div style={{fontFamily:'DM Mono',fontSize:10,color:'#a78bfa'}}>
                      Valide : {f.hypothese_liee}
                    </div>
                  )}
                </div>
                {phase === 'result' && (display.v1||[]).length > 1 && (
                  <button onClick={() => removeV1Feature(i)} title="Retirer" style={{background:'transparent',border:'none',color:'#8b8b9a',fontSize:16,padding:'2px 6px',flexShrink:0,opacity:0.5,transition:'opacity 0.2s'}}
                    onMouseEnter={e => e.currentTarget.style.opacity='1'}
                    onMouseLeave={e => e.currentTarget.style.opacity='0.5'}>
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* V2 */}
          {(display.v2 || []).length > 0 && (
            <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:16,padding:24,marginBottom:14}}>
              <SectionTitle>V2 — Extensions</SectionTitle>
              {display.v2.map((f, i) => (
                <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',padding:'10px 0',borderBottom:i < display.v2.length-1 ? '1px solid #2a2a38' : 'none'}}>
                  <span style={{fontFamily:'Syne',fontSize:13,fontWeight:700,flexShrink:0,minWidth:120}}>{f.nom}</span>
                  <span style={{fontSize:13,color:'#8b8b9a',lineHeight:1.5}}>{f.apport}</span>
                </div>
              ))}
            </div>
          )}

          {/* V3+ */}
          {(display.v3 || []).length > 0 && (
            <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:16,padding:24,marginBottom:20}}>
              <SectionTitle>V3+ — Vision long terme</SectionTitle>
              {display.v3.map((f, i) => (
                <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',padding:'10px 0',borderBottom:i < display.v3.length-1 ? '1px solid #2a2a38' : 'none'}}>
                  <span style={{fontFamily:'Syne',fontSize:13,fontWeight:700,flexShrink:0,minWidth:120}}>{f.nom}</span>
                  <span style={{fontSize:13,color:'#8b8b9a',lineHeight:1.5}}>{f.vision}</span>
                </div>
              ))}
            </div>
          )}

          {error && <ErrorBox msg={error} />}
          {phase === 'result' && (
            <div style={{display:'flex',gap:10}}>
              <button onClick={generate} style={{flex:1,background:'transparent',border:'1px solid #2a2a38',color:'#8b8b9a',borderRadius:12,padding:14,fontFamily:'DM Mono',fontSize:12}}>
                Régénérer
              </button>
              <button onClick={validate} style={{flex:3,background:'#22d3a0',color:'#0a0a0f',border:'none',borderRadius:12,padding:14,fontFamily:'Syne',fontSize:15,fontWeight:800}}>
                Valider V1 et passer au Modèle →
              </button>
            </div>
          )}
          {phase === 'done' && (
            <button onClick={onNavigate} style={{width:'100%',background:'#7c5cfc',color:'white',border:'none',borderRadius:12,padding:16,fontFamily:'Syne',fontSize:15,fontWeight:700,boxShadow:'0 4px 24px #7c5cfc30'}}>
              Aller au Modèle économique →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Module 4 — Modèle économique ────────────────────────────────────────────

function Module4({ project, onUpdate, onNavigate }) {
  const m4     = project.modules.m4;
  const m1Data = project.modules.m1.data;
  const m2Data = project.modules.m2.data;
  const m3Data = project.modules.m3.data;
  const currency = m1Data.currency || 'CAD';

  const [phase,         setPhase]         = useState(m4.status === 'complete' ? 'done' : 'ready');
  const [result,        setResult]        = useState(m4.data?.aiResult || null);
  const [modeleChoisi,  setModeleChoisi]  = useState(m4.data?.modele_choisi || null);
  const [pricingEdited, setPricingEdited] = useState(m4.data?.pricing_edited || null);
  const [error,         setError]         = useState('');

  const pricing = pricingEdited || result?.pricing;

  async function generate() {
    setError(''); setPhase('loading');
    try {
      const res  = await fetch('/api/m4', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ m1Data, m2Data, m3Data }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur API');
      setResult(data);
      setModeleChoisi(data.recommandation?.split(' ')[0] || null);
      setPricingEdited(null);
      setPhase('result');
    } catch (e) { setError(e.message); setPhase('ready'); }
  }

  function setPrix(plan, val) {
    const p = { ...(pricing || result?.pricing) };
    p[plan] = { ...p[plan], prix: parseFloat(val) || 0 };
    setPricingEdited(p);
  }

  function validate() {
    const finalData = { aiResult:result, modele_choisi:modeleChoisi, pricing_edited:pricingEdited, pricing, projections:result?.projections };
    const updated = {
      ...project,
      modules: {
        ...project.modules,
        m4: { status:'complete', data:finalData },
        m5: { ...project.modules.m5, status:'available' },
      },
    };
    onUpdate(updated);
    setPhase('done');
  }

  const fmt = n => `${Number(n).toLocaleString('fr-CA')} ${currency}`;

  return (
    <div>
      <ModuleHeader number="04" title="Modèle économique" subtitle="3 modèles proposés, pricing en devise projet, projections conservatrices." status={m4.status} />

      {phase === 'ready' && (
        <div className="fade">
          <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:14,padding:18,marginBottom:20}}>
            <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'#8b8b9a',marginBottom:6}}>V1 confirmée</div>
            <p style={{fontSize:13,color:'#c0c0d0'}}>{(m3Data?.v1||[]).map(f => f.nom).join(' · ')}</p>
          </div>
          {error && <ErrorBox msg={error} />}
          <button onClick={generate} style={{width:'100%',background:'#7c5cfc',color:'white',border:'none',borderRadius:12,padding:16,fontFamily:'Syne',fontSize:15,fontWeight:700,boxShadow:'0 4px 24px #7c5cfc30'}}>
            Générer le modèle économique →
          </button>
        </div>
      )}

      {phase === 'loading' && (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,padding:'60px 0',color:'#8b8b9a',fontSize:13}}>
          <Spinner />Génération en cours...
        </div>
      )}

      {(phase === 'result' || phase === 'done') && result && (
        <div className="fade">
          {phase === 'done' && (
            <div style={{background:'#22d3a010',border:'1px solid #22d3a025',borderRadius:12,padding:'12px 18px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:7,height:7,background:'#22d3a0',borderRadius:'50%'}} />
                <span style={{color:'#22d3a0',fontFamily:'DM Mono',fontSize:11}}>Module complété</span>
              </div>
              <button onClick={() => setPhase('result')} style={{background:'transparent',border:'1px solid #2a2a38',color:'#8b8b9a',borderRadius:8,padding:'6px 14px',fontFamily:'DM Mono',fontSize:11}}>
                Modifier
              </button>
            </div>
          )}

          {/* 3 modèles */}
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.15em',textTransform:'uppercase',color:'#8b8b9a',marginBottom:10}}>3 modèles proposés — choisis le tien</div>
            {(result.modeles || []).map((m, i) => {
              const isChosen = modeleChoisi === m.nom;
              return (
                <div key={i} onClick={() => phase === 'result' && setModeleChoisi(m.nom)}
                  style={{background:'#111118',border:`1px solid ${isChosen?'#7c5cfc':'#2a2a38'}`,borderRadius:14,padding:18,marginBottom:10,cursor:phase==='result'?'pointer':'default',transition:'border-color 0.2s'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <span style={{fontFamily:'Syne',fontSize:15,fontWeight:700}}>{m.nom}</span>
                      <Badge color="#8b8b9a">{m.type}</Badge>
                    </div>
                    {isChosen && <div style={{width:8,height:8,background:'#7c5cfc',borderRadius:'50%',boxShadow:'0 0 8px #7c5cfc'}} />}
                  </div>
                  <p style={{fontSize:13,color:'#8b8b9a',lineHeight:1.5,marginBottom:10}}>{m.description}</p>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    <div>
                      {(m.pour||[]).map((p,j) => <div key={j} style={{fontSize:12,color:'#22d3a0',display:'flex',gap:6,marginBottom:3}}><span>+</span>{p}</div>)}
                    </div>
                    <div>
                      {(m.contre||[]).map((c,j) => <div key={j} style={{fontSize:12,color:'#f87171',display:'flex',gap:6,marginBottom:3}}><span>!</span>{c}</div>)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing */}
          {pricing && (
            <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:16,padding:24,marginBottom:14}}>
              <SectionTitle>Structure tarifaire</SectionTitle>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                {['gratuit','pro','business'].map(plan => {
                  const p = pricing[plan];
                  if (!p) return null;
                  const isMain = plan === 'pro';
                  return (
                    <div key={plan} style={{background:'#18181f',border:`1px solid ${isMain?'#7c5cfc40':'#2a2a38'}`,borderRadius:12,padding:16,position:'relative'}}>
                      {isMain && <div style={{position:'absolute',top:-1,left:'50%',transform:'translateX(-50%)',padding:'2px 10px',background:'#7c5cfc',borderRadius:'0 0 8px 8px',fontFamily:'DM Mono',fontSize:9,color:'white',letterSpacing:'0.1em'}}>RECOMMANDÉ</div>}
                      <div style={{fontFamily:'Syne',fontSize:13,fontWeight:700,marginBottom:4,marginTop:isMain?8:0,textTransform:'capitalize'}}>{p.nom || plan}</div>
                      <div style={{display:'flex',alignItems:'baseline',gap:4,marginBottom:12}}>
                        {phase === 'result' && plan !== 'gratuit' ? (
                          <input type="number" value={p.prix} onChange={e => setPrix(plan, e.target.value)}
                            style={{...inputStyle,width:80,padding:'4px 8px',fontSize:20,fontFamily:'Syne',fontWeight:800,textAlign:'right',color:isMain?'#7c5cfc':'#f0f0f5'}} />
                        ) : (
                          <span style={{fontFamily:'Syne',fontSize:22,fontWeight:800,color:isMain?'#7c5cfc':p.prix===0?'#22d3a0':'#f0f0f5'}}>{p.prix === 0 ? 'Gratuit' : p.prix}</span>
                        )}
                        {p.prix > 0 && <span style={{fontFamily:'DM Mono',fontSize:10,color:'#8b8b9a'}}>{currency}/mois</span>}
                      </div>
                      {(p.features||[]).map((f,j) => (
                        <div key={j} style={{fontSize:12,color:'#8b8b9a',display:'flex',gap:6,marginBottom:4,lineHeight:1.4}}>
                          <span style={{color:'#22d3a0',flexShrink:0}}>✓</span>{f}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Projections */}
          {result.projections && (
            <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:16,padding:24,marginBottom:20}}>
              <SectionTitle>Projections conservatrices</SectionTitle>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:14}}>
                {[
                  { label:'MRR 6 mois',   val:fmt(result.projections.mrr_m6),   sub:`${result.projections.hypothese_clients_m6} clients` },
                  { label:'MRR 12 mois',  val:fmt(result.projections.mrr_m12),  sub:`${result.projections.hypothese_clients_m12} clients` },
                  { label:'LTV estimée',  val:fmt(result.projections.ltv_estime), sub:'par client' },
                  { label:'CAC cible',    val:fmt(result.projections.cac_cible), sub:'coût acquisition' },
                ].map((s,i) => (
                  <div key={i} style={{background:'#18181f',borderRadius:10,padding:14}}>
                    <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',color:'#8b8b9a',marginBottom:4}}>{s.label}</div>
                    <div style={{fontFamily:'Syne',fontSize:18,fontWeight:700,color:'#a78bfa',marginBottom:2}}>{s.val}</div>
                    <div style={{fontFamily:'DM Mono',fontSize:10,color:'#8b8b9a'}}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#18181f',borderRadius:10,padding:'12px 16px',marginBottom:10}}>
                <div style={{fontFamily:'DM Mono',fontSize:10,color:'#8b8b9a',letterSpacing:'0.08em',textTransform:'uppercase'}}>Seuil rentabilité</div>
                <div style={{fontFamily:'Syne',fontSize:18,fontWeight:800,color:'#fbbf24'}}>{result.projections.seuil_rentabilite_clients} clients</div>
              </div>
              {result.projections.note && (
                <div style={{padding:'10px 14px',background:'#18181f',borderRadius:8,fontFamily:'DM Mono',fontSize:11,color:'#8b8b9a',lineHeight:1.5}}>
                  Hypothèse : {result.projections.note}
                </div>
              )}
            </div>
          )}

          {error && <ErrorBox msg={error} />}
          {phase === 'result' && (
            <div style={{display:'flex',gap:10}}>
              <button onClick={generate} style={{flex:1,background:'transparent',border:'1px solid #2a2a38',color:'#8b8b9a',borderRadius:12,padding:14,fontFamily:'DM Mono',fontSize:12}}>
                Régénérer
              </button>
              <button onClick={validate} disabled={!modeleChoisi}
                style={{flex:3,background:modeleChoisi?'#22d3a0':'#2a2a38',color:modeleChoisi?'#0a0a0f':'#8b8b9a',border:'none',borderRadius:12,padding:14,fontFamily:'Syne',fontSize:15,fontWeight:800,transition:'background 0.2s'}}>
                Valider et passer au Lancement →
              </button>
            </div>
          )}
          {phase === 'done' && (
            <button onClick={onNavigate} style={{width:'100%',background:'#7c5cfc',color:'white',border:'none',borderRadius:12,padding:16,fontFamily:'Syne',fontSize:15,fontWeight:700,boxShadow:'0 4px 24px #7c5cfc30'}}>
              Aller au Lancement →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Module 5 — Lancement ────────────────────────────────────────────────────

const CANAL_TYPE_COLOR = {
  Organique:'#22d3a0', Payant:'#f87171', Partenariat:'#a78bfa',
  Communauté:'#fbbf24', Contenu:'#22d3a0', Direct:'#7c5cfc',
};

function Module5({ project, onUpdate, onNavigate }) {
  const m5     = project.modules.m5;
  const m1Data = project.modules.m1.data;
  const m2Data = project.modules.m2.data;
  const m3Data = project.modules.m3.data;
  const m4Data = project.modules.m4.data;
  const currency = m1Data.currency || 'CAD';

  const [phase,  setPhase]  = useState(m5.status === 'complete' ? 'done' : 'ready');
  const [result, setResult] = useState(m5.data || null);
  const [error,  setError]  = useState('');

  async function generate() {
    setError(''); setPhase('loading');
    try {
      const res  = await fetch('/api/m5', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ m1Data, m2Data, m3Data, m4Data }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur API');
      setResult(data); setPhase('result');
    } catch (e) { setError(e.message); setPhase('ready'); }
  }

  function validate() {
    const updated = {
      ...project,
      modules: {
        ...project.modules,
        m5: { status:'complete', data:result },
        m6: { ...project.modules.m6, status:'available' },
      },
    };
    onUpdate(updated);
    setPhase('done');
  }

  const fmt = n => `${Number(n||0).toLocaleString('fr-CA')} ${currency}`;

  return (
    <div>
      <ModuleHeader number="05" title="Lancement" subtitle="3 canaux max, objectifs J30/J60/J90, et un plan B si les objectifs ne sont pas atteints." status={m5.status} />

      {phase === 'ready' && (
        <div className="fade">
          <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:14,padding:18,marginBottom:20}}>
            <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'#8b8b9a',marginBottom:8}}>Contexte lancement</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <Badge color="#7c5cfc">{m4Data?.modele_choisi || '—'}</Badge>
              <Badge color="#22d3a0">{m4Data?.pricing?.pro?.prix || 0} {currency}/mois</Badge>
              <Badge color="#8b8b9a">MRR cible M6 : {fmt(m4Data?.projections?.mrr_m6)}</Badge>
            </div>
          </div>
          {error && <ErrorBox msg={error} />}
          <button onClick={generate} style={{width:'100%',background:'#7c5cfc',color:'white',border:'none',borderRadius:12,padding:16,fontFamily:'Syne',fontSize:15,fontWeight:700,boxShadow:'0 4px 24px #7c5cfc30'}}>
            Générer le plan de lancement →
          </button>
        </div>
      )}

      {phase === 'loading' && (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,padding:'60px 0',color:'#8b8b9a',fontSize:13}}>
          <Spinner />Génération en cours...
        </div>
      )}

      {(phase === 'result' || phase === 'done') && result && (
        <div className="fade">
          {phase === 'done' && (
            <div style={{background:'#22d3a010',border:'1px solid #22d3a025',borderRadius:12,padding:'12px 18px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:7,height:7,background:'#22d3a0',borderRadius:'50%'}} />
                <span style={{color:'#22d3a0',fontFamily:'DM Mono',fontSize:11}}>Module complété</span>
              </div>
              <button onClick={() => setPhase('result')} style={{background:'transparent',border:'1px solid #2a2a38',color:'#8b8b9a',borderRadius:8,padding:'6px 14px',fontFamily:'DM Mono',fontSize:11}}>
                Modifier
              </button>
            </div>
          )}

          {/* Canaux */}
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.15em',textTransform:'uppercase',color:'#8b8b9a',marginBottom:10}}>{(result.canaux||[]).length} canaux d'acquisition</div>
            {(result.canaux || []).map((c, i) => {
              const color = CANAL_TYPE_COLOR[c.type] || '#8b8b9a';
              return (
                <div key={i} style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:14,padding:20,marginBottom:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                    <span style={{fontFamily:'Syne',fontSize:15,fontWeight:700}}>{c.nom}</span>
                    <Badge color={color}>{c.type}</Badge>
                  </div>
                  <p style={{fontSize:13,color:'#8b8b9a',lineHeight:1.5,marginBottom:12}}>{c.justification}</p>
                  <div style={{background:'#18181f',borderRadius:8,padding:'10px 14px',display:'flex',gap:8,alignItems:'flex-start'}}>
                    <span style={{fontFamily:'DM Mono',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#7c5cfc',flexShrink:0,marginTop:1}}>Cette semaine</span>
                    <span style={{fontSize:13,color:'#e0e0ec',lineHeight:1.5}}>{c.action_semaine}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Objectifs */}
          {result.objectifs && (
            <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:16,padding:24,marginBottom:14}}>
              <SectionTitle>Objectifs chiffrés</SectionTitle>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                {[
                  { label:'J30', data:result.objectifs.j30, color:'#8b8b9a' },
                  { label:'J60', data:result.objectifs.j60, color:'#fbbf24' },
                  { label:'J90', data:result.objectifs.j90, color:'#22d3a0' },
                ].map(({ label, data:d, color }) => d && (
                  <div key={label} style={{background:'#18181f',borderRadius:10,padding:14}}>
                    <div style={{fontFamily:'DM Mono',fontSize:11,color,letterSpacing:'0.1em',marginBottom:10,fontWeight:700}}>{label}</div>
                    <div style={{fontFamily:'Syne',fontSize:16,fontWeight:700,marginBottom:2,color}}>{fmt(d.mrr)}</div>
                    <div style={{fontFamily:'DM Mono',fontSize:10,color:'#8b8b9a',marginBottom:8}}>{d.clients_payants} clients · {d.signups} signups</div>
                    <div style={{fontSize:11,color:'#c0c0d0',lineHeight:1.4,borderTop:'1px solid #2a2a38',paddingTop:8}}>{d.action_cle}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plan B */}
          {result.plan_b && (
            <div style={{background:'#111118',border:'1px solid #f8717118',borderRadius:16,padding:24,marginBottom:20}}>
              <SectionTitle accent="#fbbf24">Plan B — {result.plan_b.declencheur}</SectionTitle>
              {(result.plan_b.actions || []).map((a, i) => (
                <div key={i} style={{display:'flex',gap:10,fontSize:13,color:'#c0c0d0',lineHeight:1.5,marginBottom:8}}>
                  <span style={{color:'#fbbf24',flexShrink:0,fontFamily:'DM Mono',fontSize:11}}>{i+1}.</span>{a}
                </div>
              ))}
            </div>
          )}

          {error && <ErrorBox msg={error} />}
          {phase === 'result' && (
            <div style={{display:'flex',gap:10}}>
              <button onClick={generate} style={{flex:1,background:'transparent',border:'1px solid #2a2a38',color:'#8b8b9a',borderRadius:12,padding:14,fontFamily:'DM Mono',fontSize:12}}>
                Régénérer
              </button>
              <button onClick={validate} style={{flex:3,background:'#22d3a0',color:'#0a0a0f',border:'none',borderRadius:12,padding:14,fontFamily:'Syne',fontSize:15,fontWeight:800}}>
                Valider et passer au Suivi →
              </button>
            </div>
          )}
          {phase === 'done' && (
            <button onClick={onNavigate} style={{width:'100%',background:'#7c5cfc',color:'white',border:'none',borderRadius:12,padding:16,fontFamily:'Syne',fontSize:15,fontWeight:700,boxShadow:'0 4px 24px #7c5cfc30'}}>
              Aller au Suivi →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Module 6 — Suivi ────────────────────────────────────────────────────────

const STATUTS = ['Actif', 'En pause', 'Pivoté', 'Abandonné'];
const STATUT_COLOR = { Actif:'#22d3a0', 'En pause':'#fbbf24', Pivoté:'#a78bfa', Abandonné:'#f87171' };

function Module6({ project, onUpdate, onNavigate }) {
  const m5Data   = project.modules.m5.data;
  const m4Data   = project.modules.m4.data;
  const currency = project.modules.m1.data.currency || 'CAD';
  const m6       = project.modules.m6;
  const saved    = m6.data || {};

  const [statut,    setStatut]    = useState(saved.statut    || 'Actif');
  const [mrr,       setMrr]       = useState(saved.mrr       ?? '');
  const [clients,   setClients]   = useState(saved.clients   ?? '');
  const [signups,   setSignups]   = useState(saved.signups   ?? '');
  const [churn,     setChurn]     = useState(saved.churn     ?? '');
  const [journal,   setJournal]   = useState(saved.journal   || []);
  const [newEntry,  setNewEntry]  = useState('');
  const [saved2,    setSaved2]    = useState(false);

  const objetj60 = m5Data?.objectifs?.j60;
  const prixPro  = m4Data?.pricing?.pro?.prix || 1;
  const seuilM8  = 50 * prixPro;

  function computeSuggestion() {
    if (!objetj60 || !mrr) return null;
    const ratio = Number(mrr) / (objetj60.mrr || 1);
    if (ratio >= 0.9) return { label:'Continuer', color:'#22d3a0', note:'Tu es dans les objectifs.' };
    if (ratio >= 0.5) return { label:'Continuer avec vigilance', color:'#fbbf24', note:`${Math.round(ratio*100)}% de l'objectif J60.` };
    return { label:'Pivoter ou arrêter', color:'#f87171', note:`Seulement ${Math.round(ratio*100)}% de l'objectif J60. Consulte le plan B.` };
  }

  function addJournalEntry() {
    if (!newEntry.trim()) return;
    const entry = { text: newEntry.trim(), date: new Date().toLocaleDateString('fr-CA') };
    setJournal([entry, ...journal]);
    setNewEntry('');
  }

  function save() {
    const data = { statut, mrr:Number(mrr)||0, clients:Number(clients)||0, signups:Number(signups)||0, churn:Number(churn)||0, journal };
    const updated = {
      ...project,
      modules: {
        ...project.modules,
        m6: { status:'available', data },
        m7: { ...project.modules.m7, status:'available' },
      },
    };
    onUpdate(updated);
    setSaved2(true);
    setTimeout(() => setSaved2(false), 2000);
  }

  const suggestion = computeSuggestion();
  const fmt = n => `${Number(n||0).toLocaleString('fr-CA')} ${currency}`;
  const mrrNum = Number(mrr) || 0;
  const progressM8 = Math.min((mrrNum / seuilM8) * 100, 100);

  return (
    <div>
      <ModuleHeader number="06" title="Suivi" subtitle="Mise à jour hebdomadaire — métriques, statut, journal de décisions." status={m6.status} />
      <div style={{background:'#fbbf2410',border:'1px solid #fbbf2428',borderRadius:12,padding:'12px 18px',marginBottom:20,fontFamily:'DM Mono',fontSize:11,color:'#fbbf24'}}>
        Ce module est continu — reviens ici chaque semaine pour mettre à jour tes métriques.
      </div>

      {/* Statut */}
      <Section title="Statut du projet">
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {STATUTS.map(s => (
            <button key={s} onClick={() => setStatut(s)}
              style={{padding:'8px 16px',background:statut===s?`${STATUT_COLOR[s]}20`:'transparent',border:`1px solid ${statut===s?STATUT_COLOR[s]:'#2a2a38'}`,borderRadius:8,color:statut===s?STATUT_COLOR[s]:'#8b8b9a',fontFamily:'DM Mono',fontSize:11,letterSpacing:'0.08em',transition:'all 0.15s'}}>
              {s}
            </button>
          ))}
        </div>
      </Section>

      {/* Métriques */}
      <Section title="Métriques">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <Field label={`MRR (${currency})`}>
            <input type="number" value={mrr} onChange={e => setMrr(e.target.value)} placeholder="0" style={inputStyle} />
          </Field>
          <Field label="Clients payants">
            <input type="number" value={clients} onChange={e => setClients(e.target.value)} placeholder="0" style={inputStyle} />
          </Field>
          <Field label="Signups total">
            <input type="number" value={signups} onChange={e => setSignups(e.target.value)} placeholder="0" style={inputStyle} />
          </Field>
          <Field label="Churn %">
            <input type="number" value={churn} onChange={e => setChurn(e.target.value)} placeholder="0" style={inputStyle} />
          </Field>
        </div>
      </Section>

      {/* Comparaison vs objectifs */}
      {objetj60 && (
        <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:16,padding:24,marginBottom:14}}>
          <SectionTitle>Comparaison vs objectifs J60</SectionTitle>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
            {[
              { label:'MRR', actuel:mrrNum, cible:objetj60.mrr, fmt:true },
              { label:'Clients', actuel:Number(clients)||0, cible:objetj60.clients_payants },
              { label:'Signups', actuel:Number(signups)||0, cible:objetj60.signups },
            ].map(({ label, actuel, cible, fmt:doFmt }) => {
              const pct    = cible ? Math.round((actuel/cible)*100) : 0;
              const color  = pct >= 90 ? '#22d3a0' : pct >= 50 ? '#fbbf24' : '#f87171';
              return (
                <div key={label} style={{background:'#18181f',borderRadius:10,padding:14}}>
                  <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',color:'#8b8b9a',marginBottom:6}}>{label}</div>
                  <div style={{fontFamily:'Syne',fontSize:17,fontWeight:700,color,marginBottom:2}}>{doFmt ? fmt(actuel) : actuel}</div>
                  <div style={{fontFamily:'DM Mono',fontSize:10,color:'#8b8b9a',marginBottom:6}}>cible : {doFmt ? fmt(cible) : cible}</div>
                  <div style={{height:3,background:'#2a2a38',borderRadius:2,overflow:'hidden'}}>
                    <div style={{height:'100%',background:color,width:`${Math.min(pct,100)}%`,borderRadius:2}} />
                  </div>
                </div>
              );
            })}
          </div>
          {suggestion && (
            <div style={{background:`${suggestion.color}10`,border:`1px solid ${suggestion.color}28`,borderRadius:10,padding:'12px 16px',display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:8,height:8,background:suggestion.color,borderRadius:'50%',flexShrink:0}} />
              <div>
                <div style={{fontFamily:'Syne',fontSize:13,fontWeight:700,color:suggestion.color,marginBottom:2}}>{suggestion.label}</div>
                <div style={{fontSize:12,color:'#8b8b9a'}}>{suggestion.note}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compteur Module 8 */}
      <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:14,padding:20,marginBottom:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'#8b8b9a'}}>Progression vers Module 8 — Croissance</div>
          <div style={{fontFamily:'DM Mono',fontSize:11,color:progressM8>=100?'#22d3a0':'#8b8b9a'}}>
            {progressM8 >= 100 ? 'Débloqué !' : `${fmt(mrrNum)} / ${fmt(seuilM8)}`}
          </div>
        </div>
        <div style={{height:6,background:'#2a2a38',borderRadius:3,overflow:'hidden'}}>
          <div style={{height:'100%',background:progressM8>=100?'#22d3a0':'#7c5cfc',width:`${progressM8}%`,borderRadius:3,transition:'width 0.5s ease'}} />
        </div>
        <div style={{fontFamily:'DM Mono',fontSize:10,color:'#8b8b9a',marginTop:6}}>
          Seuil : MRR ≥ 50 × prix Pro ({fmt(seuilM8)})
        </div>
      </div>

      {/* Journal */}
      <Section title="Journal de décisions">
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <textarea value={newEntry} onChange={e => setNewEntry(e.target.value)}
            placeholder="Note une décision, un apprentissage, un pivot..."
            style={{...inputStyle,flex:1,minHeight:70,resize:'vertical'}} />
          <button onClick={addJournalEntry} disabled={!newEntry.trim()}
            style={{background:newEntry.trim()?'#7c5cfc':'#2a2a38',color:newEntry.trim()?'white':'#8b8b9a',border:'none',borderRadius:8,padding:'0 16px',fontFamily:'DM Mono',fontSize:12,alignSelf:'stretch',transition:'background 0.2s',flexShrink:0}}>
            + Ajouter
          </button>
        </div>
        {journal.length === 0 && (
          <div style={{textAlign:'center',padding:'20px 0',fontFamily:'DM Mono',fontSize:11,color:'#2a2a38'}}>Aucune entrée</div>
        )}
        {journal.map((e, i) => (
          <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',padding:'10px 0',borderTop:i===0?'none':'1px solid #2a2a38'}}>
            <div style={{fontFamily:'DM Mono',fontSize:10,color:'#8b8b9a',flexShrink:0,marginTop:2}}>{e.date}</div>
            <div style={{fontSize:13,color:'#c0c0d0',lineHeight:1.5}}>{e.text}</div>
          </div>
        ))}
      </Section>

      <div style={{display:'flex',gap:10}}>
        <button onClick={save}
          style={{flex:1,background:saved2?'#22d3a020':'#7c5cfc',color:saved2?'#22d3a0':'white',border:saved2?'1px solid #22d3a030':'none',borderRadius:12,padding:14,fontFamily:'Syne',fontSize:14,fontWeight:700,transition:'all 0.3s'}}>
          {saved2 ? 'Sauvegardé ✓' : 'Sauvegarder'}
        </button>
        <button onClick={onNavigate}
          style={{flex:1,background:'transparent',border:'1px solid #2a2a38',color:'#8b8b9a',borderRadius:12,padding:14,fontFamily:'DM Mono',fontSize:12}}>
          Stack & Accès →
        </button>
      </div>
    </div>
  );
}

// ─── Module 7 — Stack & Accès ────────────────────────────────────────────────

function Module7({ project, onUpdate, onNavigate }) {
  const m7     = project.modules.m7;
  const m1Data = project.modules.m1.data;
  const m3Data = project.modules.m3.data;
  const m4Data = project.modules.m4.data;
  const currency = m1Data.currency || 'CAD';

  const [phase,       setPhase]       = useState(m7.status === 'complete' ? 'done' : m7.data?.outils ? 'credentials' : 'ready');
  const [aiResult,    setAiResult]    = useState(m7.data?.aiResult || null);
  const [credentials, setCredentials] = useState(m7.data?.credentials || {});
  const [visible,     setVisible]     = useState({});
  const [alertSeuil,  setAlertSeuil]  = useState(m7.data?.alertSeuil || '');
  const [error,       setError]       = useState('');

  const outils = aiResult?.outils || [];
  const totalMensuel = outils.reduce((s, o) => s + (o.cout_mensuel || 0), 0);
  const totalUnique  = outils.reduce((s, o) => s + (o.cout_unique  || 0), 0);
  const prixPro      = m4Data?.pricing?.pro?.prix || 1;
  const clientsSeuil = totalMensuel > 0 ? Math.ceil(totalMensuel / prixPro) : 0;

  async function generate() {
    setError(''); setPhase('loading');
    try {
      const res  = await fetch('/api/m7', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ m1Data, m3Data, m4Data }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur API');
      setAiResult(data); setPhase('credentials');
    } catch (e) { setError(e.message); setPhase('ready'); }
  }

  function setCredField(outil, field, val) {
    setCredentials(c => ({ ...c, [outil]: { ...(c[outil] || {}), [field]: val } }));
  }

  function validate() {
    const finalData = { aiResult, credentials, alertSeuil:Number(alertSeuil)||0 };
    const updated = {
      ...project,
      modules: {
        ...project.modules,
        m7: { status:'complete', data:finalData },
        m8: {
          ...project.modules.m8,
          status: checkM8Seuil(project) ? 'available' : 'locked',
        },
      },
    };
    onUpdate(updated);
    setPhase('done');
  }

  function checkM8Seuil(proj) {
    const mrrActuel = proj.modules.m6?.data?.mrr || 0;
    const prix      = proj.modules.m4?.data?.pricing?.pro?.prix || 1;
    return mrrActuel >= 50 * prix;
  }

  const fmt = n => `${Number(n||0).toLocaleString('fr-CA')} ${currency}`;
  const alertActive = alertSeuil && totalMensuel > Number(alertSeuil);

  return (
    <div>
      <ModuleHeader number="07" title="Stack & Accès" subtitle="Outils recommandés pour ta V1, budget mensuel et gestion des accès." status={m7.status} />

      {phase === 'ready' && (
        <div className="fade">
          <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:14,padding:18,marginBottom:20}}>
            <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'#8b8b9a',marginBottom:6}}>Fonctionnalités V1</div>
            <p style={{fontSize:13,color:'#c0c0d0'}}>{(m3Data?.v1||[]).map(f => f.nom).join(' · ')}</p>
          </div>
          {error && <ErrorBox msg={error} />}
          <button onClick={generate} style={{width:'100%',background:'#7c5cfc',color:'white',border:'none',borderRadius:12,padding:16,fontFamily:'Syne',fontSize:15,fontWeight:700,boxShadow:'0 4px 24px #7c5cfc30'}}>
            Générer le stack recommandé →
          </button>
        </div>
      )}

      {phase === 'loading' && (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,padding:'60px 0',color:'#8b8b9a',fontSize:13}}>
          <Spinner />Génération en cours...
        </div>
      )}

      {(phase === 'credentials' || phase === 'done') && aiResult && (
        <div className="fade">
          {phase === 'done' && (
            <div style={{background:'#22d3a010',border:'1px solid #22d3a025',borderRadius:12,padding:'12px 18px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:7,height:7,background:'#22d3a0',borderRadius:'50%'}} />
                <span style={{color:'#22d3a0',fontFamily:'DM Mono',fontSize:11}}>Module complété</span>
              </div>
              <button onClick={() => setPhase('credentials')} style={{background:'transparent',border:'1px solid #2a2a38',color:'#8b8b9a',borderRadius:8,padding:'6px 14px',fontFamily:'DM Mono',fontSize:11}}>
                Modifier
              </button>
            </div>
          )}

          {/* Budget summary */}
          <div style={{background:'#111118',border:`1px solid ${alertActive?'#f8717130':'#2a2a38'}`,borderRadius:16,padding:24,marginBottom:14}}>
            <SectionTitle accent={alertActive?'#f87171':undefined}>Budget mensuel</SectionTitle>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
              {[
                { label:'Coût mensuel', val:fmt(totalMensuel), color:alertActive?'#f87171':'#a78bfa' },
                { label:'Coût annuel',  val:fmt(totalMensuel*12), color:'#8b8b9a' },
                { label:'Lancement (unique)', val:fmt(totalUnique), color:'#fbbf24' },
              ].map((s,i) => (
                <div key={i} style={{background:'#18181f',borderRadius:10,padding:14}}>
                  <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',color:'#8b8b9a',marginBottom:4}}>{s.label}</div>
                  <div style={{fontFamily:'Syne',fontSize:16,fontWeight:700,color:s.color}}>{s.val}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#18181f',borderRadius:10,padding:'10px 14px',marginBottom:10}}>
              <div style={{fontFamily:'DM Mono',fontSize:10,color:'#8b8b9a'}}>Seuil de rentabilité stack</div>
              <div style={{fontFamily:'Syne',fontSize:14,fontWeight:700,color:'#fbbf24'}}>{clientsSeuil} clients payants</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{fontFamily:'DM Mono',fontSize:10,color:'#8b8b9a',flexShrink:0}}>Alerte si total &gt;</div>
              <input type="number" value={alertSeuil} onChange={e => setAlertSeuil(e.target.value)}
                placeholder={String(totalMensuel * 2)}
                style={{...inputStyle,flex:1,padding:'6px 10px',fontSize:13}} />
              <div style={{fontFamily:'DM Mono',fontSize:10,color:'#8b8b9a',flexShrink:0}}>{currency}/mois</div>
            </div>
            {alertActive && (
              <div style={{marginTop:10,padding:'8px 12px',background:'#f8717110',borderRadius:8,fontFamily:'DM Mono',fontSize:11,color:'#f87171'}}>
                Alerte : coût stack ({fmt(totalMensuel)}) dépasse ton seuil ({fmt(alertSeuil)})
              </div>
            )}
          </div>

          {/* Outils list */}
          <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:16,padding:24,marginBottom:14}}>
            <SectionTitle>Outils ({outils.length})</SectionTitle>
            {outils.map((o, i) => {
              const cred   = credentials[o.nom] || {};
              const isVis  = visible[o.nom];
              const status = cred.statut || 'À créer';
              return (
                <div key={i} style={{background:'#18181f',borderRadius:10,padding:16,marginBottom:10}}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:8}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:4,flexWrap:'wrap'}}>
                        <a href={o.lien} target="_blank" rel="noreferrer"
                          style={{fontFamily:'Syne',fontSize:14,fontWeight:700,color:'#a78bfa',textDecoration:'none'}}>
                          {o.nom} ↗
                        </a>
                        <Badge color="#8b8b9a">{o.categorie}</Badge>
                        <span style={{fontFamily:'DM Mono',fontSize:10,color:status==='Créé'?'#22d3a0':'#fbbf24'}}>{status}</span>
                      </div>
                      <div style={{fontFamily:'DM Mono',fontSize:11,color:'#8b8b9a',marginBottom:4}}>
                        {o.plan} — <span style={{color:'#f0f0f5'}}>{fmt(o.cout_mensuel)}/mois</span>
                        {o.cout_unique > 0 && <span style={{color:'#fbbf24'}}> + {fmt(o.cout_unique)} unique</span>}
                      </div>
                      <div style={{fontSize:12,color:'#8b8b9a'}}>{o.pourquoi}</div>
                    </div>
                    <button
                      onClick={() => setCredField(o.nom, 'statut', status === 'Créé' ? 'À créer' : 'Créé')}
                      style={{background:status==='Créé'?'#22d3a015':'transparent',border:`1px solid ${status==='Créé'?'#22d3a030':'#2a2a38'}`,color:status==='Créé'?'#22d3a0':'#8b8b9a',borderRadius:8,padding:'4px 10px',fontFamily:'DM Mono',fontSize:10,flexShrink:0}}>
                      {status === 'Créé' ? '✓ Créé' : 'Marquer créé'}
                    </button>
                  </div>
                  {/* Credentials */}
                  <div style={{borderTop:'1px solid #2a2a38',paddingTop:10,display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    <div>
                      <div style={{fontFamily:'DM Mono',fontSize:9,textTransform:'uppercase',letterSpacing:'0.1em',color:'#8b8b9a',marginBottom:4}}>Identifiant</div>
                      <input value={cred.login||''} onChange={e => setCredField(o.nom,'login',e.target.value)}
                        placeholder="email ou nom d'utilisateur"
                        style={{...inputStyle,padding:'6px 10px',fontSize:12}} />
                    </div>
                    <div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                        <span style={{fontFamily:'DM Mono',fontSize:9,textTransform:'uppercase',letterSpacing:'0.1em',color:'#8b8b9a'}}>Mot de passe</span>
                        <button onClick={() => setVisible(v => ({...v,[o.nom]:!v[o.nom]}))}
                          style={{background:'transparent',border:'none',color:'#8b8b9a',fontFamily:'DM Mono',fontSize:9,padding:0}}>
                          {isVis ? 'Masquer' : 'Voir'}
                        </button>
                      </div>
                      <input
                        type={isVis ? 'text' : 'password'}
                        value={cred.password||''}
                        onChange={e => setCredField(o.nom,'password',e.target.value)}
                        placeholder="••••••••"
                        style={{...inputStyle,padding:'6px 10px',fontSize:12}}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {error && <ErrorBox msg={error} />}
          {phase === 'credentials' && (
            <div style={{display:'flex',gap:10}}>
              <button onClick={generate} style={{flex:1,background:'transparent',border:'1px solid #2a2a38',color:'#8b8b9a',borderRadius:12,padding:14,fontFamily:'DM Mono',fontSize:12}}>
                Régénérer
              </button>
              <button onClick={validate} style={{flex:3,background:'#22d3a0',color:'#0a0a0f',border:'none',borderRadius:12,padding:14,fontFamily:'Syne',fontSize:15,fontWeight:800}}>
                Valider le stack →
              </button>
            </div>
          )}
          {phase === 'done' && (
            <button onClick={onNavigate} style={{width:'100%',background:'#7c5cfc',color:'white',border:'none',borderRadius:12,padding:16,fontFamily:'Syne',fontSize:15,fontWeight:700,boxShadow:'0 4px 24px #7c5cfc30'}}>
              Aller à la Croissance →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Module 8 — Croissance ───────────────────────────────────────────────────

const LEGAL_DATA = {
  'Canada (Québec)': {
    structures: ['Entreprise individuelle', 'S.E.N.C.', 'SPA (corporation provinciale)', 'Inc. (fédérale)'],
    seuilEnregistrement: 5000,
    seuilFacturation: 'Dès le premier revenu professionnel',
    taxes: 'TPS (5%) + TVQ (9.975%) — seuil 30K CAD/an',
    ressource: 'https://www.revenu.gouv.qc.ca',
    quandStructure: 'Enregistre ton entreprise au REQ dès que tu dépasses 5 000 CAD/mois ou avant de signer un contrat.',
  },
  'France': {
    structures: ['Auto-entrepreneur (micro-entreprise)', 'SASU', 'SAS'],
    seuilEnregistrement: 6500,
    seuilFacturation: 'Dès le premier euro de CA',
    taxes: 'TVA (20%) — seuil 36 800 EUR/an en franchise de base',
    ressource: 'https://www.autoentrepreneur.urssaf.fr',
    quandStructure: 'Crée ta micro-entreprise immédiatement (gratuit). Passe en SASU/SAS à partir de 6 500 EUR/mois.',
  },
  'default': {
    structures: ['Sole proprietorship', 'LLC / Ltd', 'Corporation'],
    seuilEnregistrement: null,
    seuilFacturation: 'Dès le premier revenu',
    taxes: 'Consulte un comptable local pour les obligations fiscales',
    ressource: null,
    quandStructure: 'Enregistre ton entreprise avant de facturer des clients professionnels.',
  },
};

const PAIE_DATA = {
  'Canada (Québec)': { freelance:'Malt, Toptal, ou contrat direct + facture', employe:'ADP Canada / Ceridian / Nethris', international:'Deel' },
  'France':          { freelance:'Malt, Comet, ou portage salarial', employe:'PayFit / Silae / QuadraRH', international:'Deel' },
  'default':         { freelance:'Contra, Toptal, ou contrat direct', employe:'Rippling / Gusto / Remote', international:'Deel' },
};

function Module8Locked({ project }) {
  const m4Data   = project.modules.m4?.data;
  const m6Data   = project.modules.m6?.data;
  const currency = project.modules.m1.data.currency || 'CAD';
  const prixPro  = m4Data?.pricing?.pro?.prix || 1;
  const seuilM8  = 50 * prixPro;
  const mrrActuel = m6Data?.mrr || 0;
  const progress  = Math.min((mrrActuel / seuilM8) * 100, 100);
  const fmt = n => `${Number(n||0).toLocaleString('fr-CA')} ${currency}`;

  return (
    <div style={{textAlign:'center',padding:'60px 0'}}>
      <ModuleHeader number="08" title="Croissance" subtitle="Jalons légaux, équipe, gestion des accès et plan d'affaires." status="locked" />
      <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:16,padding:28,maxWidth:480,margin:'0 auto',textAlign:'left'}}>
        <div style={{fontFamily:'DM Mono',fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:'#8b8b9a',marginBottom:12}}>
          Seuil de déclenchement
        </div>
        <div style={{fontFamily:'Syne',fontSize:22,fontWeight:800,marginBottom:4}}>MRR ≥ {fmt(seuilM8)}</div>
        <div style={{color:'#8b8b9a',fontSize:13,marginBottom:20}}>
          50 × prix Pro ({fmt(prixPro)}/mois) — actuellement {fmt(mrrActuel)}
        </div>
        <div style={{height:8,background:'#2a2a38',borderRadius:4,overflow:'hidden',marginBottom:8}}>
          <div style={{height:'100%',background:'#7c5cfc',width:`${progress}%`,borderRadius:4,transition:'width 0.5s ease'}} />
        </div>
        <div style={{fontFamily:'DM Mono',fontSize:11,color:'#8b8b9a'}}>
          {Math.round(progress)}% du seuil — mets à jour tes métriques dans le module Suivi.
        </div>
      </div>
    </div>
  );
}

function Module8({ project, onUpdate }) {
  const m1Data   = project.modules.m1.data;
  const m3Data   = project.modules.m3?.data;
  const m4Data   = project.modules.m4?.data;
  const m6Data   = project.modules.m6?.data;
  const m7Data   = project.modules.m7?.data;
  const currency = m1Data.currency || 'CAD';
  const prixPro  = m4Data?.pricing?.pro?.prix || 1;
  const founder  = m1Data.founderCountry || 'default';

  const legalKey  = Object.keys(LEGAL_DATA).find(k => founder.startsWith(k.split(' ')[0])) || 'default';
  const legal     = LEGAL_DATA[legalKey] || LEGAL_DATA.default;
  const paieKey   = Object.keys(PAIE_DATA).find(k => founder.startsWith(k.split(' ')[0])) || 'default';
  const paie      = PAIE_DATA[paieKey]   || PAIE_DATA.default;

  const seuilFreelance  = 80  * prixPro;
  const seuilCollabo2   = 150 * prixPro;
  const seuilEmploye    = 200 * prixPro;
  const mrrActuel       = m6Data?.mrr || 0;

  const fmt  = n => `${Number(n||0).toLocaleString('fr-CA')} ${currency}`;
  const v2f  = m3Data?.v2 || [];

  const jalonsEquipe = [
    {
      seuil: seuilFreelance,
      titre: 'Premier freelance',
      color: '#a78bfa',
      condition: `MRR ≥ ${fmt(seuilFreelance)}`,
      profil: v2f[0] ? `Compétence V2 : ${v2f[0].nom}` : 'Profil lié à la première fonctionnalité V2',
      paie: paie.freelance,
      acces: 'Staging uniquement — jamais accès production',
    },
    {
      seuil: seuilCollabo2,
      titre: 'Deuxième collaborateur',
      color: '#7c5cfc',
      condition: `MRR ≥ ${fmt(seuilCollabo2)}`,
      profil: v2f[1] ? `Compétence V2 : ${v2f[1].nom}` : 'Profil lié à la deuxième fonctionnalité V2',
      paie: paie.freelance,
      acces: 'Staging uniquement — jamais accès production',
    },
    {
      seuil: seuilEmploye,
      titre: 'Premier employé officiel',
      color: '#22d3a0',
      condition: `MRR ≥ ${fmt(seuilEmploye)}`,
      profil: 'Recrute pour ton problème le plus douloureux aujourd\'hui',
      paie: paie.employe,
      acces: 'Staging OK, production sous supervision les 30 premiers jours',
    },
  ];

  const outils = m7Data?.aiResult?.outils || [];

  return (
    <div>
      <ModuleHeader number="08" title="Croissance" subtitle="Jalons légaux, équipe et plan d'affaires — tu es sur la bonne voie." status={project.modules.m8.status} />

      {/* MRR actuel */}
      <div style={{background:'#22d3a010',border:'1px solid #22d3a025',borderRadius:14,padding:18,marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <div>
          <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'#22d3a0',marginBottom:4}}>MRR actuel</div>
          <div style={{fontFamily:'Syne',fontSize:28,fontWeight:800,color:'#22d3a0'}}>{fmt(mrrActuel)}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontFamily:'DM Mono',fontSize:11,color:'#8b8b9a'}}>Seuil atteint le {new Date().toLocaleDateString('fr-CA')}</div>
          <div style={{fontSize:13,color:'#8b8b9a',marginTop:2}}>Module 8 débloqué</div>
        </div>
      </div>

      {/* Jalons légaux */}
      <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:16,padding:24,marginBottom:14}}>
        <SectionTitle accent="#fbbf24">Jalons légaux — {founder}</SectionTitle>
        <div style={{marginBottom:16}}>
          <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',color:'#8b8b9a',marginBottom:8}}>Quand enregistrer</div>
          <p style={{fontSize:13,color:'#c0c0d0',lineHeight:1.6}}>{legal.quandStructure}</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          <MiniCard label="Structures recommandées" value={legal.structures.join(', ')} />
          <MiniCard label="Facturation" value={legal.seuilFacturation} />
          <MiniCard label="Taxes / TVA" value={legal.taxes} />
          {legal.seuilEnregistrement && (
            <MiniCard label="Seuil enregistrement" value={`${fmt(legal.seuilEnregistrement)}/mois`} />
          )}
        </div>
        {legal.ressource && (
          <a href={legal.ressource} target="_blank" rel="noreferrer"
            style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 14px',background:'#fbbf2410',border:'1px solid #fbbf2428',borderRadius:8,fontFamily:'DM Mono',fontSize:11,color:'#fbbf24',textDecoration:'none'}}>
            Ressource officielle ↗
          </a>
        )}
      </div>

      {/* Jalons équipe */}
      <div style={{marginBottom:14}}>
        <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.15em',textTransform:'uppercase',color:'#8b8b9a',marginBottom:10}}>Jalons équipe</div>
        {jalonsEquipe.map((j, i) => {
          const atteint = mrrActuel >= j.seuil;
          return (
            <div key={i} style={{background:'#111118',border:`1px solid ${atteint?j.color+'40':'#2a2a38'}`,borderRadius:14,padding:20,marginBottom:10,opacity:atteint?1:0.65}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,flexWrap:'wrap',gap:8}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:8,height:8,background:atteint?j.color:'#2a2a38',borderRadius:'50%',boxShadow:atteint?`0 0 8px ${j.color}`:undefined}} />
                  <span style={{fontFamily:'Syne',fontSize:14,fontWeight:700,color:atteint?j.color:'#f0f0f5'}}>{j.titre}</span>
                </div>
                <Badge color={atteint?j.color:'#8b8b9a'}>{j.condition}</Badge>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <MiniCard label="Profil" value={j.profil} />
                <MiniCard label="Comment payer" value={j.paie} />
                <div style={{gridColumn:'1/-1'}}>
                  <MiniCard label="Accès outils" value={j.acces} />
                </div>
              </div>
              {outils.length > 0 && i === 0 && (
                <div style={{marginTop:10,padding:'10px 14px',background:'#18181f',borderRadius:8,fontFamily:'DM Mono',fontSize:10,color:'#8b8b9a'}}>
                  <span style={{color:'#a78bfa'}}>Principe moindre privilège</span> : staging OK · production sous supervision 30j · jamais admin seul
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Plan d'affaires */}
      <div style={{background:'#111118',border:'1px solid #7c5cfc28',borderRadius:16,padding:24,marginBottom:20}}>
        <SectionTitle accent="#a78bfa">Plan d'affaires simplifié</SectionTitle>
        {[
          { titre:'1. Résumé exécutif', contenu:m1Data.aiResult?.reformulation },
          { titre:'2. Produit', contenu:`Brief : ${m3Data?.brief || '—'} · V1 : ${(m3Data?.v1||[]).map(f=>f.nom).join(', ')}` },
          { titre:'3. Modèle économique', contenu:`${m4Data?.modele_choisi || '—'} · Prix Pro : ${fmt(prixPro)}/mois · MRR cible M12 : ${fmt(m4Data?.projections?.mrr_m12)}` },
          { titre:'4. Traction actuelle', contenu:`MRR : ${fmt(mrrActuel)} · Clients : ${m6Data?.clients||0} · Signups : ${m6Data?.signups||0}` },
          { titre:'5. Coûts opérationnels', contenu:`Stack mensuel : ${fmt(m7Data?.aiResult?.outils?.reduce((s,o)=>s+(o.cout_mensuel||0),0))} · Lancement : ${fmt(m7Data?.aiResult?.outils?.reduce((s,o)=>s+(o.cout_unique||0),0))}` },
          { titre:"6. Canaux d'acquisition", contenu:(project.modules.m5?.data?.canaux||[]).map(c=>c.nom).join(', ') || '—' },
          { titre:'7. Jalons légaux', contenu:legal.quandStructure },
        ].map(({ titre, contenu }, i) => (
          <div key={i} style={{padding:'12px 0',borderBottom:i<6?'1px solid #2a2a38':'none'}}>
            <div style={{fontFamily:'DM Mono',fontSize:10,color:'#a78bfa',letterSpacing:'0.08em',marginBottom:4}}>{titre}</div>
            <div style={{fontSize:13,color:'#c0c0d0',lineHeight:1.5}}>{contenu || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared UI components ────────────────────────────────────────────────────

function ModuleHeader({ number, title, subtitle, status }) {
  return (
    <div style={{marginBottom:32}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap'}}>
        <span style={{fontFamily:'DM Mono',fontSize:11,color:'#8b8b9a',letterSpacing:'0.2em'}}>{number}</span>
        <h2 style={{fontFamily:'Syne',fontSize:'clamp(22px,4vw,30px)',fontWeight:800,letterSpacing:'-0.02em'}}>{title}</h2>
        {status === 'complete' && (
          <span style={{padding:'3px 10px',background:'#22d3a012',border:'1px solid #22d3a028',borderRadius:6,fontFamily:'DM Mono',fontSize:10,color:'#22d3a0',letterSpacing:'0.05em'}}>
            complété
          </span>
        )}
      </div>
      {subtitle && <p style={{color:'#8b8b9a',fontSize:13,lineHeight:1.5}}>{subtitle}</p>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{marginBottom:16}}>
      {title && <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.15em',textTransform:'uppercase',color:'#8b8b9a',marginBottom:10}}>{title}</div>}
      <div style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:14,padding:18}}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, hint, required }) {
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
        <label style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'#8b8b9a'}}>
          {label}{required && <span style={{color:'#f87171'}}> *</span>}
        </label>
        {hint && <span style={{fontFamily:'DM Mono',fontSize:9,color:'#8b8b9a'}}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SectionTitle({ children, accent }) {
  return (
    <div style={{fontFamily:'Syne',fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:accent||'#8b8b9a',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
      {children}
      <span style={{flex:1,height:1,background:'#2a2a38',display:'block'}} />
    </div>
  );
}

function Badge({ color, children }) {
  return (
    <span style={{padding:'3px 10px',background:`${color}15`,border:`1px solid ${color}30`,borderRadius:6,fontFamily:'DM Mono',fontSize:10,letterSpacing:'0.08em',textTransform:'uppercase',color}}>
      {children}
    </span>
  );
}

function MiniCard({ label, value }) {
  return (
    <div style={{background:'#18181f',borderRadius:8,padding:'12px 14px'}}>
      <div style={{fontFamily:'DM Mono',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'#8b8b9a',marginBottom:5}}>{label}</div>
      <div style={{fontSize:13,color:'#c0c0d0',lineHeight:1.5}}>{value}</div>
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div style={{background:'#f8717110',border:'1px solid #f8717128',borderRadius:10,padding:'13px 18px',color:'#f87171',fontSize:13,marginBottom:14,lineHeight:1.5}}>
      {msg}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{width:16,height:16,border:'2px solid #ffffff15',borderTop:'2px solid #7c5cfc',borderRadius:'50%',animation:'spin 0.8s linear infinite',flexShrink:0}} />
  );
}

function LockedModule({ label, prev }) {
  return (
    <div style={{textAlign:'center',padding:'90px 0'}}>
      <div style={{fontFamily:'DM Mono',fontSize:11,letterSpacing:'0.2em',textTransform:'uppercase',color:'#2a2a38',marginBottom:16}}>module verrouillé</div>
      <div style={{fontFamily:'Syne',fontSize:20,fontWeight:800,marginBottom:8}}>{label}</div>
      <div style={{color:'#8b8b9a',fontSize:14}}>Complete le module <strong>{prev}</strong> pour débloquer.</div>
    </div>
  );
}

function ComingSoon({ label, number }) {
  return (
    <div style={{textAlign:'center',padding:'90px 0'}}>
      <div style={{fontFamily:'DM Mono',fontSize:11,letterSpacing:'0.2em',textTransform:'uppercase',color:'#2a2a38',marginBottom:16}}>{number}</div>
      <div style={{fontFamily:'Syne',fontSize:20,fontWeight:800,marginBottom:8}}>Module {label}</div>
      <div style={{color:'#8b8b9a',fontSize:14}}>En construction — bientôt disponible.</div>
    </div>
  );
}
