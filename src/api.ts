export type Job = { id: string; title: string; company: string; location: string; modality: string; kind: string; match: number; compensation?: string; summary: string; url?: string; skills?: string[] };
export type Profile = { email: string; profession: string; mode: string; aiOpportunities: boolean; skills?: string[] };
const API_URL = (import.meta.env.VITE_JOBIA_API_URL as string | undefined)?.replace(/\/$/, '');
const demoJobs: Job[] = [
  { id: 'demo-1', title: 'AI Response Evaluator', company: 'JobIA Network', location: 'Brasil', modality: 'Remoto', kind: 'Human-in-the-loop', match: 94, summary: 'Avalie respuestas de IA usando su conocimiento técnico y criterios de calidad.', skills: ['IA', 'Evaluación', 'Portugués', 'Pensamiento crítico'] },
  { id: 'demo-2', title: 'Soporte técnico remoto', company: 'JobIA Network', location: 'Brasil', modality: 'Remoto', kind: 'Tiempo completo', match: 89, summary: 'Atendimento e resolução de problemas para usuários e ambientes de tecnologia.', skills: ['Soporte', 'Windows', 'Redes', 'Atención al cliente'] },
  { id: 'demo-3', title: 'Analista de datos junior', company: 'JobIA Network', location: 'Brasil', modality: 'Híbrido', kind: 'Contrato', match: 84, summary: 'Análise, limpeza e interpretação de dados para apoiar decisões de negócio.', skills: ['Python', 'SQL', 'Excel', 'Datos'] },
];
async function request<T>(path: string, options?: RequestInit): Promise<T> { if (!API_URL) throw new Error('JobIA API no configurada'); const response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) } }); if (!response.ok) throw new Error(`JobIA API: HTTP ${response.status}`); return response.json() as Promise<T>; }
function filterDemo(query: string) { const q = query.trim().toLowerCase(); if (!q) return demoJobs; return demoJobs.filter((j) => `${j.title} ${j.company} ${j.kind} ${j.summary} ${(j.skills ?? []).join(' ')}`.toLowerCase().includes(q)); }
export async function getJobs(query = ''): Promise<{ jobs: Job[]; source: 'api' | 'demo' }> { if (!API_URL) return { jobs: filterDemo(query), source: 'demo' }; try { const data = await request<Job[]>(`/jobs${query ? `?q=${encodeURIComponent(query)}` : ''}`); return { jobs: data, source: 'api' }; } catch { return { jobs: filterDemo(query), source: 'demo' }; } }
export async function saveProfile(profile: Profile): Promise<boolean> { if (!API_URL) return true; try { await request('/profile', { method: 'PUT', body: JSON.stringify(profile) }); return true; } catch { return false; } }
export { API_URL };
