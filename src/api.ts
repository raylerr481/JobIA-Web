export type MatchReason = { skill: string; matched: boolean };
export type Job = { id: string; title: string; company: string; location: string; modality: string; kind: string; match: number; compensation?: string; summary: string; url?: string; skills?: string[]; match_reasons?: MatchReason[]; strengths?: string[]; gaps?: string[] };
export type Profile = { email: string; profession: string; mode: string; aiOpportunities: boolean; skills?: string[] };
export type JobsResponse = Job[] | { jobs?: Job[]; data?: Job[]; results?: Job[] };
export type JobIAContract = { name: string; module: string; parent_system: string; specialization: string; host_channel: string; trainer: { module: string; direction: string; purpose: string } | string; clients: string[]; principle: string };
export type JobIAStatus = { status: string; service?: string; version?: string; contract?: string; persistence?: string };
export type ApplicationDrafts = { cvSummary: string; coverLetter: string; answers: string; notes: string };

// Configure this to the real JobIA API service in the Cloudflare Pages/Workers build settings.
const API_URL = ((import.meta.env.VITE_JOBIA_API_URL as string | undefined) || 'https://jobia-api.onrender.com').trim().replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = 12000;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error('JobIA API no configurada: define VITE_JOBIA_API_URL.');
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const callerSignal = options?.signal;
  const abortFromCaller = () => controller.abort();
  callerSignal?.addEventListener('abort', abortFromCaller, { once: true });
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...(options?.body ? { 'Content-Type': 'application/json' } : {}), ...(options?.headers ?? {}) },
    });
    if (!response.ok) throw new Error(`JobIA API: HTTP ${response.status}`);
    if (response.status === 204) return undefined as T;
    return await response.json() as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw new Error('El backend JobIA agotó el tiempo de espera.');
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
    callerSignal?.removeEventListener('abort', abortFromCaller);
  }
}

function normalizeJobs(data: JobsResponse): Job[] {
  const rows = Array.isArray(data) ? data : Array.isArray(data.jobs) ? data.jobs : Array.isArray(data.data) ? data.data : Array.isArray(data.results) ? data.results : [];
  return rows.filter((job) => job && typeof job.id === 'string' && typeof job.title === 'string')
    .map((job) => ({ ...job, match: Number.isFinite(Number(job.match)) ? Math.max(0, Math.min(100, Number(job.match))) : 0 }));
}

export async function getJobs(query = '', email = ''): Promise<{ jobs: Job[]; source: 'api' | 'error'; error?: string }> {
  try {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (email.trim()) params.set('email', email.trim());
    const suffix = params.toString() ? `?${params.toString()}` : '';
    const data = await request<JobsResponse>(`/jobs${suffix}`);
    return { jobs: normalizeJobs(data), source: 'api' };
  } catch (error) {
    return { jobs: [], source: 'error', error: error instanceof Error ? error.message : 'No se pudo conectar con el backend JobIA.' };
  }
}

export async function getProfile(email: string): Promise<Profile | null> {
  const normalizedEmail = email.trim();
  if (!normalizedEmail) return null;
  try { return await request<Profile>(`/profile?email=${encodeURIComponent(normalizedEmail)}`); } catch { return null; }
}

export async function saveProfile(profile: Profile): Promise<boolean> {
  if (!profile.email.trim()) return false;
  try { await request<Profile>('/profile', { method: 'PUT', body: JSON.stringify(profile) }); return true; } catch { return false; }
}

export async function getJob(jobId: string, email = ''): Promise<Job | null> {
  if (!jobId) return null;
  try { return await request<Job>(`/jobs/${encodeURIComponent(jobId)}${email ? `?email=${encodeURIComponent(email)}` : ''}`); } catch { return null; }
}

export async function prepareApplicationRemote(jobId: string, profile: Profile): Promise<ApplicationDrafts | null> {
  if (!jobId) return null;
  try { return await request<ApplicationDrafts>('/applications/prepare', { method: 'POST', body: JSON.stringify({ job_id: jobId, profile }) }); } catch { return null; }
}

export async function getContract(): Promise<JobIAContract | null> {
  try { return await request<JobIAContract>('/api/v1/contract'); } catch { return null; }
}

export async function getHealth(): Promise<JobIAStatus | null> {
  try { return await request<JobIAStatus>('/health'); } catch { return null; }
}

export { API_URL };
