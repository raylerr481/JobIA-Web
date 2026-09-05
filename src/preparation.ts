import type { Job, Profile } from './api';
import type { ApplicationDrafts } from './storage';

const clean = (value: string) => value.trim().replace(/\s+/g, ' ');
const skills = (profile.skills ?? []).map(clean).filter(Boolean);

export function prepareApplication(job: Job, profile: Profile): ApplicationDrafts {
  const skillText = skills.length ? skills.join(', ') : 'habilidades técnicas y profesionales relevantes';
  const profession = profile.profession || 'profesional';
  const location = profile.mode || 'la modalidad indicada';
  const matched = (job.skills ?? []).filter(required => skills.some(have => have.toLowerCase().includes(required.toLowerCase()) || required.toLowerCase().includes(have.toLowerCase())));
  const matchText = matched.length ? ` Entre mis fortalezas destacan ${matched.join(', ')}.` : '';

  return {
    cvSummary: `${profession} con experiencia orientada a resultados y conocimientos en ${skillText}. Interesado/a en oportunidades ${location.toLowerCase()} y en aplicar capacidades técnicas, resolución de problemas y aprendizaje continuo.${matchText}`,
    coverLetter: `Hola,\n\nMe interesa la oportunidad de ${job.title} en ${job.company}. Mi perfil como ${profession.toLowerCase()} y mis conocimientos en ${skillText} me permiten aportar una combinación de capacidad técnica, análisis y orientación a resultados.\n\nLa posición me resulta especialmente atractiva por su enfoque en ${job.kind.toLowerCase()} y por la posibilidad de contribuir en un entorno donde pueda seguir desarrollando mis competencias.${matchText}\n\nQuedo disponible para conversar sobre mi experiencia y sobre cómo puedo contribuir al equipo.\n\nSaludos,\n${profile.email || 'Candidato/a'}`,
    answers: `Motivación: Me interesa ${job.title} porque conecta mi experiencia como ${profession.toLowerCase()} con la posibilidad de aportar valor en ${job.company}.\n\nFortalezas relevantes: ${skillText}.${matched.length ? `\n\nCoincidencias directas: ${matched.join(', ')}.` : ''}\n\nDisponibilidad: ${location}.`,
    notes: `Borrador generado localmente por JobIA. Revisar datos, requisitos, experiencia y condiciones antes de autorizar cualquier acción externa.`
  };
}
