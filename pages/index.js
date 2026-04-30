import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getProjects, createProject, deleteProject } from '../lib/storage';

const FONTS = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap';

const CAT_COLORS = {
  SaaS: '#7c5cfc', Média: '#22d3a0', 'E-commerce': '#fbbf24',
  'App mobile': '#a78bfa', Service: '#34d399', Marketplace: '#f87171', Autre: '#8b8b9a',
};

function getModuleProgress(modules) {
  if (!modules) return 0;
  return ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'].filter(k => modules[k]?.status === 'complete').length;
}

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProjects(getProjects());
  }, []);

  function handleCreate(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const p = createProject(name);
    router.push(`/project/${p.id}`);
  }

  function handleDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm('Supprimer ce projet définitivement ?')) return;
    deleteProject(id);
    setProjects(getProjects());
  }

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>MapBuilder</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link href={FONTS} rel="stylesheet" />
      </Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0a0a0f;color:#f0f0f5;font-family:'DM Sans',sans-serif;min-height:100vh}
        button{cursor:pointer;font-family:'DM Sans',sans-serif}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade{animation:fadeIn 0.3s ease both}
        .card{transition:border-color 0.2s,transform 0.15s}
        .card:hover{border-color:#7c5cfc50 !important;transform:translateY(-2px)}
        input{font-family:'DM Sans',sans-serif}
      `}</style>

      <div style={{position:'fixed',top:-200,left:'50%',transform:'translateX(-50%)',width:800,height:500,background:'radial-gradient(ellipse,#7c5cfc12 0%,transparent 70%)',pointerEvents:'none',zIndex:0}} />

      <div style={{maxWidth:960,margin:'0 auto',padding:'60px 24px',position:'relative',zIndex:1}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:52,flexWrap:'wrap',gap:16}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <div style={{width:8,height:8,background:'#7c5cfc',borderRadius:'50%',boxShadow:'0 0 12px #7c5cfc'}} />
              <span style={{fontFamily:'DM Mono',fontSize:11,letterSpacing:'0.2em',textTransform:'uppercase',color:'#a78bfa'}}>MapBuilder · v1</span>
            </div>
            <h1 style={{fontFamily:'Syne',fontSize:'clamp(28px,5vw,42px)',fontWeight:800,letterSpacing:'-0.02em',lineHeight:1.1,marginBottom:8}}>
              Tes projets
            </h1>
            <p style={{color:'#8b8b9a',fontSize:14,lineHeight:1.5}}>Structure tes idées entrepreneuriales de A à Z.</p>
          </div>
          <button
            onClick={() => { setShowCreate(true); setNewName(''); }}
            style={{background:'#7c5cfc',color:'white',border:'none',borderRadius:10,padding:'11px 20px',fontFamily:'Syne',fontSize:14,fontWeight:700,display:'flex',alignItems:'center',gap:8,flexShrink:0,boxShadow:'0 4px 24px #7c5cfc40'}}
          >
            + Nouveau projet
          </button>
        </div>

        {/* Empty state */}
        {projects.length === 0 && (
          <div style={{textAlign:'center',padding:'100px 0'}}>
            <div style={{fontFamily:'DM Mono',fontSize:11,letterSpacing:'0.2em',textTransform:'uppercase',color:'#2a2a38',marginBottom:24}}>∅ aucun projet</div>
            <div style={{fontFamily:'Syne',fontSize:22,fontWeight:800,marginBottom:10}}>Commence ici.</div>
            <div style={{color:'#8b8b9a',fontSize:14,marginBottom:28,maxWidth:360,margin:'0 auto 28px'}}>
              Crée ton premier projet pour structurer ton idée avec 8 modules séquentiels.
            </div>
            <button
              onClick={() => { setShowCreate(true); setNewName(''); }}
              style={{background:'transparent',border:'1px solid #7c5cfc',color:'#a78bfa',borderRadius:10,padding:'12px 28px',fontFamily:'Syne',fontSize:14,fontWeight:700}}
            >
              + Créer un projet
            </button>
          </div>
        )}

        {/* Projects grid */}
        {projects.length > 0 && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:16}}>
            {projects.map(p => {
              const progress = getModuleProgress(p.modules);
              const cat = p.modules?.m1?.data?.category || null;
              const catColor = CAT_COLORS[cat] || '#8b8b9a';
              const moduleKeys = ['m1','m2','m3','m4','m5','m6','m7','m8'];

              return (
                <div
                  key={p.id}
                  onClick={() => router.push(`/project/${p.id}`)}
                  className="card fade"
                  style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:16,padding:24,cursor:'pointer',position:'relative'}}
                >
                  <button
                    onClick={e => handleDelete(e, p.id)}
                    title="Supprimer"
                    style={{position:'absolute',top:14,right:14,background:'transparent',border:'none',color:'#8b8b9a',fontSize:18,lineHeight:1,padding:'2px 6px',opacity:0.4,transition:'opacity 0.2s'}}
                    onMouseEnter={e => e.currentTarget.style.opacity='1'}
                    onMouseLeave={e => e.currentTarget.style.opacity='0.4'}
                  >
                    ×
                  </button>

                  {cat && (
                    <div style={{display:'inline-flex',padding:'3px 10px',background:`${catColor}15`,border:`1px solid ${catColor}30`,borderRadius:6,fontFamily:'DM Mono',fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:catColor,marginBottom:12}}>
                      {cat}
                    </div>
                  )}

                  <div style={{fontFamily:'Syne',fontSize:18,fontWeight:700,marginBottom:6,marginRight:20,lineHeight:1.2}}>{p.name}</div>

                  {p.modules?.m1?.data?.description && (
                    <div style={{fontSize:13,color:'#8b8b9a',lineHeight:1.5,marginBottom:14,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
                      {p.modules.m1.data.description}
                    </div>
                  )}

                  <div style={{marginBottom:10}}>
                    <div style={{display:'flex',gap:3,marginBottom:6}}>
                      {moduleKeys.map(k => {
                        const s = p.modules?.[k]?.status;
                        return <div key={k} style={{flex:1,height:3,borderRadius:2,background:s==='complete'?'#22d3a0':s==='available'?'#7c5cfc40':'#2a2a38'}} />;
                      })}
                    </div>
                    <div style={{fontFamily:'DM Mono',fontSize:10,color:'#8b8b9a'}}>
                      {progress}/8 modules complétés
                    </div>
                  </div>

                  <div style={{fontFamily:'DM Mono',fontSize:10,color:'#2a2a38',marginTop:8}}>
                    {new Date(p.updatedAt).toLocaleDateString('fr-CA', { year:'numeric', month:'short', day:'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div
          style={{position:'fixed',inset:0,background:'rgba(10,10,15,0.85)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:24}}
          onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}
        >
          <div className="fade" style={{background:'#111118',border:'1px solid #2a2a38',borderRadius:20,padding:32,width:'100%',maxWidth:420}}>
            <div style={{fontFamily:'Syne',fontSize:20,fontWeight:800,marginBottom:6}}>Nouveau projet</div>
            <div style={{color:'#8b8b9a',fontSize:13,marginBottom:24}}>Donne un nom à ton idée — tu détailleras tout dans le module 1.</div>
            <form onSubmit={handleCreate}>
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ex: FinanceApp, VetConnect, StudyBuddy..."
                style={{width:'100%',background:'#18181f',border:'1px solid #2a2a38',borderRadius:10,padding:'12px 16px',color:'#f0f0f5',fontSize:15,outline:'none',marginBottom:16,transition:'border-color 0.2s'}}
                onFocus={e => e.target.style.borderColor='#7c5cfc'}
                onBlur={e => e.target.style.borderColor='#2a2a38'}
              />
              <div style={{display:'flex',gap:8}}>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  style={{flex:1,background:'transparent',border:'1px solid #2a2a38',color:'#8b8b9a',borderRadius:10,padding:12,fontFamily:'DM Mono',fontSize:12}}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  style={{flex:2,background:newName.trim()?'#7c5cfc':'#2a2a38',color:newName.trim()?'white':'#8b8b9a',border:'none',borderRadius:10,padding:12,fontFamily:'Syne',fontSize:14,fontWeight:700,transition:'background 0.2s'}}
                >
                  Créer →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
