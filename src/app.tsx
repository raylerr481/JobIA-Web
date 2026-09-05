import { useEffect, useMemo, useState } from 'react';
import { Bell, BriefcaseBusiness, ChevronRight, CircleCheck, FileText, LayoutDashboard, MapPin, Menu, Search, Settings, Sparkles, UserRound, X } from 'lucide-react';
import { API_URL, getJobs, saveProfile, type Job } from './api';

type Section = 'dashboard' | 'jobs' | 'profile' | 'alerts' | 'applications';
const professions = ['Informática / IT', 'Administración', 'Educación', 'Diseño', 'Marketing', 'Contabilidad', 'Oficios técnicos', 'Ventas', 'Salud', 'Otra'];
const modes = ['Remoto', 'Híbrido', 'Presencial'];
const frequencies = ['Cada pocas horas', 'Diario', 'Cada 2 días', 'Semanal', 'Pausado'];

export default function App() {
  const [section, setSection] = useState<Section>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [source, setSource] = useState<'api' | 'demo'>('demo');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ email: '', profession: 'Informática / IT', mode: 'Remoto', aiOpportunities: true });
  const [frequency, setFrequency] = useState('Diario');
  const [saved, setSaved] = useState(false);

  const loadJobs = async (q = '') => {
    setLoading(true);
    const result = await getJobs(q);
    setJobs(result.jobs);
    setSource(result.source);
    setLoading(false);
  };

  useEffect(() => { void loadJobs(); }, []);

  const filtered = useMemo(() => jobs, [jobs]);

  const navigate = (next: Section) => { setSection(next); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Sparkles size={19} /></div><div><strong>JobIA</strong><span>Inteligencia profesional</span></div><button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={20} /></button></div>
        <nav>
          <NavItem icon={<LayoutDashboard size={18} />} label="Inicio" active={section === 'dashboard'} onClick={() => navigate('dashboard')} />
          <NavItem icon={<Search size={18} />} label="Oportunidades" active={section === 'jobs'} onClick={() => navigate('jobs')} badge={jobs.length || undefined} />
          <NavItem icon={<FileText size={18} />} label="Mis aplicaciones" active={section === 'applications'} onClick={() => navigate('applications')} />
          <NavItem icon={<UserRound size={18} />} label="Mi perfil" active={section === 'profile'} onClick={() => navigate('profile')} />
          <NavItem icon={<Bell size={18} />} label="Alertas" active={section === 'alerts'} onClick={() => navigate('alerts')} />
        </nav>
        <div className="sidebar-bottom"><button className="nav-item"><Settings size={18} /> Configuración</button><div className="trainer"><Sparkles size={17} /><div><b>Bitey Trainer</b><small>Motor de inteligencia activo</small></div><span className="dot" /></div></div>
      </aside>

      <main className="main">
        <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={22} /></button><div className="top-search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { navigate('jobs'); void loadJobs(query); } }} placeholder="Buscar puestos, habilidades o empresas..." /></div><button className="icon-btn" onClick={() => navigate('alerts')} aria-label="Alertas"><Bell size={19} /></button><button className="avatar" onClick={() => navigate('profile')}>J</button></header>

        <div className="content">
          {section === 'dashboard' && <Dashboard jobs={jobs} profile={profile} source={source} navigate={navigate} />}
          {section === 'jobs' && <Jobs jobs={filtered} query={query} setQuery={setQuery} loading={loading} source={source} onSearch={() => void loadJobs(query)} />}
          {section === 'profile' && <Profile profile={profile} setProfile={setProfile} saved={saved} onSave={async () => { setSaved(false); const ok = await saveProfile(profile); setSaved(ok); }} />}
          {section === 'alerts' && <Alerts frequency={frequency} setFrequency={setFrequency} />}
          {section === 'applications' && <Applications />}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ jobs, profile, source, navigate }: { jobs: Job[]; profile: { email: string; profession: string; mode: string }; source: string; navigate: (s: Section) => void }) {
  const top = jobs.slice(0, 3);
  return <>
    <section className="hero"><div><div className="eyebrow"><Sparkles size={15} /> JOBIA INTELLIGENCE</div><h1>Encuentra oportunidades que <em>encajan contigo.</em></h1><p>JobIA analiza tu perfil, habilidades y preferencias para ayudarte a descubrir, entender y preparar tus próximas oportunidades profesionales.</p><button className="primary" onClick={() => navigate('jobs')}><Search size={17} /> Buscar oportunidades <ChevronRight size={17} /></button></div><div className="hero-orb"><Sparkles size={54} /><span>IA</span></div></section>
    <div className="stats"><Stat title="Oportunidades encontradas" value={jobs.length.toString()} detail="última búsqueda" /><Stat title="Mejor coincidencia" value={`${top[0]?.match ?? 0}%`} detail="según tu perfil" /><Stat title="Perfil" value={profile.profession ? 'Activo' : 'Pendiente'} detail={profile.mode} /></div>
    <div className="section-head"><div><h2>Recomendadas para ti</h2><p>Seleccionadas por el motor de matching de JobIA.</p></div><button className="text-btn" onClick={() => navigate('jobs')}>Ver todas <ChevronRight size={16} /></button></div>
    <div className="job-grid">{top.map((job) => <JobCard key={job.id} job={job} />)}</div>
    <div className="info-grid"><div className="panel"><div className="panel-icon"><UserRound size={18} /></div><div><h3>Completa tu perfil</h3><p>Añade habilidades, experiencia, certificaciones y preferencias para mejorar el matching.</p><button className="text-btn" onClick={() => navigate('profile')}>Editar perfil <ChevronRight size={16} /></button></div></div><div className="panel"><div className="panel-icon"><Bell size={18} /></div><div><h3>Configura tus alertas</h3><p>Recibe oportunidades con la frecuencia que tú decidas.</p><button className="text-btn" onClick={() => navigate('alerts')}>Configurar <ChevronRight size={16} /></button></div></div></div>
    <div className="connection"><CircleCheck size={16} /> {source === 'api' ? 'Conectado al JobIA API' : API_URL ? 'API no disponible — modo seguro de demostración' : 'Modo demostración — configura VITE_JOBIA_API_URL para conectar el backend'}</div>
  </>;
}

function Jobs({ jobs, query, setQuery, loading, source, onSearch }: { jobs: Job[]; query: string; setQuery: (v: string) => void; loading: boolean; source: string; onSearch: () => void }) {
  return <><div className="page-heading"><div><div className="eyebrow"><Search size={14} /> OPORTUNIDADES</div><h1>Trabajo seleccionado para ti</h1><p>Explora oportunidades y entiende por qué JobIA las considera compatibles.</p></div><span className="source-pill"><span className="dot" /> {source === 'api' ? 'Datos en vivo' : 'Modo demo'}</span></div><div className="search-box"><Search size={19} /><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSearch()} placeholder="Ej.: Python, soporte técnico, remoto..." /><button className="primary small" onClick={onSearch}>Buscar</button></div>{loading ? <div className="empty"><div className="loader" /><h3>Analizando oportunidades...</h3><p>JobIA está consultando su fuente de oportunidades.</p></div> : <div className="job-list">{jobs.map((job) => <JobCard key={job.id} job={job} detailed />)}{jobs.length === 0 && <div className="empty"><Search size={30} /><h3>No encontramos coincidencias</h3><p>Prueba otra búsqueda o completa tu perfil para mejorar los resultados.</p></div>}</div>}</>;
}

function JobCard({ job, detailed = false }: { job: Job; detailed?: boolean }) {
  const apply = () => { if (job.url) window.open(job.url, '_blank', 'noopener,noreferrer'); };
  return <article className={`job-card ${detailed ? 'detailed' : ''}`}><div className="company-logo">{job.company.slice(0, 1).toUpperCase()}</div><div className="job-main"><div className="job-top"><span className="match">{job.match}% Match</span><span className="job-kind">{job.kind}</span></div><h3>{job.title}</h3><p className="company">{job.company}</p><p className="summary">{job.summary}</p><div className="chips"><span><MapPin size={14} /> {job.location}</span><span><BriefcaseBusiness size={14} /> {job.modality}</span>{job.compensation && <span>{job.compensation}</span>}</div></div><button className="outline" onClick={apply}>{job.url ? 'Ver oportunidad' : 'Revisar'} <ChevronRight size={15} /></button></article>;
}

function Profile({ profile, setProfile, saved, onSave }: { profile: { email: string; profession: string; mode: string; aiOpportunities: boolean }; setProfile: (p: typeof profile) => void; saved: boolean; onSave: () => void }) {
  return <div className="form-page"><div className="page-heading"><div><div className="eyebrow"><UserRound size={14} /> PERFIL PROFESIONAL</div><h1>Mi perfil JobIA</h1><p>Tu perfil alimenta el motor de matching. Puedes cambiarlo cuando quieras.</p></div></div><div className="form-card"><label>Correo electrónico<input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="tu@email.com" /></label><label>Profesión principal<div className="choices">{professions.map((p) => <button className={profile.profession === p ? 'choice selected' : 'choice'} key={p} onClick={() => setProfile({ ...profile, profession: p })}>{profile.profession === p && '✓ '}{p}</button>)}</div></label><label>Modalidad preferida<div className="choices">{modes.map((m) => <button className={profile.mode === m ? 'choice selected' : 'choice'} key={m} onClick={() => setProfile({ ...profile, mode: m })}>{profile.mode === m && '✓ '}{m}</button>)}</div></label><button className={`toggle ${profile.aiOpportunities ? 'on' : ''}`} onClick={() => setProfile({ ...profile, aiOpportunities: !profile.aiOpportunities })}><span /> Incluir oportunidades de IA y human-in-the-loop</button><div className="form-actions"><button className="primary" onClick={onSave}>Guardar perfil</button>{saved && <span className="saved"><CircleCheck size={16} /> Perfil guardado</span>}</div></div></div>;
}

function Alerts({ frequency, setFrequency }: { frequency: string; setFrequency: (v: string) => void }) { return <div className="form-page"><div className="page-heading"><div><div className="eyebrow"><Bell size={14} /> ALERTAS</div><h1>Controla cuándo buscar</h1><p>JobIA respeta la frecuencia que tú elijas. No existe una rutina global obligatoria.</p></div></div><div className="form-card narrow"><label>Frecuencia de búsqueda</label><div className="frequency-list">{frequencies.map((f) => <button className={frequency === f ? 'frequency selected' : 'frequency'} key={f} onClick={() => setFrequency(f)}><span>{frequency === f ? '●' : '○'}</span>{f}<ChevronRight size={16} /></button>)}</div><div className="notice"><Bell size={17} /><div><b>Alertas bajo tu control</b><p>Las notificaciones por email, WhatsApp o móvil sólo se activan cuando estén configuradas y cuenten con tu consentimiento.</p></div></div></div></div>; }

function Applications() { return <div className="form-page"><div className="page-heading"><div><div className="eyebrow"><FileText size={14} /> SEGUIMIENTO</div><h1>Mis aplicaciones</h1><p>Registra tus decisiones y sigue el proceso de cada oportunidad.</p></div></div><div className="empty large"><FileText size={34} /><h3>Aún no tienes aplicaciones registradas</h3><p>Cuando revises y autorices una oportunidad, aparecerá aquí para que puedas seguir su estado.</p></div></div>; }

function NavItem({ icon, label, active, onClick, badge }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number }) { return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span>{badge ? <b>{badge}</b> : null}</button>; }
function Stat({ title, value, detail }: { title: string; value: string; detail: string }) { return <div className="stat"><span>{title}</span><strong>{value}</strong><small>{detail}</small></div>; }
