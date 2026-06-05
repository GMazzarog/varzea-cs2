import { useState, useEffect } from "react";

// ─── FONTE & ESTILOS GLOBAIS ──────────────────────────────────────────────────
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box;}
    body{margin:0;background:#08080e;}
    ::-webkit-scrollbar{width:5px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:rgba(255,69,0,0.35);border-radius:3px;}
    select option{background:#13131c;color:#e5e7eb;}
    textarea{resize:vertical;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    @keyframes toastIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
    .page-in{animation:fadeIn .25s ease both;}
    .live-dot{animation:pulse 1.2s infinite;}
  `}</style>
);

// ─── DADOS ────────────────────────────────────────────────────────────────────
const MAPS = ["Mirage","Inferno","Dust2","Nuke","Ancient","Anubis","Vertigo"];
const MAP_ICONS = {Mirage:"🏜️",Inferno:"🔥",Dust2:"💨",Nuke:"☢️",Ancient:"🏛️",Anubis:"🐍",Vertigo:"🏙️"};

const INIT_USERS = [
  {id:1,name:"Admin",        role:"holder",    team:null,avatar:"AD",available:false,password:"holder123",joined:"2025-01"},
  {id:2,name:"CapFURIA",     role:"captain",   team:1,   avatar:"CF",available:false,password:"cap123",   joined:"2025-01"},
  {id:3,name:"CapLOUD",      role:"captain",   team:2,   avatar:"CL",available:false,password:"cap456",   joined:"2025-01"},
  {id:4,name:"Silva_Press",  role:"journalist",team:null,avatar:"SP",available:false,password:"jorn123",  joined:"2025-01"},
  {id:5,name:"FalleN",       role:"player",    team:1,   avatar:"FL",available:false,password:"player1",  joined:"2025-02"},
  {id:6,name:"arT",          role:"player",    team:1,   avatar:"aT",available:false,password:"player2",  joined:"2025-02"},
  {id:7,name:"KSCERATO",     role:"player",    team:1,   avatar:"KS",available:false,password:"player3",  joined:"2025-02"},
  {id:8,name:"yuurih",       role:"player",    team:1,   avatar:"yu",available:false,password:"player4",  joined:"2025-02"},
  {id:9,name:"saffee",       role:"player",    team:1,   avatar:"sf",available:false,password:"player5",  joined:"2025-02"},
  {id:10,name:"dumau",       role:"player",    team:2,   avatar:"du",available:false,password:"player6",  joined:"2025-02"},
  {id:11,name:"aspas",       role:"player",    team:2,   avatar:"as",available:false,password:"player7",  joined:"2025-02"},
  {id:12,name:"tuyz",        role:"player",    team:2,   avatar:"ty",available:false,password:"player8",  joined:"2025-02"},
  {id:13,name:"noway",       role:"player",    team:2,   avatar:"nw",available:false,password:"player9",  joined:"2025-02"},
  {id:14,name:"JogadorLivre",role:"player",    team:null,avatar:"JL",available:true, password:"free1",    joined:"2025-03"},
  {id:15,name:"Striker99",   role:"player",    team:3,   avatar:"S9",available:false,password:"player10", joined:"2025-02"},
  {id:16,name:"NTC_br",      role:"player",    team:4,   avatar:"NT",available:false,password:"player11", joined:"2025-02"},
];
const INIT_TEAMS = [
  {id:1,name:"FURIA",  logo:"🐆",color:"#F97316",wins:3,losses:1,desc:"A FURIA é uma das maiores equipes do Brasil."},
  {id:2,name:"LOUD",   logo:"🦁",color:"#A3E635",wins:2,losses:2,desc:"LOUD, sempre barulhenta nas disputas."},
  {id:3,name:"paiN",   logo:"⚡",color:"#60A5FA",wins:1,losses:3,desc:"paiN Gaming, veterana do cenário brasileiro."},
  {id:4,name:"MIBR",   logo:"🇧🇷",color:"#34D399",wins:4,losses:0,desc:"Made in Brazil, líder do campeonato."},
];
const INIT_MATCHES = [
  {id:1,team1:1,team2:2,status:"finished",score:"2-1",maps:["Mirage","Inferno","Ancient"],champion:1,date:"2025-05-10",roundStats:[]},
  {id:2,team1:3,team2:4,status:"finished",score:"0-2",maps:["Dust2","Nuke"],            champion:4,date:"2025-05-12",roundStats:[]},
  {id:3,team1:1,team2:4,status:"live",    score:"1-1",maps:["Mirage","Inferno"],         champion:null,date:"2025-06-04",roundStats:[]},
  {id:4,team1:2,team2:3,status:"scheduled",score:null,maps:[],                           champion:null,date:"2025-06-06",roundStats:[]},
  {id:5,team1:2,team2:4,status:"scheduled",score:null,maps:[],                           champion:null,date:"2025-06-08",roundStats:[]},
];
const INIT_STATS = [
  {pid:5, kills:87,deaths:60,assists:22,hs:41,maps:5, mvps:3},
  {pid:6, kills:74,deaths:55,assists:35,hs:28,maps:5, mvps:2},
  {pid:7, kills:92,deaths:48,assists:18,hs:50,maps:5, mvps:5},
  {pid:8, kills:68,deaths:62,assists:29,hs:30,maps:5, mvps:1},
  {pid:9, kills:55,deaths:45,assists:15,hs:22,maps:5, mvps:0},
  {pid:10,kills:71,deaths:58,assists:24,hs:33,maps:4, mvps:2},
  {pid:11,kills:83,deaths:52,assists:20,hs:45,maps:4, mvps:4},
  {pid:12,kills:60,deaths:61,assists:31,hs:25,maps:4, mvps:1},
  {pid:13,kills:49,deaths:55,assists:27,hs:18,maps:4, mvps:0},
  {pid:15,kills:61,deaths:58,assists:20,hs:28,maps:4, mvps:1},
  {pid:16,kills:77,deaths:51,assists:22,hs:38,maps:4, mvps:3},
];
const INIT_NEWS = [
  {id:1,authorId:4,title:"MIBR domina fase de grupos!",content:"Em apresentação dominante, a MIBR vence mais uma partida e lidera o campeonato com 4 vitórias consecutivas. NTC_br foi eleito MVP da rodada com 77 kills no torneio.",date:"2025-06-03",type:"news",pinned:true},
  {id:2,authorId:4,title:"KSCERATO bate recorde de kills",content:"Com 92 kills em 5 mapas disputados, KSCERATO se torna o artilheiro do campeonato até agora. Seu índice de headshots de 54% impressiona a comunidade.",date:"2025-06-01",type:"news",pinned:false},
  {id:3,authorId:4,title:"Enquete: Melhor jogador de maio",content:"Vote no craque do mês!",date:"2025-05-31",type:"poll",options:["KSCERATO","aspas","FalleN","NTC_br"],votes:{},pinned:false},
  {id:4,authorId:4,title:"Enquete: Melhor mapa do campeonato",content:"Qual mapa teve as partidas mais emocionantes?",date:"2025-05-28",type:"poll",options:["Mirage","Inferno","Ancient","Dust2"],votes:{},pinned:false},
];
const INIT_BRACKET = {
  name:"Várzea Cup 2025",
  rounds:[
    {name:"Quartas de Final",  matches:[{id:"q1",t1:4,t2:3,winner:4,score:"2-0"},{id:"q2",t1:1,t2:2,winner:1,score:"2-1"},{id:"q3",t1:null,t2:null,winner:null,score:null},{id:"q4",t1:null,t2:null,winner:null,score:null}]},
    {name:"Semifinal",         matches:[{id:"s1",t1:4,t2:1,winner:null,score:null},{id:"s2",t1:null,t2:null,winner:null,score:null}]},
    {name:"Grande Final",      matches:[{id:"f1",t1:null,t2:null,winner:null,score:null}]},
  ]
};

// ─── PRIMITIVOS ───────────────────────────────────────────────────────────────
const ROLE_CFG = {
  holder:    {label:"Holder",    bg:"#7C3AED",icon:"👑",desc:"Gerencia tudo"},
  captain:   {label:"Capitão",  bg:"#F59E0B",icon:"⚔️",desc:"Gerencia o time"},
  journalist:{label:"Jornalista",bg:"#06B6D4",icon:"📰",desc:"Publica conteúdo"},
  player:    {label:"Jogador",  bg:"#10B981",icon:"🎮",desc:"Compete no campeonato"},
};

const Tag = ({role,size="sm"}) => {
  const c = ROLE_CFG[role]||{label:role,bg:"#6B7280",icon:"?"};
  return <span style={{background:c.bg,color:"#fff",fontSize:size==="sm"?"0.62rem":"0.75rem",padding:size==="sm"?"2px 7px":"3px 10px",borderRadius:4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.05em",fontWeight:700,whiteSpace:"nowrap"}}>{c.icon} {c.label}</span>;
};

const Avatar = ({initials,color="#FF4500",size=36}) => (
  <div style={{width:size,height:size,minWidth:size,borderRadius:"50%",background:`linear-gradient(135deg,${color}dd,${color}66)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:Math.max(size*0.33,10),color:"#fff",border:"2px solid rgba(255,255,255,0.1)",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.03em"}}>
    {initials}
  </div>
);

const Card = ({children,style={}}) => (
  <div style={{background:"rgba(255,255,255,0.035)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"1.1rem",...style}}>
    {children}
  </div>
);

const Btn = ({children,onClick,variant="primary",size="md",disabled=false,style={}}) => {
  const V = {
    primary:   "linear-gradient(135deg,#FF4500,#FF6B35)",
    secondary: "rgba(255,255,255,0.07)",
    danger:    "linear-gradient(135deg,#ef4444,#b91c1c)",
    green:     "linear-gradient(135deg,#22c55e,#15803d)",
    ghost:     "transparent",
    purple:    "linear-gradient(135deg,#7C3AED,#5B21B6)",
    cyan:      "linear-gradient(135deg,#06B6D4,#0e7490)",
  };
  const S = {sm:{padding:"4px 11px",fontSize:"0.72rem"},md:{padding:"7px 16px",fontSize:"0.82rem"},lg:{padding:"10px 22px",fontSize:"0.92rem"}};
  const isBg = !["ghost","secondary"].includes(variant);
  return (
    <button onClick={onClick} disabled={disabled}
      style={{background:V[variant]||V.primary,color:variant==="secondary"?"#ccc":variant==="ghost"?"#FF4500":"#fff",border:variant==="ghost"?"1px solid #FF450066":variant==="secondary"?"1px solid rgba(255,255,255,0.1)":"none",...S[size],borderRadius:7,cursor:disabled?"not-allowed":"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:"0.05em",opacity:disabled?0.5:1,transition:"opacity .15s,filter .15s",whiteSpace:"nowrap",...style}}>
      {children}
    </button>
  );
};

const Input = ({placeholder,value,onChange,type="text",style={}}) => (
  <input type={type} placeholder={placeholder} value={value} onChange={onChange}
    style={{background:"rgba(255,255,255,0.055)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,padding:"8px 11px",color:"#e5e7eb",fontSize:"0.83rem",width:"100%",outline:"none",fontFamily:"'Barlow',sans-serif",...style}}/>
);

const Textarea = ({placeholder,value,onChange,rows=4}) => (
  <textarea placeholder={placeholder} value={value} onChange={onChange} rows={rows}
    style={{background:"rgba(255,255,255,0.055)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,padding:"8px 11px",color:"#e5e7eb",fontSize:"0.83rem",width:"100%",outline:"none",fontFamily:"'Barlow',sans-serif",lineHeight:1.5}}/>
);

const Select = ({value,onChange,children,style={}}) => (
  <select value={value} onChange={onChange}
    style={{background:"rgba(255,255,255,0.055)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,padding:"8px 11px",color:"#e5e7eb",fontSize:"0.83rem",width:"100%",outline:"none",fontFamily:"'Barlow',sans-serif",...style}}>
    {children}
  </select>
);

const SectionTitle = ({children,sub,icon}) => (
  <div style={{marginBottom:"1.3rem"}}>
    <h2 style={{margin:0,fontSize:"1.45rem",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,letterSpacing:"0.05em",color:"#fff",textTransform:"uppercase",display:"flex",alignItems:"center",gap:8}}>
      {icon && <span>{icon}</span>}{children}
    </h2>
    {sub && <p style={{margin:"3px 0 0",color:"#6b7280",fontSize:"0.78rem"}}>{sub}</p>}
  </div>
);

const Pill = ({children,color="#FF4500",style={}}) => (
  <span style={{background:`${color}22`,color,border:`1px solid ${color}44`,fontSize:"0.65rem",padding:"2px 9px",borderRadius:20,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,...style}}>{children}</span>
);

const TabBar = ({tabs,active,onChange}) => (
  <div style={{display:"flex",gap:5,marginBottom:"1.2rem",flexWrap:"wrap"}}>
    {tabs.map(([k,l])=><Btn key={k} onClick={()=>onChange(k)} variant={active===k?"primary":"secondary"} size="sm">{l}</Btn>)}
  </div>
);

const Divider = () => <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",margin:"0.9rem 0"}}/>;

// ─── STAT BAR ─────────────────────────────────────────────────────────────────
const StatBar = ({label,value,max,color="#FF4500"}) => (
  <div style={{marginBottom:8}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
      <span style={{color:"#9ca3af",fontSize:"0.72rem"}}>{label}</span>
      <span style={{color:"#fff",fontSize:"0.72rem",fontWeight:700}}>{value}</span>
    </div>
    <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,0.07)"}}>
      <div style={{height:"100%",width:`${Math.min((value/max)*100,100)}%`,background:color,borderRadius:3,transition:"width .5s ease"}}/>
    </div>
  </div>
);

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({users,onLogin}) {
  const [name,setName]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const handle = () => {
    const u = users.find(u=>u.name.toLowerCase()===name.toLowerCase()&&u.password===pass);
    if(u){onLogin(u);setErr("");}
    else setErr("Usuário ou senha incorretos.");
  };
  const demo = [
    {label:"👑 Holder",   n:"Admin",      p:"holder123"},
    {label:"⚔️ Capitão",  n:"CapFURIA",   p:"cap123"},
    {label:"📰 Jornalista",n:"Silva_Press",p:"jorn123"},
    {label:"🎮 Jogador",  n:"FalleN",     p:"player1"},
  ];
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#08080e",padding:"1rem",fontFamily:"'Barlow',sans-serif"}}>
      <div style={{width:"min(420px,100%)"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#FF4500,#FF6B35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",margin:"0 auto 1rem"}}>🎯</div>
          <h1 style={{margin:"0 0 4px",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"2.4rem",letterSpacing:"0.08em",color:"#fff",textTransform:"uppercase"}}>VÁRZEA CS2</h1>
          <p style={{color:"#6b7280",margin:0,fontSize:"0.82rem",letterSpacing:"0.06em"}}>CHAMPIONSHIP PLATFORM</p>
        </div>
        <Card>
          <label style={{color:"#9ca3af",fontSize:"0.72rem",fontWeight:700,display:"block",marginBottom:5,letterSpacing:"0.08em"}}>USUÁRIO</label>
          <Input placeholder="Digite seu nome de usuário" value={name} onChange={e=>setName(e.target.value)} style={{marginBottom:"0.9rem"}}/>
          <label style={{color:"#9ca3af",fontSize:"0.72rem",fontWeight:700,display:"block",marginBottom:5,letterSpacing:"0.08em"}}>SENHA</label>
          <Input placeholder="Senha" type="password" value={pass} onChange={e=>setPass(e.target.value)} style={{marginBottom:"0.9rem"}}/>
          {err&&<p style={{color:"#ef4444",fontSize:"0.78rem",margin:"0 0 0.8rem",display:"flex",alignItems:"center",gap:5}}>⚠️ {err}</p>}
          <Btn onClick={handle} size="lg" style={{width:"100%",textAlign:"center"}}>ENTRAR NA PLATAFORMA</Btn>
        </Card>
        <div style={{marginTop:"1.2rem"}}>
          <p style={{color:"#374151",fontSize:"0.7rem",textAlign:"center",marginBottom:"0.6rem",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.05em"}}>CONTAS DEMONSTRAÇÃO</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {demo.map(d=>(
              <button key={d.n} onClick={()=>{setName(d.n);setPass(d.p);}} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:7,padding:"7px",cursor:"pointer",color:"#9ca3af",fontSize:"0.72rem",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,transition:"all .15s"}}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PICK & BAN MODAL ─────────────────────────────────────────────────────────
function PickBanModal({match,teams,canControl,onClose,onFinish}) {
  const t1 = teams.find(t=>t.id===match.team1);
  const t2 = teams.find(t=>t.id===match.team2);
  // Sequência BO3: ban ban ban ban ban ban pick pick (+ 1 restante = decider)
  const SEQ = ["ban","ban","ban","ban","ban","ban","pick","pick"];
  const [actions,setActions] = useState(match.pbActions||[]);
  const step = actions.length;
  const done = step >= SEQ.length;
  const curType = !done ? SEQ[step] : null;
  const curTeam = !done ? (step%2===0?t1:t2) : null;
  const banned = actions.filter(a=>a.type==="ban").map(a=>a.map);
  const picked = actions.filter(a=>a.type==="pick").map(a=>a.map);
  const decider = !done ? null : MAPS.find(m=>!banned.includes(m)&&!picked.includes(m));
  const allMaps = done ? [...picked, decider].filter(Boolean) : picked;

  const act = (map) => {
    if(!canControl||done||banned.includes(map)||picked.includes(map)) return;
    const nxt = [...actions,{map,type:curType,team:curTeam?.id}];
    setActions(nxt);
    if(nxt.length >= SEQ.length){
      const finalPicked = nxt.filter(a=>a.type==="pick").map(a=>a.map);
      const dec = MAPS.find(m=>!nxt.filter(a=>a.type==="ban").map(a=>a.map).includes(m)&&!finalPicked.includes(m));
      onFinish(match.id,[...finalPicked,dec].filter(Boolean),nxt);
    }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",backdropFilter:"blur(4px)"}}>
      <div style={{width:"min(720px,100%)",background:"#0e0e18",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:"1.6rem",maxHeight:"90vh",overflowY:"auto"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.2rem"}}>
          <div>
            <h2 style={{margin:"0 0 4px",color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"1.5rem",letterSpacing:"0.05em"}}>⚔️ PICK & BAN</h2>
            <p style={{margin:0,color:"#6b7280",fontSize:"0.78rem"}}>{t1?.name} <span style={{color:"#FF4500"}}>vs</span> {t2?.name} — Formato BO3</p>
          </div>
          <Btn onClick={onClose} variant="secondary" size="sm">✕ Fechar</Btn>
        </div>

        {/* Times */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.8rem",marginBottom:"1.2rem"}}>
          {[t1,t2].map((t,i)=>(
            <div key={i} style={{background:!done&&curTeam?.id===t?.id?"rgba(255,69,0,0.12)":"rgba(255,255,255,0.03)",border:`1px solid ${!done&&curTeam?.id===t?.id?"rgba(255,69,0,0.35)":"rgba(255,255,255,0.07)"}`,borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,transition:"all .2s"}}>
              <span style={{fontSize:"1.8rem"}}>{t?.logo}</span>
              <div>
                <div style={{color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"1rem"}}>{t?.name}</div>
                {!done&&curTeam?.id===t?.id&&<div style={{color:"#FF9B71",fontSize:"0.68rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>{curType==="ban"?"🚫 BANINDO...":"✅ ESCOLHENDO..."}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Status */}
        {!done && curTeam && (
          <div style={{background:"rgba(255,69,0,0.08)",border:"1px solid rgba(255,69,0,0.25)",borderRadius:8,padding:"9px 13px",marginBottom:"1.1rem",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:"1rem"}}>{curType==="ban"?"🚫":"✅"}</span>
            <span style={{color:"#FFB38A",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:"0.9rem"}}>
              Vez de <b style={{color:"#fff"}}>{curTeam.name}</b> — {curType==="ban"?"BANIR um mapa":"ESCOLHER um mapa"}
              {!canControl&&<span style={{color:"#6b7280",fontWeight:400,fontSize:"0.75rem",marginLeft:8}}>(apenas visualização)</span>}
            </span>
          </div>
        )}
        {done && (
          <div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.25)",borderRadius:8,padding:"9px 13px",marginBottom:"1.1rem"}}>
            <p style={{margin:0,color:"#86efac",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:"0.9rem"}}>
              ✅ Pick & Ban concluído! Mapas: {allMaps.join(" → ")}
            </p>
          </div>
        )}

        {/* Grid de mapas */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:9,marginBottom:"1.1rem"}}>
          {MAPS.map(map=>{
            const a = actions.find(x=>x.map===map);
            const isBanned = a?.type==="ban";
            const isPicked = a?.type==="pick";
            const isDecider = done&&map===decider;
            const teamColor = a?.team===t1?.id?t1?.color:t2?.color;
            const canClick = canControl&&!done&&!a;
            return (
              <div key={map} onClick={()=>canClick&&act(map)}
                style={{border:`2px solid ${isBanned?"#ef444466":isPicked?`${teamColor}88`:isDecider?"#F59E0B66":"rgba(255,255,255,0.08)"}`,borderRadius:10,padding:"12px 8px",textAlign:"center",cursor:canClick?"pointer":"default",opacity:isBanned?.45:1,background:isBanned?"rgba(239,68,68,0.07)":isPicked?`${teamColor}11`:isDecider?"rgba(245,158,11,0.08)":"rgba(255,255,255,0.025)",transition:"all .15s",position:"relative"}}>
                <div style={{fontSize:"1.8rem",marginBottom:4}}>{MAP_ICONS[map]||"🗺️"}</div>
                <div style={{color:isBanned?"#9ca3af":isPicked?teamColor:isDecider?"#FCD34D":"#e5e7eb",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"0.88rem",letterSpacing:"0.03em"}}>{map}</div>
                {isBanned&&<div style={{color:"#ef4444",fontSize:"0.6rem",fontWeight:700,marginTop:2}}>BANIDO</div>}
                {isPicked&&<div style={{color:teamColor,fontSize:"0.6rem",fontWeight:700,marginTop:2}}>PICK {a.team===t1?.id?t1?.name:t2?.name}</div>}
                {isDecider&&<div style={{color:"#FCD34D",fontSize:"0.6rem",fontWeight:700,marginTop:2}}>DECIDER</div>}
              </div>
            );
          })}
        </div>

        {/* Log de ações */}
        {actions.length>0&&(
          <div>
            <p style={{margin:"0 0 6px",color:"#6b7280",fontSize:"0.68rem",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:"0.08em"}}>HISTÓRICO</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {actions.map((a,i)=>{
                const tm = teams.find(t=>t.id===a.team);
                return (
                  <span key={i} style={{padding:"3px 10px",borderRadius:20,fontSize:"0.67rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",background:a.type==="ban"?"rgba(239,68,68,0.12)":"rgba(34,197,94,0.12)",color:a.type==="ban"?"#fca5a5":"#86efac",border:`1px solid ${a.type==="ban"?"rgba(239,68,68,0.25)":"rgba(34,197,94,0.25)"}`}}>
                    {a.type==="ban"?"🚫":"✅"} {a.map} <span style={{opacity:0.6,fontSize:"0.6rem"}}>({tm?.name})</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomePage({user,users,teams,matches,stats,setPbMatch,isHolder,isCaptain}) {
  const getTeam = id=>teams.find(t=>t.id===id);
  const myTeam = teams.find(t=>t.id===user.team);
  const live = matches.filter(m=>m.status==="live");
  const upcoming = matches.filter(m=>m.status==="scheduled");
  const finished = matches.filter(m=>m.status==="finished");
  const topKiller = stats.reduce((a,b)=>b.kills>a.kills?b:a,stats[0]||{kills:0});
  const topPlayer = users.find(u=>u.id===topKiller?.pid);

  return (
    <div className="page-in">
      {/* Hero banner */}
      <div style={{background:"linear-gradient(135deg,rgba(255,69,0,0.14),rgba(255,69,0,0.03),transparent)",border:"1px solid rgba(255,69,0,0.18)",borderRadius:16,padding:"1.8rem",marginBottom:"1.4rem",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-10,top:-10,fontSize:"9rem",opacity:0.04,userSelect:"none",transform:"rotate(-10deg)"}}>🎯</div>
        <div style={{display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap"}}>
          <Avatar initials={user.avatar} color={myTeam?.color||"#FF4500"} size={52}/>
          <div>
            <p style={{margin:"0 0 2px",color:"#FF6B35",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:"0.72rem",letterSpacing:"0.12em"}}>BEM-VINDO DE VOLTA</p>
            <h1 style={{margin:"0 0 4px",fontSize:"1.8rem",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,color:"#fff",lineHeight:1}}>{user.name}</h1>
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              <Tag role={user.role}/>
              {myTeam&&<span style={{color:myTeam.color,fontSize:"0.82rem",fontWeight:700}}>{myTeam.logo} {myTeam.name}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats rápidos */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"0.8rem",marginBottom:"1.4rem"}}>
        {[
          {l:"Times",v:teams.length,i:"🛡️",c:"#F97316"},
          {l:"Jogadores",v:users.filter(u=>u.role==="player").length,i:"🎮",c:"#10B981"},
          {l:"Partidas",v:matches.length,i:"🎯",c:"#60A5FA"},
          {l:"Ao Vivo",v:live.length,i:"🔴",c:"#ef4444"},
          {l:"Top Killer",v:topPlayer?.name?.split(" ")[0]||"—",i:"💀",c:"#A3E635"},
        ].map(c=>(
          <Card key={c.l} style={{textAlign:"center",padding:"0.9rem"}}>
            <div style={{fontSize:"1.6rem",marginBottom:3}}>{c.i}</div>
            <div style={{fontSize:c.l==="Top Killer"?"1rem":"1.8rem",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,color:c.c,lineHeight:1.1}}>{c.v}</div>
            <div style={{color:"#6b7280",fontSize:"0.68rem",fontWeight:700,marginTop:3,letterSpacing:"0.05em"}}>{c.l}</div>
          </Card>
        ))}
      </div>

      {/* Ao vivo */}
      {live.length>0&&(
        <div style={{marginBottom:"1.4rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:"0.8rem"}}>
            <span className="live-dot" style={{width:9,height:9,borderRadius:"50%",background:"#ef4444",display:"inline-block"}}/>
            <span style={{color:"#ef4444",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"0.78rem",letterSpacing:"0.1em"}}>PARTIDAS AO VIVO</span>
          </div>
          {live.map(m=>{
            const t1=getTeam(m.team1),t2=getTeam(m.team2);
            return (
              <Card key={m.id} style={{borderColor:"rgba(239,68,68,0.22)",marginBottom:"0.7rem",background:"rgba(239,68,68,0.04)"}}>
                <div style={{display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap"}}>
                  <span style={{fontSize:"1.7rem"}}>{t1?.logo}</span>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"1.05rem",color:"#fff"}}>{t1?.name}</span>
                  <div style={{textAlign:"center",flex:1,minWidth:80}}>
                    <div style={{background:"rgba(239,68,68,0.18)",color:"#ef4444",padding:"4px 16px",borderRadius:20,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"1.1rem",display:"inline-block"}}>{m.score||"—"}</div>
                  </div>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"1.05rem",color:"#fff"}}>{t2?.name}</span>
                  <span style={{fontSize:"1.7rem"}}>{t2?.logo}</span>
                  {(isHolder||isCaptain)&&<Btn onClick={()=>setPbMatch(m)} size="sm" variant="ghost">⚔️ Pick & Ban</Btn>}
                </div>
                {m.maps.length>0&&<div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
                  {m.maps.map(mp=><Pill key={mp} color="#9ca3af">{MAP_ICONS[mp]} {mp}</Pill>)}
                </div>}
              </Card>
            );
          })}
        </div>
      )}

      {/* Próximas */}
      <div style={{marginBottom:"1.4rem"}}>
        <p style={{margin:"0 0 0.7rem",color:"#6b7280",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:"0.72rem",letterSpacing:"0.1em"}}>PRÓXIMAS PARTIDAS</p>
        {upcoming.length===0&&<p style={{color:"#374151",fontSize:"0.82rem"}}>Nenhuma partida agendada.</p>}
        {upcoming.map(m=>{
          const t1=getTeam(m.team1),t2=getTeam(m.team2);
          return (
            <Card key={m.id} style={{display:"flex",alignItems:"center",gap:"0.8rem",flexWrap:"wrap",marginBottom:"0.5rem"}}>
              <span style={{fontSize:"1.4rem"}}>{t1?.logo}</span>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,color:"#e5e7eb",fontSize:"0.92rem"}}>{t1?.name}</span>
              <span style={{color:"#6b7280",fontWeight:700,fontSize:"0.8rem"}}>vs</span>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,color:"#e5e7eb",fontSize:"0.92rem"}}>{t2?.name}</span>
              <span style={{fontSize:"1.4rem"}}>{t2?.logo}</span>
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <Pill color="#6b7280">{m.date}</Pill>
                {isHolder&&<Btn onClick={()=>setPbMatch(m)} size="sm" variant="ghost">Pick & Ban</Btn>}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Últimos resultados */}
      <div>
        <p style={{margin:"0 0 0.7rem",color:"#6b7280",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:"0.72rem",letterSpacing:"0.1em"}}>ÚLTIMOS RESULTADOS</p>
        {finished.slice(-3).reverse().map(m=>{
          const t1=getTeam(m.team1),t2=getTeam(m.team2),winner=getTeam(m.champion);
          return (
            <Card key={m.id} style={{display:"flex",alignItems:"center",gap:"0.8rem",flexWrap:"wrap",marginBottom:"0.5rem",opacity:0.82}}>
              <span style={{fontSize:"1.2rem",opacity:m.champion===m.team1?1:.35}}>{t1?.logo}</span>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,color:m.champion===m.team1?"#fff":"#6b7280",fontSize:"0.88rem"}}>{t1?.name}</span>
              <Pill color="#6b7280">{m.score}</Pill>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,color:m.champion===m.team2?"#fff":"#6b7280",fontSize:"0.88rem"}}>{t2?.name}</span>
              <span style={{fontSize:"1.2rem",opacity:m.champion===m.team2?1:.35}}>{t2?.logo}</span>
              <span style={{marginLeft:"auto",color:"#FF4500",fontSize:"0.72rem",fontWeight:700}}>{winner?.logo} {winner?.name} venceu</span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── AO VIVO ──────────────────────────────────────────────────────────────────
function LivePage({matches,teams,users,stats,isHolder,setPbMatch,setMatches,showToast}) {
  const getTeam=id=>teams.find(t=>t.id===id);
  const getUser=id=>users.find(u=>u.id===id);
  const live=matches.filter(m=>m.status==="live");
  const fin=matches.filter(m=>m.status==="finished");

  return (
    <div className="page-in">
      <SectionTitle icon="🔴" sub="Partidas em andamento e resultados recentes">Ao Vivo & Resultados</SectionTitle>
      {live.length===0&&<Card style={{marginBottom:"1rem"}}><p style={{margin:0,color:"#6b7280"}}>Nenhuma partida ao vivo no momento.</p></Card>}
      {live.map(m=>{
        const t1=getTeam(m.team1),t2=getTeam(m.team2);
        const [s1,s2]=(m.score||"0-0").split("-").map(Number);
        return (
          <Card key={m.id} style={{marginBottom:"1.1rem",borderColor:"rgba(239,68,68,0.2)",background:"rgba(239,68,68,0.03)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
              <span style={{display:"flex",alignItems:"center",gap:5,color:"#ef4444",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"0.72rem",letterSpacing:"0.1em"}}>
                <span className="live-dot" style={{width:8,height:8,borderRadius:"50%",background:"#ef4444",display:"inline-block"}}/> AO VIVO
              </span>
              <span style={{color:"#6b7280",fontSize:"0.72rem"}}>{m.date}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"1.5rem",padding:"0.8rem 0",flexWrap:"wrap"}}>
              <div style={{textAlign:"center",minWidth:90}}>
                <div style={{fontSize:"2.8rem"}}>{t1?.logo}</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"1.1rem",color:"#fff"}}>{t1?.name}</div>
                <div style={{color:"#6b7280",fontSize:"0.72rem"}}>{t1?.wins}V {t1?.losses}D</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"2.4rem",color:"#fff",lineHeight:1}}>{s1} <span style={{color:"#6b7280"}}>:</span> {s2}</div>
                <div style={{color:"#6b7280",fontSize:"0.68rem",letterSpacing:"0.08em",marginTop:2}}>PLACAR DE MAPAS</div>
              </div>
              <div style={{textAlign:"center",minWidth:90}}>
                <div style={{fontSize:"2.8rem"}}>{t2?.logo}</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"1.1rem",color:"#fff"}}>{t2?.name}</div>
                <div style={{color:"#6b7280",fontSize:"0.72rem"}}>{t2?.wins}V {t2?.losses}D</div>
              </div>
            </div>
            {m.maps.length>0&&(
              <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",margin:"0.8rem 0"}}>
                {m.maps.map((mp,i)=><Pill key={i} color={i<s1?"#22c55e":i<s1+s2?"#ef4444":"#6b7280"}>{MAP_ICONS[mp]} {mp}</Pill>)}
              </div>
            )}
            {isHolder&&(
              <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:"0.8rem",flexWrap:"wrap"}}>
                <Btn onClick={()=>setPbMatch(m)} size="sm">⚔️ Pick & Ban</Btn>
                <Btn onClick={()=>{setMatches(p=>p.map(x=>x.id===m.id?{...x,status:"finished",champion:x.team1,score:"2-1"}:x));showToast("Partida encerrada!");}} variant="danger" size="sm">Encerrar Partida</Btn>
              </div>
            )}
          </Card>
        );
      })}

      <p style={{color:"#6b7280",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:"0.72rem",letterSpacing:"0.1em",marginBottom:"0.8rem",marginTop:"0.5rem"}}>RESULTADOS RECENTES</p>
      {fin.map(m=>{
        const t1=getTeam(m.team1),t2=getTeam(m.team2),w=getTeam(m.champion);
        return (
          <Card key={m.id} style={{marginBottom:"0.5rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.8rem",flexWrap:"wrap"}}>
              <span style={{fontSize:"1.3rem",opacity:m.champion===m.team1?1:.35}}>{t1?.logo}</span>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,color:m.champion===m.team1?"#fff":"#6b7280"}}>{t1?.name}</span>
              <Pill color="#6b7280">{m.score}</Pill>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,color:m.champion===m.team2?"#fff":"#6b7280"}}>{t2?.name}</span>
              <span style={{fontSize:"1.3rem",opacity:m.champion===m.team2?1:.35}}>{t2?.logo}</span>
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                {m.maps.map(mp=><span key={mp} style={{color:"#4b5563",fontSize:"0.68rem"}}>{MAP_ICONS[mp]}</span>)}
                <span style={{color:"#FF4500",fontSize:"0.72rem",fontWeight:700}}>{w?.logo} {w?.name} venceu</span>
                <Pill color="#6b7280">{m.date}</Pill>
              </div>
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
  const enriched = stats.map(s=>{
    const p=getUser(s.pid), t=p?getTeam(p.team):null;
    return {...s,player:p,team:t,kd:s.deaths>0?(s.kills/s.deaths).toFixed(2):s.kills.toString(),hsp:s.kills>0?Math.round(s.hs/s.kills*100):0,adr:s.maps>0?Math.round((s.kills*42+s.assists*10)/s.maps):0};
  });
  const sorted=[...enriched].sort((a,b)=>parseFloat(b[tab])-parseFloat(a[tab]));
  const maxKills=Math.max(...enriched.map(s=>s.kills),1);
  const maxKD=Math.max(...enriched.map(s=>parseFloat(s.kd)),1);

  const COLS = [
    {k:"kills",label:"Kills"},
    {k:"kd",   label:"K/D Ratio"},
    {k:"hsp",  label:"HS%"},
    {k:"assists",label:"Assists"},
    {k:"adr",  label:"ADR"},
    {k:"mvps", label:"MVPs"},
  ];

  return (
    <div className="page-in">
      <SectionTitle icon="📊" sub="Rankings individuais do campeonato">Estatísticas</SectionTitle>
      <TabBar tabs={COLS.map(c=>[c.k,c.label])} active={tab} onChange={setTab}/>

      {/* Top 3 */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"0.8rem",marginBottom:"1.3rem"}}>
        {sorted.slice(0,3).map((s,i)=>{
          const medals=["🥇","🥈","🥉"];
          const colors=["#F59E0B","#9ca3af","#CD7F32"];
          return (
            <Card key={s.pid} style={{borderColor:`${colors[i]}44`,background:`${colors[i]}08`,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:8,right:10,fontSize:"1.5rem"}}>{medals[i]}</div>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:"0.7rem"}}>
                <Avatar initials={s.player?.avatar||"??"} color={s.team?.color||"#FF4500"} size={38}/>
                <div>
                  <div style={{color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"0.95rem"}}>{s.player?.name}</div>
                  <div style={{color:s.team?.color,fontSize:"0.72rem",fontWeight:700}}>{s.team?.logo} {s.team?.name}</div>
                </div>
              </div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"2rem",color:colors[i],lineHeight:1}}>
                {s[tab]}{tab==="hsp"?"%":""}
              </div>
              <div style={{color:"#6b7280",fontSize:"0.68rem",fontWeight:700,letterSpacing:"0.06em",marginTop:2}}>{COLS.find(c=>c.k===tab)?.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Tabela */}
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:560}}>
            <thead>
              <tr style={{background:"rgba(255,255,255,0.04)"}}>
                {["#","Jogador","Time","Kills","K/D","HS%","Assists","ADR","MVPs"].map(h=>(
                  <th key={h} style={{padding:"10px 12px",textAlign:"left",color:"#6b7280",fontSize:"0.68rem",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:"0.08em",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((s,i)=>(
                <tr key={s.pid} style={{borderTop:"1px solid rgba(255,255,255,0.04)",background:i===0?"rgba(255,165,0,0.04)":"transparent"}}>
                  <td style={{padding:"9px 12px",color:i===0?"#F59E0B":i<3?"#9ca3af":"#4b5563",fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.88rem"}}>{i+1}</td>
                  <td style={{padding:"9px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <Avatar initials={s.player?.avatar||"??"} color={s.team?.color||"#FF4500"} size={26}/>
                      <span style={{color:"#e5e7eb",fontWeight:700,fontSize:"0.83rem",whiteSpace:"nowrap"}}>{s.player?.name}</span>
                    </div>
                  </td>
                  <td style={{padding:"9px 12px"}}><span style={{color:s.team?.color||"#9ca3af",fontSize:"0.78rem",fontWeight:700,whiteSpace:"nowrap"}}>{s.team?.logo} {s.team?.name||"—"}</span></td>
                  <td style={{padding:"9px 12px",color:"#fff",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>{s.kills}</td>
                  <td style={{padding:"9px 12px",color:parseFloat(s.kd)>=1?"#4ade80":"#f87171",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>{s.kd}</td>
                  <td style={{padding:"9px 12px",color:"#e5e7eb",fontFamily:"'Barlow Condensed',sans-serif"}}>{s.hsp}%</td>
                  <td style={{padding:"9px 12px",color:"#9ca3af"}}>{s.assists}</td>
                  <td style={{padding:"9px 12px",color:"#9ca3af"}}>{s.adr}</td>
                  <td style={{padding:"9px 12px",color:s.mvps>0?"#F59E0B":"#4b5563",fontWeight:700}}>{s.mvps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Barras visuais */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1rem",marginTop:"1.2rem"}}>
        <Card>
          <p style={{margin:"0 0 0.8rem",color:"#9ca3af",fontSize:"0.72rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.08em"}}>TOP KILLS</p>
          {[...enriched].sort((a,b)=>b.kills-a.kills).slice(0,5).map(s=>(
            <StatBar key={s.pid} label={s.player?.name||"?"} value={s.kills} max={maxKills} color={s.team?.color||"#FF4500"}/>
          ))}
        </Card>
        <Card>
          <p style={{margin:"0 0 0.8rem",color:"#9ca3af",fontSize:"0.72rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.08em"}}>TOP K/D RATIO</p>
          {[...enriched].sort((a,b)=>parseFloat(b.kd)-parseFloat(a.kd)).slice(0,5).map(s=>(
            <StatBar key={s.pid} label={s.player?.name||"?"} value={s.kd} max={maxKD} color={parseFloat(s.kd)>=1?"#4ade80":"#f87171"}/>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── TIMES ────────────────────────────────────────────────────────────────────
function TeamsPage({teams,users,stats,matches}) {
  const [sel,setSel]=useState(null);
  const getTeam=id=>teams.find(t=>t.id===id);
  const selectedTeam = sel ? teams.find(t=>t.id===sel) : null;

  if(selectedTeam) {
    const players=users.filter(u=>u.team===sel&&u.role==="player");
    const cap=users.find(u=>u.team===sel&&u.role==="captain");
    const teamMatches=matches.filter(m=>m.team1===sel||m.team2===sel);
    const wins=teamMatches.filter(m=>m.champion===sel).length;
    const losses=teamMatches.filter(m=>m.status==="finished"&&m.champion!==sel).length;
    const teamStats=stats.filter(s=>players.some(p=>p.id===s.pid));
    const totalKills=teamStats.reduce((a,b)=>a+b.kills,0);
    return (
      <div className="page-in">
        <Btn onClick={()=>setSel(null)} variant="secondary" size="sm" style={{marginBottom:"1rem"}}>← Voltar</Btn>
        <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1.4rem",flexWrap:"wrap"}}>
          <div style={{width:70,height:70,borderRadius:"50%",background:`${selectedTeam.color}22`,border:`3px solid ${selectedTeam.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.5rem"}}>{selectedTeam.logo}</div>
          <div>
            <h1 style={{margin:"0 0 4px",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"2rem",color:"#fff"}}>{selectedTeam.name}</h1>
            <p style={{margin:0,color:"#9ca3af",fontSize:"0.82rem"}}>{selectedTeam.desc}</p>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:"0.8rem",marginBottom:"1.3rem"}}>
          {[{l:"Vitórias",v:wins,c:"#4ade80"},{l:"Derrotas",v:losses,c:"#f87171"},{l:"Jogadores",v:players.length,c:"#60A5FA"},{l:"Total Kills",v:totalKills,c:"#F59E0B"}].map(x=>(
            <Card key={x.l} style={{textAlign:"center",padding:"0.8rem"}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"1.8rem",color:x.c}}>{x.v}</div>
              <div style={{color:"#6b7280",fontSize:"0.68rem",fontWeight:700}}>{x.l}</div>
            </Card>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
          <Card>
            <p style={{margin:"0 0 0.8rem",color:"#9ca3af",fontSize:"0.72rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.08em"}}>ELENCO</p>
            {cap&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"0.5rem"}}><Avatar initials={cap.avatar} color={selectedTeam.color} size={28}/><span style={{color:"#fff",fontSize:"0.83rem"}}>{cap.name}</span><Tag role="captain"/></div>}
            {players.map(p=>{
              const ps=stats.find(s=>s.pid===p.id);
              return <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                <Avatar initials={p.avatar} color={selectedTeam.color} size={26}/>
                <span style={{color:"#e5e7eb",fontSize:"0.82rem",flex:1}}>{p.name}</span>
                {ps&&<span style={{color:"#9ca3af",fontSize:"0.72rem"}}>{ps.kills}K</span>}
              </div>;
            })}
          </Card>
          <Card>
            <p style={{margin:"0 0 0.8rem",color:"#9ca3af",fontSize:"0.72rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.08em"}}>HISTÓRICO</p>
            {teamMatches.slice(-5).map(m=>{
              const opp=getTeam(m.team1===sel?m.team2:m.team1);
              const won=m.champion===sel;
              return <div key={m.id} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 0",borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:"0.72rem",color:won?"#4ade80":m.status==="scheduled"?"#6b7280":"#f87171",minWidth:16}}>{m.status==="scheduled"?"—":won?"V":"D"}</span>
                <span style={{color:"#9ca3af",fontSize:"0.78rem"}}>{opp?.logo} {opp?.name}</span>
                {m.score&&<span style={{color:"#6b7280",fontSize:"0.72rem",marginLeft:"auto"}}>{m.score}</span>}
              </div>;
            })}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-in">
      <SectionTitle icon="🛡️" sub="Todos os times do campeonato">Times</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:"1rem"}}>
        {teams.map(t=>{
          const players=users.filter(u=>u.team===t.id&&u.role==="player");
          const cap=users.find(u=>u.team===t.id&&u.role==="captain");
          const teamStats=stats.filter(s=>players.some(p=>p.id===s.pid));
          const totalK=teamStats.reduce((a,b)=>a+b.kills,0);
          return (
            <Card key={t.id} style={{borderColor:`${t.color}28`,cursor:"pointer"}} >
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.8rem"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:`${t.color}1a`,border:`2px solid ${t.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem"}}>{t.logo}</div>
                  <div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"1.1rem",color:"#fff"}}>{t.name}</div>
                    <div style={{display:"flex",gap:8,marginTop:2}}>
                      <span style={{color:"#4ade80",fontSize:"0.72rem",fontWeight:700}}>{t.wins}V</span>
                      <span style={{color:"#f87171",fontSize:"0.72rem",fontWeight:700}}>{t.losses}D</span>
                    </div>
                  </div>
                </div>
                <span style={{color:"#9ca3af",fontSize:"0.72rem",fontWeight:700}}>{totalK} kills</span>
              </div>
              {cap&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:"0.5rem"}}><Tag role="captain"/><span style={{color:"#9ca3af",fontSize:"0.78rem"}}>{cap.name}</span></div>}
              <Divider/>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:"0.7rem"}}>
                {players.slice(0,5).map(p=><Avatar key={p.id} initials={p.avatar} color={t.color} size={24}/>)}
                {players.length>5&&<span style={{color:"#6b7280",fontSize:"0.72rem",alignSelf:"center"}}>+{players.length-5}</span>}
              </div>
              <Btn onClick={()=>setSel(t.id)} variant="secondary" size="sm" style={{width:"100%"}}>Ver Perfil</Btn>
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
      <SectionTitle icon="🏆" sub={bracket.name}>Chaveamento</SectionTitle>
      <div style={{overflowX:"auto",paddingBottom:"1rem"}}>
        <div style={{display:"flex",gap:"1.5rem",minWidth:"fit-content",alignItems:"flex-start"}}>
          {bracket.rounds.map((round,ri)=>(
            <div key={ri} style={{display:"flex",flexDirection:"column",gap:round.matches.length>1?"2rem":"0",justifyContent:"space-around",flex:1,minWidth:200}}>
              <div style={{color:"#FF4500",fontSize:"0.7rem",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:"0.1em",marginBottom:"0.5rem",textTransform:"uppercase"}}>{round.name}</div>
              {round.matches.map(m=>{
                const t1=getTeam(m.t1), t2=getTeam(m.t2);
                return (
                  <div key={m.id} style={{border:"1px solid rgba(255,255,255,0.09)",borderRadius:10,overflow:"hidden",background:"rgba(255,255,255,0.025)"}}>
                    {[[t1,m.t1],[t2,m.t2]].map(([t,tid],si)=>(
                      <div key={si} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 13px",background:m.winner===tid?"rgba(255,69,0,0.12)":"transparent",borderBottom:si===0?"1px solid rgba(255,255,255,0.06)":"none",minWidth:180}}>
                        <span style={{fontSize:"1.3rem"}}>{t?.logo||"❓"}</span>
                        <span style={{flex:1,color:m.winner===tid?"#fff":"#9ca3af",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:"0.88rem"}}>{t?.name||"A definir"}</span>
                        {m.winner===tid&&<span style={{color:"#FF4500",fontSize:"0.72rem",fontWeight:700}}>✓</span>}
                        {m.score&&m.winner===tid&&<span style={{color:"#4ade80",fontSize:"0.72rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>{m.score.split("-")[0]}</span>}
                        {m.score&&m.winner!==tid&&tid&&<span style={{color:"#f87171",fontSize:"0.72rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>{m.score.split("-")[1]}</span>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Classificação geral */}
      <div style={{marginTop:"1.5rem"}}>
        <p style={{margin:"0 0 0.8rem",color:"#6b7280",fontSize:"0.72rem",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:"0.1em"}}>CLASSIFICAÇÃO GERAL</p>
        <Card style={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>
              {["Pos","Time","V","D","Pts"].map(h=><th key={h} style={{padding:"9px 13px",textAlign:"left",color:"#6b7280",fontSize:"0.68rem",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:"0.08em"}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {[...teams].sort((a,b)=>(b.wins*3-(b.losses))-(a.wins*3-(a.losses))).map((t,i)=>(
                <tr key={t.id} style={{borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                  <td style={{padding:"9px 13px",color:i===0?"#F59E0B":i===1?"#9ca3af":i===2?"#CD7F32":"#6b7280",fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif"}}>{i+1}</td>
                  <td style={{padding:"9px 13px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:"1.1rem"}}>{t.logo}</span>
                      <span style={{color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{t.name}</span>
                    </div>
                  </td>
                  <td style={{padding:"9px 13px",color:"#4ade80",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>{t.wins}</td>
                  <td style={{padding:"9px 13px",color:"#f87171",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>{t.losses}</td>
                  <td style={{padding:"9px 13px",color:"#FF4500",fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif"}}>{t.wins*3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

// ─── MERCADO ──────────────────────────────────────────────────────────────────
function MarketPage({user,users,teams,setUsers,setUser,showToast,isCaptain,isHolder}) {
  const free=users.filter(u=>u.role==="player"&&u.available&&!u.team);
  const myTeam=teams.find(t=>t.id===user.team);
  const isMyself = user.role==="player"&&!user.team;
  return (
    <div className="page-in">
      <SectionTitle icon="💼" sub="Jogadores disponíveis para contratação">Mercado de Transferências</SectionTitle>
      {isMyself&&(
        <Card style={{marginBottom:"1.1rem",borderColor:"rgba(99,102,241,0.25)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap"}}>
            <Avatar initials={user.avatar} color="#6366f1" size={42}/>
            <div style={{flex:1}}>
              <p style={{margin:"0 0 3px",color:"#fff",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",fontSize:"1rem"}}>{user.name}</p>
              <p style={{margin:0,color:"#9ca3af",fontSize:"0.78rem"}}>{user.available?"Você está visível no mercado":"Você está oculto no mercado"}</p>
            </div>
            <Btn onClick={()=>{
              const next=!user.available;
              setUsers(p=>p.map(u=>u.id===user.id?{...u,available:next}:u));
              setUser(p=>({...p,available:next}));
              showToast(next?"Você agora está disponível no mercado!":"Você saiu do mercado.");
            }} variant={user.available?"danger":"green"} size="sm">
              {user.available?"Sair do Mercado":"Me Disponibilizar"}
            </Btn>
          </div>
        </Card>
      )}
      {free.length===0
        ? <Card><p style={{margin:0,color:"#6b7280"}}>Nenhum jogador disponível no momento.</p></Card>
        : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:"0.9rem"}}>
          {free.map(p=>(
            <Card key={p.id}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"0.7rem"}}>
                <Avatar initials={p.avatar} color="#6366f1" size={40}/>
                <div>
                  <div style={{color:"#fff",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.92rem"}}>{p.name}</div>
                  <Tag role="player"/>
                </div>
              </div>
              <div style={{display:"flex",gap:5,marginBottom:"0.7rem",flexWrap:"wrap"}}>
                <Pill color="#4ade80">Livre</Pill>
                <Pill color="#6b7280">Desde {p.joined}</Pill>
              </div>
              {(isCaptain||isHolder)&&(
                <Btn onClick={()=>{
                  setUsers(prev=>prev.map(u=>u.id===p.id?{...u,team:user.team||1,available:false}:u));
                  showToast(`${p.name} foi contratado!`);
                }} variant="green" size="sm" style={{width:"100%"}}>
                  {myTeam?"Contratar para "+myTeam.name:"Contratar"}
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
  const pinned=news.filter(n=>n.pinned);
  const rest=news.filter(n=>!n.pinned);
  const all=[...pinned,...rest];

  const castVote=(nid,opt)=>{
    if(votes[nid]) return;
    setVotes(p=>({...p,[nid]:opt}));
    setNews(p=>p.map(n=>n.id===nid?{...n,votes:{...n.votes,[opt]:(n.votes[opt]||0)+1}}:n));
  };

  return (
    <div className="page-in">
      <SectionTitle icon="📰" sub="Últimas notícias, análises e enquetes">Notícias & Enquetes</SectionTitle>
      {all.map(n=>{
        const author=getUser(n.authorId);
        if(n.type==="poll") {
          const total=Object.values(n.votes||{}).reduce((a,b)=>a+b,0);
          const myVote=votes[n.id];
          const winner=total>0?Object.entries(n.votes||{}).sort((a,b)=>b[1]-a[1])[0][0]:null;
          return (
            <Card key={n.id} style={{marginBottom:"1rem",borderColor:"rgba(99,102,241,0.2)",background:"rgba(99,102,241,0.03)"}}>
              <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:"0.7rem",flexWrap:"wrap"}}>
                <Pill color="#818cf8">📊 ENQUETE</Pill>
                <span style={{color:"#6b7280",fontSize:"0.72rem"}}>{n.date}</span>
                <span style={{color:"#6b7280",fontSize:"0.72rem",marginLeft:"auto"}}>por {author?.name}</span>
              </div>
              <h3 style={{margin:"0 0 1rem",color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"1.1rem"}}>{n.title}</h3>
              {n.options.map(opt=>{
                const cnt=(n.votes||{})[opt]||0;
                const pct=total>0?Math.round(cnt/total*100):0;
                const isWinner=myVote&&opt===winner;
                const isMyPick=myVote===opt;
                return (
                  <div key={opt} onClick={()=>castVote(n.id,opt)}
                    style={{cursor:myVote?"default":"pointer",marginBottom:8,padding:"9px 12px",borderRadius:8,border:`1px solid ${isMyPick?"rgba(99,102,241,0.5)":"rgba(255,255,255,0.07)"}`,background:isMyPick?"rgba(99,102,241,0.1)":"rgba(255,255,255,0.03)",transition:"all .15s",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${pct}%`,background:"rgba(99,102,241,0.15)",transition:"width .5s",borderRadius:7}}/>
                    <div style={{position:"relative",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{color:isMyPick?"#a5b4fc":"#e5e7eb",fontSize:"0.83rem",fontWeight:isMyPick?700:400}}>{opt} {isWinner&&myVote?"🏆":""}</span>
                      <span style={{color:"#9ca3af",fontSize:"0.75rem",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{myVote?`${pct}% (${cnt})`:""}</span>
                    </div>
                  </div>
                );
              })}
              <p style={{margin:"0.5rem 0 0",color:"#6b7280",fontSize:"0.7rem"}}>{total} votos {!myVote&&"— clique para votar"}</p>
            </Card>
          );
        }
        return (
          <Card key={n.id} style={{marginBottom:"0.9rem",borderColor:n.pinned?"rgba(245,158,11,0.2)":"rgba(255,255,255,0.07)"}}>
            {n.pinned&&<div style={{marginBottom:"0.5rem"}}><Pill color="#F59E0B">📌 DESTAQUE</Pill></div>}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"0.6rem"}}>
              <Avatar initials={author?.avatar||"??"} color="#06B6D4" size={26}/>
              <span style={{color:"#6b7280",fontSize:"0.72rem"}}>{author?.name} · {n.date}</span>
            </div>
            <h3 style={{margin:"0 0 0.5rem",color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"1.05rem"}}>{n.title}</h3>
            <p style={{margin:0,color:"#9ca3af",fontSize:"0.83rem",lineHeight:1.65}}>{n.content}</p>
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
      <SectionTitle icon="✍️" sub="Publicar notícias, enquetes e registrar estatísticas">Painel do Jornalista</SectionTitle>
      <TabBar tabs={[["news","📰 Notícia"],["poll","📊 Enquete"],["stats","📈 Estatísticas"],["history","📋 Publicadas"]]} active={tab} onChange={setTab}/>

      {tab==="news"&&(
        <Card>
          <p style={{margin:"0 0 0.9rem",color:"#9ca3af",fontSize:"0.72rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.08em"}}>NOVA NOTÍCIA</p>
          <Input placeholder="Título" value={nTitle} onChange={e=>setNTitle(e.target.value)} style={{marginBottom:"0.6rem"}}/>
          <Textarea placeholder="Conteúdo da notícia..." value={nContent} onChange={e=>setNContent(e.target.value)} rows={5}/>
          <div style={{display:"flex",alignItems:"center",gap:8,margin:"0.7rem 0"}}>
            <input type="checkbox" checked={nPin} onChange={e=>setNPin(e.target.checked)} id="pin"/>
            <label htmlFor="pin" style={{color:"#9ca3af",fontSize:"0.8rem",cursor:"pointer"}}>📌 Fixar como destaque</label>
          </div>
          <Btn onClick={()=>{
            if(!nTitle.trim()||!nContent.trim()) return showToast("Preencha título e conteúdo","error");
            setNews(p=>[{id:Date.now(),authorId:user.id,title:nTitle,content:nContent,date:new Date().toISOString().split("T")[0],type:"news",pinned:nPin},...p]);
            setNTitle(""); setNContent(""); setNPin(false);
            showToast("Notícia publicada com sucesso!");
          }}>Publicar Notícia</Btn>
        </Card>
      )}

      {tab==="poll"&&(
        <Card>
          <p style={{margin:"0 0 0.9rem",color:"#9ca3af",fontSize:"0.72rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.08em"}}>NOVA ENQUETE</p>
          <Input placeholder="Pergunta da enquete" value={pTitle} onChange={e=>setPTitle(e.target.value)} style={{marginBottom:"0.6rem"}}/>
          <Input placeholder="Opções separadas por vírgula (mín. 2)" value={pOpts} onChange={e=>setPOpts(e.target.value)} style={{marginBottom:"0.9rem"}}/>
          <p style={{margin:"0 0 0.8rem",color:"#6b7280",fontSize:"0.75rem"}}>Prévia: {pOpts.split(",").filter(o=>o.trim()).map(o=><Pill key={o} color="#818cf8" style={{marginRight:4}}>{o.trim()}</Pill>)}</p>
          <Btn onClick={()=>{
            const opts=pOpts.split(",").map(o=>o.trim()).filter(Boolean);
            if(!pTitle.trim()||opts.length<2) return showToast("Preencha a pergunta e ao menos 2 opções","error");
            setNews(p=>[{id:Date.now(),authorId:user.id,title:pTitle,content:"",date:new Date().toISOString().split("T")[0],type:"poll",options:opts,votes:{},pinned:false},...p]);
            setPTitle(""); setPOpts("");
            showToast("Enquete criada!");
          }}>Criar Enquete</Btn>
        </Card>
      )}

      {tab==="stats"&&(
        <Card>
          <p style={{margin:"0 0 0.9rem",color:"#9ca3af",fontSize:"0.72rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.08em"}}>REGISTRAR ESTATÍSTICAS</p>
          <Select value={selPid} onChange={e=>setSelPid(e.target.value)} style={{marginBottom:"0.8rem"}}>
            <option value="">Selecionar jogador...</option>
            {users.filter(u=>u.role==="player").map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
          </Select>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.6rem",marginBottom:"0.8rem"}}>
            <div><label style={{color:"#6b7280",fontSize:"0.7rem",display:"block",marginBottom:3}}>KILLS</label><Input placeholder="0" value={kills} onChange={e=>setKills(e.target.value)}/></div>
            <div><label style={{color:"#6b7280",fontSize:"0.7rem",display:"block",marginBottom:3}}>DEATHS</label><Input placeholder="0" value={deaths} onChange={e=>setDeaths(e.target.value)}/></div>
            <div><label style={{color:"#6b7280",fontSize:"0.7rem",display:"block",marginBottom:3}}>ASSISTS</label><Input placeholder="0" value={assists} onChange={e=>setAssists(e.target.value)}/></div>
            <div><label style={{color:"#6b7280",fontSize:"0.7rem",display:"block",marginBottom:3}}>HEADSHOTS</label><Input placeholder="0" value={hs} onChange={e=>setHs(e.target.value)}/></div>
            <div><label style={{color:"#6b7280",fontSize:"0.7rem",display:"block",marginBottom:3}}>MAPAS</label><Input placeholder="1" value={maps} onChange={e=>setMaps(e.target.value)}/></div>
            <div><label style={{color:"#6b7280",fontSize:"0.7rem",display:"block",marginBottom:3}}>MVPs</label><Input placeholder="0" value={mvps} onChange={e=>setMvps(e.target.value)}/></div>
          </div>
          <p style={{margin:"0 0 0.8rem",color:"#6b7280",fontSize:"0.75rem"}}>ℹ️ Os valores serão somados aos existentes do jogador.</p>
          <Btn onClick={()=>{
            if(!selPid) return showToast("Selecione um jogador","error");
            const pid=Number(selPid),k=Number(kills)||0,d=Number(deaths)||0,a=Number(assists)||0,h=Number(hs)||0,m=Number(maps)||1,mv=Number(mvps)||0;
            setStats(prev=>{
              const ex=prev.find(s=>s.pid===pid);
              if(ex) return prev.map(s=>s.pid===pid?{...s,kills:s.kills+k,deaths:s.deaths+d,assists:s.assists+a,hs:s.hs+h,maps:s.maps+m,mvps:s.mvps+mv}:s);
              return [...prev,{pid,kills:k,deaths:d,assists:a,hs:h,maps:m,mvps:mv}];
            });
            setSelPid(""); setKills(""); setDeaths(""); setAssists(""); setHs(""); setMaps(""); setMvps("");
            showToast("Estatísticas registradas!");
          }}>Registrar</Btn>
        </Card>
      )}

      {tab==="history"&&(
        <div>
          {news.filter(n=>users.find(u=>u.id===n.authorId)?.id===user.id).map(n=>(
            <Card key={n.id} style={{marginBottom:"0.6rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <Pill color={n.type==="poll"?"#818cf8":"#06B6D4"}>{n.type==="poll"?"📊 Enquete":"📰 Notícia"}</Pill>
                <span style={{color:"#e5e7eb",fontSize:"0.83rem",flex:1,fontWeight:600}}>{n.title}</span>
                <span style={{color:"#6b7280",fontSize:"0.72rem"}}>{n.date}</span>
                <Btn onClick={()=>{setNews(p=>p.filter(x=>x.id!==n.id));showToast("Publicação removida.");}} variant="danger" size="sm">Remover</Btn>
              </div>
            </Card>
          ))}
          {news.filter(n=>users.find(u=>u.id===n.authorId)?.id===user.id).length===0&&<Card><p style={{color:"#6b7280",margin:0}}>Você não publicou nada ainda.</p></Card>}
        </div>
      )}
    </div>
  );
}

// ─── PAINEL ADMIN ─────────────────────────────────────────────────────────────
function AdminPanel({user,users,setUsers,teams,setTeams,matches,setMatches,showToast,setPbMatch,isHolder,isCaptain}) {
  const [tab,setTab]=useState(isHolder?"matches":"myteam");
  const myTeam=teams.find(t=>t.id===user.team);
  const [t1,setT1]=useState("");
  const [t2,setT2]=useState("");
  const [mDate,setMDate]=useState("");
  const [newTName,setNewTName]=useState("");
  const [newTLogo,setNewTLogo]=useState("");
  const [newTColor,setNewTColor]=useState("#FF4500");
  const [editName,setEditName]=useState(myTeam?.name||"");
  const [editLogo,setEditLogo]=useState(myTeam?.logo||"");
  const [selScore,setSelScore]=useState({});
  const getTeam=id=>teams.find(t=>t.id===id);

  const tabs=[];
  if(isHolder){tabs.push(["matches","🎯 Partidas"],["teams_mgr","🛡️ Times"],["users_mgr","👥 Usuários"]);}
  if(isCaptain||isHolder){tabs.push(["myteam","✏️ Meu Time"]);}

  return (
    <div className="page-in">
      <SectionTitle icon="⚙️" sub={isHolder?"Gerenciamento completo do campeonato":"Gerenciar seu time"}>Painel de Gerenciamento</SectionTitle>
      <TabBar tabs={tabs} active={tab} onChange={setTab}/>

      {/* PARTIDAS */}
      {tab==="matches"&&isHolder&&(
        <div>
          <Card style={{marginBottom:"1rem"}}>
            <p style={{margin:"0 0 0.9rem",color:"#9ca3af",fontSize:"0.72rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.08em"}}>AGENDAR NOVA PARTIDA</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem",marginBottom:"0.6rem"}}>
              <Select value={t1} onChange={e=>setT1(e.target.value)}><option value="">Time 1...</option>{teams.map(t=><option key={t.id} value={t.id}>{t.logo} {t.name}</option>)}</Select>
              <Select value={t2} onChange={e=>setT2(e.target.value)}><option value="">Time 2...</option>{teams.map(t=><option key={t.id} value={t.id}>{t.logo} {t.name}</option>)}</Select>
            </div>
            <Input placeholder="Data (ex: 2025-07-10)" value={mDate} onChange={e=>setMDate(e.target.value)} style={{marginBottom:"0.8rem"}}/>
            <Btn onClick={()=>{
              if(!t1||!t2||t1===t2) return showToast("Selecione dois times diferentes","error");
              setMatches(p=>[...p,{id:Date.now(),team1:Number(t1),team2:Number(t2),status:"scheduled",score:null,maps:[],champion:null,date:mDate||"TBD",pbActions:[]}]);
              setT1(""); setT2(""); setMDate("");
              showToast("Partida agendada!");
            }}>Agendar Partida</Btn>
          </Card>

          <Card style={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"0.9rem 1.1rem",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              <p style={{margin:0,color:"#9ca3af",fontSize:"0.72rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.08em"}}>GERENCIAR PARTIDAS</p>
            </div>
            {matches.map(m=>{
              const mt1=getTeam(m.team1),mt2=getTeam(m.team2);
              const sc=selScore[m.id]||"";
              return (
                <div key={m.id} style={{padding:"0.8rem 1.1rem",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{color:"#e5e7eb",fontSize:"0.82rem",flex:1,minWidth:120}}>{mt1?.logo}{mt1?.name} <span style={{color:"#6b7280"}}>vs</span> {mt2?.logo}{mt2?.name}</span>
                  <Pill color={m.status==="live"?"#ef4444":m.status==="finished"?"#4ade80":"#6b7280"}>{m.status==="live"?"🔴 Ao vivo":m.status==="finished"?"✅ Encerrado":"📅 Agendado"}</Pill>
                  {m.status==="scheduled"&&<Btn onClick={()=>{setMatches(p=>p.map(x=>x.id===m.id?{...x,status:"live"}:x));showToast("Partida iniciada!");}} variant="green" size="sm">Iniciar</Btn>}
                  {m.status==="live"&&(
                    <>
                      <Input placeholder="2-1" value={sc} onChange={e=>setSelScore(p=>({...p,[m.id]:e.target.value}))} style={{width:60,padding:"4px 7px",fontSize:"0.78rem"}}/>
                      <Select value={m.champion||""} onChange={e=>setMatches(p=>p.map(x=>x.id===m.id?{...x,champion:Number(e.target.value)}:x))} style={{width:130,padding:"4px 7px",fontSize:"0.78rem"}}>
                        <option value="">Vencedor...</option>
                        <option value={m.team1}>{mt1?.name}</option>
                        <option value={m.team2}>{mt2?.name}</option>
                      </Select>
                      <Btn onClick={()=>{
                        if(!m.champion) return showToast("Selecione o vencedor","error");
                        setMatches(p=>p.map(x=>x.id===m.id?{...x,status:"finished",score:sc||"2-1"}:x));
                        setTeams(p=>p.map(t=>t.id===m.champion?{...t,wins:t.wins+1}:t.id===m.team1||t.id===m.team2?{...t,losses:t.losses+1}:t));
                        showToast("Partida encerrada e placar registrado!");
                      }} variant="danger" size="sm">Encerrar</Btn>
                      <Btn onClick={()=>setPbMatch(m)} size="sm">P&B</Btn>
                    </>
                  )}
                  {m.status==="finished"&&<Btn onClick={()=>{setMatches(p=>p.filter(x=>x.id!==m.id));showToast("Partida removida.");}} variant="secondary" size="sm">Remover</Btn>}
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* TIMES */}
      {tab==="teams_mgr"&&isHolder&&(
        <div>
          <Card style={{marginBottom:"1rem"}}>
            <p style={{margin:"0 0 0.9rem",color:"#9ca3af",fontSize:"0.72rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.08em"}}>CRIAR NOVO TIME</p>
            <Input placeholder="Nome do time" value={newTName} onChange={e=>setNewTName(e.target.value)} style={{marginBottom:"0.6rem"}}/>
            <div style={{display:"flex",gap:"0.6rem",marginBottom:"0.8rem"}}>
              <Input placeholder="Logo (emoji)" value={newTLogo} onChange={e=>setNewTLogo(e.target.value)}/>
              <input type="color" value={newTColor} onChange={e=>setNewTColor(e.target.value)} style={{width:44,height:38,border:"none",background:"none",cursor:"pointer",borderRadius:7}}/>
            </div>
            <Btn onClick={()=>{
              if(!newTName.trim()) return;
              setTeams(p=>[...p,{id:Date.now(),name:newTName,logo:newTLogo||"🛡️",color:newTColor,wins:0,losses:0,desc:""}]);
              setNewTName(""); setNewTLogo(""); setNewTColor("#FF4500");
              showToast("Time criado!");
            }}>Criar Time</Btn>
          </Card>
          <Card>
            {teams.map(t=>(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <span style={{fontSize:"1.3rem"}}>{t.logo}</span>
                <span style={{color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,flex:1}}>{t.name}</span>
                <span style={{color:"#4ade80",fontSize:"0.75rem",fontWeight:700}}>{t.wins}V</span>
                <span style={{color:"#f87171",fontSize:"0.75rem",fontWeight:700}}>{t.losses}D</span>
                <Btn onClick={()=>{setTeams(p=>p.filter(x=>x.id!==t.id));showToast("Time removido.");}} variant="danger" size="sm">Remover</Btn>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* USUÁRIOS */}
      {tab==="users_mgr"&&isHolder&&(
        <Card>
          <p style={{margin:"0 0 0.9rem",color:"#9ca3af",fontSize:"0.72rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.08em"}}>TODOS OS USUÁRIOS</p>
          {users.map(u=>{
            const ut=teams.find(t=>t.id===u.team);
            return (
              <div key={u.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",flexWrap:"wrap"}}>
                <Avatar initials={u.avatar} color={ut?.color||"#6b7280"} size={26}/>
                <span style={{flex:1,color:"#e5e7eb",fontSize:"0.82rem",minWidth:80}}>{u.name}</span>
                <Tag role={u.role}/>
                {ut&&<span style={{color:ut.color,fontSize:"0.72rem",fontWeight:700}}>{ut.logo} {ut.name}</span>}
                <Select value={u.role} onChange={e=>{setUsers(p=>p.map(x=>x.id===u.id?{...x,role:e.target.value}:x));showToast("Cargo alterado!");}} style={{width:110,padding:"3px 7px",fontSize:"0.72rem"}}>
                  {Object.entries(ROLE_CFG).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
                </Select>
              </div>
            );
          })}
        </Card>
      )}

      {/* MEU TIME */}
      {tab==="myteam"&&(
        <div>
          {(isCaptain?[myTeam]:teams).filter(Boolean).map(t=>{
            const tPlayers=users.filter(u=>u.team===t.id&&u.role==="player");
            return (
              <Card key={t.id} style={{marginBottom:"1rem",borderColor:`${t.color}33`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"1rem"}}>
                  <div style={{fontSize:"2rem"}}>{t.logo}</div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"1.2rem",color:"#fff"}}>{t.name}</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem",marginBottom:"0.8rem"}}>
                  <Input placeholder="Novo nome" defaultValue={t.name} onChange={e=>setEditName(e.target.value)}/>
                  <Input placeholder="Novo logo (emoji)" defaultValue={t.logo} onChange={e=>setEditLogo(e.target.value)}/>
                </div>
                <Btn onClick={()=>{
                  setTeams(p=>p.map(x=>x.id===t.id?{...x,name:editName||x.name,logo:editLogo||x.logo}:x));
                  showToast("Time atualizado!");
                }} size="sm" style={{marginBottom:"1rem"}}>Salvar Alterações</Btn>
                <Divider/>
                <p style={{margin:"0 0 0.6rem",color:"#9ca3af",fontSize:"0.72rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.08em"}}>JOGADORES ({tPlayers.length})</p>
                {tPlayers.map(p=>(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <Avatar initials={p.avatar} color={t.color} size={26}/>
                    <span style={{color:"#e5e7eb",fontSize:"0.82rem",flex:1}}>{p.name}</span>
                    <Btn onClick={()=>{setUsers(prev=>prev.map(u=>u.id===p.id?{...u,team:null,available:true}:u));showToast(`${p.name} dispensado.`);}} variant="secondary" size="sm">Dispensar</Btn>
                  </div>
                ))}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PERFIL ───────────────────────────────────────────────────────────────────
function ProfilePage({user,users,teams,stats,setUser,setUsers,showToast}) {
  const myTeam=teams.find(t=>t.id===user.team);
  const myStats=stats.find(s=>s.pid===user.id);
  const getTeam=id=>teams.find(t=>t.id===id);
  const [editName,setEditName]=useState(user.name);

  return (
    <div className="page-in">
      <SectionTitle icon="👤" sub="Suas informações e estatísticas">Meu Perfil</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"1rem"}}>
        <Card>
          <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1.2rem"}}>
            <Avatar initials={user.avatar} color={myTeam?.color||"#FF4500"} size={58}/>
            <div>
              <h2 style={{margin:"0 0 4px",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"1.4rem",color:"#fff"}}>{user.name}</h2>
              <Tag role={user.role} size="md"/>
              {myTeam&&<div style={{marginTop:5,color:myTeam.color,fontSize:"0.82rem",fontWeight:700}}>{myTeam.logo} {myTeam.name}</div>}
            </div>
          </div>
          <Divider/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.7rem",marginBottom:"1rem"}}>
            {[{l:"Cargo",v:ROLE_CFG[user.role]?.label},{l:"Time",v:myTeam?.name||"Sem time"},{l:"Membro desde",v:user.joined},{l:"Status",v:user.available?"Disponível":"Em time"}].map(x=>(
              <div key={x.l}>
                <div style={{color:"#6b7280",fontSize:"0.68rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.06em",marginBottom:2}}>{x.l}</div>
                <div style={{color:"#e5e7eb",fontSize:"0.83rem",fontWeight:600}}>{x.v}</div>
              </div>
            ))}
          </div>
          <Btn onClick={()=>{setUser(null);}} variant="danger" size="sm">Sair da Conta</Btn>
        </Card>

        {user.role==="player"&&(
          <Card>
            <p style={{margin:"0 0 0.9rem",color:"#9ca3af",fontSize:"0.72rem",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.08em"}}>MINHAS ESTATÍSTICAS</p>
            {!myStats
              ? <p style={{color:"#6b7280",fontSize:"0.83rem"}}>Nenhuma estatística registrada.</p>
              : (()=>{
                const kd=myStats.deaths>0?(myStats.kills/myStats.deaths).toFixed(2):myStats.kills;
                const hsp=myStats.kills>0?Math.round(myStats.hs/myStats.kills*100):0;
                return (
                  <div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.7rem",marginBottom:"1rem"}}>
                      {[{l:"Kills",v:myStats.kills,c:"#FF4500"},{l:"K/D",v:kd,c:parseFloat(kd)>=1?"#4ade80":"#f87171"},{l:"HS%",v:hsp+"%",c:"#F59E0B"},{l:"Assists",v:myStats.assists,c:"#60A5FA"},{l:"Mapas",v:myStats.maps,c:"#9ca3af"},{l:"MVPs",v:myStats.mvps,c:"#A3E635"}].map(x=>(
                        <div key={x.l} style={{textAlign:"center",background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"0.7rem"}}>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"1.5rem",color:x.c,lineHeight:1}}>{x.v}</div>
                          <div style={{color:"#6b7280",fontSize:"0.65rem",fontWeight:700,marginTop:2}}>{x.l}</div>
                        </div>
                      ))}
                    </div>
                    <StatBar label="Kills" value={myStats.kills} max={100} color="#FF4500"/>
                    <StatBar label="Headshots" value={myStats.hs} max={myStats.kills||1} color="#F59E0B"/>
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
  const [users,   setUsers]   = useState(INIT_USERS);
  const [teams,   setTeams]   = useState(INIT_TEAMS);
  const [matches, setMatches] = useState(INIT_MATCHES);
  const [stats,   setStats]   = useState(INIT_STATS);
  const [news,    setNews]    = useState(INIT_NEWS);
  const [bracket]             = useState(INIT_BRACKET);
  const [user,    setUser]    = useState(null);
  const [page,    setPage]    = useState("home");
  const [pbMatch, setPbMatch] = useState(null);
  const [toast,   setToast]   = useState(null);
  const [mobileNav,setMobileNav] = useState(false);

  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),3000);};

  if(!user) return (<><G/><Login users={users} onLogin={u=>{setUser(u);setPage("home");}}/></>);

  const isHolder     = user.role==="holder";
  const isCaptain    = user.role==="captain";
  const isJournalist = user.role==="journalist";
  const myTeam       = teams.find(t=>t.id===user.team);

  const NAV_ITEMS = [
    {key:"home",   label:"Início",        icon:"🏠"},
    {key:"live",   label:"Ao Vivo",       icon:"🔴"},
    {key:"stats",  label:"Estatísticas",  icon:"📊"},
    {key:"teams",  label:"Times",         icon:"🛡️"},
    {key:"bracket",label:"Chaveamento",   icon:"🏆"},
    {key:"market", label:"Mercado",       icon:"💼"},
    {key:"news",   label:"Notícias",      icon:"📰"},
    ...(isJournalist?[{key:"journalist_panel",label:"Painel Jornalista",icon:"✍️"}]:[]),
    ...((isHolder||isCaptain)?[{key:"admin",label:"Gerenciar",icon:"⚙️"}]:[]),
    {key:"profile",label:"Perfil",        icon:"👤"},
  ];

  const sharedProps = {user,users,setUsers,teams,setTeams,matches,setMatches,stats,setStats,news,setNews,isHolder,isCaptain,isJournalist,myTeam,setPbMatch,showToast};

  const renderPage = () => {
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
      case "profile": return <ProfilePage user={user} users={users} teams={teams} stats={stats} setUser={setUser} setUsers={setUsers} showToast={showToast}/>;
      default:        return <HomePage {...sharedProps}/>;
    }
  };

  const liveCnt = matches.filter(m=>m.status==="live").length;

  return (
    <>
      <G/>

      {/* Toast */}
      {toast&&(
        <div style={{position:"fixed",top:16,right:16,zIndex:99998,background:toast.type==="success"?"rgba(22,163,74,0.95)":"rgba(185,28,28,0.95)",color:"#fff",padding:"10px 17px",borderRadius:8,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:"0.88rem",boxShadow:"0 6px 24px rgba(0,0,0,0.5)",animation:"toastIn .2s ease",display:"flex",alignItems:"center",gap:7,maxWidth:300}}>
          {toast.type==="success"?"✓":"⚠"} {toast.msg}
        </div>
      )}

      {/* Pick & Ban modal */}
      {pbMatch&&(
        <PickBanModal
          match={pbMatch} teams={teams}
          canControl={isHolder||(isCaptain&&(pbMatch.team1===user.team||pbMatch.team2===user.team))}
          onClose={()=>setPbMatch(null)}
          onFinish={(mid,maps,actions)=>{
            setMatches(p=>p.map(m=>m.id===mid?{...m,maps,pbActions:actions}:m));
            setPbMatch(null);
            showToast("Pick & Ban finalizado! Mapas definidos.");
          }}
        />
      )}

      <div style={{display:"flex",minHeight:"100vh"}}>
        {/* Sidebar desktop */}
        <nav style={{width:210,background:"rgba(255,255,255,0.022)",borderRight:"1px solid rgba(255,255,255,0.055)",display:"flex",flexDirection:"column",padding:"1.1rem 0.6rem",flexShrink:0,position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
          {/* Logo */}
          <div style={{padding:"0 0.5rem",marginBottom:"1.4rem"}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#FF4500,#FF6B35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",marginBottom:"0.5rem"}}>🎯</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"0.95rem",color:"#fff",letterSpacing:"0.06em",lineHeight:1.1}}>VÁRZEA CS2</div>
            <div style={{fontSize:"0.58rem",color:"#374151",letterSpacing:"0.1em",marginTop:1}}>CHAMPIONSHIP</div>
          </div>

          {/* Nav */}
          <div style={{flex:1}}>
            {NAV_ITEMS.map(n=>(
              <button key={n.key} onClick={()=>setPage(n.key)}
                style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"8px 10px",borderRadius:8,border:"none",background:page===n.key?"rgba(255,69,0,0.14)":"transparent",color:page===n.key?"#FF4500":"#9ca3af",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:"0.86rem",letterSpacing:"0.04em",marginBottom:1,transition:"all .12s",textAlign:"left",position:"relative"}}>
                <span style={{fontSize:"0.95rem",flexShrink:0}}>{n.icon}</span>
                {n.label}
                {n.key==="live"&&liveCnt>0&&<span style={{marginLeft:"auto",background:"#ef4444",color:"#fff",fontSize:"0.6rem",fontWeight:900,width:16,height:16,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>{liveCnt}</span>}
                {page===n.key&&<div style={{position:"absolute",left:0,top:"20%",bottom:"20%",width:3,background:"#FF4500",borderRadius:"0 3px 3px 0"}}/>}
              </button>
            ))}
          </div>

          {/* User footer */}
          <div style={{borderTop:"1px solid rgba(255,255,255,0.055)",paddingTop:"0.8rem",marginTop:"0.5rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 0.4rem"}}>
              <Avatar initials={user.avatar} color={myTeam?.color||"#FF4500"} size={30}/>
              <div style={{overflow:"hidden"}}>
                <div style={{color:"#e5e7eb",fontSize:"0.76rem",fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div>
                <Tag role={user.role}/>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main style={{flex:1,padding:"1.6rem",overflowY:"auto",maxWidth:"calc(100vw - 210px)",minWidth:0}}>
          {renderPage()}
        </main>
      </div>
    </>
  );
}
