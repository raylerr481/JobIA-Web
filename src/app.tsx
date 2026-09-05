import { useEffect, useMemo, useState } from 'react';
import { Bell, BriefcaseBusiness, Bookmark, Check, ChevronRight, CircleCheck, ExternalLink, FileText, LayoutDashboard, MapPin, Menu, Search, Settings, Sparkles, UserRound, WandSparkles, X } from 'lucide-react';
import { API_URL, getJobs, saveProfile, type Job, type Profile } from './api';
import { prepareApplication } from './preparation';
import { defaultProfile, loadApplications, loadFrequency, loadProfile, loadSaved, persistFrequency, persistProfile, saveApplication, toggleSaved, updateApplication, type Application, type ApplicationDrafts } from './storage';

type Section = 'dashboard' | 'jobs' | 'saved' | 'applications' | 'profile' | 'alerts';
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
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [frequency, setFrequency] = useState('Diario');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Job | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => { setProfile(loadProfile()); setFrequency(loadFrequency()); setSavedIds(loadSaved()); setApplications(loadApplications()); void loadJobs(); }, []);
  const loadJobs = async (q = '') => { setLoading(true); const result = await getJobs(q); setJobs(result.jobs); setSource(result.source); setLoading(false); };
  const navigate = (next: Section) => { setSection(next); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const savedJobs = useMemo(() => jobs.filter(j => savedIds.includes(j.id)), [jobs, savedIds]);
  const onToggleSaved = (id: string) => setSavedIds(toggleSaved(id));
  const onSaveProfile = async () => { persistProfile(profile); const ok = await saveProfile(profile); setSavedNotice(ok || !API_URL); setTimeout(() => setSavedNotice(false), 2500); };
  const onFrequency = (value: string) => { setFrequency(value); persistFrequency(value); };
  const onPrepare = (job: Job) => { const drafts = prepareApplication(job, profile); saveApplication(job, 'preparando', drafts); setApplications(loadApplications()); setSelected(job); };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Sparkles size={19} /></div><div><strong>JobIA</strong><span>Inteligencia profesional</span></div><button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={20} /></button></div>
      <nav>
        <NavItem icon={<LayoutDashboard size={18} />} label="Inicio" active={section === 'dashboard'} onClick={() => navigate('dashboard')} />
        <NavItem icon={<Search size={18} />} label="Oportunidades" active={section === 'jobs'} onClick={() => navigate('jobs')} badge={jobs.length || undefined} />
        <NavItem icon={<Bookmark size={18} />} label="Guardadas" active={section === 'saved'} onClick={() => navigate('saved')} badge={savedIds.length || undefined} />
        <NavItem icon={<FileText size={18} />} label="Mis aplicaciones" active={section === 'applications'} onClick={() => navigate('applications')} badge={applications.length || undefined} />
        <NavItem icon={<UserRound size={18} />} label="Mi perfil" active={section === 'profile'} onClick={() => navigate('profile')} />
        <NavItem icon={<Bell size={18} />} label="Alertas" active={section === 'alerts'} onClick={() => navigate('alerts')} />
      </nav>
      <div className="sidebar-bottom"><button className="nav-item"><Settings size={18} /> Configuración</button><div className="trainer"><Sparkles size={17} /><div><b>Bitey Trainer</b><small>Motor de inteligencia activo</small></div><span className="dot" /></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={22} /></button><div className="top-search"><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && (navigate('jobs'), void loadJobs(query))} placeholder="Buscar puestos, habilidades o empresas..." /></div><button className="icon-btn" onClick={() => navigate('alerts')} aria-label="Alertas"><Bell size={19} /></button><button className="avatar" onClick={() => navigate('profile')}>J</button></header>
      <div className="content">
        {section === 'dashboard' && <Dashboard jobs={jobs} profile={profile} source={source} savedIds={savedIds} navigate={navigate} onOpen={setSelected} />}
        {section === 'jobs' && <Jobs jobs={jobs} query={query} setQuery={setQuery} loading={loading} source={source} savedIds={savedIds} onSearch={() => void loadJobs(query)} onToggleSaved={onToggleSaved} onOpen={setSelected} onPrepare={onPrepare} />}
        {section === 'saved' && <Jobs jobs={savedJobs} query={query} setQuery={setQuery} loading={false} source="demo" savedIds={savedIds} onSearch={() => undefined} onToggleSaved={onToggleSaved} onOpen={setSelected} onPrepare={onPrepare} savedView />}
        {section === 'profile' && <ProfileEditor profile={profile} setProfile={setProfile} saved={savedNotice} onSave={onSaveProfile} />}
        {section === 'alerts' && <Alerts frequency={frequency} setFrequency={onFrequency} />}
        {section === 'applications' && <Applications applications={applications} onOpen={setSelected} onUpdate={patch => { setApplications(updateApplication(patch.id, patch)); }} />}
      </div>
    </main>
    {selected && <JobDetail job={selected} saved={savedIds.includes(selected.id)} profile={profile} application={applications.find(a => a.job.id === selected.id)} onClose={() => setSelected(null)} onToggleSaved={() => onToggleSaved(selected.id)} onPrepare={() => onPrepare(selected)} onUpdate={patch => setApplications(updateApplication(patch.id, patch))} />}
  </div>;
}

function Dashboard({ jobs, profile, source, savedIds, navigate, onOpen }: { jobs: Job[]; profile: Profile; source: string; savedIds: string[]; navigate: (s: Section) => void; onOpen: (j: Job) => void }) {
  const top = jobs.slice(0, 3); return <><section className="hero"><div><div className="eyebrow"><Sparkles size={15} /> JOBIA INTELLIGENCE</div><h1>Encuentra oportunidades que <em>encajan contigo.</em></h1><p>JobIA analiza tu perfil, habilidades y preferencias para ayudarte a descubrir, entender y preparar tus próximas oportunidades profesionales.</p><button className="primary" onClick={() => navigate('jobs')}><Search size={17} /> Buscar oportunidades <ChevronRight size={17} /></button></div><div className="hero-orb"><Sparkles size={54} /><span>IA</span></div></section>
  <div className="stats"><Stat title="Oportunidades" value={`${jobs.length}`} detail="última búsqueda" /><Stat title="Mejor coincidencia" value={`${top[0]?.match ?? 0}%`} detail="según tu perfil" /><Stat title="Guardadas" value={`${savedIds.length}`} detail="para revisar" /><Stat title="Perfil" value={profile.profession ? 'Activo' : 'Pendiente'} detail={profile.mode} /></div>
  <div className="section-head"><div><h2>Recomendadas para ti</h2><p>Seleccionadas por el motor de matching de JobIA.</p></div><button className="text-btn" onClick={() => navigate('jobs')}>Ver todas <ChevronRight size={16} /></button></div><div className="job-grid">{top.map(job => <JobCard key={job.id} job={job} saved={savedIds.includes(job.id)} onOpen={onOpen} />)}</div>
  <div className="info-grid"><div className="panel"><div className="panel-icon"><UserRound size={18} /></div><div><h3>Completa tu perfil</h3><p>Añade habilidades, experiencia, certificaciones y preferencias para mejorar el matching.</p><button className="text-btn" onClick={() => navigate('profile')}>Editar perfil <ChevronRight size={16} /></button></div></div><div className="panel"><div className="panel-icon"><Bell size={18} /></div><div><h3>Configura tus alertas</h3><p>Recibe oportunidades con la frecuencia que tú decidas.</p><button className="text-btn" onClick={() => navigate('alerts')}>Configurar <ChevronRight size={16} /></button></div></div></div>
  <div className="connection"><CircleCheck size={16} /> {source === 'api' ? 'Conectado al JobIA API' : API_URL ? 'API no disponible — modo seguro de demostración' : 'Modo demostración — configura VITE_JOBIA_API_URL para conectar el backend'}</div></>;
}

function Jobs({ jobs, query, setQuery, loading, source, savedIds, onSearch, onToggleSaved, onOpen, onPrepare, savedView = false }: { jobs: Job[]; query: string; setQuery: (v: string) => void; loading: boolean; source: string; savedIds: string[]; onSearch: () => void; onToggleSaved: (id: string) => void; onOpen: (j: Job) => void; onPrepare: (j: Job) => void; savedView?: boolean }) {
  return <><div className="page-heading"><div><div className="eyebrow"><Search size={14} /> {savedView ? 'GUARDADAS' : 'OPORTUNIDADES'}</div><h1>{savedView ? 'Oportunidades guardadas' : 'Trabajo seleccionado para ti'}</h1><p>{savedView ? 'Revisa las oportunidades que decidiste conservar.' : 'Explora oportunidades y entiende por qué JobIA las considera compatibles.'}</p></div>{!savedView && <span className="source-pill"><span className="dot" /> {source === 'api' ? 'Datos en vivo' : 'Modo demo'}</span>}</div>
  {!savedView && <div className="search-box"><Search size={19} /><input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSearch()} placeholder="Ej.: Python, soporte técnico, remoto..." /><button className="primary small" onClick={onSearch}>Buscar</button></div>}
  {loading ? <div className="empty"><div className="loader" /><h3>Analizando oportunidades...</h3><p>JobIA está consultando su fuente de oportunidades.</p></div> : <div className="job-list">{jobs.map(job => <JobCard key={job.id} job={job} detailed saved={savedIds.includes(job.id)} onOpen={onOpen} onToggleSaved={() => onToggleSaved(job.id)} onPrepare={() => onPrepare(job)} />)}{jobs.length === 0 && <div className="empty"><Bookmark size={30} /><h3>{savedView ? 'No tienes oportunidades guardadas' : 'No encontramos coincidencias'}</h3><p>{savedView ? 'Guarda una oportunidad desde el buscador para verla aquí.' : 'Prueba otra búsqueda o completa tu perfil para mejorar los resultados.'}</p></div>}</div>}</>;
}

function JobCard({ job, detailed = false, saved = false, onOpen, onToggleSaved, onPrepare }: { job: Job; detailed?: boolean; saved?: boolean; onOpen: (j: Job) => void; onToggleSaved?: () => void; onPrepare?: () => void }) {
  return <article className={`job-card ${detailed ? 'detailed' : ''}`}><div className="company-logo">{job.company.slice(0, 1).toUpperCase()}</div><div className="job-main" onClick={() => onOpen(job)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onOpen(job)}><div className="job-top"><span className="match">{job.match}% Match</span><span className="job-kind">{job.kind}</span></div><h3>{job.title}</h3><p className="company">{job.company}</p><p className="summary">{job.summary}</p><div className="chips"><span><MapPin size={14} /> {job.location}</span><span><BriefcaseBusiness size={14} /> {job.modality}</span>{job.compensation && <span>{job.compensation}</span>}</div></div><div className="card-actions">{onToggleSaved && <button className={`icon-btn ${saved ? 'selected-icon' : ''}`} onClick={onToggleSaved} aria-label="Guardar oportunidad"><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /></button>}<button className="outline" onClick={() => onOpen(job)}>Revisar <ChevronRight size={15} /></button>{onPrepare && <button className="primary small" onClick={onPrepare}>Preparar</button>}</div></article>;
}

function JobDetail({ job, saved, profile, application, onClose, onToggleSaved, onPrepare, onUpdate }: { job: Job; saved: boolean; profile: Profile; application?: Application; onClose: () => void; onToggleSaved: () => void; onPrepare: () => void; onUpdate: (patch: { id: string; status?: Application['status']; drafts?: ApplicationDrafts }) => void }) {
  const [preparing, setPreparing] = useState(Boolean(application?.drafts));
  const [drafts, setDrafts] = useState<ApplicationDrafts>(application?.drafts ?? prepareApplication(job, profile));
  const profileSkills = profile.skills ?? [];
  const matched = (job.skills ?? []).filter(s => profileSkills.some(p => p.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(p.toLowerCase())));
  const gaps = (job.skills ?? []).filter(s => !matched.includes(s));
  const currentApp = application;
  const startPreparation = () => { const next = prepareApplication(job, profile); setDrafts(next); setPreparing(true); onPrepare(); };
  const saveDrafts = () => { if (!currentApp) { onPrepare(); } else { onUpdate({ id: currentApp.id, status: 'preparando', drafts }); } };
  return <div className="modal-backdrop" onClick={onClose}><section className={`detail-modal ${preparing ? 'wide' : ''}`} onClick={e => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={20} /></button>
    {!preparing ? <><div className="eyebrow"><Sparkles size={14} /> EXPLICACIÓN DE MATCH</div><h2>{job.title}</h2><p className="company">{job.company} · {job.location} · {job.modality}</p><div className="match-big">{job.match}% <span>compatibilidad estimada</span></div><p>{job.summary}</p><h3>¿Por qué encaja?</h3><div className="chips">{matched.length ? matched.map(s => <span key={s}>✓ {s}</span>) : <span>El perfil aún necesita más señales de coincidencia.</span>}</div>{gaps.length > 0 && <><h3>Aspectos a reforzar</h3><div className="chips">{gaps.map(s => <span key={s}>○ {s}</span>)}</div></>}<h3>Próximo paso</h3><p>JobIA prepara borradores localmente. Tú revisas el contenido y autorizas cualquier acción externa.</p><div className="modal-actions"><button className="outline" onClick={onToggleSaved}><Bookmark size={16} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Guardada' : 'Guardar'}</button><button className="primary" onClick={startPreparation}><WandSparkles size={16} /> {currentApp?.drafts ? 'Editar candidatura' : 'Preparar candidatura'}</button>{job.url && <button className="outline" onClick={() => window.open(job.url, '_blank', 'noopener,noreferrer')}><ExternalLink size={16} /> Fuente</button>}</div></> : <PreparationEditor job={job} drafts={drafts} setDrafts={setDrafts} application={currentApp} onSave={saveDrafts} onAuthorize={() => currentApp && onUpdate({ id: currentApp.id, status: 'autorizada', drafts })} />}
  </section></div>;
}

function PreparationEditor({ job, drafts, setDrafts, application, onSave, onAuthorize }: { job: Job; drafts: ApplicationDrafts; setDrafts: (d: ApplicationDrafts) => void; application?: Application; onSave: () => void; onAuthorize: () => void }) {
  return <div className="prep"><div className="eyebrow"><WandSparkles size={14} /> PREPARACIÓN DE CANDIDATURA</div><h2>{job.title}</h2><p className="prep-intro">Borradores generados para <b>{job.company}</b>. Puedes editar cada campo antes de guardarlo.</p><label>Resumen para CV<textarea value={drafts.cvSummary} onChange={e => setDrafts({ ...drafts, cvSummary: e.target.value })} rows={5} /></label><label>Carta de presentación<textarea value={drafts.coverLetter} onChange={e => setDrafts({ ...drafts, coverLetter: e.target.value })} rows={9} /></label><label>Respuestas / propuesta<textarea value={drafts.answers} onChange={e => setDrafts({ ...drafts, answers: e.target.value })} rows={7} /></label><label>Notas de revisión<textarea value={drafts.notes} onChange={e => setDrafts({ ...drafts, notes: e.target.value })} rows={3} /></label><div className="authorization"><CircleCheck size={18} /><div><b>Control del usuario</b><span>Nada se envía automáticamente. La autorización sólo marca que tú aprobaste el contenido.</span></div></div><div className="modal-actions"><button className="primary" onClick={onSave}><Check size={16} /> Guardar preparación</button>{application && <button className="outline" onClick={onAuthorize} disabled={application.status === 'autorizada'}>{application.status === 'autorizada' ? 'Autorizada' : 'Autorizar siguiente paso'}</button>}</div></div>;
}

function Applications({ applications, onOpen, onUpdate }: { applications: Application[]; onOpen: (j: Job) => void; onUpdate: (patch: { id: string; status?: Application['status'] }) => void }) {
  return <div><div className="page-heading"><div><div className="eyebrow"><FileText size={14} /> SEGUIMIENTO</div><h1>Mis aplicaciones</h1><p>Controla preparación y autorización sin enviar nada automáticamente.</p></div></div>{applications.length === 0 ? <div className="empty"><FileText size={30} /><h3>Aún no tienes candidaturas preparadas</h3><p>Abre una oportunidad y selecciona “Preparar candidatura”.</p></div> : <div className="application-list">{applications.map(app => <article className="application-card" key={app.id}><div><span className={`status status-${app.status}`}>{app.status === 'autorizada' ? 'Autorizada' : app.status === 'preparando' ? 'Preparando' : 'Revisada'}</span><h3>{app.job.title}</h3><p>{app.job.company} · {app.job.location}</p><small>Actualizada {new Date(app.updatedAt).toLocaleString()}</small></div><div className="card-actions"><button className="outline" onClick={() => onOpen(app.job)}>Abrir</button>{app.status !== 'autorizada' && <button className="primary small" onClick={() => onUpdate({ id: app.id, status: app.status === 'preparando' ? 'autorizada' : 'preparando' })}>{app.status === 'preparando' ? 'Autorizar' : 'Preparar'}</button>}</div></article>)}</div>}</div>;
}

function ProfileEditor({ profile, setProfile, saved, onSave }: { profile: Profile; setProfile: (p: Profile) => void; saved: boolean; onSave: () => void }) {
  const [skills, setSkills] = useState((profile.skills ?? []).join(', '));
  useEffect(() => setSkills((profile.skills ?? []).join(', ')), [profile.skills]);
  const commitSkills = () => setProfile({ ...profile, skills: skills.split(',').map(s => s.trim()).filter(Boolean) });
  return <div className="form-page"><div className="page-heading"><div><div className="eyebrow"><UserRound size={14} /> PERFIL PROFESIONAL</div><h1>Mi perfil JobIA</h1><p>Tu perfil alimenta el matching y se guarda localmente en este navegador.</p></div></div><div className="form-card"><label>Correo electrónico<input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="tu@email.com" /></label><label>Profesión principal<div className="choices">{professions.map(p => <button type="button" className={profile.profession === p ? 'choice selected' : 'choice'} key={p} onClick={() => setProfile({ ...profile, profession: p })}>{profile.profession === p && '✓ '}{p}</button>)}</div></label><label>Modalidad preferida<div className="choices">{modes.map(m => <button type="button" className={profile.mode === m ? 'choice selected' : 'choice'} key={m} onClick={() => setProfile({ ...profile, mode: m })}>{profile.mode === m && '✓ '}{m}</button>)}</div></label><label>Habilidades <input value={skills} onChange={e => setSkills(e.target.value)} onBlur={commitSkills} placeholder="Python, SQL, Redes, Soporte técnico" /></label><label className="check-row"><input type="checkbox" checked={profile.aiOpportunities} onChange={e => setProfile({ ...profile, aiOpportunities: e.target.checked })} /> Mostrar oportunidades de trabajo con IA y human-in-the-loop</label><button className="primary" onClick={() => { commitSkills(); onSave(); }}><Check size={17} /> Guardar perfil</button>{saved && <span className="saved-feedback"><CircleCheck size={15} /> Perfil guardado</span>}</div></div>;
}

function Alerts({ frequency, setFrequency }: { frequency: string; setFrequency: (v: string) => void }) { return <div className="form-page"><div className="page-heading"><div><div className="eyebrow"><Bell size={14} /> ALERTAS</div><h1>Cuándo quieres recibir oportunidades</h1><p>La preferencia se guarda localmente. El envío real dependerá del backend y del canal que autorices.</p></div></div><div className="form-card"><div className="choices">{frequencies.map(v => <button type="button" className={frequency === v ? 'choice selected' : 'choice'} key={v} onClick={() => setFrequency(v)}>{frequency === v && '✓ '}{v}</button>)}</div><div className="authorization"><Bell size={18} /><div><b>Privacidad primero</b><span>JobIA no activa comunicaciones externas sólo por cambiar esta preferencia.</span></div></div></div></div>; }

function NavItem({ icon, label, active, onClick, badge }: { icon: JSX.Element; label: string; active: boolean; onClick: () => void; badge?: number }) { return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span>{badge ? <b>{badge}</b> : null}</button>; }
function Stat({ title, value, detail }: { title: string; value: string; detail: string }) { return <div className="stat"><span>{title}</span><strong>{value}</strong><small>{detail}</small></div>; }
