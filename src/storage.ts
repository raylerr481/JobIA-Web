import type { Job, Profile } from './api';

const PROFILE_KEY = 'jobia:profile:v1';
const SAVED_KEY = 'jobia:saved:v1';
const APPLICATIONS_KEY = 'jobia:applications:v1';
const ALERT_KEY = 'jobia:alert:v1';

export type ApplicationDrafts = { cvSummary: string; coverLetter: string; answers: string; notes: string };
export type Application = { id: string; job: Job; status: 'revisada' | 'preparando' | 'autorizada'; updatedAt: string; drafts?: ApplicationDrafts };

function read<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function write<T>(key: string, value: T) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private/demo mode */ } }
function newId(job: Job) { return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${job.id}`; }

export const defaultProfile: Profile = { email: '', profession: 'Informática / IT', mode: 'Remoto', aiOpportunities: true, skills: ['Python', 'Redes', 'Windows', 'Soporte técnico'] };
export function loadProfile() { return read<Profile>(PROFILE_KEY, defaultProfile); }
export function persistProfile(profile: Profile) { write(PROFILE_KEY, profile); }
export function loadSaved() { return read<string[]>(SAVED_KEY, []); }
export function toggleSaved(id: string) { const current = loadSaved(); const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id]; write(SAVED_KEY, next); return next; }
export function loadApplications() { return read<Application[]>(APPLICATIONS_KEY, []); }
export function saveApplication(job: Job, status: Application['status'] = 'revisada', drafts?: ApplicationDrafts) {
  const current = loadApplications(); const existing = current.find(a => a.job.id === job.id);
  const next = existing ? current.map(a => a.job.id === job.id ? { ...a, status, updatedAt: new Date().toISOString(), drafts: drafts ?? a.drafts } : a) : [{ id: newId(job), job, status, updatedAt: new Date().toISOString(), drafts }, ...current];
  write(APPLICATIONS_KEY, next); return next;
}
export function updateApplication(id: string, patch: Partial<Pick<Application, 'status' | 'drafts'>>) {
  const current = loadApplications(); const next = current.map(a => a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a); write(APPLICATIONS_KEY, next); return next;
}
export function loadFrequency() { return read(ALERT_KEY, 'Diario'); }
export function persistFrequency(value: string) { write(ALERT_KEY, value); }
