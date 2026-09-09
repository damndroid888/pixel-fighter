import re

with open('src/data/plan.ts','r',encoding='utf-8') as f:
    t = f.read()

# Progressão semanal nos hints
replacements = [
    ('3 × 10–12', '2×6-8→3×10-12'),
    ('2 × 6–10', '1×5-6→2×6-10'),
    ('2 × 6–8', '1×4-5→2×6-8'),
    ('3 × 20–30s', '2×15s→3×30s'),
    ('3 × 8 cada lado', '2×5→3×8'),
    ('3 × 20–30s por perna', '2×15s→3×30s'),
    ('2 rounds de 2 min', '1→3 rounds 2min'),
    ('3 × 12–15', '2×10→3×15'),
    ('3 × 8 cada perna', '2×6→3×8'),
    ('3 × 12', '2×8→3×12'),
    ('3 × 15–20', '2×12→3×20'),
    ('2 × 12 cada perna', '1×10→2×12'),
    ('2 × 6–8, s', '1×4→2×6-8, s'),
    ('2 × 20s cada lado', '1×15s→2×20s'),
    ('3 × 20s por perna', '2×15s→3×20s'),
    ('3 rounds de 2 min', '2→3 rounds 2min'),
    ('3 × 30s', '2×20s→3×30s'),
    ('2 × 30–45s', '1×20s→2×45s'),
    ('2 min · tornozelo', '2→4 min'),
    ('progressivo: 2–3 → 10 min', 'S1:1-2min→S4:10min'),
    ('10 min (postura da semana: semanas 1–2 wuji neutra; semanas 3–4 "abraçar a árvore")', 'S1:1-2min(wuji)→S4:10min(árvore)'),
]

for old, new in replacements:
    t = t.replace(old, new)

# Atualizar WEEK_FOCUS
old_focus = 'export const WEEK_FOCUS = [\n  "SÓ COMPARECER. Rotina vale mais que intensidade. Zhan zhuang: 2–3 min (wuji).",\n  "+5s nas pranchas. Zhan zhuang sobe para 5 min.",\n  "+1 série na remada com faixa (total 4). Zhan zhuang: 7 min. Água: 2,5L/dia.",\n  "Shadowboxing vira 3 rounds de 2 min. Zhan zhuang: 10 min (abraçar a árvore).",\n];'

new_focus = '''export const WEEK_FOCUS = [
  "SEMANA DE COMPARECER. Volume pela metade. Zhan zhuang: 1-2 min. Regra: NUNCA zerar 2x.",
  "Volume base. Zhan zhuang: 3 min. +5s nas pranchas. Água: 2,5L/dia.",
  "Intensificação suave. Zhan zhuang: 5 min. +1 série nos exercícios principais.",
  "Semana cheia. Zhan zhuang: 10 min (abraçar a árvore). 3 rounds shadowboxing.",
];'''

t = t.replace(old_focus, new_focus)

with open('src/data/plan.ts','w',encoding='utf-8') as f:
    f.write(t)

print('plan.ts atualizado')
