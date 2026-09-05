import type { Job, Profile } from './api';

export type MatchReason = { skill: string; matched: boolean };
export type MatchResult = { score: number; reasons: MatchReason[]; strengths: string[]; gaps: string[] };

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const tokens = (value: string) => normalize(value).split(/[^a-z0-9+#.]+/).filter(Boolean);
const overlaps = (a: string, b: string) => {
  const aa = normalize(a); const bb = normalize(b);
  return aa === bb || aa.includes(bb) || bb.includes(aa) || tokens(a).some(t => tokens(b).includes(t) && t.length > 2);
};

export function calculateMatch(job: Job, profile: Profile): MatchResult {
  const required = job.skills ?? [];
  const owned = profile.skills ?? [];
  const reasons = required.map(skill => ({ skill, matched: owned.some(item => overlaps(item, skill)) }));
  const strengths = reasons.filter(r => r.matched).map(r => r.skill);
  const gaps = reasons.filter(r => !r.matched).map(r => r.skill);

  const skillScore = required.length ? (strengths.length / required.length) * 70 : 50;
  const modalityScore = normalize(job.modality) === normalize(profile.mode) ? 15 : 5;
  const professionScore = profile.profession && normalize(job.title + ' ' + job.summary).includes(normalize(profile.profession.split('/')[0])) ? 15 : 8;
  const score = Math.max(0, Math.min(100, Math.round(skillScore + modalityScore + professionScore)));
  return { score, reasons, strengths, gaps };
}

export function rankJobs(jobs: Job[], profile: Profile) {
  return jobs.map(job => ({ job, match: calculateMatch(job, profile) })).sort((a, b) => b.match.score - a.match.score);
}
