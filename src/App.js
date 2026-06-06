import { useState } from "react";

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#020a12;font-family:'Rajdhani',sans-serif;}
    ::-webkit-scrollbar{width:4px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:rgba(0,200,255,0.3);border-radius:2px;}
    select option{background:#050f1a;color:#a0d4e8;}
    textarea{resize:vertical;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes toastIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
    @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
    @keyframes flicker{0%,100%{opacity:1}92%{opacity:1}93%{opacity:.8}94%{opacity:1}96%{opacity:.9}97%{opacity:1}}
    @keyframes glow{0%,100%{box-shadow:0 0 8px rgba(0,200,255,0.4)}50%{box-shadow:0 0 20px rgba(0,200,255,0.8),0 0 40px rgba(0,200,255,0.2)}}
    @keyframes borderGlow{0%,100%{border-color:rgba(0,200,255,0.3)}50%{border-color:rgba(0,200,255,0.8)}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    .page-in{animation:fadeIn .3s ease both;}
    .live-dot{animation:pulse 1.2s infinite;}
    .glow-box{animation:glow 3s ease-in-out infinite;}
    .border-glow{animation:borderGlow 2s ease-in-out infinite;}
  `}</style>
);

// ─── DADOS ────────────────────────────────────────────────────────────────────
const MAPS = ["Mirage","Inferno","Dust2","Nuke","Ancient","Anubis","Vertigo"];
const MAP_ICONS = {Mirage:"🏜️",Inferno:"🔥",Dust2:"💨",Nuke:"☢️",Ancient:"🏛️",Anubis:"🐍",Vertigo:"🏙️"};

const INIT_USERS = [
  {id:1,name:"Admin",role:"holder",team:null,avatar:"AD",available:false,password:"holder123",joined:"2025-01"},
];
const INIT_TEAMS = [];
const INIT_MATCHES = [];
const INIT_STATS = [];
const INIT_NEWS = [];
const INIT_BRACKET = {name:"Campeonato",rounds:[
  {name:"Quartas de Final",matches:[{id:"q1",t1:null,t2:null,winner:null,score:null},{id:"q2",t1:null,t2:null,winner:null,score:null},{id:"q3",t1:null,t2:null,winner:null,score:null},{id:"q4",t1:null,t2:null,winner:null,score:null}]},
  {name:"Semifinal",matches:[{id:"s1",t1:null,t2:null,winner:null,score:null},{id:"s2",t1:null,t2:null,winner:null,score:null}]},
  {name:"Grande Final",matches:[{id:"f1",t1:null,t2:null,winner:null,score:null}]},
]};

const ROLE_CFG = {
  holder:    {label:"Holder",    bg:"#00c8ff",icon:"👑"},
  captain:   {label:"Capitão",  bg:"#7b2fff",icon:"⚔️"},
  journalist:{label:"Jornalista",bg:"#00ffcc",icon:"📰"},
  player:    {label:"Jogador",  bg:"#00ff88",icon:"🎮"},
};

// ─── PRIMITIVOS CYBER ─────────────────────────────────────────────────────────
const CyberBorder = ({children,style={}}) => (
  <div style={{position:"relative",...style}}>
    <div style={{position:"absolute",top:0,left:0,width:12,height:12,borderTop:"2px solid #00c8ff",borderLeft:"2px solid #00c8ff"}}/>
    <div style={{position:"absolute",top:0,right:0,width:12,height:12,borderTop:"2px solid #00c8ff",borderRight:"2px solid #00c8ff"}}/>
    <div style={{position:"absolute",bottom:0,left:0,width:12,height:12,borderBottom:"2px solid #00c8ff",borderLeft:"2px solid #00c8ff"}}/>
    <div style={{position:"absolute",bottom:0,right:0,width:12,height:12,borderBottom:"2px solid #00c8ff",borderRight:"2px solid #00c8ff"}}/>
    {children}
  </div>
);

const Tag = ({role}) => {
  const c=ROLE_CFG[role]||{label:role,bg:"#6B7280",icon:"?"};
  return <span style={{background:`${c.bg}22`,color:c.bg,border:`1px solid ${c.bg}55`,fontSize:"0.62rem",padding:"2px 8px",borderRadius:2,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:"0.08em",whiteSpace:"nowrap"}}>{c.icon} {c.label}</span>;
};

const Avatar = ({initials,color="#00c8ff",size=36}) => (
  <div style={{width:size,height:size,minWidth:size,borderRadius:2,background:`${color}18`,border:`1px solid ${color}66`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:Math.max(size*0.32,10),color,fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.05em",position:"relative"}}>
    {initials}
    <div style={{position:"absolute",top:0,left:0,width:6,height:6,borderTop:`1px solid ${color}`,borderLeft:`1px solid ${color}`}}/>
    <div style={{position:"absolute",bottom:0,right:0,width:6,height:6,borderBottom:`1px solid ${color}`,borderRight:`1px solid ${color}`}}/>
  </div>
);

const Card = ({children,style={},glow=false}) => (
  <div style={{background:"rgba(0,20,35,0.8)",border:"1px solid rgba(0,200,255,0.15)",borderRadius:2,padding:"1.1rem",backdropFilter:"blur(10px)",position:"relative",overflow:"hidden",...(glow?{boxShadow:"0 0 20px rgba(0,200,255,0.1)"}:{}),...style}}>
    <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(0,200,255,0.5),transparent)"}}/>
    {children}
  </div>
);

const Btn = ({children,onClick,variant="primary",size="md",disabled=false,style={}}) => {
  const V = {
    primary:  {bg:"transparent",border:"#00c8ff",color:"#00c8ff",glow:"rgba(0,200,255,0.3)"},
    secondary:{bg:"transparent",border:"rgba(255,255,255,0.15)",color:"#6b8a9a",glow:"transparent"},
    danger:   {bg:"transparent",border:"#ff3366",color:"#ff3366",glow:"rgba(255,51,102,0.3)"},
    green:    {bg:"transparent",border:"#00ff88",color:"#00ff88",glow:"rgba(0,255,136,0.3)"},
    purple:   {bg:"transparent",border:"#7b2fff",color:"#7b2fff",glow:"rgba(123,47,255,0.3)"},
    cyan:     {bg:"transparent",border:"#00ffcc",color:"#00ffcc",glow:"rgba(0,255,204,0.3)"},
    solid:    {bg:"rgba(0,200,255,0.15)",border:"#00c8ff",color:"#00c8ff",glow:"rgba(0,200,255,0.4)"},
  };
  const S = {sm:{padding:"4px 12px",fontSize:"0.7rem"},md:{padding:"7px 16px",fontSize:"0.78rem"},lg:{padding:"10px 24px",fontSize:"0.88rem"}};
  const v=V[variant]||V.primary;
  return (
    <button onClick={onClick} disabled={disabled} style={{background:v.bg,color:v.color,border:`1px solid ${v.border}`,...S[size],borderRadius:2,cursor:disabled?"not-allowed":"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:"0.08em",opacity:disabled?0.4:1,transition:"all .2s",boxShadow:disabled?"none":`0 0 10px ${v.glow}`,whiteSpace:"nowrap",textTransform:"uppercase",...style}}>
      {children}
    </button>
  );
};

const Input = ({placeholder,value,onChange,type="text",style={}}) => (
  <input type={type} placeholder={placeholder} value={value} onChange={onChange}
    style={{background:"rgba(0,200,255,0.04)",border:"1px solid rgba(0,200,255,0.2)",borderRadius:2,padding:"8px 12px",color:"#a0d4e8",fontSize:"0.82rem",width:"100%",outline:"none",fontFamily:"'Rajdhani',sans-serif","::placeholder":{color:"#2a4a5a"},...style}}/>
);

const Textarea = ({placeholder,value,onChange,rows=4}) => (
  <textarea placeholder={placeholder} value={value} onChange={onChange} rows={rows}
    style={{background:"rgba(0,200,255,0.04)",border:"1px solid rgba(0,200,255,0.2)",borderRadius:2,padding:"8px 12px",color:"#a0d4e8",fontSize:"0.82rem",width:"100%",outline:"none",fontFamily:"'Rajdhani',sans-serif",lineHeight:1.5}}/>
);

const Select = ({value,onChange,children,style={}}) => (
  <select value={value} onChange={onChange}
    style={{background:"rgba(0,10,20,0.9)",border:"1px solid rgba(0,200,255,0.2)",borderRadius:2,padding:"8px 12px",color:"#a0d4e8",fontSize:"0.82rem",width:"100%",outline:"none",fontFamily:"'Rajdhani',sans-serif",...style}}>
    {children}
  </select>
);

const SectionTitle = ({children,sub,icon}) => (
  <div style={{marginBottom:"1.4rem"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
      <div style={{width:3,height:24,background:"linear-gradient(180deg,#00c8ff,transparent)"}}/>
      <h2 style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1.2rem",color:"#00c8ff",letterSpacing:"0.1em",textTransform:"uppercase",textShadow:"0 0 20px rgba(0,200,255,0.5)"}}>{icon&&<span style={{marginRight:8}}>{icon}</span>}{children}</h2>
    </div>
    {sub&&<p style={{color:"#2a6a7a",fontSize:"0.75rem",fontFamily:"'Share Tech Mono',monospace",marginLeft:13}}>&gt; {sub}</p>}
  </div>
);

const Pill = ({children,color="#00c8ff",style={}}) => (
  <span style={{background:`${color}15`,color,border:`1px solid ${color}33`,fontSize:"0.65rem",padding:"2px 9px",borderRadius:2,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:"0.05em",...style}}>{children}</span>
);

const Divider = () => (
  <div style={{margin:"0.9rem 0",height:1,background:"linear-gradient(90deg,transparent,rgba(0,200,255,0.2),transparent)"}}/>
);

const TabBar = ({tabs,active,onChange}) => (
  <div style={{display:"flex",gap:5,marginBottom:"1.2rem",flexWrap:"wrap"}}>
    {tabs.map(([k,l])=>(
      <button key={k} onClick={()=>onChange(k)}
        style={{background:active===k?"rgba(0,200,255,0.12)":"transparent",color:active===k?"#00c8ff":"#2a6a7a",border:`1px solid ${active===k?"rgba(0,200,255,0.5)":"rgba(0,200,255,0.1)"}`,padding:"5px 13px",borderRadius:2,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.65rem",letterSpacing:"0.08em",textTransform:"uppercase",transition:"all .15s",boxShadow:active===k?"0 0 10px rgba(0,200,255,0.2)":"none"}}>
        {l}
      </button>
    ))}
  </div>
);

const StatBar = ({label,value,max,color="#00c8ff"}) => (
  <div style={{marginBottom:8}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
      <span style={{color:"#2a6a7a",fontSize:"0.7rem",fontFamily:"'Share Tech Mono',monospace"}}>{label}</span>
      <span style={{color,fontSize:"0.7rem",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{value}</span>
    </div>
    <div style={{height:4,borderRadius:1,background:"rgba(0,200,255,0.08)"}}>
      <div style={{height:"100%",width:`${Math.min((value/max)*100,100)}%`,background:`linear-gradient(90deg,${color},${color}88)`,borderRadius:1,boxShadow:`0 0 6px ${color}66`,transition:"width .6s ease"}}/>
    </div>
  </div>
);

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({users,onLogin}) {
  const [name,setName]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const handle = () => {
    setLoading(true);
    setTimeout(()=>{
      const u=users.find(u=>u.name.toLowerCase()===name.toLowerCase()&&u.password===pass);
      if(u){onLogin(u);setErr("");}
      else setErr("// ACESSO NEGADO — credenciais inválidas");
      setLoading(false);
    },800);
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#020a12",padding:"1rem",position:"relative",overflow:"hidden"}}>
      {/* Grid background */}
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(0,200,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}}/>
      {/* Scanline */}
      <div style={{position:"fixed",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,rgba(0,200,255,0.15),transparent)",animation:"scanline 8s linear infinite",pointerEvents:"none"}}/>
      {/* Glow orbs */}
      <div style={{position:"fixed",top:"20%",left:"10%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,200,255,0.06),transparent)",pointerEvents:"none"}}/>
      <div style={{position:"fixed",bottom:"20%",right:"10%",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(123,47,255,0.06),transparent)",pointerEvents:"none"}}/>

      <div style={{width:"min(420px,100%)",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"0.7rem",color:"#00c8ff",letterSpacing:"0.3em",marginBottom:"0.8rem",opacity:0.6}}>// SISTEMA DE AUTENTICAÇÃO //</div>
          <div style={{position:"relative",display:"inline-block",marginBottom:"1rem"}}>
            <div style={{width:70,height:70,borderRadius:2,background:"rgba(0,200,255,0.08)",border:"1px solid rgba(0,200,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",margin:"0 auto",boxShadow:"0 0 30px rgba(0,200,255,0.2)",animation:"glow 3s ease-in-out infinite"}}>🎯</div>
          </div>
          <h1 style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"2rem",color:"#fff",letterSpacing:"0.12em",textShadow:"0 0 30px rgba(0,200,255,0.5)",marginBottom:4}}>VÁRZEA CS2</h1>
          <p style={{color:"#2a6a7a",fontSize:"0.7rem",fontFamily:"'Share Tech Mono',monospace",letterSpacing:"0.1em"}}>CHAMPIONSHIP MANAGEMENT SYSTEM v2.0</p>
        </div>

        <CyberBorder style={{padding:"1.6rem",background:"rgba(0,15,25,0.9)",backdropFilter:"blur(20px)"}}>
          <div style={{marginBottom:"0.3rem"}}>
            <label style={{color:"#00c8ff",fontSize:"0.65rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.12em",display:"block",marginBottom:6}}>// IDENTIFICADOR</label>
            <Input placeholder="username" value={name} onChange={e=>setName(e.target.value)} style={{marginBottom:"1rem",fontFamily:"'Share Tech Mono',monospace"}}/>
            <label style={{color:"#00c8ff",fontSize:"0.65rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.12em",display:"block",marginBottom:6}}>// SENHA DE ACESSO</label>
            <Input placeholder="••••••••••" type="password" value={pass} onChange={e=>setPass(e.target.value)} style={{marginBottom:"1rem",fontFamily:"'Share Tech Mono',monospace"}}/>
          </div>
          {err&&<p style={{color:"#ff3366",fontSize:"0.72rem",margin:"0 0 1rem",fontFamily:"'Share Tech Mono',monospace",display:"flex",alignItems:"center",gap:5}}>{err}</p>}
          <Btn onClick={handle} variant="solid" size="lg" disabled={loading} style={{width:"100%",textAlign:"center",letterSpacing:"0.15em"}}>
            {loading?"// VERIFICANDO...":"// ACESSAR SISTEMA"}
          </Btn>
        </CyberBorder>

        <p style={{textAlign:"center",color:"rgba(0,200,255,0.15)",fontSize:"0.62rem",marginTop:"1.5rem",fontFamily:"'Share Tech Mono',monospace"}}>SISTEMA PROTEGIDO — ACESSO RESTRITO</p>
      </div>
    </div>
  );
}

// ─── PICK & BAN ───────────────────────────────────────────────────────────────
function PickBanModal({match,teams,canControl,onClose,onFinish}) {
  const t1=teams.find(t=>t.id===match.team1);
  const t2=teams.find(t=>t.id===match.team2);
  const SEQ=["ban","ban","ban","ban","ban","ban","pick","pick"];
  const [actions,setActions]=useState(match.pbActions||[]);
  const step=actions.length;
  const done=step>=SEQ.length;
  const curType=!done?SEQ[step]:null;
  const curTeam=!done?(step%2===0?t1:t2):null;
  const banned=actions.filter(a=>a.type==="ban").map(a=>a.map);
  const picked=actions.filter(a=>a.type==="pick").map(a=>a.map);
  const decider=done?MAPS.find(m=>!banned.includes(m)&&!picked.includes(m)):null;

  const act=(map)=>{
    if(!canControl||done||banned.includes(map)||picked.includes(map)) return;
    const nxt=[...actions,{map,type:curType,team:curTeam?.id}];
    setActions(nxt);
    if(nxt.length>=SEQ.length){
      const fp=nxt.filter(a=>a.type==="pick").map(a=>a.map);
      const dec=MAPS.find(m=>!nxt.filter(a=>a.type==="ban").map(a=>a.map).includes(m)&&!fp.includes(m));
      onFinish(match.id,[...fp,dec].filter(Boolean),nxt);
    }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,5,10,0.95)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",backdropFilter:"blur(8px)"}}>
      <div style={{width:"min(720px,100%)",background:"#020a12",border:"1px solid rgba(0,200,255,0.25)",borderRadius:2,padding:"1.6rem",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 0 60px rgba(0,200,255,0.15)"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,#00c8ff,transparent)"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.3rem"}}>
          <div>
            <h2 style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1.2rem",color:"#00c8ff",letterSpacing:"0.1em",textShadow:"0 0 20px rgba(0,200,255,0.5)"}}>⚔ PICK & BAN</h2>
            <p style={{color:"#2a6a7a",fontSize:"0.7rem",fontFamily:"'Share Tech Mono',monospace",marginTop:3}}>&gt; {t1?.name||"TIME 1"} vs {t2?.name||"TIME 2"} // BO3</p>
          </div>
          <Btn onClick={onClose} variant="danger" size="sm">✕ FECHAR</Btn>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.8rem",marginBottom:"1.2rem"}}>
          {[t1,t2].map((t,i)=>(
            <div key={i} style={{background:!done&&curTeam?.id===t?.id?"rgba(0,200,255,0.08)":"rgba(0,10,20,0.5)",border:`1px solid ${!done&&curTeam?.id===t?.id?"rgba(0,200,255,0.5)":"rgba(0,200,255,0.1)"}`,borderRadius:2,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,transition:"all .2s",boxShadow:!done&&curTeam?.id===t?.id?"0 0 20px rgba(0,200,255,0.1)":"none"}}>
              <span style={{fontSize:"1.8rem"}}>{t?.logo||"?"}</span>
              <div>
                <div style={{color:"#fff",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.85rem"}}>{t?.name||"A DEFINIR"}</div>
                {!done&&curTeam?.id===t?.id&&<div style={{color:"#00c8ff",fontSize:"0.6rem",fontFamily:"'Share Tech Mono',monospace",marginTop:2}}>&gt; {curType==="ban"?"BANINDO...":"ESCOLHENDO..."}</div>}
              </div>
            </div>
          ))}
        </div>

        {!done&&curTeam&&(
          <div style={{background:"rgba(0,200,255,0.05)",border:"1px solid rgba(0,200,255,0.2)",borderRadius:2,padding:"9px 13px",marginBottom:"1.1rem",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.78rem",color:"#00c8ff"}}>
            &gt; {curTeam.name} — {curType==="ban"?"BANIR UM MAPA":"ESCOLHER UM MAPA"}
            {!canControl&&<span style={{color:"#2a6a7a",marginLeft:8}}>[somente leitura]</span>}
          </div>
        )}
        {done&&(
          <div style={{background:"rgba(0,255,136,0.05)",border:"1px solid rgba(0,255,136,0.2)",borderRadius:2,padding:"9px 13px",marginBottom:"1.1rem"}}>
            <p style={{color:"#00ff88",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.78rem"}}>&gt; PICK & BAN CONCLUÍDO // MAPAS: {[...picked,decider].filter(Boolean).join(" → ")}</p>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8,marginBottom:"1.1rem"}}>
          {MAPS.map(map=>{
            const a=actions.find(x=>x.map===map);
            const isBanned=a?.type==="ban";
            const isPicked=a?.type==="pick";
            const isDecider=done&&map===decider;
            const teamColor=a?.team===t1?.id?t1?.color||"#00c8ff":t2?.color||"#7b2fff";
            const canClick=canControl&&!done&&!a;
            return (
              <div key={map} onClick={()=>canClick&&act(map)}
                style={{border:`1px solid ${isBanned?"rgba(255,51,102,0.4)":isPicked?`${teamColor}66`:isDecider?"rgba(255,200,0,0.4)":"rgba(0,200,255,0.12)"}`,borderRadius:2,padding:"12px 8px",textAlign:"center",cursor:canClick?"pointer":"default",opacity:isBanned?.4:1,background:isBanned?"rgba(255,51,102,0.05)":isPicked?`${teamColor}0a`:isDecider?"rgba(255,200,0,0.05)":"rgba(0,200,255,0.02)",transition:"all .15s",position:"relative"}}>
                <div style={{fontSize:"1.6rem",marginBottom:4}}>{MAP_ICONS[map]||"🗺️"}</div>
                <div style={{color:isBanned?"#ff3366":isPicked?teamColor:isDecider?"#ffc800":"#a0d4e8",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.72rem",letterSpacing:"0.05em"}}>{map}</div>
                {isBanned&&<div style={{color:"#ff3366",fontSize:"0.55rem",fontFamily:"'Share Tech Mono',monospace",marginTop:2}}>BANIDO</div>}
                {isPicked&&<div style={{color:teamColor,fontSize:"0.55rem",fontFamily:"'Share Tech Mono',monospace",marginTop:2}}>PICK</div>}
                {isDecider&&<div style={{color:"#ffc800",fontSize:"0.55rem",fontFamily:"'Share Tech Mono',monospace",marginTop:2}}>DECIDER</div>}
              </div>
            );
          })}
        </div>

        {actions.length>0&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {actions.map((a,i)=>(
              <span key={i} style={{padding:"2px 9px",borderRadius:2,fontSize:"0.62rem",fontFamily:"'Share Tech Mono',monospace",background:a.type==="ban"?"rgba(255,51,102,0.08)":"rgba(0,255,136,0.08)",color:a.type==="ban"?"#ff3366":"#00ff88",border:`1px solid ${a.type==="ban"?"rgba(255,51,102,0.2)":"rgba(0,255,136,0.2)"}`}}>
                {a.type==="ban"?"✕":"✓"} {a.map}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomePage({user,users,teams,matches,stats,setPbMatch,isHolder,isCaptain}) {
  const getTeam=id=>teams.find(t=>t.id===id);
  const myTeam=teams.find(t=>t.id===user.team);
  const live=matches.filter(m=>m.status==="live");
  const upcoming=matches.filter(m=>m.status==="scheduled");
  const finished=matches.filter(m=>m.status==="finished");

  return (
    <div className="page-in">
      <div style={{background:"linear-gradient(135deg,rgba(0,200,255,0.06),rgba(0,10,20,0))",border:"1px solid rgba(0,200,255,0.12)",borderRadius:2,padding:"1.8rem",marginBottom:"1.5rem",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:0,top:0,bottom:0,width:"40%",background:"linear-gradient(135deg,transparent,rgba(0,200,255,0.03))",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,#00c8ff,transparent)"}}/>
        <p style={{color:"#00c8ff",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.68rem",letterSpacing:"0.15em",marginBottom:6,opacity:0.7}}>&gt; OPERADOR AUTENTICADO</p>
        <h1 style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1.8rem",color:"#fff",letterSpacing:"0.08em",marginBottom:8,textShadow:"0 0 20px rgba(0,200,255,0.3)"}}>{user.name}</h1>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <Tag role={user.role}/>
          {myTeam&&<Pill color={myTeam.color||"#00c8ff"}>{myTeam.logo} {myTeam.name}</Pill>}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"0.8rem",marginBottom:"1.5rem"}}>
        {[
          {l:"Times",v:teams.length,i:"🛡",c:"#00c8ff"},
          {l:"Jogadores",v:users.filter(u=>u.role==="player").length,i:"🎮",c:"#7b2fff"},
          {l:"Partidas",v:matches.length,i:"⚡",c:"#00ffcc"},
          {l:"Ao Vivo",v:live.length,i:"●",c:"#ff3366"},
        ].map(c=>(
          <Card key={c.l} style={{textAlign:"center",padding:"1rem"}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1.8rem",color:c.c,textShadow:`0 0 15px ${c.c}66`,lineHeight:1}}>{c.v}</div>
            <div style={{color:"#2a6a7a",fontSize:"0.62rem",fontFamily:"'Share Tech Mono',monospace",marginTop:5,letterSpacing:"0.08em"}}>{c.l}</div>
          </Card>
        ))}
      </div>

      {live.length>0&&(
        <div style={{marginBottom:"1.5rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:"0.8rem"}}>
            <span className="live-dot" style={{width:8,height:8,borderRadius:"50%",background:"#ff3366",display:"inline-block",boxShadow:"0 0 8px #ff3366"}}/>
            <span style={{color:"#ff3366",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.65rem",letterSpacing:"0.15em"}}>AO VIVO</span>
          </div>
          {live.map(m=>{
            const mt1=getTeam(m.team1),mt2=getTeam(m.team2);
            return (
              <Card key={m.id} style={{borderColor:"rgba(255,51,102,0.2)",marginBottom:"0.6rem"}} glow>
                <div style={{display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap"}}>
                  <span style={{fontSize:"1.6rem"}}>{mt1?.logo}</span>
                  <span style={{fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:"#fff",fontSize:"0.9rem"}}>{mt1?.name}</span>
                  <div style={{flex:1,textAlign:"center"}}>
                    <span style={{background:"rgba(255,51,102,0.12)",color:"#ff3366",padding:"4px 16px",border:"1px solid rgba(255,51,102,0.3)",fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1rem"}}>{m.score||"—"}</span>
                  </div>
                  <span style={{fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:"#fff",fontSize:"0.9rem"}}>{mt2?.name}</span>
                  <span style={{fontSize:"1.6rem"}}>{mt2?.logo}</span>
                  {(isHolder||isCaptain)&&<Btn onClick={()=>setPbMatch(m)} size="sm">P&B</Btn>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div style={{marginBottom:"1.5rem"}}>
        <p style={{color:"#2a6a7a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.68rem",letterSpacing:"0.1em",marginBottom:"0.8rem"}}>&gt; PRÓXIMAS PARTIDAS</p>
        {upcoming.length===0&&<Card><p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.75rem"}}>&gt; NENHUMA PARTIDA AGENDADA</p></Card>}
        {upcoming.map(m=>{
          const mt1=getTeam(m.team1),mt2=getTeam(m.team2);
          return (
            <Card key={m.id} style={{display:"flex",alignItems:"center",gap:"0.8rem",flexWrap:"wrap",marginBottom:"0.5rem"}}>
              <span style={{fontSize:"1.3rem"}}>{mt1?.logo}</span>
              <span style={{fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:"#a0d4e8",fontSize:"0.8rem"}}>{mt1?.name}</span>
              <span style={{color:"#2a6a7a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.75rem"}}>VS</span>
              <span style={{fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:"#a0d4e8",fontSize:"0.8rem"}}>{mt2?.name}</span>
              <span style={{fontSize:"1.3rem"}}>{mt2?.logo}</span>
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
                <Pill color="#2a6a7a">{m.date}</Pill>
                {isHolder&&<Btn onClick={()=>setPbMatch(m)} size="sm">P&B</Btn>}
              </div>
            </Card>
          );
        })}
      </div>

      <div>
        <p style={{color:"#2a6a7a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.68rem",letterSpacing:"0.1em",marginBottom:"0.8rem"}}>&gt; ÚLTIMOS RESULTADOS</p>
        {finished.length===0&&<Card><p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.75rem"}}>&gt; NENHUM RESULTADO REGISTRADO</p></Card>}
        {finished.slice(-4).reverse().map(m=>{
          const mt1=getTeam(m.team1),mt2=getTeam(m.team2),w=getTeam(m.champion);
          return (
            <Card key={m.id} style={{display:"flex",alignItems:"center",gap:"0.8rem",flexWrap:"wrap",marginBottom:"0.4rem",opacity:0.75}}>
              <span style={{opacity:m.champion===m.team1?1:.3,fontSize:"1.1rem"}}>{mt1?.logo}</span>
              <span style={{fontFamily:"'Orbitron',sans-serif",color:m.champion===m.team1?"#a0d4e8":"#2a4a5a",fontSize:"0.75rem"}}>{mt1?.name}</span>
              <Pill color="#2a6a7a">{m.score}</Pill>
              <span style={{fontFamily:"'Orbitron',sans-serif",color:m.champion===m.team2?"#a0d4e8":"#2a4a5a",fontSize:"0.75rem"}}>{mt2?.name}</span>
              <span style={{opacity:m.champion===m.team2?1:.3,fontSize:"1.1rem"}}>{mt2?.logo}</span>
              <span style={{marginLeft:"auto",color:"#00c8ff",fontSize:"0.65rem",fontFamily:"'Share Tech Mono',monospace"}}>{w?.logo} {w?.name} [WIN]</span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── AO VIVO ──────────────────────────────────────────────────────────────────
function LivePage({matches,teams,isHolder,setPbMatch,setMatches,showToast}) {
  const getTeam=id=>teams.find(t=>t.id===id);
  const live=matches.filter(m=>m.status==="live");
  const fin=matches.filter(m=>m.status==="finished");
  return (
    <div className="page-in">
      <SectionTitle icon="●" sub="partidas em andamento e resultados recentes">Ao Vivo</SectionTitle>
      {live.length===0&&<Card><p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.75rem"}}>&gt; NENHUMA PARTIDA AO VIVO</p></Card>}
      {live.map(m=>{
        const mt1=getTeam(m.team1),mt2=getTeam(m.team2);
        const [s1,s2]=(m.score||"0-0").split("-").map(Number);
        return (
          <Card key={m.id} style={{marginBottom:"1.1rem",borderColor:"rgba(255,51,102,0.2)"}} glow>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"1rem"}}>
              <span style={{display:"flex",alignItems:"center",gap:5,color:"#ff3366",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.6rem",letterSpacing:"0.15em"}}>
                <span className="live-dot" style={{width:7,height:7,borderRadius:"50%",background:"#ff3366",boxShadow:"0 0 6px #ff3366"}}/>AO VIVO
              </span>
              <span style={{color:"#2a6a7a",fontSize:"0.68rem",fontFamily:"'Share Tech Mono',monospace"}}>{m.date}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"2rem",padding:"1rem 0",flexWrap:"wrap"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:"2.5rem",marginBottom:4}}>{mt1?.logo}</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.9rem",color:"#fff"}}>{mt1?.name}</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"2.5rem",color:"#fff",textShadow:"0 0 20px rgba(0,200,255,0.5)",lineHeight:1}}>{s1}<span style={{color:"#2a6a7a",margin:"0 8px"}}>:</span>{s2}</div>
                <div style={{color:"#2a6a7a",fontSize:"0.6rem",fontFamily:"'Share Tech Mono',monospace",marginTop:3}}>MAP SCORE</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:"2.5rem",marginBottom:4}}>{mt2?.logo}</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.9rem",color:"#fff"}}>{mt2?.name}</div>
              </div>
            </div>
            {m.maps.length>0&&<div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap",marginBottom:"0.8rem"}}>{m.maps.map((mp,i)=><Pill key={i} color="#2a6a7a">{MAP_ICONS[mp]} {mp}</Pill>)}</div>}
            {isHolder&&<div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
              <Btn onClick={()=>setPbMatch(m)} size="sm">⚔ PICK & BAN</Btn>
              <Btn onClick={()=>{setMatches(p=>p.map(x=>x.id===m.id?{...x,status:"finished",champion:x.team1,score:"2-1"}:x));showToast("Partida encerrada!");}} variant="danger" size="sm">✕ ENCERRAR</Btn>
            </div>}
          </Card>
        );
      })}
      <p style={{color:"#2a6a7a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.68rem",letterSpacing:"0.1em",marginBottom:"0.8rem",marginTop:"0.5rem"}}>&gt; RESULTADOS RECENTES</p>
      {fin.length===0&&<Card><p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.75rem"}}>&gt; NENHUM RESULTADO AINDA</p></Card>}
      {fin.map(m=>{
        const mt1=getTeam(m.team1),mt2=getTeam(m.team2),w=getTeam(m.champion);
        return (
          <Card key={m.id} style={{marginBottom:"0.4rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.8rem",flexWrap:"wrap"}}>
              <span style={{opacity:m.champion===m.team1?1:.3,fontSize:"1.2rem"}}>{mt1?.logo}</span>
              <span style={{fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:m.champion===m.team1?"#a0d4e8":"#2a4a5a",fontSize:"0.78rem"}}>{mt1?.name}</span>
              <Pill color="#2a6a7a">{m.score}</Pill>
              <span style={{fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:m.champion===m.team2?"#a0d4e8":"#2a4a5a",fontSize:"0.78rem"}}>{mt2?.name}</span>
              <span style={{opacity:m.champion===m.team2?1:.3,fontSize:"1.2rem"}}>{mt2?.logo}</span>
              <span style={{marginLeft:"auto",color:"#00c8ff",fontSize:"0.65rem",fontFamily:"'Share Tech Mono',monospace"}}>{w?.logo} {w?.name} [WIN]</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── ESTATÍSTICAS ─────────────────────────────────────────────────────────────
function StatsPage({stats,users,teams}) {
  const [tab,setTab]=useState("kills");
  const getTeam=id=>teams.find(t=>t.id===id);
  const getUser=id=>users.find(u=>u.id===id);
  const enriched=stats.map(s=>{
    const p=getUser(s.pid),t=p?getTeam(p.team):null;
    return {...s,player:p,team:t,kd:s.deaths>0?(s.kills/s.deaths).toFixed(2):s.kills.toString(),hsp:s.kills>0?Math.round(s.hs/s.kills*100):0,adr:s.maps>0?Math.round((s.kills*42+s.assists*10)/s.maps):0};
  });
  const sorted=[...enriched].sort((a,b)=>parseFloat(b[tab])-parseFloat(a[tab]));
  const maxKills=Math.max(...enriched.map(s=>s.kills),1);
  const COLS=[{k:"kills",l:"Kills"},{k:"kd",l:"K/D"},{k:"hsp",l:"HS%"},{k:"assists",l:"Assists"},{k:"adr",l:"ADR"},{k:"mvps",l:"MVPs"}];
  return (
    <div className="page-in">
      <SectionTitle icon="◈" sub="rankings individuais do campeonato">Estatísticas</SectionTitle>
      <TabBar tabs={COLS.map(c=>[c.k,c.l])} active={tab} onChange={setTab}/>
      {sorted.length===0&&<Card><p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.75rem"}}>&gt; NENHUMA ESTATÍSTICA REGISTRADA</p></Card>}
      {sorted.length>0&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"0.8rem",marginBottom:"1.3rem"}}>
            {sorted.slice(0,3).map((s,i)=>{
              const colors=["#ffc800","#a0a0b0","#cd7f32"];
              const labels=["#01","#02","#03"];
              return (
                <Card key={s.pid} style={{borderColor:`${colors[i]}33`,background:`rgba(0,10,20,0.9)`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.8rem"}}>
                    <Avatar initials={s.player?.avatar||"??"} color={s.team?.color||"#00c8ff"} size={36}/>
                    <span style={{color:colors[i],fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"0.8rem"}}>{labels[i]}</span>
                  </div>
                  <div style={{color:"#fff",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.85rem",marginBottom:2}}>{s.player?.name}</div>
                  <div style={{color:s.team?.color||"#2a6a7a",fontSize:"0.65rem",fontFamily:"'Share Tech Mono',monospace",marginBottom:"0.8rem"}}>{s.team?.logo} {s.team?.name||"—"}</div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"2rem",color:colors[i],textShadow:`0 0 15px ${colors[i]}66`,lineHeight:1}}>{s[tab]}{tab==="hsp"?"%":""}</div>
                  <div style={{color:"#2a6a7a",fontSize:"0.6rem",fontFamily:"'Share Tech Mono',monospace",marginTop:2}}>{COLS.find(c=>c.k===tab)?.l}</div>
                </Card>
              );
            })}
          </div>
          <Card style={{padding:0,overflow:"hidden"}}>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:560}}>
                <thead><tr style={{background:"rgba(0,200,255,0.04)",borderBottom:"1px solid rgba(0,200,255,0.1)"}}>
                  {["#","Jogador","Time","Kills","K/D","HS%","Assists","ADR","MVPs"].map(h=>(
                    <th key={h} style={{padding:"9px 12px",textAlign:"left",color:"#00c8ff",fontSize:"0.6rem",fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:"0.1em"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {sorted.map((s,i)=>(
                    <tr key={s.pid} style={{borderBottom:"1px solid rgba(0,200,255,0.04)",background:i===0?"rgba(0,200,255,0.03)":"transparent"}}>
                      <td style={{padding:"9px 12px",color:i===0?"#ffc800":i<3?"#a0a0b0":"#2a4a5a",fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"0.75rem"}}>0{i+1}</td>
                      <td style={{padding:"9px 12px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <Avatar initials={s.player?.avatar||"??"} color={s.team?.color||"#00c8ff"} size={24}/>
                          <span style={{color:"#a0d4e8",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"0.85rem"}}>{s.player?.name}</span>
                        </div>
                      </td>
                      <td style={{padding:"9px 12px"}}><span style={{color:s.team?.color||"#2a6a7a",fontSize:"0.72rem",fontFamily:"'Share Tech Mono',monospace"}}>{s.team?.logo} {s.team?.name||"—"}</span></td>
                      <td style={{padding:"9px 12px",color:"#fff",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.82rem"}}>{s.kills}</td>
                      <td style={{padding:"9px 12px",color:parseFloat(s.kd)>=1?"#00ff88":"#ff3366",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.82rem"}}>{s.kd}</td>
                      <td style={{padding:"9px 12px",color:"#a0d4e8",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.78rem"}}>{s.hsp}%</td>
                      <td style={{padding:"9px 12px",color:"#2a6a7a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.78rem"}}>{s.assists}</td>
                      <td style={{padding:"9px 12px",color:"#2a6a7a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.78rem"}}>{s.adr}</td>
                      <td style={{padding:"9px 12px",color:s.mvps>0?"#ffc800":"#2a4a5a",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.78rem"}}>{s.mvps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1rem",marginTop:"1.2rem"}}>
            <Card>
              <p style={{margin:"0 0 0.8rem",color:"#00c8ff",fontSize:"0.6rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.1em"}}>&gt; TOP KILLS</p>
              {[...enriched].sort((a,b)=>b.kills-a.kills).slice(0,5).map(s=><StatBar key={s.pid} label={s.player?.name||"?"} value={s.kills} max={maxKills} color={s.team?.color||"#00c8ff"}/>)}
            </Card>
            <Card>
              <p style={{margin:"0 0 0.8rem",color:"#00c8ff",fontSize:"0.6rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.1em"}}>&gt; TOP K/D</p>
              {[...enriched].sort((a,b)=>parseFloat(b.kd)-parseFloat(a.kd)).slice(0,5).map(s=><StatBar key={s.pid} label={s.player?.name||"?"} value={s.kd} max={3} color={parseFloat(s.kd)>=1?"#00ff88":"#ff3366"}/>)}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ─── TIMES ────────────────────────────────────────────────────────────────────
function TeamsPage({teams,users,stats,matches}) {
  const [sel,setSel]=useState(null);
  const getTeam=id=>teams.find(t=>t.id===id);
  const selectedTeam=sel?teams.find(t=>t.id===sel):null;
  if(selectedTeam){
    const players=users.filter(u=>u.team===sel&&u.role==="player");
    const cap=users.find(u=>u.team===sel&&u.role==="captain");
    const tm=matches.filter(m=>m.team1===sel||m.team2===sel);
    const wins=tm.filter(m=>m.champion===sel).length;
    const losses=tm.filter(m=>m.status==="finished"&&m.champion!==sel).length;
    return (
      <div className="page-in">
        <Btn onClick={()=>setSel(null)} variant="secondary" size="sm" style={{marginBottom:"1rem"}}>← VOLTAR</Btn>
        <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1.4rem",flexWrap:"wrap"}}>
          <div style={{width:60,height:60,borderRadius:2,background:`${selectedTeam.color||"#00c8ff"}12`,border:`1px solid ${selectedTeam.color||"#00c8ff"}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",boxShadow:`0 0 20px ${selectedTeam.color||"#00c8ff"}22`}}>{selectedTeam.logo}</div>
          <div>
            <h1 style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1.6rem",color:"#fff",letterSpacing:"0.08em",textShadow:`0 0 20px ${selectedTeam.color||"#00c8ff"}44`}}>{selectedTeam.name}</h1>
            <p style={{color:"#2a6a7a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.72rem",marginTop:3}}>{selectedTeam.desc||"— sem descrição —"}</p>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:"0.7rem",marginBottom:"1.2rem"}}>
          {[{l:"Vitórias",v:wins,c:"#00ff88"},{l:"Derrotas",v:losses,c:"#ff3366"},{l:"Jogadores",v:players.length,c:"#00c8ff"},{l:"Partidas",v:tm.length,c:"#7b2fff"}].map(x=>(
            <Card key={x.l} style={{textAlign:"center",padding:"0.8rem"}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1.8rem",color:x.c,textShadow:`0 0 10px ${x.c}55`}}>{x.v}</div>
              <div style={{color:"#2a6a7a",fontSize:"0.6rem",fontFamily:"'Share Tech Mono',monospace",marginTop:3}}>{x.l}</div>
            </Card>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
          <Card>
            <p style={{margin:"0 0 0.8rem",color:"#00c8ff",fontSize:"0.6rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.1em"}}>&gt; ELENCO</p>
            {cap&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"0.5rem"}}><Avatar initials={cap.avatar} color={selectedTeam.color||"#00c8ff"} size={26}/><span style={{color:"#a0d4e8",fontSize:"0.82rem",flex:1}}>{cap.name}</span><Tag role="captain"/></div>}
            {players.map(p=><div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderTop:"1px solid rgba(0,200,255,0.06)"}}><Avatar initials={p.avatar} color={selectedTeam.color||"#00c8ff"} size={24}/><span style={{color:"#a0d4e8",fontSize:"0.8rem"}}>{p.name}</span></div>)}
            {players.length===0&&<p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.72rem"}}>&gt; SEM JOGADORES</p>}
          </Card>
          <Card>
            <p style={{margin:"0 0 0.8rem",color:"#00c8ff",fontSize:"0.6rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.1em"}}>&gt; HISTÓRICO</p>
            {tm.slice(-5).map(m=>{
              const opp=getTeam(m.team1===sel?m.team2:m.team1);
              const won=m.champion===sel;
              return <div key={m.id} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 0",borderTop:"1px solid rgba(0,200,255,0.06)"}}>
                <span style={{fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.7rem",color:won?"#00ff88":m.status==="scheduled"?"#2a6a7a":"#ff3366",minWidth:16}}>{m.status==="scheduled"?"?":won?"W":"L"}</span>
                <span style={{color:"#2a6a7a",fontSize:"0.75rem",fontFamily:"'Share Tech Mono',monospace"}}>{opp?.logo} {opp?.name}</span>
                {m.score&&<span style={{color:"#2a4a5a",fontSize:"0.7rem",marginLeft:"auto",fontFamily:"'Orbitron',sans-serif"}}>{m.score}</span>}
              </div>;
            })}
            {tm.length===0&&<p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.72rem"}}>&gt; SEM HISTÓRICO</p>}
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="page-in">
      <SectionTitle icon="◉" sub="todos os times do campeonato">Times</SectionTitle>
      {teams.length===0&&<Card><p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.75rem"}}>&gt; NENHUM TIME CADASTRADO</p></Card>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"1rem"}}>
        {teams.map(t=>{
          const players=users.filter(u=>u.team===t.id&&u.role==="player");
          const cap=users.find(u=>u.team===t.id&&u.role==="captain");
          return (
            <Card key={t.id} style={{borderColor:`${t.color||"#00c8ff"}22`,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.8rem"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:42,height:42,borderRadius:2,background:`${t.color||"#00c8ff"}12`,border:`1px solid ${t.color||"#00c8ff"}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem"}}>{t.logo}</div>
                  <div>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.9rem",color:"#fff"}}>{t.name}</div>
                    <div style={{display:"flex",gap:8,marginTop:2}}>
                      <span style={{color:"#00ff88",fontSize:"0.65rem",fontFamily:"'Share Tech Mono',monospace"}}>{t.wins}W</span>
                      <span style={{color:"#ff3366",fontSize:"0.65rem",fontFamily:"'Share Tech Mono',monospace"}}>{t.losses}L</span>
                    </div>
                  </div>
                </div>
              </div>
              {cap&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:"0.5rem"}}><Tag role="captain"/><span style={{color:"#2a6a7a",fontSize:"0.75rem",fontFamily:"'Share Tech Mono',monospace"}}>{cap.name}</span></div>}
              <Divider/>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:"0.7rem"}}>
                {players.slice(0,5).map(p=><Avatar key={p.id} initials={p.avatar} color={t.color||"#00c8ff"} size={22}/>)}
                {players.length===0&&<span style={{color:"#2a4a5a",fontSize:"0.68rem",fontFamily:"'Share Tech Mono',monospace"}}>&gt; SEM JOGADORES</span>}
              </div>
              <Btn onClick={()=>setSel(t.id)} variant="secondary" size="sm" style={{width:"100%"}}>VER PERFIL</Btn>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── CHAVEAMENTO ──────────────────────────────────────────────────────────────
function BracketPage({teams,bracket}) {
  const getTeam=id=>teams.find(t=>t.id===id);
  return (
    <div className="page-in">
      <SectionTitle icon="◆" sub={bracket.name}>Chaveamento</SectionTitle>
      <div style={{overflowX:"auto",paddingBottom:"1rem"}}>
        <div style={{display:"flex",gap:"1.5rem",minWidth:"fit-content",alignItems:"flex-start"}}>
          {bracket.rounds.map((round,ri)=>(
            <div key={ri} style={{display:"flex",flexDirection:"column",gap:"1.5rem",minWidth:200}}>
              <div style={{color:"#00c8ff",fontSize:"0.6rem",fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:"0.12em",marginBottom:4,textShadow:"0 0 10px rgba(0,200,255,0.5)"}}>{round.name.toUpperCase()}</div>
              {round.matches.map(m=>{
                const mt1=getTeam(m.t1),mt2=getTeam(m.t2);
                return (
                  <div key={m.id} style={{border:"1px solid rgba(0,200,255,0.12)",borderRadius:2,overflow:"hidden",background:"rgba(0,10,20,0.8)"}}>
                    {[[mt1,m.t1],[mt2,m.t2]].map(([t,tid],si)=>(
                      <div key={si} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 12px",background:m.winner===tid?"rgba(0,200,255,0.08)":"transparent",borderBottom:si===0?"1px solid rgba(0,200,255,0.08)":"none"}}>
                        <span style={{fontSize:"1.1rem"}}>{t?.logo||"?"}</span>
                        <span style={{flex:1,color:m.winner===tid?"#00c8ff":"#2a4a5a",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.72rem"}}>{t?.name||"A DEFINIR"}</span>
                        {m.winner===tid&&<span style={{color:"#00c8ff",fontSize:"0.65rem",fontFamily:"'Share Tech Mono',monospace"}}>WIN</span>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div style={{marginTop:"1.5rem"}}>
        <p style={{color:"#2a6a7a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.68rem",letterSpacing:"0.1em",marginBottom:"0.8rem"}}>&gt; CLASSIFICAÇÃO GERAL</p>
        {teams.length===0&&<Card><p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.75rem"}}>&gt; NENHUM TIME CADASTRADO</p></Card>}
        {teams.length>0&&(
          <Card style={{padding:0,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{background:"rgba(0,200,255,0.04)",borderBottom:"1px solid rgba(0,200,255,0.1)"}}>
                {["POS","TIME","V","D","PTS"].map(h=><th key={h} style={{padding:"9px 13px",textAlign:"left",color:"#00c8ff",fontSize:"0.6rem",fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:"0.1em"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[...teams].sort((a,b)=>(b.wins*3-b.losses)-(a.wins*3-a.losses)).map((t,i)=>(
                  <tr key={t.id} style={{borderBottom:"1px solid rgba(0,200,255,0.04)"}}>
                    <td style={{padding:"9px 13px",color:i===0?"#ffc800":i===1?"#a0a0b0":i===2?"#cd7f32":"#2a4a5a",fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"0.75rem"}}>0{i+1}</td>
                    <td style={{padding:"9px 13px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:"1rem"}}>{t.logo}</span>
                        <span style={{color:"#a0d4e8",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.78rem"}}>{t.name}</span>
                      </div>
                    </td>
                    <td style={{padding:"9px 13px",color:"#00ff88",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.78rem"}}>{t.wins}</td>
                    <td style={{padding:"9px 13px",color:"#ff3366",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.78rem"}}>{t.losses}</td>
                    <td style={{padding:"9px 13px",color:"#00c8ff",fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"0.82rem"}}>{t.wins*3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── MERCADO ──────────────────────────────────────────────────────────────────
function MarketPage({user,users,teams,setUsers,setUser,showToast,isCaptain,isHolder}) {
  const free=users.filter(u=>u.role==="player"&&u.available&&!u.team);
  const myTeam=teams.find(t=>t.id===user.team);
  return (
    <div className="page-in">
      <SectionTitle icon="◈" sub="jogadores disponíveis para contratação">Mercado</SectionTitle>
      {free.length===0
        ?<Card><p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.75rem"}}>&gt; NENHUM JOGADOR NO MERCADO</p></Card>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:"0.9rem"}}>
          {free.map(p=>(
            <Card key={p.id}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"0.7rem"}}>
                <Avatar initials={p.avatar} color="#7b2fff" size={38}/>
                <div>
                  <div style={{color:"#fff",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.8rem"}}>{p.name}</div>
                  <Tag role="player"/>
                </div>
              </div>
              <div style={{display:"flex",gap:5,marginBottom:"0.7rem",flexWrap:"wrap"}}>
                <Pill color="#00ff88">LIVRE</Pill>
              </div>
              {(isCaptain||isHolder)&&(
                <Btn onClick={()=>{setUsers(prev=>prev.map(u=>u.id===p.id?{...u,team:user.team||1,available:false}:u));showToast(`${p.name} contratado!`);}} variant="green" size="sm" style={{width:"100%"}}>
                  + CONTRATAR
                </Btn>
              )}
            </Card>
          ))}
        </div>
      }
    </div>
  );
}

// ─── NOTÍCIAS ─────────────────────────────────────────────────────────────────
function NewsPage({news,users,setNews}) {
  const [votes,setVotes]=useState({});
  const getUser=id=>users.find(u=>u.id===id);
  return (
    <div className="page-in">
      <SectionTitle icon="▣" sub="notícias, análises e enquetes">Notícias</SectionTitle>
      {news.length===0&&<Card><p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.75rem"}}>&gt; NENHUMA NOTÍCIA PUBLICADA</p></Card>}
      {[...news].sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0)).map(n=>{
        const author=getUser(n.authorId);
        if(n.type==="poll"){
          const total=Object.values(n.votes||{}).reduce((a,b)=>a+b,0);
          const myVote=votes[n.id];
          const winner=total>0?Object.entries(n.votes||{}).sort((a,b)=>b[1]-a[1])[0][0]:null;
          return (
            <Card key={n.id} style={{marginBottom:"1rem",borderColor:"rgba(123,47,255,0.2)"}}>
              <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:"0.7rem",flexWrap:"wrap"}}>
                <Pill color="#7b2fff">▣ ENQUETE</Pill>
                <span style={{color:"#2a6a7a",fontSize:"0.65rem",fontFamily:"'Share Tech Mono',monospace"}}>{n.date}</span>
                <span style={{color:"#2a6a7a",fontSize:"0.65rem",fontFamily:"'Share Tech Mono',monospace",marginLeft:"auto"}}>{author?.name}</span>
              </div>
              <h3 style={{fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.9rem",color:"#fff",marginBottom:"1rem",letterSpacing:"0.05em"}}>{n.title}</h3>
              {n.options.map(opt=>{
                const cnt=(n.votes||{})[opt]||0;
                const pct=total>0?Math.round(cnt/total*100):0;
                const isMyPick=myVote===opt;
                return (
                  <div key={opt} onClick={()=>{if(!myVote){setVotes(p=>({...p,[n.id]:opt}));setNews(p=>p.map(x=>x.id===n.id?{...x,votes:{...x.votes,[opt]:(x.votes[opt]||0)+1}}:x));}}}
                    style={{cursor:myVote?"default":"pointer",marginBottom:7,padding:"8px 12px",border:`1px solid ${isMyPick?"rgba(123,47,255,0.5)":"rgba(0,200,255,0.08)"}`,borderRadius:2,background:isMyPick?"rgba(123,47,255,0.08)":"rgba(0,10,20,0.5)",position:"relative",overflow:"hidden",transition:"all .15s"}}>
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${pct}%`,background:"rgba(123,47,255,0.1)",transition:"width .5s"}}/>
                    <div style={{position:"relative",display:"flex",justifyContent:"space-between"}}>
                      <span style={{color:isMyPick?"#7b2fff":"#a0d4e8",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:isMyPick?700:400}}>{opt}{opt===winner&&myVote?" ◆":""}</span>
                      <span style={{color:"#2a6a7a",fontSize:"0.68rem",fontFamily:"'Orbitron',sans-serif"}}>{myVote?`${pct}%`:""}</span>
                    </div>
                  </div>
                );
              })}
              <p style={{margin:"0.5rem 0 0",color:"#2a4a5a",fontSize:"0.65rem",fontFamily:"'Share Tech Mono',monospace"}}>&gt; {total} votos {!myVote&&"— selecione para votar"}</p>
            </Card>
          );
        }
        return (
          <Card key={n.id} style={{marginBottom:"0.9rem",borderColor:n.pinned?"rgba(0,200,255,0.25)":"rgba(0,200,255,0.08)"}}>
            {n.pinned&&<div style={{marginBottom:"0.5rem"}}><Pill color="#00c8ff">◈ DESTAQUE</Pill></div>}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"0.6rem"}}>
              <Avatar initials={author?.avatar||"??"} color="#00ffcc" size={24}/>
              <span style={{color:"#2a6a7a",fontSize:"0.68rem",fontFamily:"'Share Tech Mono',monospace"}}>{author?.name} // {n.date}</span>
            </div>
            <h3 style={{fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.9rem",color:"#fff",marginBottom:"0.5rem",letterSpacing:"0.05em"}}>{n.title}</h3>
            <p style={{color:"#4a8a9a",fontSize:"0.82rem",lineHeight:1.65,fontFamily:"'Rajdhani',sans-serif"}}>{n.content}</p>
          </Card>
        );
      })}
    </div>
  );
}

// ─── PAINEL JORNALISTA ────────────────────────────────────────────────────────
function JournalistPanel({user,users,stats,setStats,news,setNews,showToast}) {
  const [tab,setTab]=useState("news");
  const [nTitle,setNTitle]=useState("");
  const [nContent,setNContent]=useState("");
  const [nPin,setNPin]=useState(false);
  const [pTitle,setPTitle]=useState("");
  const [pOpts,setPOpts]=useState("");
  const [selPid,setSelPid]=useState("");
  const [kills,setKills]=useState("");
  const [deaths,setDeaths]=useState("");
  const [assists,setAssists]=useState("");
  const [hs,setHs]=useState("");
  const [maps,setMaps]=useState("");
  const [mvps,setMvps]=useState("");
  return (
    <div className="page-in">
      <SectionTitle icon="▣" sub="publicar notícias, enquetes e registrar estatísticas">Painel Jornalista</SectionTitle>
      <TabBar tabs={[["news","Notícia"],["poll","Enquete"],["stats","Stats"],["history","Histórico"]]} active={tab} onChange={setTab}/>
      {tab==="news"&&(
        <Card>
          <p style={{margin:"0 0 0.9rem",color:"#00c8ff",fontSize:"0.6rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.1em"}}>&gt; PUBLICAR NOTÍCIA</p>
          <Input placeholder="Título" value={nTitle} onChange={e=>setNTitle(e.target.value)} style={{marginBottom:"0.6rem"}}/>
          <Textarea placeholder="Conteúdo da notícia..." value={nContent} onChange={e=>setNContent(e.target.value)} rows={5}/>
          <div style={{display:"flex",alignItems:"center",gap:8,margin:"0.7rem 0"}}>
            <input type="checkbox" checked={nPin} onChange={e=>setNPin(e.target.checked)} id="pin" style={{accentColor:"#00c8ff"}}/>
            <label htmlFor="pin" style={{color:"#2a6a7a",fontSize:"0.75rem",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace"}}>◈ Fixar como destaque</label>
          </div>
          <Btn onClick={()=>{if(!nTitle.trim()||!nContent.trim())return showToast("Preencha todos os campos","error");setNews(p=>[{id:Date.now(),authorId:user.id,title:nTitle,content:nContent,date:new Date().toISOString().split("T")[0],type:"news",pinned:nPin},...p]);setNTitle("");setNContent("");setNPin(false);showToast("Notícia publicada!");}}>PUBLICAR</Btn>
        </Card>
      )}
      {tab==="poll"&&(
        <Card>
          <p style={{margin:"0 0 0.9rem",color:"#00c8ff",fontSize:"0.6rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.1em"}}>&gt; CRIAR ENQUETE</p>
          <Input placeholder="Pergunta da enquete" value={pTitle} onChange={e=>setPTitle(e.target.value)} style={{marginBottom:"0.6rem"}}/>
          <Input placeholder="Opções separadas por vírgula (mín. 2)" value={pOpts} onChange={e=>setPOpts(e.target.value)} style={{marginBottom:"0.8rem"}}/>
          {pOpts&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:"0.8rem"}}>{pOpts.split(",").filter(o=>o.trim()).map(o=><Pill key={o} color="#7b2fff">{o.trim()}</Pill>)}</div>}
          <Btn onClick={()=>{const opts=pOpts.split(",").map(o=>o.trim()).filter(Boolean);if(!pTitle.trim()||opts.length<2)return showToast("Preencha a pergunta e ao menos 2 opções","error");setNews(p=>[{id:Date.now(),authorId:user.id,title:pTitle,content:"",date:new Date().toISOString().split("T")[0],type:"poll",options:opts,votes:{},pinned:false},...p]);setPTitle("");setPOpts("");showToast("Enquete criada!");}}>CRIAR ENQUETE</Btn>
        </Card>
      )}
      {tab==="stats"&&(
        <Card>
          <p style={{margin:"0 0 0.9rem",color:"#00c8ff",fontSize:"0.6rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.1em"}}>&gt; REGISTRAR ESTATÍSTICAS</p>
          <Select value={selPid} onChange={e=>setSelPid(e.target.value)} style={{marginBottom:"0.8rem"}}>
            <option value="">Selecionar jogador...</option>
            {users.filter(u=>u.role==="player").map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
          </Select>
          {users.filter(u=>u.role==="player").length===0&&<p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.72rem",marginBottom:"0.8rem"}}>&gt; NENHUM JOGADOR CADASTRADO</p>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.6rem",marginBottom:"0.8rem"}}>
            {[["KILLS",kills,setKills],["DEATHS",deaths,setDeaths],["ASSISTS",assists,setAssists],["HEADSHOTS",hs,setHs],["MAPAS",maps,setMaps],["MVPs",mvps,setMvps]].map(([l,v,s])=>(
              <div key={l}><label style={{color:"#2a6a7a",fontSize:"0.58rem",display:"block",marginBottom:3,fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.08em"}}>{l}</label><Input placeholder="0" value={v} onChange={e=>s(e.target.value)}/></div>
            ))}
          </div>
          <Btn onClick={()=>{if(!selPid)return showToast("Selecione um jogador","error");const pid=Number(selPid),k=Number(kills)||0,d=Number(deaths)||0,a=Number(assists)||0,h=Number(hs)||0,m=Number(maps)||1,mv=Number(mvps)||0;setStats(prev=>{const ex=prev.find(s=>s.pid===pid);if(ex)return prev.map(s=>s.pid===pid?{...s,kills:s.kills+k,deaths:s.deaths+d,assists:s.assists+a,hs:s.hs+h,maps:s.maps+m,mvps:s.mvps+mv}:s);return [...prev,{pid,kills:k,deaths:d,assists:a,hs:h,maps:m,mvps:mv}];});setSelPid("");setKills("");setDeaths("");setAssists("");setHs("");setMaps("");setMvps("");showToast("Estatísticas registradas!");}}>REGISTRAR</Btn>
        </Card>
      )}
      {tab==="history"&&(
        <div>
          {news.filter(n=>n.authorId===user.id).length===0&&<Card><p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.75rem"}}>&gt; NENHUMA PUBLICAÇÃO</p></Card>}
          {news.filter(n=>n.authorId===user.id).map(n=>(
            <Card key={n.id} style={{marginBottom:"0.6rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <Pill color={n.type==="poll"?"#7b2fff":"#00ffcc"}>{n.type==="poll"?"▣ ENQUETE":"▣ NOTÍCIA"}</Pill>
                <span style={{color:"#a0d4e8",fontSize:"0.8rem",flex:1,fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{n.title}</span>
                <span style={{color:"#2a6a7a",fontSize:"0.65rem",fontFamily:"'Share Tech Mono',monospace"}}>{n.date}</span>
                <Btn onClick={()=>{setNews(p=>p.filter(x=>x.id!==n.id));showToast("Removido.");}} variant="danger" size="sm">✕</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function AdminPanel({user,users,setUsers,teams,setTeams,matches,setMatches,showToast,setPbMatch,isHolder,isCaptain}) {
  const [tab,setTab]=useState(isHolder?"matches":"myteam");
  const myTeam=teams.find(t=>t.id===user.team);
  const [t1,setT1]=useState("");
  const [t2,setT2]=useState("");
  const [mDate,setMDate]=useState("");
  const [newTName,setNewTName]=useState("");
  const [newTLogo,setNewTLogo]=useState("");
  const [newTColor,setNewTColor]=useState("#00c8ff");
  const [editName,setEditName]=useState("");
  const [editLogo,setEditLogo]=useState("");
  const [selScore,setSelScore]=useState({});
  const getTeam=id=>teams.find(t=>t.id===id);
  const tabs=[];
  if(isHolder)tabs.push(["matches","Partidas"],["teams_mgr","Times"],["users_mgr","Usuários"]);
  if(isCaptain||isHolder)tabs.push(["myteam","Meu Time"]);
  return (
    <div className="page-in">
      <SectionTitle icon="◉" sub={isHolder?"gerenciamento completo":"gerenciar seu time"}>Gerenciamento</SectionTitle>
      <TabBar tabs={tabs} active={tab} onChange={setTab}/>
      {tab==="matches"&&isHolder&&(
        <div>
          <Card style={{marginBottom:"1rem"}}>
            <p style={{margin:"0 0 0.9rem",color:"#00c8ff",fontSize:"0.6rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.1em"}}>&gt; AGENDAR PARTIDA</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem",marginBottom:"0.6rem"}}>
              <Select value={t1} onChange={e=>setT1(e.target.value)}><option value="">Time 1...</option>{teams.map(t=><option key={t.id} value={t.id}>{t.logo} {t.name}</option>)}</Select>
              <Select value={t2} onChange={e=>setT2(e.target.value)}><option value="">Time 2...</option>{teams.map(t=><option key={t.id} value={t.id}>{t.logo} {t.name}</option>)}</Select>
            </div>
            <Input placeholder="Data (ex: 2025-07-10)" value={mDate} onChange={e=>setMDate(e.target.value)} style={{marginBottom:"0.8rem"}}/>
            <Btn onClick={()=>{if(!t1||!t2||t1===t2)return showToast("Selecione dois times diferentes","error");setMatches(p=>[...p,{id:Date.now(),team1:Number(t1),team2:Number(t2),status:"scheduled",score:null,maps:[],champion:null,date:mDate||"TBD",pbActions:[]}]);setT1("");setT2("");setMDate("");showToast("Partida agendada!");}}>AGENDAR</Btn>
          </Card>
          <Card style={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"0.9rem 1.1rem",borderBottom:"1px solid rgba(0,200,255,0.08)"}}><p style={{margin:0,color:"#00c8ff",fontSize:"0.6rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.1em"}}>&gt; GERENCIAR PARTIDAS</p></div>
            {matches.length===0&&<div style={{padding:"1rem"}}><p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.72rem"}}>&gt; NENHUMA PARTIDA</p></div>}
            {matches.map(m=>{
              const mt1=getTeam(m.team1),mt2=getTeam(m.team2);
              const sc=selScore[m.id]||"";
              return (
                <div key={m.id} style={{padding:"0.8rem 1.1rem",borderBottom:"1px solid rgba(0,200,255,0.04)",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{color:"#a0d4e8",fontSize:"0.78rem",flex:1,minWidth:120,fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{mt1?.logo}{mt1?.name} <span style={{color:"#2a6a7a"}}>VS</span> {mt2?.logo}{mt2?.name}</span>
                  <Pill color={m.status==="live"?"#ff3366":m.status==="finished"?"#00ff88":"#2a6a7a"}>{m.status==="live"?"● AO VIVO":m.status==="finished"?"✓ ENCERRADO":"○ AGENDADO"}</Pill>
                  {m.status==="scheduled"&&<Btn onClick={()=>{setMatches(p=>p.map(x=>x.id===m.id?{...x,status:"live"}:x));showToast("Partida iniciada!");}} variant="green" size="sm">INICIAR</Btn>}
                  {m.status==="live"&&<>
                    <Input placeholder="2-1" value={sc} onChange={e=>setSelScore(p=>({...p,[m.id]:e.target.value}))} style={{width:60,padding:"4px 7px",fontSize:"0.75rem"}}/>
                    <Select value={m.champion||""} onChange={e=>setMatches(p=>p.map(x=>x.id===m.id?{...x,champion:Number(e.target.value)}:x))} style={{width:130,padding:"4px 7px",fontSize:"0.75rem"}}>
                      <option value="">Vencedor...</option>
                      <option value={m.team1}>{mt1?.name}</option>
                      <option value={m.team2}>{mt2?.name}</option>
                    </Select>
                    <Btn onClick={()=>{if(!m.champion)return showToast("Selecione o vencedor","error");setMatches(p=>p.map(x=>x.id===m.id?{...x,status:"finished",score:sc||"2-1"}:x));setTeams(p=>p.map(t=>t.id===m.champion?{...t,wins:t.wins+1}:t.id===m.team1||t.id===m.team2?{...t,losses:t.losses+1}:t));showToast("Partida encerrada!");}} variant="danger" size="sm">ENCERRAR</Btn>
                    <Btn onClick={()=>setPbMatch(m)} size="sm">P&B</Btn>
                  </>}
                  {m.status==="finished"&&<Btn onClick={()=>{setMatches(p=>p.filter(x=>x.id!==m.id));showToast("Removido.");}} variant="secondary" size="sm">✕</Btn>}
                </div>
              );
            })}
          </Card>
        </div>
      )}
      {tab==="teams_mgr"&&isHolder&&(
        <div>
          <Card style={{marginBottom:"1rem"}}>
            <p style={{margin:"0 0 0.9rem",color:"#00c8ff",fontSize:"0.6rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.1em"}}>&gt; CRIAR TIME</p>
            <Input placeholder="Nome do time" value={newTName} onChange={e=>setNewTName(e.target.value)} style={{marginBottom:"0.6rem"}}/>
            <div style={{display:"flex",gap:"0.6rem",marginBottom:"0.8rem",alignItems:"center"}}>
              <Input placeholder="Logo (emoji ex: 🐆)" value={newTLogo} onChange={e=>setNewTLogo(e.target.value)}/>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <label style={{color:"#2a6a7a",fontSize:"0.58rem",fontFamily:"'Orbitron',sans-serif"}}>COR</label>
                <input type="color" value={newTColor} onChange={e=>setNewTColor(e.target.value)} style={{width:44,height:36,border:"1px solid rgba(0,200,255,0.2)",background:"transparent",cursor:"pointer",borderRadius:2}}/>
              </div>
            </div>
            <Btn onClick={()=>{if(!newTName.trim())return;setTeams(p=>[...p,{id:Date.now(),name:newTName,logo:newTLogo||"🛡",color:newTColor,wins:0,losses:0,desc:""}]);setNewTName("");setNewTLogo("");setNewTColor("#00c8ff");showToast("Time criado!");}}>CRIAR TIME</Btn>
          </Card>
          <Card>
            {teams.length===0&&<p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.72rem"}}>&gt; NENHUM TIME</p>}
            {teams.map(t=>(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(0,200,255,0.04)"}}>
                <span style={{fontSize:"1.2rem"}}>{t.logo}</span>
                <span style={{color:"#a0d4e8",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.78rem",flex:1}}>{t.name}</span>
                <span style={{color:"#00ff88",fontSize:"0.68rem",fontFamily:"'Share Tech Mono',monospace"}}>{t.wins}W</span>
                <span style={{color:"#ff3366",fontSize:"0.68rem",fontFamily:"'Share Tech Mono',monospace"}}>{t.losses}L</span>
                <Btn onClick={()=>{setTeams(p=>p.filter(x=>x.id!==t.id));showToast("Time removido.");}} variant="danger" size="sm">✕</Btn>
              </div>
            ))}
          </Card>
        </div>
      )}
      {tab==="users_mgr"&&isHolder&&(
        <Card>
          <p style={{margin:"0 0 0.9rem",color:"#00c8ff",fontSize:"0.6rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.1em"}}>&gt; TODOS OS USUÁRIOS</p>
          {users.map(u=>{
            const ut=teams.find(t=>t.id===u.team);
            return (
              <div key={u.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid rgba(0,200,255,0.04)",flexWrap:"wrap"}}>
                <Avatar initials={u.avatar} color={ut?.color||"#2a6a7a"} size={24}/>
                <span style={{flex:1,color:"#a0d4e8",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:600,minWidth:80}}>{u.name}</span>
                <Tag role={u.role}/>
                {ut&&<span style={{color:ut.color,fontSize:"0.68rem",fontFamily:"'Share Tech Mono',monospace"}}>{ut.logo} {ut.name}</span>}
                <Select value={u.role} onChange={e=>{setUsers(p=>p.map(x=>x.id===u.id?{...x,role:e.target.value}:x));showToast("Cargo alterado!");}} style={{width:110,padding:"3px 7px",fontSize:"0.7rem"}}>
                  {Object.entries(ROLE_CFG).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
                </Select>
              </div>
            );
          })}
        </Card>
      )}
      {tab==="myteam"&&(
        <div>
          {(isCaptain?[myTeam]:teams).filter(Boolean).map(t=>{
            const tPlayers=users.filter(u=>u.team===t.id&&u.role==="player");
            return (
              <Card key={t.id} style={{marginBottom:"1rem",borderColor:`${t.color||"#00c8ff"}22`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"1rem"}}>
                  <span style={{fontSize:"1.8rem"}}>{t.logo}</span>
                  <span style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1rem",color:"#fff"}}>{t.name}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem",marginBottom:"0.8rem"}}>
                  <Input placeholder="Novo nome" defaultValue={t.name} onChange={e=>setEditName(e.target.value)}/>
                  <Input placeholder="Novo logo (emoji)" defaultValue={t.logo} onChange={e=>setEditLogo(e.target.value)}/>
                </div>
                <Btn onClick={()=>{setTeams(p=>p.map(x=>x.id===t.id?{...x,name:editName||x.name,logo:editLogo||x.logo}:x));showToast("Time atualizado!");}} size="sm" style={{marginBottom:"1rem"}}>SALVAR</Btn>
                <Divider/>
                <p style={{margin:"0 0 0.6rem",color:"#00c8ff",fontSize:"0.6rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.1em"}}>&gt; JOGADORES ({tPlayers.length})</p>
                {tPlayers.length===0&&<p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.72rem"}}>&gt; SEM JOGADORES</p>}
                {tPlayers.map(p=>(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid rgba(0,200,255,0.04)"}}>
                    <Avatar initials={p.avatar} color={t.color||"#00c8ff"} size={24}/>
                    <span style={{color:"#a0d4e8",fontSize:"0.8rem",flex:1}}>{p.name}</span>
                    <Btn onClick={()=>{setUsers(prev=>prev.map(u=>u.id===p.id?{...u,team:null,available:true}:u));showToast(`${p.name} dispensado.`);}} variant="secondary" size="sm">DISPENSAR</Btn>
                  </div>
                ))}
              </Card>
            );
          })}
          {(isCaptain?[myTeam]:teams).filter(Boolean).length===0&&<Card><p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.72rem"}}>&gt; NENHUM TIME PARA GERENCIAR</p></Card>}
        </div>
      )}
    </div>
  );
}

// ─── PERFIL ───────────────────────────────────────────────────────────────────
function ProfilePage({user,users,teams,stats,setUser}) {
  const myTeam=teams.find(t=>t.id===user.team);
  const myStats=stats.find(s=>s.pid===user.id);
  return (
    <div className="page-in">
      <SectionTitle icon="◈" sub="informações e estatísticas">Perfil</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"1rem"}}>
        <Card glow>
          <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1.3rem"}}>
            <Avatar initials={user.avatar} color={myTeam?.color||"#00c8ff"} size={56}/>
            <div>
              <h2 style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1.3rem",color:"#fff",letterSpacing:"0.06em",textShadow:"0 0 20px rgba(0,200,255,0.3)"}}>{user.name}</h2>
              <div style={{marginTop:5}}><Tag role={user.role}/></div>
              {myTeam&&<div style={{marginTop:6,color:myTeam.color,fontSize:"0.75rem",fontFamily:"'Share Tech Mono',monospace"}}>{myTeam.logo} {myTeam.name}</div>}
            </div>
          </div>
          <Divider/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.7rem",marginBottom:"1.2rem"}}>
            {[{l:"CARGO",v:ROLE_CFG[user.role]?.label},{l:"TIME",v:myTeam?.name||"SEM TIME"},{l:"MEMBRO DESDE",v:user.joined},{l:"STATUS",v:user.available?"DISPONÍVEL":"EM TIME"}].map(x=>(
              <div key={x.l}>
                <div style={{color:"#2a6a7a",fontSize:"0.58rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.1em",marginBottom:3}}>{x.l}</div>
                <div style={{color:"#a0d4e8",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{x.v}</div>
              </div>
            ))}
          </div>
          <Btn onClick={()=>setUser(null)} variant="danger" size="sm">✕ SAIR DO SISTEMA</Btn>
        </Card>
        {user.role==="player"&&(
          <Card>
            <p style={{margin:"0 0 0.9rem",color:"#00c8ff",fontSize:"0.6rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.1em"}}>&gt; ESTATÍSTICAS</p>
            {!myStats
              ?<p style={{color:"#2a4a5a",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.75rem"}}>&gt; SEM ESTATÍSTICAS</p>
              :(()=>{
                const kd=myStats.deaths>0?(myStats.kills/myStats.deaths).toFixed(2):myStats.kills;
                const hsp=myStats.kills>0?Math.round(myStats.hs/myStats.kills*100):0;
                return (
                  <div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.7rem",marginBottom:"1rem"}}>
                      {[{l:"KILLS",v:myStats.kills,c:"#00c8ff"},{l:"K/D",v:kd,c:parseFloat(kd)>=1?"#00ff88":"#ff3366"},{l:"HS%",v:hsp+"%",c:"#ffc800"},{l:"ASSISTS",v:myStats.assists,c:"#7b2fff"},{l:"MAPAS",v:myStats.maps,c:"#2a6a7a"},{l:"MVPs",v:myStats.mvps,c:"#00ffcc"}].map(x=>(
                        <div key={x.l} style={{textAlign:"center",background:"rgba(0,200,255,0.03)",border:"1px solid rgba(0,200,255,0.08)",borderRadius:2,padding:"0.7rem"}}>
                          <div style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1.4rem",color:x.c,textShadow:`0 0 10px ${x.c}55`,lineHeight:1}}>{x.v}</div>
                          <div style={{color:"#2a6a7a",fontSize:"0.55rem",fontFamily:"'Orbitron',sans-serif",marginTop:3,letterSpacing:"0.08em"}}>{x.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            }
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  const [users,  setUsers]  = useState(INIT_USERS);
  const [teams,  setTeams]  = useState(INIT_TEAMS);
  const [matches,setMatches]= useState(INIT_MATCHES);
  const [stats,  setStats]  = useState(INIT_STATS);
  const [news,   setNews]   = useState(INIT_NEWS);
  const [bracket]           = useState(INIT_BRACKET);
  const [user,   setUser]   = useState(null);
  const [page,   setPage]   = useState("home");
  const [pbMatch,setPbMatch]= useState(null);
  const [toast,  setToast]  = useState(null);

  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),3000);};

  if(!user) return (<><G/><Login users={users} onLogin={u=>{setUser(u);setPage("home");}}/></>);

  const isHolder     = user.role==="holder";
  const isCaptain    = user.role==="captain";
  const isJournalist = user.role==="journalist";
  const myTeam       = teams.find(t=>t.id===user.team);
  const liveCnt      = matches.filter(m=>m.status==="live").length;

  const NAV=[
    {key:"home",   label:"Início",    icon:"⌂"},
    {key:"live",   label:"Ao Vivo",   icon:"●"},
    {key:"stats",  label:"Stats",     icon:"◈"},
    {key:"teams",  label:"Times",     icon:"◉"},
    {key:"bracket",label:"Chaveamento",icon:"◆"},
    {key:"market", label:"Mercado",   icon:"◧"},
    {key:"news",   label:"Notícias",  icon:"▣"},
    ...(isJournalist?[{key:"journalist_panel",label:"Painel",icon:"✎"}]:[]),
    ...((isHolder||isCaptain)?[{key:"admin",label:"Gerenciar",icon:"⚙"}]:[]),
    {key:"profile",label:"Perfil",    icon:"◈"},
  ];

  const sharedProps={user,users,setUsers,teams,setTeams,matches,setMatches,stats,setStats,news,setNews,isHolder,isCaptain,isJournalist,myTeam,setPbMatch,showToast};

  const renderPage=()=>{
    switch(page){
      case "home":    return <HomePage {...sharedProps}/>;
      case "live":    return <LivePage {...sharedProps}/>;
      case "stats":   return <StatsPage {...sharedProps}/>;
      case "teams":   return <TeamsPage {...sharedProps}/>;
      case "bracket": return <BracketPage teams={teams} bracket={bracket}/>;
      case "market":  return <MarketPage {...sharedProps}/>;
      case "news":    return <NewsPage news={news} users={users} setNews={setNews}/>;
      case "journalist_panel": return <JournalistPanel user={user} users={users} stats={stats} setStats={setStats} news={news} setNews={setNews} showToast={showToast}/>;
      case "admin":   return <AdminPanel {...sharedProps}/>;
      case "profile": return <ProfilePage user={user} users={users} teams={teams} stats={stats} setUser={setUser}/>;
      default:        return <HomePage {...sharedProps}/>;
    }
  };

  return (
    <>
      <G/>
      {/* Background grid */}
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(0,200,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.02) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",top:"10%",left:"5%",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,200,255,0.04),transparent)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:"10%",right:"5%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(123,47,255,0.04),transparent)",pointerEvents:"none",zIndex:0}}/>

      {/* Toast */}
      {toast&&(
        <div style={{position:"fixed",top:16,right:16,zIndex:99998,background:toast.type==="success"?"rgba(0,15,25,0.97)":"rgba(0,15,25,0.97)",color:toast.type==="success"?"#00ff88":"#ff3366",padding:"10px 17px",border:`1px solid ${toast.type==="success"?"rgba(0,255,136,0.3)":"rgba(255,51,102,0.3)"}`,borderRadius:2,fontFamily:"'Share Tech Mono',monospace",fontWeight:700,fontSize:"0.8rem",boxShadow:`0 0 20px ${toast.type==="success"?"rgba(0,255,136,0.15)":"rgba(255,51,102,0.15)"}`,animation:"toastIn .2s ease",display:"flex",alignItems:"center",gap:8}}>
          {toast.type==="success"?"✓":":"} {toast.msg}
        </div>
      )}

      {/* Pick & Ban */}
      {pbMatch&&(
        <PickBanModal match={pbMatch} teams={teams}
          canControl={isHolder||(isCaptain&&(pbMatch.team1===user.team||pbMatch.team2===user.team))}
          onClose={()=>setPbMatch(null)}
          onFinish={(mid,maps,actions)=>{setMatches(p=>p.map(m=>m.id===mid?{...m,maps,pbActions:actions}:m));setPbMatch(null);showToast("Pick & Ban concluído!");}}
        />
      )}

      <div style={{display:"flex",minHeight:"100vh",position:"relative",zIndex:1}}>
        {/* Sidebar */}
        <nav style={{width:190,background:"rgba(0,8,15,0.95)",borderRight:"1px solid rgba(0,200,255,0.08)",display:"flex",flexDirection:"column",padding:"1.1rem 0.6rem",flexShrink:0,position:"sticky",top:0,height:"100vh",overflowY:"auto",backdropFilter:"blur(20px)"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,#00c8ff,transparent)"}}/>
          <div style={{padding:"0 0.4rem",marginBottom:"1.6rem"}}>
            <div style={{width:34,height:34,borderRadius:2,background:"rgba(0,200,255,0.08)",border:"1px solid rgba(0,200,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",marginBottom:"0.6rem",boxShadow:"0 0 15px rgba(0,200,255,0.1)"}}>🎯</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"0.82rem",color:"#00c8ff",letterSpacing:"0.08em",lineHeight:1.2,textShadow:"0 0 10px rgba(0,200,255,0.5)"}}>VÁRZEA CS2</div>
            <div style={{fontSize:"0.5rem",color:"rgba(0,200,255,0.3)",letterSpacing:"0.12em",marginTop:2,fontFamily:"'Share Tech Mono',monospace"}}>CHAMPIONSHIP SYS</div>
          </div>
          <div style={{flex:1}}>
            {NAV.map(n=>(
              <button key={n.key} onClick={()=>setPage(n.key)}
                style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"8px 10px",borderRadius:2,border:"none",background:page===n.key?"rgba(0,200,255,0.08)":"transparent",color:page===n.key?"#00c8ff":"#2a5a6a",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:"0.65rem",letterSpacing:"0.06em",marginBottom:2,transition:"all .12s",textAlign:"left",position:"relative",boxShadow:page===n.key?"0 0 10px rgba(0,200,255,0.08)":"none"}}>
                {page===n.key&&<div style={{position:"absolute",left:0,top:"15%",bottom:"15%",width:2,background:"#00c8ff",boxShadow:"0 0 6px #00c8ff"}}/>}
                <span style={{fontSize:"0.8rem",flexShrink:0}}>{n.icon}</span>
                {n.label}
                {n.key==="live"&&liveCnt>0&&<span style={{marginLeft:"auto",background:"#ff3366",color:"#fff",fontSize:"0.55rem",fontFamily:"'Orbitron',sans-serif",fontWeight:900,width:16,height:16,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 6px #ff3366"}}>{liveCnt}</span>}
              </button>
            ))}
          </div>
          <div style={{borderTop:"1px solid rgba(0,200,255,0.08)",paddingTop:"0.8rem",marginTop:"0.5rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 0.4rem"}}>
              <Avatar initials={user.avatar} color={myTeam?.color||"#00c8ff"} size={28}/>
              <div style={{overflow:"hidden"}}>
                <div style={{color:"#a0d4e8",fontSize:"0.72rem",fontFamily:"'Orbitron',sans-serif",fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div>
                <Tag role={user.role}/>
              </div>
            </div>
          </div>
        </nav>

        {/* Main */}
        <main style={{flex:1,padding:"1.6rem",overflowY:"auto",maxWidth:"calc(100vw - 190px)",minWidth:0}}>
          {renderPage()}
        </main>
      </div>
    </>
  );
}
