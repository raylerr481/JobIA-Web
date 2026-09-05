import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Bell, BriefcaseBusiness, Bookmark, Check, ChevronRight, CircleCheck, ExternalLink, FileText, LayoutDashboard, MapPin, Menu, Search, Settings, Sparkles, UserRound, WandSparkles, X } from 'lucide-react';
import { API_URL, getJobs, saveProfile, type Job, type Profile } from './api';
import { calculateMatch, rankJobs } from './matching';
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
  const rankedJobs = useMemo(() => rankJobs(jobs, profile).map(({ job, match }) => ({ ...job, match: match.score })), [jobs, profile]);
  const savedJobs = useMemo(() => rankedJobs.filter(j => savedIds.includes(j.id)), [rankedJobs, savedIds]);
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
        {section === 'dashboard' && <Dashboard jobs={rankedJobs} profile={profile} source={source} savedIds={savedIds} navigate={navigate} onOpen={setSelected} />}
        {section === 'jobs' && <Jobs jobs={rankedJobs} query={query} setQuery={setQuery} loading={loading} source={source} savedIds={savedIds} onSearch={() => void loadJobs(query)} onToggleSaved={onToggleSaved} onOpen={setSelected} onPrepare={onPrepare} />}
        {section === 'saved' && <Jobs jobs={savedJobs} query={query} setQuery={setQuery} loading={false} source={source} savedIds={savedIds} onSearch={() => undefined} onToggleSaved={onToggleSaved} onOpen={setSelected} onPrepare={onPrepare} savedView />}
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
  <div className="stats"><Stat title="Oportunidades" value={`${jobs.length}`} detail="última búsqueda" /><Stat title="Mejor coincidencia" value={`${top[0]?.match ?? 0}%`} detail="calculada por JobIA" /><Stat title="Guardadas" value={`${savedIds.length}`} detail="para revisar" /><Stat title="Perfil" value={profile.profession ? 'Activo' : 'Pendiente'} detail={profile.mode} /></div>
  <div className="section-head"><div><h2>Recomendadas para ti</h2><p>Ordenadas por el motor de matching de JobIA según tu perfil actual.</p></div><button className="text-btn" onClick={() => navigate('jobs')}>Ver todas <ChevronRight size={16} /></button></div><div className="job-grid">{top.map(job => <JobCard key={job.id} job={job} saved={savedIds.includes(job.id)} onOpen={onOpen} />)}</div>
  <div className="info-grid"><div className="panel"><div className="panel-icon"><UserRound size={18} /></div><div><h3>Completa tu perfil</h3><p>Añade habilidades, experiencia, certificaciones y preferencias para mejorar el matching.</p><button className="text-btn" onClick={() => navigate('profile')}>Editar perfil <ChevronRight size={16} /></button></div></div><div className="panel"><div className="panel-icon"><Bell size={18} /></div><div><h3>Configura tus alertas</h3><p>Recibe oportunidades con la frecuencia que tú decidas.</p><button className="text-btn" onClick={() => navigate('alerts')}>Configurar <ChevronRight size={16} /></button></div></div></div>
  <div className="connection"><CircleCheck size={16} /> {source === 'api' ? 'Conectado al JobIA API · matching local activo' : API_URL ? 'API no disponible — matching local en modo seguro' : 'Modo demostración — matching local activo; configura VITE_JOBIA_API_URL para conectar el backend'}</div></>;
}

function Jobs({ jobs, query, setQuery, loading, source, savedIds, onSearch, onToggleSaved, onOpen, onPrepare, savedView = false }: { jobs: Job[]; query: string; setQuery: (v: string) => void; loading: boolean; source: string; savedIds: string[]; onSearch: () => void; onToggleSaved: (id: string) => void; onOpen: (j: Job) => void; onPrepare: (j: Job) => void; savedView?: boolean }) {
  return <><div className="page-heading"><div><div className="eyebrow"><Search size={14} /> {savedView ? 'GUARDADAS' : 'OPORTUNIDADES'}</div><h1>{savedView ? 'Oportunidades guardadas' : 'Trabajo seleccionado para ti'}</h1><p>{savedView ? 'Revisa las oportunidades que decidiste conservar.' : 'Explora oportunidades y entiende por qué JobIA las considera compatibles.'}</p></div>{!savedView && <span className="source-pill"><span className="dot" /> {source === 'api' ? 'Datos en vivo' : 'Modo demo'} · matching JobIA</span>}</div>
  {!savedView && <div className="search-box"><Search size={19} /><input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSearch()} placeholder="Ej.: Python, soporte técnico, remoto..." /><button className="primary small" onClick={onSearch}>Buscar</button></div>}
  {loading ? <div className="empty"><div className="loader" /><h3>Analizando oportunidades...</h3><p>JobIA está consultando su fuente de oportunidades.</p></div> : <div className="job-list">{jobs.map(job => <JobCard key={job.id} job={job} detailed saved={savedIds.includes(job.id)} onOpen={onOpen} onToggleSaved={() => onToggleSaved(job.id)} onPrepare={() => onPrepare(job)} />)}{jobs.length === 0 && <div className="empty"><Bookmark size={30} /><h3>{savedView ? 'No tienes oportunidades guardadas' : 'No encontramos coincidencias'}</h3><p>{savedView ? 'Guarda una oportunidad desde el buscador para verla aquí.' : 'Prueba otra búsqueda o completa tu perfil para mejorar los resultados.'}</p></div>}</div>}</>;
}

function JobCard({ job, detailed = false, saved = false, onOpen, onToggleSaved, onPrepare }: { job: Job; detailed?: boolean; saved?: boolean; onOpen: (j: Job) => void; onToggleSaved?: () => void; onPrepare?: () => void }) {
  return <article className={`job-card ${detailed ? 'detailed' : ''}`}><div className="company-logo">{job.company.slice(0, 1).toUpperCase()}</div><div className="job-main" onClick={() => onOpen(job)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onOpen(job)}><div className="job-top"><span className="match">{job.match}% Match</span><span className="job-kind">{job.kind}</span></div><h3>{job.title}</h3><p className="company">{job.company}</p><p className="summary">{job.summary}</p><div className="chips"><span><MapPin size={14} /> {job.location}</span><span><BriefcaseBusiness size={14} /> {job.modality}</span>{job.compensation && <span>{job.compensation}</span>}</div></div><div className="card-actions">{onToggleSaved && <button className={`icon-btn ${saved ? 'selected-icon' : ''}`} onClick={onToggleSaved} aria-label="Guardar oportunidad"><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /></button>}<button className="outline" onClick={() => onOpen(job)}>Revisar <ChevronRight size={15} /></button>{onPrepare && <button className="primary small" onClick={onPrepare}>Preparar</button>}</div></article>;
}

function JobDetail({ job, saved, profile, application, onClose, onToggleSaved, onPrepare, onUpdate }: { job: Job; saved: boolean; profile: Profile; application?: Application; onClose: () => void; onToggleSaved: () => void; onPrepare: () => void; onUpdate: (patch: { id: string; status?: Application['status']; drafts?: ApplicationDrafts }) => void }) {
  const [preparing, setPreparing] = useState(Boolean(application?.drafts));
  const [drafts, setDrafts] = useState<ApplicationDrafts>(application?.drafts ?? prepareApplication(job, profile));
  const match = calculateMatch(job, profile);
  const currentApp = application;
  const startPreparation = () => { const next = prepareApplication(job, profile); setDrafts(next); setPreparing(true); onPrepare(); };
  const saveDrafts = () => { if (!currentApp) { onPrepare(); } else { onUpdate({ id: currentApp.id, status: 'preparando', drafts }); } };
  return <div className="modal-backdrop" onClick={onClose}><section className={`detail-modal ${preparing ? 'wide' : ''}`} onClick={e => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={20} /></button>
    {!preparing ? <><div className="eyebrow"><Sparkles size={14} /> EXPLICACIÓN DE MATCH</div><h2>{job.title}</h2><p className="company">{job.company} · {job.location} · {job.modality}</p><div className="match-big">{match.score}% <span>compatibilidad calculada por JobIA</span></div><p>{job.summary}</p><h3>¿Por qué encaja?</h3><div className="chips">{match.strengths.length ? match.strengths.map(s => <span key={s}>✓ {s}</span>) : <span>El perfil aún necesita más señales de coincidencia.</span>}</div>{match.gaps.length > 0 && <><h3>Aspectos a reforzar</h3><div className="chips">{match.gaps.map(s => <span key={s}>○ {s}</span>)}</div></>}<h3>Próximo paso</h3><p>JobIA prepara borradores localmente. Tú revisas el contenido y autorizas cualquier acción externa.</p><div className="modal-actions"><button className="outline" onClick={onToggleSaved}><Bookmark size={16} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Guardada' : 'Guardar'}</button><button className="primary" onClick={startPreparation}><WandSparkles size={16} /> {currentApp?.drafts ? 'Editar candidatura' : 'Preparar candidatura'}</button>{job.url && <button className="outline" onClick={() => window.open(job.url, '_blank', 'noopener,noreferrer')}><ExternalLink size={16} /> Ver oferta</button>}</div></> : <><div className="eyebrow"><WandSparkles size={14} /> PREPARACIÓN ASISTIDA</div><h2>Preparar candidatura</h2><p className="company">{job.title} · {job.company}</p><div className="draft-grid"><DraftField label="Resumen para CV" value={drafts.cvSummary} onChange={v => setDrafts(d => ({ ...d, cvSummary: v }))} /><DraftField label="Carta de presentación" value={drafts.coverLetter} onChange={v => setDrafts(d => ({ ...d, coverLetter: v }))} /><DraftField label="Respuestas de candidatura" value={drafts.answers} onChange={v => setDrafts(d => ({ ...d, answers: v }))} /><DraftField label="Notas de revisión" value={drafts.notes} onChange={v => setDrafts(d => ({ ...d, notes: v }))} /></div><div className="modal-actions"><button className="outline" onClick={() => setPreparing(false)}>Volver</button><button className="primary" onClick={saveDrafts}><Check size={16} /> Guardar preparación</button></div><p className="privacy-note">La preparación se genera localmente en este frontend. No se envía una candidatura automáticamente.</p></>}
  </section></div>;
}

function DraftField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) { return <label className="draft-field"><span>{label}</span><textarea value={value} onChange={e => onChange(e.target.value)} rows={7} /></label>; }
function Stat({ title, value, detail }: { title: string; value: string; detail: string }) { return <div className="stat"><span>{title}</span><strong>{value}</strong><small>{detail}</small></div>; }
function NavItem({ icon, label, active, onClick, badge }: { icon: ReactNode; label: string; active: boolean; onClick: () => void; badge?: number }) { return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span>{badge ? <b>{badge}</b> : null}</button>; }

function ProfileEditor({ profile, setProfile, saved, onSave }: { profile: Profile; setProfile: (p: Profile) => void; saved: boolean; onSave: () => void }) {
  const [skills, setSkills] = useState((profile.skills ?? []).join(', '));
  useEffect(() => setSkills((profile.skills ?? []).join(', ')), [profile.skills]);
  const update = (patch: Partial<Profile>) => setProfile({ ...profile, ...patch });
  return <><div className="page-heading"><div><div className="eyebrow"><UserRound size={14} /> MI PERFIL</div><h1>Tu perfil profesional</h1><p>Estas señales alimentan el motor de matching de JobIA.</p></div></div><div className="profile-panel"><label>Profesión<select value={profile.profession} onChange={e => update({ profession: e.target.value })}>{professions.map(x => <option key={x}>{x}</option>)}</select></label><label>Modalidad preferida<select value={profile.mode} onChange={e => update({ mode: e.target.value })}>{modes.map(x => <option key={x}>{x}</option>)}</select></label><label>Email<input value={profile.email} onChange={e => update({ email: e.target.value })} placeholder="tu@email.com" /></label><label>Habilidades<textarea value={skills} onChange={e => { setSkills(e.target.value); update({ skills: e.target.value.split(',').map(x => x.trim()).filter(Boolean) }); }} rows={5} placeholder="Python, Redes, Windows, Soporte técnico" /></label><label className="check-row"><input type="checkbox" checked={profile.aiOpportunities} onChange={e => update({ aiOpportunities: e.target.checked })} /> Incluir oportunidades de evaluación y trabajo relacionado con IA</label><div className="modal-actions"><button className="primary" onClick={onSave}><Check size={16} /> Guardar perfil</button>{saved && <span className="saved-message"><CircleCheck size={16} /> Perfil guardado</span>}</div></div></>;
}
function Alerts({ frequency, setFrequency }: { frequency: string; setFrequency: (v: string) => void }) { return <><div className="page-heading"><div><div className="eyebrow"><Bell size={14} /> ALERTAS</div><h1>Controla cuándo buscar</h1><p>La frecuencia queda guardada localmente hasta conectar el backend.</p></div></div><div className="alert-panel">{frequencies.map(f => <button key={f} className={frequency === f ? 'selected-frequency' : ''} onClick={() => setFrequency(f)}><Bell size={17} /><span>{f}</span>{frequency === f && <Check size={16} />}</button>)}</div></>; }
function Applications({ applications, onOpen, onUpdate }: { applications: Application[]; onOpen: (j: Job) => void; onUpdate: (p: { id: string; status?: Application['status'] }) => void }) { return <><div className="page-heading"><div><div className="eyebrow"><FileText size={14} /> MIS APLICACIONES</div><h1>Tu proceso, bajo tu control</h1><p>JobIA conserva el estado y tus borradores sin enviar candidaturas por su cuenta.</p></div></div>{applications.length === 0 ? <div className="empty"><FileText size={30} /><h3>Aún no tienes candidaturas preparadas</h3><p>Abre una oportunidad y usa “Preparar candidatura”.</p></div> : <div className="application-list">{applications.map(a => <article className="application-card" key={a.id}><div><span className="job-kind">{a.status}</span><h3>{a.job.title}</h3><p>{a.job.company} · {a.job.location}</p><small>Actualizada: {new Date(a.updatedAt).toLocaleString()}</small></div><div className="card-actions"><button className="outline" onClick={() => onOpen(a.job)}>Abrir</button>{a.status !== 'autorizada' && <button className="primary small" onClick={() => onUpdate({ id: a.id, status: 'autorizada' })}>Autorizar</button>}</div></article>)}</div>}</>; }
