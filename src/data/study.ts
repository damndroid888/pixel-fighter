// Trilha de estudo — Defesa Cibernética Cívica
// Integra o plano de 6 meses (plano-ciberseguranca-6-meses.md) ao Pixel Fighter.
// Mesmas leis do dojo: o mínimo conta integral, a Regra da Reentrada vale aqui
// também, e a gamificação é aliada, nunca juiz.

import type { Activity } from "@/data/plan";

// Estudo diário — o "neigong matinal" da mente. 20 minutos inegociáveis,
// no pior dia. Conteúdo do mês corrente do plano (SC-900, TryHackMe, labs...).
export const STUDY_DAILY: Activity = {
  id: "estudo_daily",
  weekday: -1,
  dayLabel: "Todos os dias",
  title: "Estudo — mínimo inegociável (20 min)",
  emoji: "🛡️",
  accent: "#34d399",
  bonusXp: 10,
  exercises: [
    {
      id: "mod",
      name: "Módulo de estudo (20 min)",
      xp: 15,
      hint: "SC-900 · TryHackMe · lab",
      guide:
        "Como fazer:\n• Escolha UMA fonte (Microsoft Learn, TryHackMe, LetsDefend) — nunca duas no mesmo dia\n• 25 min em bloco único ou Pomodoro (25/5)\n• Dia difícil? 20 min conta integral — não negocie no meio\n• Conteúdo segue o mês do plano: mês 1 SC-900 + TryHackMe 'Pre-Security'; depois Defender for Endpoint, SC-200, labs\nCuidados: estudar sem produzir artefato é meio-estudo — o artefato do domingo completa o ciclo. O cérebro com TDAH aprende fazendo: prefira labs a vídeos passivos.",
    },
  ],
};

// Revisão de domingo — fecha a semana dos dois planos (treino + estudo)
// e transforma aprendizado em proteção real para leigos (método 3.4).
export const STUDY_SUNDAY: Activity = {
  id: "estudo_domingo",
  weekday: 0,
  dayLabel: "Domingo",
  title: "Revisão semanal + artefato (método 3.4)",
  emoji: "📜",
  accent: "#a3e635",
  bonusXp: 10,
  exercises: [
    {
      id: "rev",
      name: "Revisão dos dois planos (15 min)",
      xp: 10,
      hint: "mesmo caderno do dojo",
      guide:
        "Como fazer:\n• 15 minutos, mesmo caderno da revisão do treino\n• Responda: o que estudei? o que treinei? quem isso protege?\n• Olhe o placar da semana (app + calendário de parede) sem julgamento — semana tem presença, não nota\n• Defina o sinal do dia seguinte (🔴🟡🟢) com honestidade\nCuidados: a revisão conecta estudo a pessoas reais — é o combustível motivacional. Sem ela, o plano vira obrigação; com ela, vira missão.",
    },
    {
      id: "art",
      name: "Artefato da semana (guia, cartão ou lab)",
      xp: 15,
      hint: "1 entregável para leigos",
      guide:
        "Como fazer:\n• Produza 1 artefato simples que um leigo usa sozinho: guia de 1 página, cartão, checklist, ou 1 lab documentado\n• Padrão: letra grande · uma ação por passo · zero sigla sem explicação · testado com um familiar real\n• Exemplos já feitos: Cartão de Emergência da Família, 'Seu Android seguro em 30 minutos'\n• Próximos da fila: 'Proteja um Windows em 1 hora' · kit de crise anti-ransomware · 'Backup que salva' · mini-guia anti-fake-news\nCuidados: explicar é o método de estudo com mais evidência de fixação — você nunca mais esquece o que ensinou. E o artefato fica protegendo alguém mesmo nos dias em que você não estuda.",
    },
  ],
};

export interface StudyStats {
  studyStreak: number; // dias consecutivos com pelo menos 1 check de estudo
  studyActiveDays: number; // dias com pelo menos 1 check de estudo
  artifactDays: number; // dias com um artefato concluído
  studyCameBackAfterBreak: boolean; // voltou a estudar após pausa de 3+ dias
}

export interface StudyAchievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  test: (s: StudyStats) => boolean;
}

export const STUDY_ACHIEVEMENTS: StudyAchievement[] = [
  {
    id: "study-first",
    name: "Primeiro Módulo",
    desc: "Marcou o primeiro módulo de estudo",
    icon: "📗",
    test: (s) => s.studyActiveDays >= 1,
  },
  {
    id: "study-streak-7",
    name: "7 Dias de Silício",
    desc: "7 dias seguidos de estudo",
    icon: "🔐",
    test: (s) => s.studyStreak >= 7,
  },
  {
    id: "study-streak-30",
    name: "Mente Blindada",
    desc: "30 dias seguidos de estudo",
    icon: "🛡️",
    test: (s) => s.studyStreak >= 30,
  },
  {
    id: "artifact-first",
    name: "Método 3.4",
    desc: "Produziu o primeiro artefato para leigos",
    icon: "📄",
    test: (s) => s.artifactDays >= 1,
  },
  {
    id: "artifact-6",
    name: "Fila Concluída",
    desc: "6 semanas com artefato entregue",
    icon: "🗂️",
    test: (s) => s.artifactDays >= 6,
  },
  {
    id: "study-phoenix",
    name: "Fênix do Estudo",
    desc: "Voltou a estudar após uma pausa de 3+ dias — voltar é habilidade, não fracasso",
    icon: "🦅",
    test: (s) => s.studyCameBackAfterBreak,
  },
];
