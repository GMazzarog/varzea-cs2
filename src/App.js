import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   VÁRZEA CS2 — CHAMPIONSHIP PLATFORM
   Banco de dados: window.storage (shared=true) — dados compartilhados entre
   todos os usuários em tempo real.
   Tabelas: db:users | db:teams | db:matches | db:stats | db:news | db:bracket
   Sessão:  db:session (shared=false, privado por usuário)
═══════════════════════════════════════════════════════════════════════════ */

/* ─── ESTILOS ────────────────────────────────────────────────────────────── */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:    #06090f;
      --bg1:   #0b1018;
      --bg2:   #101724;
      --bg3:   #16202e;
      --line:  rgba(255,255,255,0.06);
      --line2: rgba(255,255,255,0.11);
      --text:  #e8edf5;
      --sub:   #8899aa;
      --dim:   #3a4a5a;
      --blue:  #3b82f6;
      --blue2: #60a5fa;
      --green: #10b981;
      --red:   #ef4444;
      --yel:   #f59e0b;
      --pur:   #8b5cf6;
      --cyan:  #06b6d4;
      --font:  'DM Sans', sans-serif;
      --mono:  'DM Mono', monospace;
      --disp:  'Syne', sans-serif;
    }
    html, body { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font); }
    * { scrollbar-width: thin; scrollbar-color: rgba(59,130,246,.18) transparent; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(59,130,246,.2); border-radius: 4px; }
    select option { background: #0b1018; }
    input::placeholder, textarea::placeholder { color: var(--dim); }
    @keyframes fadeUp   { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
    @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
    @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:.25} }
    @keyframes spin     { to { transform:rotate(360deg) } }
    @keyframes toast    { from{opacity:0;transform:translateX(14px)} to{opacity:1;transform:translateX(0)} }
    .page   { animation: fadeUp .28s ease both; }
    .fadein { animation: fadeIn .2s ease both; }
    .blink  { animation: blink 1.4s infinite; }
    .spin   { animation: spin .75s linear infinite; }
  `}</style>
);

/* ─── BANCO DE DADOS (window.storage shared) ────────────────────────────── */
const DB = {
  async get(table) {
    try {
      const r = await window.storage.get(`db:${table}`, table !== "session");
      return r ? JSON.parse(r.value) : null;
    } catch { return null; }
  },
  async set(table, value) {
    try {
      await window.storage.set(`db:${table}`, JSON.stringify(value), table !== "session");
      return true;
    } catch { return false; }
  },
  async getSession() {
    try {
      const r = await window.storage.get("db:session", false);
      return r ? JSON.parse(r.value) : null;
    } catch { return null; }
  },
  async setSession(value) {
    try {
      await window.storage.set("db:session", JSON.stringify(value), false);
      return true;
    } catch { return false; }
  },
};

const MAPS = ["Mirage","Inferno","Dust2","Nuke","Ancient","Anubis","Vertigo"];
const ROLES = { holder:"Holder", captain:"Capitão", journalist:"Jornalista", player:"Jogador" };
const ROLE_COLOR = { holder:"#a78bfa", captain:"#fbbf24", journalist:"#34d399", player:"#60a5fa" };

const SEED = {
  users: [{ id:"admin", name:"Admin", role:"holder", team:null, photo:null, password:"holder123", joined: new Date().toISOString().slice(0,7), available:false }],
  teams: [], matches: [], stats: [], news: [],
  bracket: {
    name: "Campeonato",
    rounds: [
      { name:"Quartas de Final", matches:[{id:"q1",t1:null,t2:null,winner:null,score:null},{id:"q2",t1:null,t2:null,winner:null,score:null},{id:"q3",t1:null,t2:null,winner:null,score:null},{id:"q4",t1:null,t2:null,winner:null,score:null}] },
      { name:"Semifinal",        matches:[{id:"s1",t1:null,t2:null,winner:null,score:null},{id:"s2",t1:null,t2:null,winner:null,score:null}] },
      { name:"Grande Final",     matches:[{id:"f1",t1:null,t2:null,winner:null,score:null}] },
    ]
  }
};

/* ─── PRIMITIVOS UI ──────────────────────────────────────────────────────── */
const Avatar = ({ name="?", photo, color="#60a5fa", size=36 }) => {
  const l = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  if (photo) return <img src={photo} alt={name} style={{ width:size, height:size, minWidth:size, borderRadius:"50%", objectFit:"cover", border:`1.5px solid ${color}33`, flexShrink:0 }}/>;
  return <div style={{ width:size, height:size, minWidth:size, borderRadius:"50%", background:`linear-gradient(135deg,${color}28,${color}0d)`, border:`1.5px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--disp)", fontWeight:700, fontSize:Math.max(size*.33,10), color, flexShrink:0 }}>{l}</div>;
};

const TeamLogo = ({ team, size=36 }) => {
  if (!team) return <div style={{ width:size, height:size, minWidth:size, borderRadius:8, background:"var(--bg2)", border:"1px solid var(--line)", flexShrink:0 }}/>;
  if (team.logoUrl) return <img src={team.logoUrl} alt={team.name} style={{ width:size, height:size, minWidth:size, borderRadius:8, objectFit:"cover", border:`1.5px solid ${team.color||"#60a5fa"}30`, flexShrink:0 }}/>;
  const l = team.name?.slice(0,3).toUpperCase()||"???";
  return <div style={{ width:size, height:size, minWidth:size, borderRadius:8, background:`${team.color||"#60a5fa"}14`, border:`1.5px solid ${team.color||"#60a5fa"}28`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--disp)", fontWeight:800, fontSize:Math.max(size*.28,8), color:team.color||"#60a5fa", flexShrink:0 }}>{l}</div>;
};

const Badge = ({ role }) => {
  const c = ROLE_COLOR[role]||"#64748b";
  return <span style={{ background:`${c}14`, color:c, border:`1px solid ${c}26`, fontSize:"0.6rem", padding:"2px 8px", borderRadius:20, fontWeight:600, letterSpacing:".04em", fontFamily:"var(--mono)", whiteSpace:"nowrap" }}>{ROLES[role]||role}</span>;
};

const Pill = ({ children, color="#60a5fa" }) => (
  <span style={{ background:`${color}12`, color, border:`1px solid ${color}24`, fontSize:"0.62rem", padding:"2px 9px", borderRadius:20, fontWeight:500, whiteSpace:"nowrap" }}>{children}</span>
);

const Card = ({ children, style={}, accent }) => (
  <div style={{ background:"var(--bg1)", border:`1px solid ${accent?`${accent}22`:"var(--line)"}`, borderRadius:14, padding:"1.1rem", position:"relative", overflow:"hidden", ...style }}>
    {accent && <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${accent}55,transparent)` }}/>}
    {children}
  </div>
);

const Btn = ({ children, onClick, variant="primary", size="md", disabled=false, full=false, style={} }) => {
  const V = {
    primary:   { bg:"linear-gradient(135deg,#3b82f6,#2563eb)", c:"#fff",       b:"none",                           s:"0 4px 14px rgba(59,130,246,.28)" },
    secondary: { bg:"var(--bg2)",                              c:"var(--sub)",  b:"1px solid var(--line2)",         s:"none" },
    danger:    { bg:"linear-gradient(135deg,#ef4444,#dc2626)", c:"#fff",        b:"none",                           s:"0 4px 14px rgba(239,68,68,.22)" },
    success:   { bg:"linear-gradient(135deg,#10b981,#059669)", c:"#fff",        b:"none",                           s:"0 4px 14px rgba(16,185,129,.22)" },
    ghost:     { bg:"transparent",                             c:"#60a5fa",     b:"1px solid rgba(59,130,246,.28)", s:"none" },
    yellow:    { bg:"linear-gradient(135deg,#f59e0b,#d97706)", c:"#fff",        b:"none",                           s:"0 4px 14px rgba(245,158,11,.22)" },
  };
  const S = { sm:{padding:"5px 12px",fontSize:".72rem"}, md:{padding:"8px 16px",fontSize:".81rem"}, lg:{padding:"11px 26px",fontSize:".9rem"} };
  const v = V[variant]||V.primary;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background:v.bg, color:v.c, border:v.b||"none", ...S[size], borderRadius:9, cursor:disabled?"not-allowed":"pointer", fontFamily:"var(--font)", fontWeight:600, opacity:disabled?.4:1, transition:"opacity .15s", boxShadow:disabled?"none":v.s, width:full?"100%":"auto", whiteSpace:"nowrap", ...style }}>
      {children}
    </button>
  );
};

const PasswordInput = ({ placeholder, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <input type={show?"text":"password"} placeholder={placeholder} value={value} onChange={onChange}
        style={{ background:"var(--bg2)", border:"1px solid var(--line2)", borderRadius:9, padding:"9px 38px 9px 12px", color:"var(--text)", fontSize:".84rem", width:"100%", outline:"none", fontFamily:"var(--font)" }}
        onFocus={e=>e.target.style.borderColor="rgba(59,130,246,.45)"} onBlur={e=>e.target.style.borderColor="var(--line2)"}/>
      <button onClick={()=>setShow(s=>!s)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--sub)", display:"flex", alignItems:"center", padding:2 }}>
        {show
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        }
      </button>
    </div>
  );
};

const TextInput = ({ placeholder, value, onChange, type="text", style={} }) => (
  <input type={type} placeholder={placeholder} value={value} onChange={onChange}
    style={{ background:"var(--bg2)", border:"1px solid var(--line2)", borderRadius:9, padding:"9px 12px", color:"var(--text)", fontSize:".84rem", width:"100%", outline:"none", fontFamily:"var(--font)", ...style }}
    onFocus={e=>e.target.style.borderColor="rgba(59,130,246,.45)"} onBlur={e=>e.target.style.borderColor="var(--line2)"}/>
);

const Textarea = ({ placeholder, value, onChange, rows=4 }) => (
  <textarea placeholder={placeholder} value={value} onChange={onChange} rows={rows}
    style={{ background:"var(--bg2)", border:"1px solid var(--line2)", borderRadius:9, padding:"9px 12px", color:"var(--text)", fontSize:".84rem", width:"100%", outline:"none", fontFamily:"var(--font)", lineHeight:1.6, resize:"vertical" }}/>
);

const Select = ({ value, onChange, children, style={} }) => (
  <select value={value} onChange={onChange}
    style={{ background:"#0b1018", border:"1px solid var(--line2)", borderRadius:9, padding:"9px 12px", color:"var(--text)", fontSize:".84rem", width:"100%", outline:"none", fontFamily:"var(--font)", ...style }}>
    {children}
  </select>
);

const Field = ({ label, children, style={} }) => (
  <div style={{ marginBottom:".85rem", ...style }}>
    {label && <label style={{ display:"block", color:"var(--sub)", fontSize:".68rem", fontWeight:600, letterSpacing:".06em", textTransform:"uppercase", marginBottom:5 }}>{label}</label>}
    {children}
  </div>
);

const Divider = ({ label }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, margin:"1rem 0" }}>
    {label && <span style={{ color:"var(--sub)", fontSize:".64rem", fontWeight:600, letterSpacing:".08em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{label}</span>}
    <div style={{ flex:1, height:1, background:"var(--line)" }}/>
  </div>
);

const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom:"1.5rem" }}>
    <h2 style={{ fontFamily:"var(--disp)", fontWeight:800, fontSize:"1.35rem", color:"var(--text)", letterSpacing:"-.01em" }}>{children}</h2>
    {sub && <p style={{ color:"var(--sub)", fontSize:".77rem", marginTop:3 }}>{sub}</p>}
  </div>
);

const TabBar = ({ tabs, active, onChange }) => (
  <div style={{ display:"flex", gap:3, marginBottom:"1.3rem", flexWrap:"wrap", background:"var(--bg1)", padding:4, borderRadius:11, border:"1px solid var(--line)", width:"fit-content" }}>
    {tabs.map(([k,l]) => (
      <button key={k} onClick={() => onChange(k)}
        style={{ background:active===k?"var(--bg2)":"transparent", color:active===k?"var(--text)":"var(--sub)", border:active===k?"1px solid var(--line2)":"1px solid transparent", padding:"6px 13px", borderRadius:8, cursor:"pointer", fontFamily:"var(--font)", fontWeight:500, fontSize:".78rem", transition:"all .15s", whiteSpace:"nowrap" }}>
        {l}
      </button>
    ))}
  </div>
);

const StatBar = ({ label, value, max, color="#60a5fa" }) => (
  <div style={{ marginBottom:9 }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
      <span style={{ color:"var(--sub)", fontSize:".71rem" }}>{label}</span>
      <span style={{ color:"var(--text)", fontSize:".71rem", fontFamily:"var(--mono)", fontWeight:500 }}>{value}</span>
    </div>
    <div style={{ height:3, borderRadius:3, background:"var(--bg2)" }}>
      <div style={{ height:"100%", width:`${Math.min((parseFloat(value)/max)*100,100)}%`, background:color, borderRadius:3, transition:"width .6s ease" }}/>
    </div>
  </div>
);

const PhotoUpload = ({ current, onUpload, size=80, circle=false, label="Upload" }) => {
  const ref = useRef();
  const handle = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onUpload(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
      <div onClick={() => ref.current.click()}
        style={{ width:size, height:size, borderRadius:circle?"50%":10, background:"var(--bg2)", border:"1.5px dashed var(--line2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden", flexShrink:0 }}>
        {current
          ? <img src={current} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          : <div style={{ textAlign:"center", color:"var(--sub)", padding:4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ display:"block", margin:"0 auto 3px" }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <div style={{ fontSize:".6rem", fontWeight:600 }}>{label}</div>
            </div>
        }
      </div>
      {current && <Btn onClick={() => ref.current.click()} variant="secondary" size="sm">Trocar</Btn>}
      <input ref={ref} type="file" accept="image/*" onChange={handle} style={{ display:"none" }}/>
    </div>
  );
};

const Empty = ({ message }) => (
  <Card style={{ textAlign:"center", padding:"2rem" }}>
    <p style={{ color:"var(--dim)", fontSize:".82rem" }}>{message}</p>
  </Card>
);

const Spinner = ({ size=28 }) => (
  <div className="spin" style={{ width:size, height:size, border:"2px solid var(--line2)", borderTopColor:"var(--blue)", borderRadius:"50%", flexShrink:0 }}/>
);

const Loading = () => (
  <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--bg)", gap:14 }}>
    <Spinner size={32}/>
    <p style={{ color:"var(--sub)", fontSize:".78rem", fontFamily:"var(--mono)" }}>conectando ao banco de dados...</p>
  </div>
);

const ErrMsg = ({ msg }) => (
  <p style={{ color:"#f87171", fontSize:".76rem", marginBottom:"1rem", display:"flex", alignItems:"center", gap:5 }}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    {msg}
  </p>
);

/* ─── HOOK: useSaving ────────────────────────────────────────────────────── */
function useSaving(data, table) {
  const [saving, setSaving] = useState(false);
  const timer = useRef(null);
  const first = useRef(true);
  useEffect(() => {
    if (data === null || data === undefined) return;
    if (first.current) { first.current = false; return; }
    setSaving(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await DB.set(table, data);
      setSaving(false);
    }, 700);
    return () => clearTimeout(timer.current);
  }, [data, table]);
  return saving;
}

/* ─── AUTH ───────────────────────────────────────────────────────────────── */
function AuthPage({ users, onLogin, onRegister }) {
  const [tab, setTab]     = useState("login");
  const [name, setName]   = useState("");
  const [pass, setPass]   = useState("");
  const [pass2, setPass2] = useState("");
  const [photo, setPhoto] = useState(null);
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const login = () => {
    setLoading(true);
    setTimeout(() => {
      const u = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === pass);
      if (u) { onLogin(u, remember); setErr(""); }
      else setErr("Usuário ou senha incorretos.");
      setLoading(false);
    }, 500);
  };

  const register = () => {
    if (!name.trim() || name.length < 3) return setErr("Nome deve ter ao menos 3 caracteres.");
    if (pass.length < 4) return setErr("Senha deve ter ao menos 4 caracteres.");
    if (pass !== pass2)  return setErr("As senhas não coincidem.");
    if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) return setErr("Este nome já está em uso.");
    onRegister({ id:`u${Date.now()}`, name:name.trim(), role:"player", team:null, photo:photo||null, password:pass, joined:new Date().toISOString().slice(0,7), available:false });
    setErr("");
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"var(--bg)", overflow:"hidden" }}>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 60% at 30% 50%,rgba(59,130,246,.06),transparent)", pointerEvents:"none" }}/>
        <div style={{ width:"min(420px,100%)", position:"relative", zIndex:1, animation:"fadeUp .4s ease both" }}>
          <div style={{ marginBottom:"2.5rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1rem" }}>
              <div style={{ width:42, height:42, borderRadius:12, background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(59,130,246,.28)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <div>
                <div style={{ fontFamily:"var(--disp)", fontWeight:800, fontSize:"1.2rem", color:"var(--text)" }}>Várzea CS2</div>
                <div style={{ fontSize:".68rem", color:"var(--sub)", fontFamily:"var(--mono)" }}>Championship Platform</div>
              </div>
            </div>
            <h1 style={{ fontFamily:"var(--disp)", fontWeight:800, fontSize:"2rem", color:"var(--text)", lineHeight:1.2, letterSpacing:"-.02em" }}>
              {tab === "login" ? <>Bem-vindo<br/>de volta.</> : <>Crie sua<br/>conta.</>}
            </h1>
          </div>

          <div style={{ display:"flex", background:"var(--bg1)", borderRadius:11, padding:4, marginBottom:"1.5rem", border:"1px solid var(--line)" }}>
            {[["login","Entrar"],["register","Criar Conta"]].map(([k,l]) => (
              <button key={k} onClick={() => { setTab(k); setErr(""); }}
                style={{ flex:1, background:tab===k?"var(--bg2)":"transparent", color:tab===k?"var(--text)":"var(--sub)", border:tab===k?"1px solid var(--line2)":"1px solid transparent", padding:"9px", borderRadius:8, cursor:"pointer", fontFamily:"var(--font)", fontWeight:600, fontSize:".84rem", transition:"all .15s" }}>
                {l}
              </button>
            ))}
          </div>

          {tab === "login" ? (
            <div className="fadein">
              <Field label="Usuário"><TextInput placeholder="Seu nome de usuário" value={name} onChange={e=>setName(e.target.value)}/></Field>
              <Field label="Senha"><PasswordInput placeholder="Sua senha" value={pass} onChange={e=>setPass(e.target.value)}/></Field>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:"1.2rem" }}>
                <input type="checkbox" id="rem" checked={remember} onChange={e=>setRemember(e.target.checked)} style={{ accentColor:"var(--blue)", width:15, height:15, cursor:"pointer" }}/>
                <label htmlFor="rem" style={{ color:"var(--sub)", fontSize:".78rem", cursor:"pointer", userSelect:"none" }}>Manter conectado</label>
              </div>
              {err && <ErrMsg msg={err}/>}
              <Btn onClick={login} disabled={loading} full size="lg">{loading ? "Verificando..." : "Entrar"}</Btn>
            </div>
          ) : (
            <div className="fadein">
              <div style={{ display:"flex", justifyContent:"center", marginBottom:"1.2rem" }}>
                <PhotoUpload current={photo} onUpload={setPhoto} size={72} circle label="Foto"/>
              </div>
              <Field label="Nome de Usuário"><TextInput placeholder="Escolha um nome único" value={name} onChange={e=>setName(e.target.value)}/></Field>
              <Field label="Senha"><PasswordInput placeholder="Mínimo 4 caracteres" value={pass} onChange={e=>setPass(e.target.value)}/></Field>
              <Field label="Confirmar Senha"><PasswordInput placeholder="Repita a senha" value={pass2} onChange={e=>setPass2(e.target.value)}/></Field>
              {err && <ErrMsg msg={err}/>}
              <Btn onClick={register} variant="success" full size="lg">Criar Conta</Btn>
              <p style={{ textAlign:"center", color:"var(--sub)", fontSize:".72rem", marginTop:".8rem" }}>Novas contas entram como Jogador</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ width:"42%", background:"var(--bg1)", borderLeft:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-20%", right:"-10%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(59,130,246,.07),transparent)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:"-10%", left:"-10%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,.05),transparent)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:1, maxWidth:280 }}>
          <div style={{ fontFamily:"var(--disp)", fontWeight:800, fontSize:"3.5rem", lineHeight:1, color:"rgba(255,255,255,.035)", letterSpacing:"-.03em", marginBottom:"2rem", userSelect:"none" }}>CS2</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              ["Banco de dados compartilhado","Todos os dados sincronizados em tempo real"],
              ["Estatísticas detalhadas","K/D, HS%, ADR, MVPs e rankings ao vivo"],
              ["Pick & Ban interativo","Sistema completo de veto de mapas BO3"],
              ["Chaveamento automático","Brackets atualizados conforme resultados"],
              ["Mercado de jogadores","Contratações e transferências entre times"],
            ].map(([t,s]) => (
              <div key={t} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"10px 12px", background:"var(--bg)", borderRadius:10, border:"1px solid var(--line)" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--blue)", marginTop:5, flexShrink:0 }}/>
                <div>
                  <div style={{ fontSize:".8rem", fontWeight:600, color:"var(--text)", marginBottom:2 }}>{t}</div>
                  <div style={{ fontSize:".7rem", color:"var(--sub)" }}>{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── PICK & BAN ─────────────────────────────────────────────────────────── */
function PickBanModal({ match, teams, canControl, onClose, onFinish }) {
  const t1 = teams.find(t=>t.id===match.team1);
  const t2 = teams.find(t=>t.id===match.team2);
  const SEQ = ["ban","ban","ban","ban","ban","ban","pick","pick"];
  const [actions, setActions] = useState(match.pbActions||[]);
  const step = actions.length;
  const done = step >= SEQ.length;
  const curType = !done ? SEQ[step] : null;
  const curTeam = !done ? (step%2===0?t1:t2) : null;
  const banned  = actions.filter(a=>a.type==="ban").map(a=>a.map);
  const picked  = actions.filter(a=>a.type==="pick").map(a=>a.map);
  const decider = done ? MAPS.find(m=>!banned.includes(m)&&!picked.includes(m)) : null;

  const act = map => {
    if (!canControl||done||banned.includes(map)||picked.includes(map)) return;
    const nxt = [...actions,{map,type:curType,team:curTeam?.id}];
    setActions(nxt);
    if (nxt.length >= SEQ.length) {
      const fp  = nxt.filter(a=>a.type==="pick").map(a=>a.map);
      const dec = MAPS.find(m=>!nxt.filter(a=>a.type==="ban").map(a=>a.map).includes(m)&&!fp.includes(m));
      onFinish(match.id, [...fp,dec].filter(Boolean), nxt);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.82)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", backdropFilter:"blur(8px)" }}>
      <div style={{ width:"min(700px,100%)", background:"var(--bg1)", border:"1px solid var(--line2)", borderRadius:16, padding:"1.6rem", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 60px rgba(0,0,0,.6)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.3rem" }}>
          <div>
            <h2 style={{ fontFamily:"var(--disp)", fontWeight:800, fontSize:"1.2rem", color:"var(--text)" }}>Pick & Ban</h2>
            <p style={{ color:"var(--sub)", fontSize:".74rem", marginTop:2, fontFamily:"var(--mono)" }}>{t1?.name||"Time 1"} vs {t2?.name||"Time 2"} — BO3</p>
          </div>
          <Btn onClick={onClose} variant="secondary" size="sm">Fechar</Btn>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".8rem", marginBottom:"1.2rem" }}>
          {[t1,t2].map((t,i) => (
            <div key={i} style={{ background:!done&&curTeam?.id===t?.id?"rgba(59,130,246,.07)":"var(--bg2)", border:`1px solid ${!done&&curTeam?.id===t?.id?"rgba(59,130,246,.32)":"var(--line)"}`, borderRadius:10, padding:"10px 13px", display:"flex", alignItems:"center", gap:10, transition:"all .2s" }}>
              <TeamLogo team={t} size={30}/>
              <div>
                <div style={{ color:"var(--text)", fontWeight:600, fontSize:".85rem" }}>{t?.name||"A definir"}</div>
                {!done&&curTeam?.id===t?.id&&<div style={{ color:"#60a5fa", fontSize:".65rem", marginTop:1 }}>{curType==="ban"?"Banindo...":"Escolhendo..."}</div>}
              </div>
            </div>
          ))}
        </div>
        {!done&&curTeam&&<div style={{ background:"rgba(59,130,246,.05)", border:"1px solid rgba(59,130,246,.16)", borderRadius:9, padding:"9px 13px", marginBottom:"1.1rem", fontSize:".81rem", color:"#93c5fd" }}>
          Vez de <b style={{ color:"var(--text)" }}>{curTeam.name}</b> — {curType==="ban"?"banir":"escolher"} um mapa
          {!canControl&&<span style={{ color:"var(--sub)", marginLeft:6 }}>(visualização)</span>}
        </div>}
        {done&&<div style={{ background:"rgba(16,185,129,.05)", border:"1px solid rgba(16,185,129,.16)", borderRadius:9, padding:"9px 13px", marginBottom:"1.1rem" }}>
          <p style={{ color:"#6ee7b7", fontSize:".81rem" }}>Concluído! Mapas: {[...picked,decider].filter(Boolean).join(" → ")}</p>
        </div>}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))", gap:7, marginBottom:"1.1rem" }}>
          {MAPS.map(map => {
            const a = actions.find(x=>x.map===map);
            const isBanned=a?.type==="ban", isPicked=a?.type==="pick", isDecider=done&&map===decider;
            const tc = a?.team===t1?.id ? t1?.color||"#3b82f6" : t2?.color||"#8b5cf6";
            return (
              <div key={map} onClick={()=>!a&&canControl&&!done&&act(map)}
                style={{ border:`1.5px solid ${isBanned?"rgba(239,68,68,.28)":isPicked?`${tc}40`:isDecider?"rgba(245,158,11,.32)":"var(--line)"}`, borderRadius:10, padding:"11px 7px", textAlign:"center", cursor:!a&&canControl&&!done?"pointer":"default", opacity:isBanned?.38:1, background:isBanned?"rgba(239,68,68,.04)":isPicked?`${tc}09`:isDecider?"rgba(245,158,11,.04)":"var(--bg2)", transition:"all .15s" }}>
                <div style={{ fontWeight:700, fontSize:".78rem", color:isBanned?"var(--sub)":isPicked?tc:isDecider?"#f59e0b":"var(--text)", marginBottom:3 }}>{map}</div>
                {isBanned&&<div style={{ color:"#ef4444", fontSize:".58rem", fontWeight:600 }}>Banido</div>}
                {isPicked&&<div style={{ color:tc, fontSize:".58rem", fontWeight:600 }}>Pick</div>}
                {isDecider&&<div style={{ color:"#f59e0b", fontSize:".58rem", fontWeight:600 }}>Decider</div>}
              </div>
            );
          })}
        </div>
        {actions.length>0&&<div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
          {actions.map((a,i)=>(
            <span key={i} style={{ padding:"2px 9px", borderRadius:20, fontSize:".65rem", fontFamily:"var(--mono)", background:a.type==="ban"?"rgba(239,68,68,.08)":"rgba(16,185,129,.08)", color:a.type==="ban"?"#f87171":"#6ee7b7", border:`1px solid ${a.type==="ban"?"rgba(239,68,68,.16)":"rgba(16,185,129,.16)"}` }}>
              {a.type==="ban"?"–":"+"} {a.map}
            </span>
          ))}
        </div>}
      </div>
    </div>
  );
}

/* ─── PAGES ──────────────────────────────────────────────────────────────── */
function HomePage({ user, users, teams, matches, setPbMatch, isHolder, isCaptain }) {
  const getTeam = id => teams.find(t=>t.id===id);
  const myTeam  = teams.find(t=>t.id===user.team);
  const live     = matches.filter(m=>m.status==="live");
  const upcoming = matches.filter(m=>m.status==="scheduled");
  const finished = matches.filter(m=>m.status==="finished");
  return (
    <div className="page">
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"1.4rem", background:"var(--bg1)", borderRadius:14, border:"1px solid var(--line)", marginBottom:"1.2rem", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#3b82f6,#8b5cf6,transparent)" }}/>
        <Avatar name={user.name} photo={user.photo} color={myTeam?.color||"#60a5fa"} size={50}/>
        <div style={{ flex:1 }}>
          <p style={{ color:"var(--sub)", fontSize:".68rem", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em", marginBottom:3 }}>Bem-vindo de volta</p>
          <h1 style={{ fontFamily:"var(--disp)", fontWeight:800, fontSize:"1.5rem", color:"var(--text)", letterSpacing:"-.01em", marginBottom:5 }}>{user.name}</h1>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <Badge role={user.role}/>
            {myTeam&&<Pill color={myTeam.color||"#60a5fa"}>{myTeam.name}</Pill>}
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:".7rem", marginBottom:"1.3rem" }}>
        {[{l:"Times",v:teams.length,c:"#60a5fa"},{l:"Jogadores",v:users.filter(u=>u.role==="player").length,c:"#a78bfa"},{l:"Partidas",v:matches.length,c:"#34d399"},{l:"Ao Vivo",v:live.length,c:"#f87171"}].map(c=>(
          <Card key={c.l} style={{ padding:".9rem", textAlign:"center" }}>
            <div style={{ fontFamily:"var(--mono)", fontWeight:700, fontSize:"1.7rem", color:c.c, lineHeight:1 }}>{c.v}</div>
            <div style={{ color:"var(--sub)", fontSize:".64rem", fontWeight:600, marginTop:4, textTransform:"uppercase", letterSpacing:".05em" }}>{c.l}</div>
          </Card>
        ))}
      </div>

      {live.length>0&&<div style={{ marginBottom:"1.3rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:".7rem" }}>
          <span className="blink" style={{ width:7, height:7, borderRadius:"50%", background:"#f87171", boxShadow:"0 0 6px #f87171" }}/>
          <span style={{ color:"#f87171", fontSize:".7rem", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase" }}>Ao Vivo</span>
        </div>
        {live.map(m=>{
          const mt1=getTeam(m.team1),mt2=getTeam(m.team2);
          return (
            <Card key={m.id} style={{ marginBottom:".6rem" }} accent="#f87171">
              <div style={{ display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
                <TeamLogo team={mt1} size={30}/><span style={{ fontWeight:700, color:"var(--text)", fontSize:".88rem" }}>{mt1?.name}</span>
                <div style={{ flex:1, textAlign:"center" }}><span style={{ background:"rgba(248,113,113,.1)", color:"#f87171", padding:"4px 16px", borderRadius:8, fontWeight:800, fontSize:"1rem", border:"1px solid rgba(248,113,113,.17)", fontFamily:"var(--mono)" }}>{m.score||"—"}</span></div>
                <span style={{ fontWeight:700, color:"var(--text)", fontSize:".88rem" }}>{mt2?.name}</span><TeamLogo team={mt2} size={30}/>
                {(isHolder||isCaptain)&&<Btn onClick={()=>setPbMatch(m)} size="sm" variant="ghost">Pick & Ban</Btn>}
              </div>
            </Card>
          );
        })}
      </div>}

      <div style={{ marginBottom:"1.3rem" }}>
        <p style={{ color:"var(--sub)", fontSize:".7rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:".7rem" }}>Próximas Partidas</p>
        {upcoming.length===0&&<Empty message="Nenhuma partida agendada."/>}
        {upcoming.map(m=>{
          const mt1=getTeam(m.team1),mt2=getTeam(m.team2);
          return (
            <Card key={m.id} style={{ display:"flex", alignItems:"center", gap:".8rem", flexWrap:"wrap", marginBottom:".5rem" }}>
              <TeamLogo team={mt1} size={26}/><span style={{ fontWeight:600, color:"var(--text)", fontSize:".83rem" }}>{mt1?.name}</span>
              <span style={{ color:"var(--dim)", fontWeight:700 }}>vs</span>
              <span style={{ fontWeight:600, color:"var(--text)", fontSize:".83rem" }}>{mt2?.name}</span><TeamLogo team={mt2} size={26}/>
              <div style={{ marginLeft:"auto", display:"flex", gap:7, alignItems:"center" }}>
                <Pill color="#475569">{m.date}</Pill>
                {isHolder&&<Btn onClick={()=>setPbMatch(m)} size="sm" variant="ghost">P&B</Btn>}
              </div>
            </Card>
          );
        })}
      </div>

      <div>
        <p style={{ color:"var(--sub)", fontSize:".7rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:".7rem" }}>Últimos Resultados</p>
        {finished.length===0&&<Empty message="Nenhum resultado ainda."/>}
        {finished.slice(-5).reverse().map(m=>{
          const mt1=getTeam(m.team1),mt2=getTeam(m.team2),w=getTeam(m.champion);
          return (
            <Card key={m.id} style={{ display:"flex", alignItems:"center", gap:".8rem", flexWrap:"wrap", marginBottom:".4rem", opacity:.8 }}>
              <TeamLogo team={mt1} size={22}/><span style={{ fontWeight:600, color:m.champion===m.team1?"var(--text)":"var(--dim)", fontSize:".82rem" }}>{mt1?.name}</span>
              <Pill color="#334155">{m.score}</Pill>
              <span style={{ fontWeight:600, color:m.champion===m.team2?"var(--text)":"var(--dim)", fontSize:".82rem" }}>{mt2?.name}</span><TeamLogo team={mt2} size={22}/>
              <span style={{ marginLeft:"auto", color:"var(--blue2)", fontSize:".7rem", fontWeight:600 }}>{w?.name} venceu</span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function LivePage({ matches, teams, isHolder, setPbMatch, setMatches, showToast }) {
  const getTeam = id => teams.find(t=>t.id===id);
  const live = matches.filter(m=>m.status==="live");
  const fin  = matches.filter(m=>m.status==="finished");
  return (
    <div className="page">
      <SectionTitle sub="Partidas em andamento e resultados recentes">Ao Vivo & Resultados</SectionTitle>
      {live.length===0&&<Empty message="Nenhuma partida ao vivo."/>}
      {live.map(m=>{
        const mt1=getTeam(m.team1),mt2=getTeam(m.team2);
        const [s1,s2]=(m.score||"0-0").split("-").map(Number);
        return (
          <Card key={m.id} style={{ marginBottom:"1.1rem" }} accent="#f87171">
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"1rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, color:"#f87171", fontSize:".68rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".08em" }}>
                <span className="blink" style={{ width:6, height:6, borderRadius:"50%", background:"#f87171", boxShadow:"0 0 6px #f87171" }}/>Ao Vivo
              </div>
              <span style={{ color:"var(--sub)", fontSize:".72rem", fontFamily:"var(--mono)" }}>{m.date}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"2rem", padding:".8rem 0", flexWrap:"wrap" }}>
              <div style={{ textAlign:"center" }}><TeamLogo team={mt1} size={44}/><div style={{ fontWeight:700, fontSize:".9rem", color:"var(--text)", marginTop:6 }}>{mt1?.name}</div></div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"var(--mono)", fontWeight:700, fontSize:"2.4rem", color:"var(--text)", lineHeight:1 }}>{s1}<span style={{ color:"var(--dim)", margin:"0 5px" }}>:</span>{s2}</div>
                <div style={{ color:"var(--sub)", fontSize:".62rem", marginTop:3, textTransform:"uppercase", letterSpacing:".06em" }}>placar de mapas</div>
              </div>
              <div style={{ textAlign:"center" }}><TeamLogo team={mt2} size={44}/><div style={{ fontWeight:700, fontSize:".9rem", color:"var(--text)", marginTop:6 }}>{mt2?.name}</div></div>
            </div>
            {m.maps?.length>0&&<div style={{ display:"flex", gap:5, justifyContent:"center", flexWrap:"wrap", margin:".8rem 0" }}>{m.maps.map((mp,i)=><Pill key={i} color="#475569">{mp}</Pill>)}</div>}
            {isHolder&&<div style={{ display:"flex", gap:6, justifyContent:"center", marginTop:".8rem", flexWrap:"wrap" }}>
              <Btn onClick={()=>setPbMatch(m)} size="sm">Pick & Ban</Btn>
              <Btn onClick={()=>{setMatches(p=>p.map(x=>x.id===m.id?{...x,status:"finished",champion:x.team1,score:"2-1"}:x));showToast("Partida encerrada!");}} variant="danger" size="sm">Encerrar</Btn>
            </div>}
          </Card>
        );
      })}
      <Divider label="Resultados Recentes"/>
      {fin.length===0&&<Empty message="Nenhum resultado registrado."/>}
      {fin.map(m=>{
        const mt1=getTeam(m.team1),mt2=getTeam(m.team2),w=getTeam(m.champion);
        return (
          <Card key={m.id} style={{ marginBottom:".5rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:".8rem", flexWrap:"wrap" }}>
              <TeamLogo team={mt1} size={24}/><span style={{ fontWeight:600, color:m.champion===m.team1?"var(--text)":"var(--dim)", fontSize:".83rem" }}>{mt1?.name}</span>
              <Pill color="#334155">{m.score}</Pill>
              <span style={{ fontWeight:600, color:m.champion===m.team2?"var(--text)":"var(--dim)", fontSize:".83rem" }}>{mt2?.name}</span><TeamLogo team={mt2} size={24}/>
              <span style={{ marginLeft:"auto", color:"var(--blue2)", fontSize:".7rem", fontWeight:600 }}>{w?.name} venceu</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function StatsPage({ stats, users, teams }) {
  const [tab, setTab] = useState("kills");
  const getTeam = id => teams.find(t=>t.id===id);
  const getUser = id => users.find(u=>u.id===id);
  const enriched = stats.map(s=>{
    const p=getUser(s.pid), t=p?getTeam(p.team):null;
    return { ...s, player:p, team:t, kd:s.deaths>0?(s.kills/s.deaths).toFixed(2):s.kills.toString(), hsp:s.kills>0?Math.round(s.hs/s.kills*100):0, adr:s.maps>0?Math.round((s.kills*42+s.assists*10)/s.maps):0 };
  });
  const sorted = [...enriched].sort((a,b)=>parseFloat(b[tab])-parseFloat(a[tab]));
  const COLS = [{k:"kills",l:"Kills"},{k:"kd",l:"K/D"},{k:"hsp",l:"HS%"},{k:"assists",l:"Assists"},{k:"adr",l:"ADR"},{k:"mvps",l:"MVPs"}];
  const maxK  = Math.max(...enriched.map(s=>s.kills),1);
  const maxKD = Math.max(...enriched.map(s=>parseFloat(s.kd)),1);
  return (
    <div className="page">
      <SectionTitle sub="Rankings individuais do campeonato">Estatísticas</SectionTitle>
      <TabBar tabs={COLS.map(c=>[c.k,c.l])} active={tab} onChange={setTab}/>
      {sorted.length===0&&<Empty message="Nenhuma estatística registrada."/>}
      {sorted.length>0&&<>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))", gap:".8rem", marginBottom:"1.3rem" }}>
          {sorted.slice(0,3).map((s,i)=>{
            const colors=["#f59e0b","#94a3b8","#b45309"];
            return (
              <Card key={s.pid} style={{ borderColor:`${colors[i]}20` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:".8rem" }}>
                  <Avatar name={s.player?.name||"?"} photo={s.player?.photo} color={s.team?.color||"#60a5fa"} size={34}/>
                  <span style={{ color:colors[i], fontFamily:"var(--mono)", fontWeight:700, fontSize:".78rem" }}>#{i+1}</span>
                </div>
                <div style={{ fontWeight:700, fontSize:".86rem", color:"var(--text)", marginBottom:2 }}>{s.player?.name}</div>
                <div style={{ color:s.team?.color||"var(--sub)", fontSize:".68rem", marginBottom:".8rem" }}>{s.team?.name||"—"}</div>
                <div style={{ fontFamily:"var(--mono)", fontWeight:700, fontSize:"2rem", color:colors[i], lineHeight:1 }}>{s[tab]}{tab==="hsp"?"%":""}</div>
                <div style={{ color:"var(--sub)", fontSize:".62rem", marginTop:2, textTransform:"uppercase", letterSpacing:".05em" }}>{COLS.find(c=>c.k===tab)?.l}</div>
              </Card>
            );
          })}
        </div>
        <Card style={{ padding:0, overflow:"hidden", marginBottom:"1.2rem" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:520 }}>
              <thead><tr style={{ background:"rgba(255,255,255,.02)", borderBottom:"1px solid var(--line)" }}>
                {["#","Jogador","Time","K","K/D","HS%","Ast","ADR","MVP"].map(h=>(
                  <th key={h} style={{ padding:"9px 11px", textAlign:"left", color:"var(--sub)", fontSize:".67rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {sorted.map((s,i)=>(
                  <tr key={s.pid} style={{ borderBottom:"1px solid var(--line)" }}>
                    <td style={{ padding:"8px 11px", color:i===0?"#f59e0b":i<3?"#64748b":"var(--dim)", fontFamily:"var(--mono)", fontWeight:700, fontSize:".78rem" }}>{i+1}</td>
                    <td style={{ padding:"8px 11px" }}><div style={{ display:"flex", alignItems:"center", gap:7 }}><Avatar name={s.player?.name||"?"} photo={s.player?.photo} color={s.team?.color||"#60a5fa"} size={24}/><span style={{ color:"var(--text)", fontWeight:600, fontSize:".81rem" }}>{s.player?.name}</span></div></td>
                    <td style={{ padding:"8px 11px", color:s.team?.color||"var(--sub)", fontSize:".74rem", fontWeight:600 }}>{s.team?.name||"—"}</td>
                    <td style={{ padding:"8px 11px", color:"var(--text)", fontFamily:"var(--mono)", fontWeight:700, fontSize:".81rem" }}>{s.kills}</td>
                    <td style={{ padding:"8px 11px", color:parseFloat(s.kd)>=1?"#4ade80":"#f87171", fontFamily:"var(--mono)", fontWeight:700, fontSize:".81rem" }}>{s.kd}</td>
                    <td style={{ padding:"8px 11px", fontFamily:"var(--mono)", fontSize:".76rem", color:"var(--text)" }}>{s.hsp}%</td>
                    <td style={{ padding:"8px 11px", fontFamily:"var(--mono)", fontSize:".76rem", color:"var(--sub)" }}>{s.assists}</td>
                    <td style={{ padding:"8px 11px", fontFamily:"var(--mono)", fontSize:".76rem", color:"var(--sub)" }}>{s.adr}</td>
                    <td style={{ padding:"8px 11px", fontFamily:"var(--mono)", fontWeight:700, fontSize:".76rem", color:s.mvps>0?"#f59e0b":"var(--dim)" }}>{s.mvps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:"1rem" }}>
          <Card><p style={{ margin:"0 0 .8rem", color:"var(--sub)", fontSize:".68rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em" }}>Top Kills</p>{[...enriched].sort((a,b)=>b.kills-a.kills).slice(0,5).map(s=><StatBar key={s.pid} label={s.player?.name||"?"} value={s.kills} max={maxK} color={s.team?.color||"#60a5fa"}/>)}</Card>
          <Card><p style={{ margin:"0 0 .8rem", color:"var(--sub)", fontSize:".68rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em" }}>Top K/D</p>{[...enriched].sort((a,b)=>parseFloat(b.kd)-parseFloat(a.kd)).slice(0,5).map(s=><StatBar key={s.pid} label={s.player?.name||"?"} value={s.kd} max={maxKD} color={parseFloat(s.kd)>=1?"#4ade80":"#f87171"}/>)}</Card>
        </div>
      </>}
    </div>
  );
}

function TeamProfile({ selected, sel, players, cap, tm, wins, losses, getTeam, setTeams, isHolder, showToast, onBack }) {
  const [editName,  setEditName]  = useState(selected.name);
  const [editColor, setEditColor] = useState(selected.color||"#60a5fa");
  const [editing,   setEditing]   = useState(false);

  const saveTeam = () => {
    setTeams(p=>p.map(t=>t.id===sel?{...t,name:editName,color:editColor}:t));
    setEditing(false); showToast("Time atualizado!");
  };

  return (
    <div className="page">
      <Btn onClick={onBack} variant="secondary" size="sm" style={{ marginBottom:"1rem" }}>← Voltar</Btn>

      <Card style={{ marginBottom:"1.2rem", padding:"1.6rem" }} accent={selected.color||"#60a5fa"}>
        <div style={{ display:"flex", alignItems:"center", gap:"1.2rem", flexWrap:"wrap" }}>
          {isHolder ? (
            <PhotoUpload current={selected.logoUrl} onUpload={url=>{setTeams(p=>p.map(t=>t.id===sel?{...t,logoUrl:url}:t));showToast("Logo atualizado!");}} size={80} label="Logo"/>
          ) : (
            selected.logoUrl
              ? <img src={selected.logoUrl} alt={selected.name} style={{ width:80, height:80, borderRadius:12, objectFit:"cover", border:`2px solid ${selected.color||"#60a5fa"}40` }}/>
              : <div style={{ width:80, height:80, borderRadius:12, background:`${selected.color||"#60a5fa"}14`, border:`2px solid ${selected.color||"#60a5fa"}28`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--disp)", fontWeight:800, fontSize:22, color:selected.color||"#60a5fa" }}>{selected.name?.slice(0,3).toUpperCase()}</div>
          )}
          <div style={{ flex:1 }}>
            {editing && isHolder ? (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                <TextInput value={editName} onChange={e=>setEditName(e.target.value)} style={{ maxWidth:200 }}/>
                <input type="color" value={editColor} onChange={e=>setEditColor(e.target.value)} style={{ width:36, height:34, borderRadius:6, cursor:"pointer", border:"1px solid var(--line2)", background:"transparent" }}/>
                <Btn onClick={saveTeam} size="sm" variant="success">Salvar</Btn>
                <Btn onClick={()=>setEditing(false)} size="sm" variant="secondary">Cancelar</Btn>
              </div>
            ) : (
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                  <h1 style={{ fontFamily:"var(--disp)", fontWeight:800, fontSize:"1.8rem", color:"var(--text)", letterSpacing:"-.01em" }}>{selected.name}</h1>
                  {isHolder&&<Btn onClick={()=>setEditing(true)} size="sm" variant="ghost">Editar</Btn>}
                </div>
                <p style={{ color:"var(--sub)", fontSize:".76rem" }}>{selected.desc||"Sem descrição."}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))", gap:".7rem", marginBottom:"1.2rem" }}>
        {[{l:"Vitórias",v:wins,c:"#4ade80"},{l:"Derrotas",v:losses,c:"#f87171"},{l:"Jogadores",v:players.length,c:"#60a5fa"},{l:"Partidas",v:tm.length,c:"#a78bfa"}].map(x=>(
          <Card key={x.l} style={{ textAlign:"center", padding:".8rem" }}>
            <div style={{ fontFamily:"var(--mono)", fontWeight:700, fontSize:"1.7rem", color:x.c, lineHeight:1 }}>{x.v}</div>
            <div style={{ color:"var(--sub)", fontSize:".62rem", fontWeight:600, marginTop:4, textTransform:"uppercase", letterSpacing:".04em" }}>{x.l}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
        <Card>
          <p style={{ margin:"0 0 .8rem", color:"var(--sub)", fontSize:".67rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>Elenco</p>
          {cap&&<div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:".5rem" }}><Avatar name={cap.name} photo={cap.photo} color={selected.color||"#60a5fa"} size={26}/><span style={{ color:"var(--text)", fontSize:".81rem", flex:1 }}>{cap.name}</span><Badge role="captain"/></div>}
          {players.map(p=><div key={p.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0", borderTop:"1px solid var(--line)" }}><Avatar name={p.name} photo={p.photo} color={selected.color||"#60a5fa"} size={24}/><span style={{ color:"var(--text)", fontSize:".8rem" }}>{p.name}</span></div>)}
          {!cap&&players.length===0&&<p style={{ color:"var(--dim)", fontSize:".76rem" }}>Sem membros.</p>}
        </Card>
        <Card>
          <p style={{ margin:"0 0 .8rem", color:"var(--sub)", fontSize:".67rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>Histórico</p>
          {tm.slice(-5).map(m=>{
            const opp=getTeam(m.team1===sel?m.team2:m.team1);
            const won=m.champion===sel;
            return <div key={m.id} style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 0", borderTop:"1px solid var(--line)" }}>
              <span style={{ fontFamily:"var(--mono)", fontWeight:700, fontSize:".7rem", color:won?"#4ade80":m.status==="scheduled"?"var(--sub)":"#f87171", minWidth:16 }}>{m.status==="scheduled"?"?":won?"W":"L"}</span>
              <span style={{ color:"var(--sub)", fontSize:".76rem", flex:1 }}>{opp?.name}</span>
              {m.score&&<span style={{ color:"var(--dim)", fontSize:".7rem", fontFamily:"var(--mono)" }}>{m.score}</span>}
            </div>;
          })}
          {tm.length===0&&<p style={{ color:"var(--dim)", fontSize:".76rem" }}>Sem histórico.</p>}
        </Card>
      </div>
    </div>
  );
}

function TeamsPage({ teams, users, stats, matches, setTeams, isHolder, showToast }) {
  const [sel, setSel] = useState(null);
  const getTeam = id => teams.find(t=>t.id===id);
  const selected = sel ? teams.find(t=>t.id===sel) : null;

  if (selected) {
    const players = users.filter(u=>u.team===sel&&u.role==="player");
    const cap     = users.find(u=>u.team===sel&&u.role==="captain");
    const tm      = matches.filter(m=>m.team1===sel||m.team2===sel);
    const wins    = tm.filter(m=>m.champion===sel).length;
    const losses  = tm.filter(m=>m.status==="finished"&&m.champion!==sel).length;
    return <TeamProfile selected={selected} sel={sel} players={players} cap={cap} tm={tm} wins={wins} losses={losses} getTeam={getTeam} setTeams={setTeams} isHolder={isHolder} showToast={showToast} onBack={()=>setSel(null)}/>;
  }

  return (
    <div className="page">
      <SectionTitle sub="Todos os times do campeonato">Times</SectionTitle>
      {teams.length===0&&<Empty message="Nenhum time cadastrado."/>}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:"1rem" }}>
        {teams.map(t=>{
          const players=users.filter(u=>u.team===t.id&&u.role==="player");
          const cap=users.find(u=>u.team===t.id&&u.role==="captain");
          return (
            <Card key={t.id} style={{ borderColor:`${t.color||"#60a5fa"}16` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:".8rem" }}>
                <TeamLogo team={t} size={40}/>
                <div>
                  <div style={{ fontWeight:700, fontSize:".93rem", color:"var(--text)" }}>{t.name}</div>
                  <div style={{ display:"flex", gap:8, marginTop:2 }}>
                    <span style={{ color:"#4ade80", fontSize:".66rem", fontFamily:"var(--mono)", fontWeight:700 }}>{t.wins}W</span>
                    <span style={{ color:"#f87171", fontSize:".66rem", fontFamily:"var(--mono)", fontWeight:700 }}>{t.losses}L</span>
                  </div>
                </div>
              </div>
              {cap&&<div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:".5rem" }}><Badge role="captain"/><span style={{ color:"var(--sub)", fontSize:".72rem", marginLeft:3 }}>{cap.name}</span></div>}
              <Divider/>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:".8rem" }}>
                {players.slice(0,5).map(p=><Avatar key={p.id} name={p.name} photo={p.photo} color={t.color||"#60a5fa"} size={20}/>)}
                {players.length===0&&<span style={{ color:"var(--dim)", fontSize:".7rem" }}>Sem jogadores</span>}
              </div>
              <Btn onClick={()=>setSel(t.id)} variant="secondary" size="sm" full>Ver Perfil</Btn>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function BracketPage({ teams, bracket }) {
  const getTeam = id => teams.find(t=>t.id===id);
  const rounds  = bracket?.rounds || [];
  return (
    <div className="page">
      <SectionTitle sub={bracket?.name||"Campeonato"}>Chaveamento</SectionTitle>
      <div style={{ overflowX:"auto", paddingBottom:"1rem" }}>
        <div style={{ display:"flex", gap:"1.5rem", minWidth:"fit-content" }}>
          {rounds.map((round,ri)=>(
            <div key={ri} style={{ display:"flex", flexDirection:"column", gap:"1.5rem", minWidth:190 }}>
              <div style={{ color:"var(--blue)", fontSize:".67rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".08em" }}>{round.name}</div>
              {round.matches.map(m=>{
                const mt1=getTeam(m.t1),mt2=getTeam(m.t2);
                return (
                  <div key={m.id} style={{ border:"1px solid var(--line)", borderRadius:10, overflow:"hidden" }}>
                    {[[mt1,m.t1],[mt2,m.t2]].map(([t,tid],si)=>(
                      <div key={si} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 11px", background:m.winner===tid?"rgba(59,130,246,.06)":"transparent", borderBottom:si===0?"1px solid var(--line)":"none" }}>
                        <TeamLogo team={t} size={20}/>
                        <span style={{ flex:1, color:m.winner===tid?"var(--text)":"var(--sub)", fontWeight:m.winner===tid?600:400, fontSize:".8rem" }}>{t?.name||"A definir"}</span>
                        {m.winner===tid&&<span style={{ color:"var(--blue2)", fontSize:".62rem", fontWeight:700, fontFamily:"var(--mono)" }}>WIN</span>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <Divider label="Classificação"/>
      {teams.length===0&&<Empty message="Nenhum time."/>}
      {teams.length>0&&(
        <Card style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:"rgba(255,255,255,.02)", borderBottom:"1px solid var(--line)" }}>
              {["Pos","Time","V","D","Pts"].map(h=><th key={h} style={{ padding:"8px 12px", textAlign:"left", color:"var(--sub)", fontSize:".66rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {[...teams].sort((a,b)=>(b.wins*3-b.losses)-(a.wins*3-a.losses)).map((t,i)=>(
                <tr key={t.id} style={{ borderBottom:"1px solid var(--line)" }}>
                  <td style={{ padding:"8px 12px", color:i===0?"#f59e0b":i===1?"#94a3b8":i===2?"#b45309":"var(--dim)", fontFamily:"var(--mono)", fontWeight:700, fontSize:".76rem" }}>{i+1}</td>
                  <td style={{ padding:"8px 12px" }}><div style={{ display:"flex", alignItems:"center", gap:8 }}><TeamLogo team={t} size={20}/><span style={{ color:"var(--text)", fontWeight:600, fontSize:".8rem" }}>{t.name}</span></div></td>
                  <td style={{ padding:"8px 12px", color:"#4ade80", fontFamily:"var(--mono)", fontWeight:700, fontSize:".8rem" }}>{t.wins}</td>
                  <td style={{ padding:"8px 12px", color:"#f87171", fontFamily:"var(--mono)", fontWeight:700, fontSize:".8rem" }}>{t.losses}</td>
                  <td style={{ padding:"8px 12px", color:"var(--blue2)", fontFamily:"var(--mono)", fontWeight:800, fontSize:".82rem" }}>{t.wins*3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function MarketPage({ user, users, teams, setUsers, setUser, showToast, isCaptain, isHolder }) {
  const free = users.filter(u=>u.role==="player"&&u.available&&!u.team);
  return (
    <div className="page">
      <SectionTitle sub="Jogadores disponíveis para contratação">Mercado</SectionTitle>
      {user.role==="player"&&!user.team&&(
        <Card style={{ marginBottom:"1.1rem", borderColor:"rgba(139,92,246,.16)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
            <Avatar name={user.name} photo={user.photo} color="#a78bfa" size={40}/>
            <div style={{ flex:1 }}>
              <p style={{ color:"var(--text)", fontWeight:600, marginBottom:2 }}>{user.name}</p>
              <p style={{ color:"var(--sub)", fontSize:".76rem" }}>{user.available?"Visível no mercado":"Oculto no mercado"}</p>
            </div>
            <Btn onClick={()=>{const n=!user.available;setUsers(p=>p.map(u=>u.id===user.id?{...u,available:n}:u));setUser(p=>({...p,available:n}));showToast(n?"Você está disponível!":"Você saiu do mercado.");}} variant={user.available?"danger":"success"} size="sm">
              {user.available?"Sair do Mercado":"Me Disponibilizar"}
            </Btn>
          </div>
        </Card>
      )}
      {free.length===0&&<Empty message="Nenhum jogador disponível."/>}
      {free.length>0&&<div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:".9rem" }}>
        {free.map(p=>(
          <Card key={p.id}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:".8rem" }}>
              <Avatar name={p.name} photo={p.photo} color="#a78bfa" size={38}/>
              <div><div style={{ color:"var(--text)", fontWeight:700, fontSize:".86rem" }}>{p.name}</div><Badge role="player"/></div>
            </div>
            <Pill color="#4ade80">Livre</Pill>
            {(isCaptain||isHolder)&&<div style={{ marginTop:".8rem" }}><Btn onClick={()=>{setUsers(p2=>p2.map(u=>u.id===p.id?{...u,team:user.team||null,available:false}:u));showToast(`${p.name} contratado!`);}} variant="success" size="sm" full>Contratar</Btn></div>}
          </Card>
        ))}
      </div>}
    </div>
  );
}

function NewsPage({ news, users, setNews }) {
  const [votes, setVotes] = useState({});
  const getUser = id => users.find(u=>u.id===id);
  return (
    <div className="page">
      <SectionTitle sub="Notícias e enquetes do campeonato">Notícias</SectionTitle>
      {news.length===0&&<Empty message="Nenhuma notícia publicada ainda."/>}
      {[...news].sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0)).map(n=>{
        const author = getUser(n.authorId);
        if (n.type==="poll") {
          const total  = Object.values(n.votes||{}).reduce((a,b)=>a+b,0);
          const myVote = votes[n.id];
          const winner = total>0 ? Object.entries(n.votes||{}).sort((a,b)=>b[1]-a[1])[0][0] : null;
          return (
            <Card key={n.id} style={{ marginBottom:"1rem", borderColor:"rgba(139,92,246,.14)" }} accent="#8b5cf6">
              <div style={{ display:"flex", gap:7, alignItems:"center", marginBottom:".7rem", flexWrap:"wrap" }}>
                <Pill color="#a78bfa">Enquete</Pill>
                <span style={{ color:"var(--sub)", fontSize:".7rem", fontFamily:"var(--mono)" }}>{n.date}</span>
                <span style={{ color:"var(--dim)", fontSize:".7rem", marginLeft:"auto" }}>{author?.name}</span>
              </div>
              <h3 style={{ fontFamily:"var(--disp)", fontWeight:700, fontSize:".98rem", color:"var(--text)", marginBottom:"1rem" }}>{n.title}</h3>
              {n.options.map(opt=>{
                const cnt=(n.votes||{})[opt]||0;
                const pct=total>0?Math.round(cnt/total*100):0;
                const isMyPick=myVote===opt;
                return (
                  <div key={opt} onClick={()=>{if(!myVote){setVotes(p=>({...p,[n.id]:opt}));setNews(p=>p.map(x=>x.id===n.id?{...x,votes:{...x.votes,[opt]:(x.votes[opt]||0)+1}}:x));}}}
                    style={{ cursor:myVote?"default":"pointer", marginBottom:6, padding:"8px 12px", border:`1px solid ${isMyPick?"rgba(139,92,246,.38)":"var(--line)"}`, borderRadius:9, background:isMyPick?"rgba(139,92,246,.07)":"var(--bg2)", position:"relative", overflow:"hidden", transition:"all .15s" }}>
                    <div style={{ position:"absolute", left:0, top:0, bottom:0, width:`${pct}%`, background:"rgba(139,92,246,.07)", transition:"width .5s" }}/>
                    <div style={{ position:"relative", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ color:isMyPick?"#c4b5fd":"var(--text)", fontSize:".81rem", fontWeight:isMyPick?600:400 }}>{opt}{opt===winner&&myVote?" ✓":""}</span>
                      <span style={{ color:"var(--sub)", fontSize:".7rem", fontFamily:"var(--mono)" }}>{myVote?`${pct}%`:""}</span>
                    </div>
                  </div>
                );
              })}
              <p style={{ margin:".5rem 0 0", color:"var(--dim)", fontSize:".67rem", fontFamily:"var(--mono)" }}>{total} votos{!myVote&&" — clique para votar"}</p>
            </Card>
          );
        }
        return (
          <Card key={n.id} style={{ marginBottom:".9rem" }} accent={n.pinned?"#3b82f6":undefined}>
            {n.pinned&&<div style={{ marginBottom:".5rem" }}><Pill color="#60a5fa">Destaque</Pill></div>}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:".6rem" }}>
              <Avatar name={author?.name||"?"} photo={author?.photo} color="#34d399" size={24}/>
              <span style={{ color:"var(--sub)", fontSize:".71rem", fontFamily:"var(--mono)" }}>{author?.name} · {n.date}</span>
            </div>
            <h3 style={{ fontFamily:"var(--disp)", fontWeight:700, fontSize:".98rem", color:"var(--text)", marginBottom:".5rem" }}>{n.title}</h3>
            <p style={{ color:"var(--sub)", fontSize:".81rem", lineHeight:1.65 }}>{n.content}</p>
          </Card>
        );
      })}
    </div>
  );
}

function JournalistPanel({ user, users, stats, setStats, news, setNews, showToast }) {
  const [tab,setTab]=useState("news");
  const [nTitle,setNTitle]=useState(""); const [nContent,setNContent]=useState(""); const [nPin,setNPin]=useState(false);
  const [pTitle,setPTitle]=useState(""); const [pOpts,setPOpts]=useState("");
  const [selPid,setSelPid]=useState("");
  const [kills,setKills]=useState(""); const [deaths,setDeaths]=useState(""); const [assists,setAssists]=useState("");
  const [hs,setHs]=useState(""); const [maps,setMaps]=useState(""); const [mvps,setMvps]=useState("");
  return (
    <div className="page">
      <SectionTitle sub="Publicar conteúdo e registrar estatísticas">Painel do Jornalista</SectionTitle>
      <TabBar tabs={[["news","Notícia"],["poll","Enquete"],["stats","Estatísticas"],["history","Histórico"]]} active={tab} onChange={setTab}/>
      {tab==="news"&&<Card>
        <Field label="Título"><TextInput placeholder="Título da notícia" value={nTitle} onChange={e=>setNTitle(e.target.value)}/></Field>
        <Field label="Conteúdo"><Textarea placeholder="Escreva o conteúdo..." value={nContent} onChange={e=>setNContent(e.target.value)} rows={5}/></Field>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:"1rem" }}>
          <input type="checkbox" checked={nPin} onChange={e=>setNPin(e.target.checked)} id="pin" style={{ accentColor:"var(--blue)", width:14, height:14 }}/>
          <label htmlFor="pin" style={{ color:"var(--sub)", fontSize:".76rem", cursor:"pointer" }}>Fixar como destaque</label>
        </div>
        <Btn onClick={()=>{if(!nTitle.trim()||!nContent.trim())return showToast("Preencha todos os campos","error");setNews(p=>[{id:`n${Date.now()}`,authorId:user.id,title:nTitle,content:nContent,date:new Date().toISOString().split("T")[0],type:"news",pinned:nPin},...p]);setNTitle("");setNContent("");setNPin(false);showToast("Notícia publicada!");}}>Publicar</Btn>
      </Card>}
      {tab==="poll"&&<Card>
        <Field label="Pergunta"><TextInput placeholder="Ex: Melhor jogador do mês?" value={pTitle} onChange={e=>setPTitle(e.target.value)}/></Field>
        <Field label="Opções (separadas por vírgula)"><TextInput placeholder="Ex: Player1, Player2, Player3" value={pOpts} onChange={e=>setPOpts(e.target.value)}/></Field>
        {pOpts&&<div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:".8rem" }}>{pOpts.split(",").filter(o=>o.trim()).map(o=><Pill key={o} color="#a78bfa">{o.trim()}</Pill>)}</div>}
        <Btn onClick={()=>{const opts=pOpts.split(",").map(o=>o.trim()).filter(Boolean);if(!pTitle.trim()||opts.length<2)return showToast("Mínimo 2 opções","error");setNews(p=>[{id:`n${Date.now()}`,authorId:user.id,title:pTitle,content:"",date:new Date().toISOString().split("T")[0],type:"poll",options:opts,votes:{},pinned:false},...p]);setPTitle("");setPOpts("");showToast("Enquete criada!");}}>Criar Enquete</Btn>
      </Card>}
      {tab==="stats"&&<Card>
        <Field label="Jogador"><Select value={selPid} onChange={e=>setSelPid(e.target.value)}><option value="">Selecionar jogador...</option>{users.filter(u=>u.role==="player").map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</Select></Field>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:".6rem", marginBottom:".8rem" }}>
          {[["Kills",kills,setKills],["Deaths",deaths,setDeaths],["Assists",assists,setAssists],["Headshots",hs,setHs],["Mapas",maps,setMaps],["MVPs",mvps,setMvps]].map(([l,v,s])=>(
            <Field key={l} label={l}><TextInput placeholder="0" value={v} onChange={e=>s(e.target.value)}/></Field>
          ))}
        </div>
        <p style={{ color:"var(--dim)", fontSize:".71rem", marginBottom:".8rem" }}>Os valores são somados ao total existente do jogador.</p>
        <Btn onClick={()=>{if(!selPid)return showToast("Selecione um jogador","error");const pid=selPid,k=Number(kills)||0,d=Number(deaths)||0,a=Number(assists)||0,h=Number(hs)||0,m=Number(maps)||1,mv=Number(mvps)||0;setStats(prev=>{const ex=prev.find(s=>s.pid===pid);if(ex)return prev.map(s=>s.pid===pid?{...s,kills:s.kills+k,deaths:s.deaths+d,assists:s.assists+a,hs:s.hs+h,maps:s.maps+m,mvps:s.mvps+mv}:s);return[...prev,{pid,kills:k,deaths:d,assists:a,hs:h,maps:m,mvps:mv}];});setSelPid("");setKills("");setDeaths("");setAssists("");setHs("");setMaps("");setMvps("");showToast("Estatísticas registradas!");}}>Registrar</Btn>
      </Card>}
      {tab==="history"&&<div>
        {news.filter(n=>n.authorId===user.id).length===0&&<Empty message="Nenhuma publicação."/>}
        {news.filter(n=>n.authorId===user.id).map(n=>(
          <Card key={n.id} style={{ marginBottom:".6rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <Pill color={n.type==="poll"?"#a78bfa":"#34d399"}>{n.type==="poll"?"Enquete":"Notícia"}</Pill>
              <span style={{ color:"var(--text)", fontSize:".81rem", flex:1, fontWeight:500 }}>{n.title}</span>
              <span style={{ color:"var(--sub)", fontSize:".7rem", fontFamily:"var(--mono)" }}>{n.date}</span>
              <Btn onClick={()=>{setNews(p=>p.filter(x=>x.id!==n.id));showToast("Removido.");}} variant="danger" size="sm">Remover</Btn>
            </div>
          </Card>
        ))}
      </div>}
    </div>
  );
}

function AdminPanel({ user, users, setUsers, teams, setTeams, matches, setMatches, showToast, setPbMatch, isHolder, isCaptain }) {
  const [tab,setTab]=useState(isHolder?"matches":"myteam");
  const myTeam=teams.find(t=>t.id===user.team);
  const [t1,setT1]=useState(""); const [t2,setT2]=useState(""); const [mDate,setMDate]=useState("");
  const [newTName,setNewTName]=useState(""); const [newTColor,setNewTColor]=useState("#60a5fa"); const [newTLogo,setNewTLogo]=useState(null);
  const [editName,setEditName]=useState(""); const [editLogo,setEditLogo]=useState(null);
  const [selScore,setSelScore]=useState({});
  const getTeam=id=>teams.find(t=>t.id===id);
  const tabs=[]; if(isHolder)tabs.push(["matches","Partidas"],["teams_mgr","Times"],["users_mgr","Usuários"]); if(isCaptain||isHolder)tabs.push(["myteam","Meu Time"]);

  return (
    <div className="page">
      <SectionTitle sub={isHolder?"Gerenciamento completo do campeonato":"Gerenciar seu time"}>Gerenciamento</SectionTitle>
      <TabBar tabs={tabs} active={tab} onChange={setTab}/>

      {tab==="matches"&&isHolder&&<div>
        <Card style={{ marginBottom:"1rem" }}>
          <p style={{ color:"var(--sub)", fontSize:".69rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:"1rem" }}>Agendar Partida</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".6rem", marginBottom:".6rem" }}>
            <Field label="Time 1"><Select value={t1} onChange={e=>setT1(e.target.value)}><option value="">Selecionar...</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</Select></Field>
            <Field label="Time 2"><Select value={t2} onChange={e=>setT2(e.target.value)}><option value="">Selecionar...</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</Select></Field>
          </div>
          <Field label="Data"><TextInput placeholder="2025-07-10" value={mDate} onChange={e=>setMDate(e.target.value)}/></Field>
          <Btn onClick={()=>{if(!t1||!t2||t1===t2)return showToast("Selecione dois times diferentes","error");setMatches(p=>[...p,{id:`m${Date.now()}`,team1:t1,team2:t2,status:"scheduled",score:null,maps:[],champion:null,date:mDate||"TBD",pbActions:[]}]);setT1("");setT2("");setMDate("");showToast("Partida agendada!");}}>Agendar</Btn>
        </Card>
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:".9rem 1.1rem", borderBottom:"1px solid var(--line)" }}><p style={{ margin:0, color:"var(--sub)", fontSize:".69rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em" }}>Partidas ({matches.length})</p></div>
          {matches.length===0&&<div style={{ padding:"1rem" }}><p style={{ color:"var(--dim)", fontSize:".8rem" }}>Nenhuma partida.</p></div>}
          {matches.map(m=>{
            const mt1=getTeam(m.team1),mt2=getTeam(m.team2); const sc=selScore[m.id]||"";
            return (
              <div key={m.id} style={{ padding:".8rem 1.1rem", borderBottom:"1px solid var(--line)", display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                <span style={{ color:"var(--text)", fontSize:".8rem", flex:1, minWidth:140, fontWeight:500 }}>{mt1?.name||"?"} <span style={{ color:"var(--dim)" }}>vs</span> {mt2?.name||"?"}</span>
                <Pill color={m.status==="live"?"#f87171":m.status==="finished"?"#4ade80":"#475569"}>{m.status==="live"?"Ao Vivo":m.status==="finished"?"Encerrado":"Agendado"}</Pill>
                {m.status==="scheduled"&&<Btn onClick={()=>{setMatches(p=>p.map(x=>x.id===m.id?{...x,status:"live"}:x));showToast("Iniciada!");}} variant="success" size="sm">Iniciar</Btn>}
                {m.status==="live"&&<>
                  <TextInput placeholder="2-1" value={sc} onChange={e=>setSelScore(p=>({...p,[m.id]:e.target.value}))} style={{ width:64, padding:"5px 8px", fontSize:".78rem" }}/>
                  <Select value={m.champion||""} onChange={e=>setMatches(p=>p.map(x=>x.id===m.id?{...x,champion:e.target.value}:x))} style={{ width:130, padding:"5px 8px", fontSize:".78rem" }}>
                    <option value="">Vencedor...</option>
                    <option value={m.team1}>{mt1?.name}</option>
                    <option value={m.team2}>{mt2?.name}</option>
                  </Select>
                  <Btn onClick={()=>{if(!m.champion)return showToast("Selecione o vencedor","error");setMatches(p=>p.map(x=>x.id===m.id?{...x,status:"finished",score:sc||"2-1"}:x));setTeams(p=>p.map(t=>t.id===m.champion?{...t,wins:t.wins+1}:t.id===m.team1||t.id===m.team2?{...t,losses:t.losses+1}:t));showToast("Encerrada!");}} variant="danger" size="sm">Encerrar</Btn>
                  <Btn onClick={()=>setPbMatch(m)} variant="ghost" size="sm">P&B</Btn>
                </>}
                {m.status==="finished"&&<Btn onClick={()=>{setMatches(p=>p.filter(x=>x.id!==m.id));showToast("Removida.");}} variant="secondary" size="sm">Remover</Btn>}
              </div>
            );
          })}
        </Card>
      </div>}

      {tab==="teams_mgr"&&isHolder&&<div>
        <Card style={{ marginBottom:"1rem" }}>
          <p style={{ color:"var(--sub)", fontSize:".69rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:"1rem" }}>Criar Time</p>
          <div style={{ display:"flex", gap:"1.2rem", alignItems:"flex-start", marginBottom:".8rem", flexWrap:"wrap" }}>
            <PhotoUpload current={newTLogo} onUpload={setNewTLogo} size={68} label="Logo"/>
            <div style={{ flex:1, minWidth:170 }}>
              <Field label="Nome"><TextInput placeholder="Nome do time" value={newTName} onChange={e=>setNewTName(e.target.value)}/></Field>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <label style={{ color:"var(--sub)", fontSize:".69rem", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em" }}>Cor:</label>
                <input type="color" value={newTColor} onChange={e=>setNewTColor(e.target.value)} style={{ width:40, height:32, borderRadius:6, cursor:"pointer", border:"1px solid var(--line2)", background:"transparent" }}/>
                <span style={{ color:newTColor, fontFamily:"var(--mono)", fontSize:".76rem" }}>{newTColor}</span>
              </div>
            </div>
          </div>
          <Btn onClick={()=>{if(!newTName.trim())return;setTeams(p=>[...p,{id:`t${Date.now()}`,name:newTName,logoUrl:newTLogo||null,color:newTColor,wins:0,losses:0,desc:""}]);setNewTName("");setNewTLogo(null);setNewTColor("#60a5fa");showToast("Time criado!");}}>Criar Time</Btn>
        </Card>
        <Card>
          {teams.length===0&&<p style={{ color:"var(--dim)", fontSize:".8rem" }}>Nenhum time.</p>}
          {teams.map(t=>(
            <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid var(--line)" }}>
              <TeamLogo team={t} size={28}/>
              <span style={{ color:"var(--text)", fontWeight:600, fontSize:".83rem", flex:1 }}>{t.name}</span>
              <span style={{ color:"#4ade80", fontSize:".7rem", fontFamily:"var(--mono)" }}>{t.wins}W</span>
              <span style={{ color:"#f87171", fontSize:".7rem", fontFamily:"var(--mono)" }}>{t.losses}L</span>
              <Btn onClick={()=>{setTeams(p=>p.filter(x=>x.id!==t.id));showToast("Removido.");}} variant="danger" size="sm">Remover</Btn>
            </div>
          ))}
        </Card>
      </div>}

      {tab==="users_mgr"&&isHolder&&<Card>
        <p style={{ color:"var(--sub)", fontSize:".69rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:"1rem" }}>Usuários & Cargos ({users.length})</p>
        {users.map(u=>{
          const ut=teams.find(t=>t.id===u.team);
          return (
            <div key={u.id} style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 0", borderBottom:"1px solid var(--line)", flexWrap:"wrap" }}>
              <Avatar name={u.name} photo={u.photo} color={ut?.color||"#64748b"} size={26}/>
              <span style={{ flex:1, color:"var(--text)", fontSize:".81rem", fontWeight:500, minWidth:90 }}>{u.name}</span>
              <Badge role={u.role}/>
              {ut&&<span style={{ color:ut.color, fontSize:".7rem", fontWeight:600 }}>{ut.name}</span>}
              {u.id!==user.id
                ?<><Select value={u.role} onChange={e=>{setUsers(p=>p.map(x=>x.id===u.id?{...x,role:e.target.value}:x));showToast(`Cargo de ${u.name} alterado!`);}} style={{ width:120, padding:"4px 8px", fontSize:".74rem" }}>
                  {Object.entries(ROLES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </Select>
                <Btn onClick={()=>{if(window.confirm(`Excluir ${u.name}?`)){setUsers(p=>p.filter(x=>x.id!==u.id));showToast(`${u.name} removido.`);}}} variant="danger" size="sm">✕</Btn></>
                :<Pill color="var(--blue)">Você</Pill>}
            </div>
          );
        })}
      </Card>}

      {tab==="myteam"&&<div>
        {(isCaptain?[myTeam]:teams).filter(Boolean).map(t=>{
          const tPlayers=users.filter(u=>u.team===t.id&&u.role==="player");
          return (
            <Card key={t.id} style={{ marginBottom:"1rem", borderColor:`${t.color||"#60a5fa"}16` }}>
              <div style={{ display:"flex", gap:"1.2rem", alignItems:"flex-start", marginBottom:"1rem", flexWrap:"wrap" }}>
                <PhotoUpload current={editLogo||t.logoUrl} onUpload={url=>{setEditLogo(url);setTeams(p=>p.map(x=>x.id===t.id?{...x,logoUrl:url}:x));showToast("Logo atualizado!");}} size={60} label="Logo"/>
                <div style={{ flex:1, minWidth:160 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:".7rem" }}><TeamLogo team={t} size={28}/><span style={{ fontWeight:700, fontSize:".95rem", color:"var(--text)" }}>{t.name}</span></div>
                  <Field label="Novo Nome"><TextInput placeholder={t.name} defaultValue={t.name} onChange={e=>setEditName(e.target.value)}/></Field>
                  <Btn onClick={()=>{setTeams(p=>p.map(x=>x.id===t.id?{...x,name:editName||x.name}:x));showToast("Time atualizado!");}} size="sm">Salvar</Btn>
                </div>
              </div>
              <Divider label={`Jogadores (${tPlayers.length})`}/>
              {tPlayers.length===0&&<p style={{ color:"var(--dim)", fontSize:".76rem" }}>Sem jogadores.</p>}
              {tPlayers.map(p=>(
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0", borderBottom:"1px solid var(--line)" }}>
                  <Avatar name={p.name} photo={p.photo} color={t.color||"#60a5fa"} size={24}/>
                  <span style={{ color:"var(--text)", fontSize:".8rem", flex:1 }}>{p.name}</span>
                  <Btn onClick={()=>{setUsers(prev=>prev.map(u=>u.id===p.id?{...u,team:null,available:true}:u));showToast(`${p.name} dispensado.`);}} variant="secondary" size="sm">Dispensar</Btn>
                </div>
              ))}
            </Card>
          );
        })}
        {(isCaptain?[myTeam]:teams).filter(Boolean).length===0&&<Empty message="Nenhum time para gerenciar."/>}
      </div>}
    </div>
  );
}

function ProfilePage({ user, setUser, setUsers, users, teams, stats, showToast }) {
  const myTeam  = teams.find(t=>t.id===user.team);
  const myStats = stats.find(s=>s.pid===user.id);
  const [newPhoto, setNewPhoto] = useState(user.photo);
  const [newPass,  setNewPass]  = useState("");
  const [newPass2, setNewPass2] = useState("");

  const save = () => {
    if (newPass&&newPass.length<4)  return showToast("Senha mínima de 4 caracteres","error");
    if (newPass&&newPass!==newPass2) return showToast("Senhas não coincidem","error");
    const updated = {...user, photo:newPhoto, ...(newPass?{password:newPass}:{})};
    setUsers(p=>p.map(u=>u.id===user.id?updated:u));
    setUser(updated);
    setNewPass(""); setNewPass2("");
    showToast("Perfil atualizado!");
  };

  return (
    <div className="page">
      <SectionTitle sub="Suas informações e configurações">Perfil</SectionTitle>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:"1rem" }}>
        <Card>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, marginBottom:"1.3rem" }}>
            <PhotoUpload current={newPhoto} onUpload={setNewPhoto} size={88} circle label="Foto"/>
            <div style={{ textAlign:"center" }}>
              <h2 style={{ fontFamily:"var(--disp)", fontWeight:800, fontSize:"1.25rem", color:"var(--text)", letterSpacing:"-.01em" }}>{user.name}</h2>
              <div style={{ display:"flex", gap:6, justifyContent:"center", marginTop:5, flexWrap:"wrap" }}>
                <Badge role={user.role}/>
                {myTeam&&<Pill color={myTeam.color||"#60a5fa"}>{myTeam.name}</Pill>}
              </div>
            </div>
          </div>
          <Divider/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".7rem", marginBottom:"1.2rem" }}>
            {[{l:"Cargo",v:ROLES[user.role]||user.role},{l:"Time",v:myTeam?.name||"Sem time"},{l:"Membro desde",v:user.joined},{l:"Status",v:user.available?"Disponível":"Em time"}].map(x=>(
              <div key={x.l}><div style={{ color:"var(--dim)", fontSize:".64rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:3 }}>{x.l}</div><div style={{ color:"var(--text)", fontSize:".8rem", fontWeight:500 }}>{x.v}</div></div>
            ))}
          </div>
          <Divider label="Alterar Senha"/>
          <Field label="Nova Senha"><PasswordInput placeholder="Mínimo 4 caracteres" value={newPass} onChange={e=>setNewPass(e.target.value)}/></Field>
          <Field label="Confirmar Nova Senha"><PasswordInput placeholder="Repita a senha" value={newPass2} onChange={e=>setNewPass2(e.target.value)}/></Field>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <Btn onClick={save}>Salvar Perfil</Btn>
            <Btn onClick={()=>setUser(null)} variant="danger">Sair</Btn>
          </div>
        </Card>
        {user.role==="player"&&myStats&&(()=>{
          const kd  = myStats.deaths>0?(myStats.kills/myStats.deaths).toFixed(2):myStats.kills;
          const hsp = myStats.kills>0?Math.round(myStats.hs/myStats.kills*100):0;
          return (
            <Card>
              <p style={{ margin:"0 0 1rem", color:"var(--sub)", fontSize:".68rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em" }}>Minhas Estatísticas</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:".7rem" }}>
                {[{l:"Kills",v:myStats.kills,c:"#60a5fa"},{l:"K/D",v:kd,c:parseFloat(kd)>=1?"#4ade80":"#f87171"},{l:"HS%",v:hsp+"%",c:"#f59e0b"},{l:"Assists",v:myStats.assists,c:"#a78bfa"},{l:"Mapas",v:myStats.maps,c:"#64748b"},{l:"MVPs",v:myStats.mvps,c:"#f59e0b"}].map(x=>(
                  <div key={x.l} style={{ textAlign:"center", background:"var(--bg2)", borderRadius:10, padding:".8rem" }}>
                    <div style={{ fontFamily:"var(--mono)", fontWeight:700, fontSize:"1.4rem", color:x.c, lineHeight:1 }}>{x.v}</div>
                    <div style={{ color:"var(--sub)", fontSize:".6rem", fontWeight:600, marginTop:4, textTransform:"uppercase", letterSpacing:".04em" }}>{x.l}</div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })()}
      </div>
    </div>
  );
}

/* ─── SIDEBAR ICONS ──────────────────────────────────────────────────────── */
const ICONS = {
  home:             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  live:             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>,
  stats:            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  teams:            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  bracket:          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>,
  market:           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  news:             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg>,
  journalist_panel: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  admin:            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/></svg>,
  profile:          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

/* ─── APP ────────────────────────────────────────────────────────────────── */
export default function App() {
  const [users,    setUsersRaw]   = useState(null);
  const [teams,    setTeamsRaw]   = useState(null);
  const [matches,  setMatchesRaw] = useState(null);
  const [stats,    setStatsRaw]   = useState(null);
  const [news,     setNewsRaw]    = useState(null);
  const [bracket,  setBracketRaw] = useState(null);
  const [loaded,   setLoaded]     = useState(false);

  const [user,     setUserState]  = useState(null);
  const [page,     setPage]       = useState("home");
  const [pbMatch,  setPbMatch]    = useState(null);
  const [toast,    setToast]      = useState(null);
  const [syncTime, setSyncTime]   = useState(null);

  /* Carrega DB ao montar */
  useEffect(() => {
    (async () => {
      const [u,t,m,s,n,b,sess] = await Promise.all([
        DB.get("users"), DB.get("teams"), DB.get("matches"),
        DB.get("stats"), DB.get("news"), DB.get("bracket"),
        DB.getSession(),
      ]);
      const fUsers   = u || SEED.users;
      const fTeams   = t || SEED.teams;
      const fMatches = m || SEED.matches;
      const fStats   = s || SEED.stats;
      const fNews    = n || SEED.news;
      const fBracket = b || SEED.bracket;

      if (!u) await DB.set("users",   fUsers);
      if (!t) await DB.set("teams",   fTeams);
      if (!m) await DB.set("matches", fMatches);
      if (!s) await DB.set("stats",   fStats);
      if (!n) await DB.set("news",    fNews);
      if (!b) await DB.set("bracket", fBracket);

      setUsersRaw(fUsers); setTeamsRaw(fTeams); setMatchesRaw(fMatches);
      setStatsRaw(fStats); setNewsRaw(fNews);   setBracketRaw(fBracket);

      if (sess?.userId) {
        const loggedUser = fUsers.find(u=>u.id===sess.userId);
        if (loggedUser) setUserState(loggedUser);
      }
      setLoaded(true);
    })();
  }, []);

  /* Auto-save por tabela (debounced) */
  const savingU = useSaving(users,   "users");
  const savingT = useSaving(teams,   "teams");
  const savingM = useSaving(matches, "matches");
  const savingS = useSaving(stats,   "stats");
  const savingN = useSaving(news,    "news");
  const saving  = savingU||savingT||savingM||savingS||savingN;

  const setUsers   = useCallback(fn => setUsersRaw(p   => typeof fn==="function"?fn(p):fn), []);
  const setTeams   = useCallback(fn => setTeamsRaw(p   => typeof fn==="function"?fn(p):fn), []);
  const setMatches = useCallback(fn => setMatchesRaw(p => typeof fn==="function"?fn(p):fn), []);
  const setStats   = useCallback(fn => setStatsRaw(p   => typeof fn==="function"?fn(p):fn), []);
  const setNews    = useCallback(fn => setNewsRaw(p    => typeof fn==="function"?fn(p):fn), []);

  /* Polling de sincronização entre usuários */
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(async () => {
      const [u,t,m,s,n] = await Promise.all([
        DB.get("users"), DB.get("teams"), DB.get("matches"),
        DB.get("stats"), DB.get("news"),
      ]);
      if (u) setUsersRaw(u);
      if (t) setTeamsRaw(t);
      if (m) setMatchesRaw(m);
      if (s) setStatsRaw(s);
      if (n) setNewsRaw(n);
      setSyncTime(new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}));
    }, 15000);
    return () => clearInterval(interval);
  }, [loaded]);

  const showToast = useCallback((msg,type="success") => {
    setToast({msg,type}); setTimeout(()=>setToast(null),3200);
  }, []);

  const handleLogin = (u, remember) => {
    const fresh = users.find(x=>x.id===u.id)||u;
    setUserState(fresh); setPage("home");
    if (remember) DB.setSession({userId:u.id});
  };

  const handleRegister = newUser => {
    setUsers(p=>[...p,newUser]);
    setUserState(newUser); setPage("home");
    showToast("Conta criada! Bem-vindo, "+newUser.name);
  };

  const logout = () => {
    setUserState(null); setPage("home");
    DB.setSession(null);
  };

  if (!loaded || users===null) return (<><Styles/><Loading/></>);

  if (!user) return (
    <>
      <Styles/>
      <AuthPage users={users} onLogin={handleLogin} onRegister={handleRegister}/>
    </>
  );

  const currentUser  = users.find(u=>u.id===user.id)||user;
  const isHolder     = currentUser.role==="holder";
  const isCaptain    = currentUser.role==="captain";
  const isJournalist = currentUser.role==="journalist";
  const myTeam       = teams.find(t=>t.id===currentUser.team);
  const liveCnt      = matches.filter(m=>m.status==="live").length;

  const nav = [
    {key:"home",    label:"Início"},
    {key:"live",    label:"Ao Vivo"},
    {key:"stats",   label:"Estatísticas"},
    {key:"teams",   label:"Times"},
    {key:"bracket", label:"Chaveamento"},
    {key:"market",  label:"Mercado"},
    {key:"news",    label:"Notícias"},
    ...(isJournalist?[{key:"journalist_panel",label:"Painel"}]:[]),
    ...((isHolder||isCaptain)?[{key:"admin",label:"Gerenciar"}]:[]),
    {key:"profile", label:"Perfil"},
  ];

  const sharedProps = {
    user:currentUser, users, setUsers, teams, setTeams,
    matches, setMatches, stats, setStats, news, setNews,
    isHolder, isCaptain, isJournalist, myTeam, setPbMatch, showToast,
  };

  const syncUser = updated => {
    setUsers(p=>p.map(u=>u.id===updated.id?updated:u));
    setUserState(updated);
  };

  const renderPage = () => {
    switch(page) {
      case "home":             return <HomePage {...sharedProps}/>;
      case "live":             return <LivePage {...sharedProps}/>;
      case "stats":            return <StatsPage {...sharedProps}/>;
      case "teams":            return <TeamsPage {...sharedProps} setTeams={setTeams}/>;
      case "bracket":          return <BracketPage teams={teams} bracket={bracket||SEED.bracket}/>;
      case "market":           return <MarketPage {...sharedProps} setUser={u=>{setUserState(u);setUsers(p=>p.map(x=>x.id===u.id?u:x));}}/>;
      case "news":             return <NewsPage news={news} users={users} setNews={setNews}/>;
      case "journalist_panel": return <JournalistPanel user={currentUser} users={users} stats={stats} setStats={setStats} news={news} setNews={setNews} showToast={showToast}/>;
      case "admin":            return <AdminPanel {...sharedProps}/>;
      case "profile":          return <ProfilePage user={currentUser} setUser={u=>{if(!u){logout();}else{syncUser(u);}}} setUsers={setUsers} users={users} teams={teams} stats={stats} showToast={showToast}/>;
      default:                 return <HomePage {...sharedProps}/>;
    }
  };

  return (
    <>
      <Styles/>

      {toast&&(
        <div style={{ position:"fixed", top:16, right:16, zIndex:99999, background:"var(--bg1)", color:toast.type==="success"?"#4ade80":"#f87171", padding:"11px 15px", border:`1px solid ${toast.type==="success"?"rgba(74,222,128,.2)":"rgba(248,113,113,.2)"}`, borderRadius:10, fontSize:".8rem", fontWeight:600, boxShadow:"0 8px 30px rgba(0,0,0,.45)", animation:"toast .2s ease", display:"flex", alignItems:"center", gap:8, maxWidth:280, fontFamily:"var(--font)" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"currentColor", flexShrink:0 }}/>
          {toast.msg}
        </div>
      )}

      <div style={{ position:"fixed", bottom:12, right:12, zIndex:9998, display:"flex", alignItems:"center", gap:6, padding:"5px 10px", background:"var(--bg1)", border:"1px solid var(--line)", borderRadius:8, fontSize:".65rem", fontFamily:"var(--mono)", color:"var(--dim)" }}>
        {saving
          ? <><Spinner size={10}/> <span>salvando...</span></>
          : <><span style={{ color:"#4ade80", fontSize:10 }}>●</span><span>banco de dados{syncTime?` · ${syncTime}`:""}</span></>
        }
      </div>

      {pbMatch&&(
        <PickBanModal match={pbMatch} teams={teams}
          canControl={isHolder||(isCaptain&&(pbMatch.team1===currentUser.team||pbMatch.team2===currentUser.team))}
          onClose={()=>setPbMatch(null)}
          onFinish={(mid,maps,actions)=>{setMatches(p=>p.map(m=>m.id===mid?{...m,maps,pbActions:actions}:m));setPbMatch(null);showToast("Pick & Ban concluído!");}}
        />
      )}

      <div style={{ display:"flex", minHeight:"100vh" }}>
        <nav style={{ width:196, background:"var(--bg1)", borderRight:"1px solid var(--line)", display:"flex", flexDirection:"column", padding:"1rem .65rem", flexShrink:0, position:"sticky", top:0, height:"100vh", overflowY:"auto" }}>
          <div style={{ padding:".2rem .5rem", marginBottom:"1.5rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 4px 12px rgba(59,130,246,.24)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <div>
                <div style={{ fontFamily:"var(--disp)", fontWeight:800, fontSize:".85rem", color:"var(--text)", letterSpacing:"-.01em", lineHeight:1.2 }}>Várzea CS2</div>
                <div style={{ fontSize:".58rem", color:"var(--sub)", fontFamily:"var(--mono)" }}>Championship</div>
              </div>
            </div>
          </div>

          <div style={{ flex:1 }}>
            {nav.map(n=>(
              <button key={n.key} onClick={()=>setPage(n.key)}
                style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"8px 10px", borderRadius:9, border:"none", background:page===n.key?"rgba(59,130,246,.09)":"transparent", color:page===n.key?"var(--blue2)":"var(--sub)", cursor:"pointer", fontFamily:"var(--font)", fontWeight:500, fontSize:".8rem", marginBottom:1, transition:"all .12s", textAlign:"left", position:"relative" }}>
                <span style={{ opacity:page===n.key?1:.55, flexShrink:0 }}>{ICONS[n.key]||ICONS.home}</span>
                {n.label}
                {n.key==="live"&&liveCnt>0&&(
                  <span style={{ marginLeft:"auto", background:"#f87171", color:"#fff", fontSize:".56rem", fontWeight:800, width:16, height:16, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{liveCnt}</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ borderTop:"1px solid var(--line)", paddingTop:".8rem", marginTop:".5rem" }}>
            <button onClick={()=>setPage("profile")}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 8px", borderRadius:9, border:"none", background:"transparent", cursor:"pointer", width:"100%", transition:"background .12s" }}
              onMouseEnter={e=>e.currentTarget.style.background="var(--bg2)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <Avatar name={currentUser.name} photo={currentUser.photo} color={myTeam?.color||"#60a5fa"} size={28}/>
              <div style={{ overflow:"hidden", flex:1, textAlign:"left" }}>
                <div style={{ color:"var(--text)", fontSize:".76rem", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{currentUser.name}</div>
                <Badge role={currentUser.role}/>
              </div>
            </button>
          </div>
        </nav>

        <main style={{ flex:1, padding:"1.8rem", overflowY:"auto", maxWidth:"calc(100vw - 196px)", minWidth:0, background:"var(--bg)" }}>
          {renderPage()}
        </main>
      </div>
    </>
  );
}
