// Dados do plano de treino (Fase 1 — Adaptação) + sistema de gamificação
// Cada exercício carrega um "guide": execução correta + cuidados específicos.

export interface Exercise {
  id: string;
  name: string;
  xp: number;
  hint?: string;
  guide?: string;
}

export type EnergyMode = "red" | "yellow" | "green";

export interface Activity {
  id: string;
  weekday: number; // 0 = domingo ... 6 = sábado (JS Date.getDay())
  dayLabel: string;
  title: string;
  emoji: string;
  accent: string; // hex
  bonusXp: number;
  exercises: Exercise[];
  // versões do semáforo de energia (Fase 1 — semana 3 como referência de volume)
  versions?: Record<EnergyMode, string>;
}

export const WEEK_ORDER = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;

const G = {
  aquecimento:
    "Como fazer:\n• 3 min de caminhada ou corrida estacionária (vai acelerando aos poucos)\n• 1 min polichinelos — pés fecham e abrem junto com os braços\n• 1 min giros de braços: 30s para frente, 30s para trás, ombros soltos\n• 1 min rotação de tronco e quadril, devagar\n• 2 min agachamentos sem peso, amplitude confortável\n• 2 min alongamento dinâmico: toque nos pés alternando, balanço de pernas\nCuidados: o aquecimento é inegociável — ele prepara o joelho e o cotovelo para o treino. No frio, alongue um pouco mais.",
  flexaoInclinada:
    "Como fazer:\n• Mãos apoiadas em banco/mesa firme, um pouco mais abertas que os ombros\n• Corpo em linha reta da cabeça aos calcanhares (contraia abdômen e glúteos)\n• Desça o peito em direção ao apoio, cotovelos a ~45° do tronco\n• Empurre o chão para subir, sem deixar o quadril cair\nCuidados: punhos sempre alinhados com os antebraços (não dobrem para fora) — importante para a epicondilite. Respire: desce expirando, sobe inspirando.",
  flexaoComum:
    "Como fazer:\n• Mãos no chão na largura dos ombros, punhos sob os ombros\n• Se estiver pesado, apoie os joelhos no chão (versão facilitada)\n• Corpo reto, abdômen firme; desça o peito quase ao chão\n• Suba empurrando o chão\nCuidados: nunca deixe o cotovelo abrir 90° para fora — mantenha a ~45° do tronco. Dor no punho = mãos mais altas (livro embaixo de cada mão).",
  pikePushup:
    "Como fazer:\n• Posição de flexão, ande com as mãos em direção aos pés e suba o quadril (formato de V invertido)\n• Cabeça passa entre os braços, olhando para os pés\n• Dobre os cotovelos e desça a cabeça em direção ao chão\n• Suba estendendo os braços — é um 'empurrão para cima', como um soco para o alto\nCuidados: o peso fica nos ombros; se for demais, faça com pés mais perto das mãos. Ótimo exercício para a força de soco.",
  prancha:
    "Como fazer:\n• Antebraços no chão, cotovelos sob os ombros\n• Corpo em linha reta: cabeça, quadril, joelhos e tornozelos alinhados\n• Contraia abdômen e glúteos como se fosse levar um soco na barriga\n• Respire normal durante os 20–30s\nCuidados: quadril nem caído nem para cima — imagine uma tábua. Se a lombar doer, pare e descanse 20s.",
  deadbug:
    "Como fazer:\n• Deitado de costas, braços apontados para o teto, joelhos flexionados a 90° (cachorrão deitado)\n• Desça DEVAGAR o braço direito e a perna esquerda até quase tocar o chão\n• Volte e alterne os lados\n• Lombada colada no chão o tempo todo\nCuidados: se a lombar descolar do chão, reduza a amplitude. A lentidão é o exercício — não deixe a gravidade fazer o trabalho.",
  apoioUnipodal:
    "Como fazer:\n• Fique em um pé só, joelho levemente flexionado (não trave)\n• Olhe para um ponto fixo à frente\n• Segure 20–30s; se fácil, feche os olhos ou fique em superfície instável (almofada)\n• Troque de perna\nCuidados: de olhos fechados, fique perto de uma parede. Este exercício reconstrói a propriedade que protege o seu joelho de LCA — vale ouro para o futuro grappling.",
  reabilitacao:
    "Como fazer:\n• Alongamento: braço estendido à frente, palma para baixo; puxe os dedos com a outra mão 30s (3×). Você deve sentir alongar a parte de fora do antebraço\n• Excêntrico: antebraço apoiado na coxa, segure uma garrafa de 500ml–1L com a palma para baixo; use a outra mão para erguer o punho, e desça SOZINHO bem devagar (3 segundos). 3 × 15\nCuidados: é o tratamento da epicondilite — faça TODOS os dias, mesmo sem treinar. Dor leve (até 3/10) é aceitável; dor que aumenta = pare e reduza o peso.",
  shadowboxing:
    "Como fazer:\n• Postura de luta: pé da frente apontado à frente, do outro a ~45°, peso dividido\n• Guarda alta: mãos na altura do queixo, cotovelos perto do corpo\n• Jab (da frente): estica o braço girando o ombro, mão volta rápido para a guarda\n• Direto (de trás): gira o quadril e o pé ao mesmo tempo — a força sai do chão\n• Mexa a cabeça depois de cada golpe (esquiva)\nCuidados: NESSA FASE é técnica pura, sem força máxima — sacode brusco de cotovelo irrita o tendão. Se o cotovelo reclamar, faça golpes mais curtos e próximos ao corpo.",
  agachamentoLivre:
    "Como fazer:\n• Pés na largura dos ombros, pontas levemente para fora\n• Desça empurrando o quadril para trás e flexionando os joelhos, como se sentasse num banco\n• Desça até onde conseguir sem a lombar arredondar\n• Suba empurrando o chão com o pé inteiro\nCuidados: o joelho DEVE acompanhar a direção da ponta do pé (nem cai para dentro, nem para fora). Suba contraindo o glúteo no final — isso protege o LCA.",
  afundoEstatico:
    "Como fazer:\n• Dê um passo à frente e PARA (por isso 'estático' — sem avanço brusco)\n• Desça os dois joelhos até ~90° do da frente\n• Tronco ereto, peso no calcanhar da frente\n• Suba empurrando com a perna da frente e volte\nCuidados: passo longo o suficiente para o joelho da frente NÃO passar muito da ponta do pé. Se o joelho reclamar, reduza a profundidade. Segure numa parede se precisar de equilíbrio.",
  gluteBridge:
    "Como fazer:\n• Deitado, joelhos flexionados, pés no chão na largura do quadril\n• Suba o quadril até alinhar ombros–quadril–joelhos\n• Aperte os glúteos 2s no alto\n• Desça devagar\nCuidados: não arqueie a lombar no alto — o movimento é do quadril, não da coluna. Este músculo é o 'amortecedor' do seu joelho.",
  panturrilha:
    "Como fazer:\n• Em pé, apoie as mãos na parede se precisar\n• Suba na ponta dos pés o máximo que conseguir (2s subindo)\n• Pause 1s no alto, desça devagar até alongar\n• 15–20 repetições\nCuidados: suba RETO, sem rolar o pé para fora. Forte panturrilha = tornozelo estável = joelho protegido.",
  extensaoJoelho:
    "Como fazer:\n• Faça um laço com a faixa elástica e prenda atrás do joelho (ou numa cadeira);\n• Sente com a faixa firme atrás do joelho\n• Estenda o joelho até a perna ficar reta, contraindo a coxa\n• Segure 2s e retorne devagar\nCuidados: movimento lento e controlado; se inchar ou doer, pare. Fortalece o vasto medial — o músculo que 'trava' o joelho estável.",
  remadaFaixa:
    "Como fazer:\n• Sente no chão, pernas estendidas, faixa presa nos pés (ou num ponto firme)\n• Segure a faixa com PEGADA NEUTRA (palmas uma de cada lado, polegares para cima)\n• Costas eretas, puxe os cotovelos para trás junto ao corpo\n• Aperte as escápulas 2s e retorne devagar\nCuidados: punho firme e ALINHADO com o antebraço — não deixe o punho 'quebrar'. Pegada neutra tira a carga do tendão do cotovelo. É a substituta dos pull-ups nesta fase.",
  remadaAustraliana:
    "Como fazer:\n• Deite sob uma mesa/mesa de jantar firme; segure a borda com pegada neutra (palmas para você ou para fora, o que for confortável)\n• Corpo em linha reta, só os calcanhares no chão\n• Puxe o peito em direção à borda da mesa\n• Desça devagar\nCuidados: SÓ faça se o cotovelo estiver sem dor — é a barra que mais carrega o tendão extensor. Se doer, volte para a remada com faixa sem culpa nenhuma.",
  superman:
    "Como fazer:\n• Deitado de bruços, braços estendidos à frente\n• Levante braços e pernas ao mesmo tempo, olhando para o chão (pescoço neutro)\n• Segure 2s no alto apertando as costas e glúteos\n• Desça devagar\nCuidados: não force a lombar — o movimento vem das costas e glúteos. Fortalece a cadeia posterior: postura de luta e proteção da coluna no BJJ.",
  facePull:
    "Como fazer:\n• Prenda a faixa na altura do rosto (porta ou ponto firme)\n• Segure com as duas mãos, braços estendidos\n• Puxe em direção ao rosto, ABRINDO os cotovelos para os lados (como um arco)\n• Termine com as mãos ao lado das orelhas, escápulas apertadas\nCuidados: carga leve e controle total. Este exercício equilibra os ombros de quem soca — essencial para não desenvolver dor de boxeador.",
  pranchaLateral:
    "Como fazer:\n• Deite de lado, antebraço no chão, cotovelo sob o ombro\n• Suba o quadril até o corpo ficar em linha reta\n• Braço de cima pode apontar para o teto\n• Segure 20s de cada lado\nCuidados: quadril para frente, não para trás. Óbvio que é difícil — tremedeira leve é normal; dor lombar não é.",
  jabs:
    "Como fazer:\n• Postura de luta, guarda alta\n• Jabs em sequência rápida por 30s: estica–recolhe, estica–recolhe\n• Mexa a cabeça para o lado depois de cada jab\n• Intenção: cadência e precisão, NÃO força\nCuidados: se o cotovelo formigar, reduza a velocidade e a extensão. Lembre: soco leve e certo > soco forte e errado (e lesionado).",
  combinacao:
    "Como fazer:\n• Devagar: jab (frente) → direto (trás) → gancho esquerdo (braço da frente, em arco)\n• O corpo inteiro participa: passo, rotação de quadril, rotação de tronco\n• Depois do direto, deslize a cabeça para fora da lina de centro\n• Repita em câmera lenta, técnica impecável\nCuidados: a lentidão é o objetivo — velocidade sem técnica grava movimento errado. O gancho sai da rotação do quadril, não só do braço.",
  mountain:
    "Como fazer:\n• Posição de flexão, mãos sob os ombros\n• Traga um joelho em direção ao peito e troque, como 'correndo' no chão\n• Quadril baixo e estável, ritmo constante por 30s\nCuidados: se o punho doer, faça com as mãos em cima de um livro/lado macio. Costas retas — não deixe o quadril subir.",
  burpee:
    "Como fazer (versão adaptada):\n• Em pé, agache e apoie as mãos no chão\n• Recue os pés para posição de prancha (SEM flexão no chão nesta fase)\n• Retorne os pés junto às mãos e suba saltando leve\nCuidados: as mãos recebem seu peso ao recuar — apoie-as FIRME com punhos alinhados (polegar e indicador apontando para frente). Se doer, faça o recuo de um pé de cada vez, devagar.",
  mobilidade:
    "Como fazer:\n• Quadril 90/90: sente, pernas a 90° à frente e ao lado; gire os dois lados devagar, 2 min\n• Tornozelo: de frente para a parede, joelho flexionado tocando a parede sem o calcanhar sair do chão, 1 min cada\n• Coluna: deitado, braços abertos, joelhos caem para os lados, 1 min cada\nCuidados: movimento lento e controlado, sem dor. Mobilidade de quadril e tornozelo = joelho que trabalha menos e melhor.",
  alongamento:
    "Como fazer (sequência de 30s cada):\n• Ombros: braço cruzado no peito, puxe com o outro\n• Tríceps: mão entre as escápulas, puxe o cotovelo\n• Peito: mãos atrás das costas, abra o peito\n• Quadríceps: pé na mão, calcanhar no glúteo\n• Panturrilha: passo à frente, calcanhar de trás no chão\n• Costas: sente, pernas juntas, mãos nos pés, relaxe\nCuidados: alongamento é ESTÁTICO depois do treino — sem balanço. Respire profundo em cada posição.",
  zhanZhuang:
    "Como fazer (wuji — postura neutra):\n• Pés na largura dos ombros, paralelos, joelhos levemente flexionados (NUNCA trave, NUNCA passe a ponta dos pés)\n• Coluna alongada como se uma linha puxasse o topo da cabeça para cima\n• Peso distribuído no centro dos pés (ponto Yongquan)\n• Braços soltos ao lado do corpo, ombros caídos\n• Respire pelo nariz, barriga expandindo; conte 1–10 e recomece\nCuidados: tremedeira nas pernas é normal e passa. Tontura = pare e sente. A mente vai vagar — note e volte à contagem, sem julgamento. É assim que se treina o 'monkey mind' do TDAH.",
  respiracao:
    "Como fazer:\n• Sente ou fique em pé, coluna ereta, mãos sobre o dan tian (abaixo do umbigo)\n• Inspire pelo nariz sentindo a BARRIGA inflar (não o peito)\n• Expire soltando o ar, barriga afundando\n• Conte mentalmente 1, 2, 3... até 10 e recomece do 1\nCuidados: não force nem prenda o ar. Se o peito subir, coloque uma mão no peito e uma na barriga até aprender a separar os dois. É a base de toda a respiração do neigong (e do boxe).",
  baduanjinS12:
    "Como fazer (seguindo o manual, pp. 14–21):\n• 1º 'Segurando o Céu': palmas sobem pela linha do corpo até acima da cabeça, estique TODA a lateral do corpo, olhe as mãos; desça pelos lados\n• 2º 'Arco e flecha': passo de cavaleiro (raro), braços como quem puxa um arco — um estica, o outro 'segura a corda'\nCuidados: no 2º, dedos estendidos mas SEM RIGIDEZ — a tensão no punho irrita o cotovelo. Respire natural, sem prender.",
  baduanjinS35:
    "Como fazer (seguindo o manual, pp. 22–34):\n• 3º 'Uma mão erguida': uma palma empurra para cima, a outra pressiona para baixo, esticando os flancos\n• 4º 'Olhar para trás': gire a cabeça DEVAGAR sobre o ombro — amplitude confortável\n• 5º 'Cabeça e cauda': inclinações laterais no cavaleiro, braço deslizando pela coxa\nCuidados: 4º — pescoço SEMPRE lento e pequeno. 5º — cavaleiro RASO (o manual pede baixo, mas seu joelho manda: alinhado e sem dor).",
  baduanjinS68:
    "Como fazer (seguindo o manual, pp. 35–48):\n• 6º 'Tocar os pés': braços sobem e descem pela linha do corpo, mãos deslizam até os pés, joelhos semiflexionados\n• 7º 'Punho e olhar': ADAPTADO — em vez de punhos cerrados, empurre com PALMAS ABERTAS, sem força, olhar firme à frente\n• 8º 'Elevações dos calcanhares': suba na ponta dos pés com o corpo inteiro esticado, balance perto da parede\nCuidados: o 7º com palmas abertas é a adaptação da epicondilite — respeite-a. O 8º fortalece o equilíbrio que protege o LCA.",
  shouGong:
    "Como fazer (fechamento, pp. 49–51):\n• Mãos sobre o dantian (abaixo do umbigo), HOMENS: mão DIREITA por cima da esquerda\n• Feche os olhos, respire 6–9 respirações profundas pela barriga\n• Visualize a prática 'guardada' no centro do corpo\n• Esfregue as palmas até aquecer e passe no rosto\nCuidados: não pule o fechamento — o manual o trata como parte integrante da prática. É o momento de transição de volta ao dia.",
};

export const ACTIVITIES: Activity[] = [
  {
    id: "forca_a",
    weekday: 1,
    dayLabel: "Segunda",
    title: "Força A — Peito / Ombros / Core",
    emoji: "💪",
    accent: "#f97316",
    bonusXp: 25,
    versions: {
      red: "Aquecimento + flexão inclinada 1×6 + prancha 1×15s + respiração",
      yellow: "+ flexão inclinada 2×8 · prancha 2×20s · dead bug 2×6",
      green: "+ pike push-up 2×5 · apoio unipodal 2×15s · reab. cotovelo",
    },
    exercises: [
      { id: "aq", name: "Aquecimento padrão (10 min)", xp: 10, guide: G.aquecimento },
      { id: "fi", name: "Flexão inclinada", xp: 15, hint: "2×6-8→3×10-12", guide: G.flexaoInclinada },
      { id: "fc", name: "Flexão comum", xp: 15, hint: "1×5-6→2×6-10", guide: G.flexaoComum },
      { id: "pp", name: "Pike push-up", xp: 15, hint: "1×4-5→2×6-8", guide: G.pikePushup },
      { id: "pl", name: "Prancha isométrica", xp: 10, hint: "2×15s→3×30s", guide: G.prancha },
      { id: "db", name: "Dead bug", xp: 10, hint: "2×5→3×8", guide: G.deadbug },
      { id: "au", name: "Apoio unipodal (equilíbrio)", xp: 10, hint: "2×15s→3×30s", guide: G.apoioUnipodal },
      { id: "rc", name: "Reabilitação de cotovelo", xp: 10, hint: "5 min", guide: G.reabilitacao },
    ],
  },
  {
    id: "boxe_pernas",
    weekday: 2,
    dayLabel: "Terça",
    title: "Boxe leve + Pernas",
    emoji: "🥊",
    accent: "#ef4444",
    bonusXp: 25,
    versions: {
      red: "Aquecimento + deslocamento em guarda 2×1min + agachamento 1×8",
      yellow: "+ shadowboxing 1×2min · agachamento 2×10 · glute bridge 2×10",
      green: "+ shadow 2×2min · afundo 2×6/p · panturrilha 2×12 · ext. joelho 1×10/p",
    },
    exercises: [
      { id: "aq", name: "Aquecimento padrão (10 min)", xp: 10, guide: G.aquecimento },
      { id: "sb", name: "Shadowboxing técnico", xp: 15, hint: "2 × 2 min, suave", guide: G.shadowboxing },
      { id: "ag", name: "Agachamento livre", xp: 15, hint: "2×10→3×15", guide: G.agachamentoLivre },
      { id: "af", name: "Afundo estático", xp: 15, hint: "3 × 8 por perna", guide: G.afundoEstatico },
      { id: "gb", name: "Glute bridge", xp: 10, hint: "2×8→3×12", guide: G.gluteBridge },
      { id: "pt", name: "Elevação de panturrilha", xp: 10, hint: "2×12→3×20", guide: G.panturrilha },
      { id: "et", name: "Extensão terminal de joelho (faixa)", xp: 10, hint: "2 × 12 por perna", guide: G.extensaoJoelho },
    ],
  },
  {
    id: "forca_b",
    weekday: 4,
    dayLabel: "Quinta",
    title: "Força B — Costas adaptadas / Braços / Core",
    emoji: "🧗",
    accent: "#22c55e",
    bonusXp: 25,
    versions: {
      red: "Aquecimento + remada com faixa 1×6 + superman 1×8",
      yellow: "+ remada 2×8 · superman 2×10 · prancha lateral 2×10s",
      green: "+ face pull 2×10 · remada australiana 1×4 (só se sem dor) · unipodal 2×15s",
    },
    exercises: [
      { id: "aq", name: "Aquecimento padrão (10 min)", xp: 10, guide: G.aquecimento },
      { id: "rf", name: "Remada com faixa (pegada neutra)", xp: 15, hint: "2×6-8→3×10-12", guide: G.remadaFaixa },
      { id: "ra", name: "Remada australiana", xp: 15, hint: "1×4-5→2×6-8, só se sem dor", guide: G.remadaAustraliana },
      { id: "sm", name: "Superman", xp: 10, hint: "2×8→3×12", guide: G.superman },
      { id: "fp", name: "Face pull com faixa", xp: 10, hint: "2 × 12", guide: G.facePull },
      { id: "pl", name: "Prancha lateral", xp: 10, hint: "1×15s→2×20s", guide: G.pranchaLateral },
      { id: "au", name: "Apoio unipodal (olhos fechados)", xp: 10, hint: "3 × 20s", guide: G.apoioUnipodal },
      { id: "rc", name: "Reabilitação de cotovelo", xp: 10, hint: "5 min", guide: G.reabilitacao },
    ],
  },
  {
    id: "boxe_cond",
    weekday: 6,
    dayLabel: "Sábado",
    title: "Boxe condicionamento + Mobilidade",
    emoji: "🔥",
    accent: "#eab308",
    bonusXp: 25,
    versions: {
      red: "Aquecimento + shadowboxing 1×2min + alongamento 3min",
      yellow: "+ shadow 2×2min · jabs 2×20s · mountain 2×20s · mobilidade 2min",
      green: "+ combinação 2×20s · burpees 1×20s · mobilidade 4min · alongamento 5min",
    },
    exercises: [
      { id: "aq", name: "Aquecimento padrão (10 min)", xp: 10, guide: G.aquecimento },
      { id: "sb", name: "Shadowboxing", xp: 15, hint: "3 × 2 min", guide: G.shadowboxing },
      { id: "jb", name: "Jabs rápidos no ar", xp: 10, hint: "2×20s→3×30s, leve", guide: G.jabs },
      { id: "cb", name: "Combinação lenta", xp: 10, hint: "2×20s→3×30s", guide: G.combinacao },
      { id: "mc", name: "Mountain climbers", xp: 10, hint: "2×20s→3×30s", guide: G.mountain },
      { id: "bp", name: "Burpees adaptado", xp: 15, hint: "1×20s→2×45s", guide: G.burpee },
      { id: "mo", name: "Mobilidade (quadril/tornozelo/coluna)", xp: 10, hint: "4 min", guide: G.mobilidade },
      { id: "al", name: "Alongamento completo", xp: 10, hint: "5 min", guide: G.alongamento },
    ],
  },
];

export const NEIGONG_DAILY: Activity = {
  id: "neigong_daily",
  weekday: -1,
  dayLabel: "Todos os dias",
  title: "Neigong matinal (em jejum)",
  emoji: "🧘",
  accent: "#38bdf8",
  bonusXp: 10,
  exercises: [
    { id: "zz", name: "Zhan zhuang (postura da estaca)", xp: 15, hint: "S1:1-2min→S4:10min", guide: G.zhanZhuang },
    { id: "ra2", name: "Respiração abdominal (dan tian)", xp: 10, hint: "5 min, contar 1–10", guide: G.respiracao },
  ],
};

export const NEIGONG_DOMINGO: Activity = {
  id: "baduanjin",
  weekday: 0,
  dayLabel: "Domingo",
  title: "Neigong completo — Ba Duan Jin",
  emoji: "☯️",
  accent: "#a78bfa",
  bonusXp: 15,
  exercises: [
    { id: "zz", name: "Zhan zhuang", xp: 15, hint: "10 min", guide: G.zhanZhuang },
    { id: "s18", name: "Ba Duan Jin — abertura + segmentos 1–2", xp: 15, hint: "manual pp. 14–21", guide: G.baduanjinS12 },
    { id: "s58", name: "Ba Duan Jin — segmentos 3–5", xp: 15, hint: "cavalo raso no 5º!", guide: G.baduanjinS35 },
    { id: "s88", name: "Ba Duan Jin — segmentos 6–8", xp: 15, hint: "7º com palmas abertas", guide: G.baduanjinS68 },
    { id: "sg", name: "Shou Gong (fechamento)", xp: 10, hint: "mãos no dantian, dir. por cima", guide: G.shouGong },
  ],
};

export const REST_DAYS: Record<number, string> = {
  3: "Recuperação ativa — caminhada leve 20–30 min",
  5: "Recuperação ativa — caminhada leve 20–30 min",
};

export const WEEK_FOCUS = [
  "SÓ COMPARECER. Versão 🔴 conta como treino. Flexão inclinada 2×8 · zhan zhuang 3 min.",
  "Progressão suave: agachamento 3×10 · remada 2×10 · zhan zhuang 5 min.",
  "Shadowboxing 2×2min · zhan zhuang 7 min · água 2,5L/dia.",
  "Semana 6 do plano: flexão 3×12 · 10 min de zhan zhuang. Pronto para a Fase 2.",
];

export const LEVELS = [
  { xp: 0, name: "Calouro do Dojo", stage: 0 },
  { xp: 150, name: "Faixa Branca", stage: 0 },
  { xp: 400, name: "Faixa Azul", stage: 1 },
  { xp: 800, name: "Faixa Roxa", stage: 2 },
  { xp: 1400, name: "Faixa Marrom", stage: 3 },
  { xp: 2200, name: "Faixa Preta", stage: 4 },
  { xp: 3200, name: "Faixa Preta 1º Dan", stage: 4 },
  { xp: 4500, name: "2º Dan", stage: 4 },
  { xp: 6000, name: "3º Dan", stage: 4 },
  { xp: 8000, name: "Mestre do Neigong", stage: 5 },
] as { xp: number; name: string; stage: number }[];

// ===== Conquistas (Dojo de Conquistas) =====

export interface Stats {
  totalXp: number;
  streak: number;
  weekDone: number;
  weekTotal: number;
  levelIndex: number;
  neigongDailyComplete: boolean;
  baduanjinComplete: boolean;
  mainTrainingComplete: boolean; // algum treino principal completo
  activeDays: number; // dias com pelo menos 1 check
  rehabDays: number; // dias com reabilitação de cotovelo feita
  baduanjinDays: number; // domingos com Ba Duan Jin completo
  cameBackAfterBreak: boolean; // voltou a treinar após pausa de 3+ dias
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  test: (s: Stats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-step",
    name: "Primeiro Passo",
    desc: "Marcou o primeiro exercício",
    icon: "👣",
    test: (s) => s.totalXp > 0,
  },
  {
    id: "first-workout",
    name: "Sangue no Olho",
    desc: "Completou o primeiro treino inteiro",
    icon: "🥊",
    test: (s) => s.mainTrainingComplete,
  },
  {
    id: "neigong-novice",
    name: "Neigong Iniciante",
    desc: "Completou o neigong matinal",
    icon: "🧘",
    test: (s) => s.neigongDailyComplete,
  },
  {
    id: "quiet-mind",
    name: "Mente Quieta",
    desc: "Completou o Ba Duan Jin de domingo",
    icon: "☯️",
    test: (s) => s.baduanjinComplete,
  },
  {
    id: "perfect-week",
    name: "Semana Lendária",
    desc: "Completou os 4 treinos da semana",
    icon: "🏆",
    test: (s) => s.weekDone >= s.weekTotal && s.weekTotal > 0,
  },
  {
    id: "streak-3",
    name: "Fogo de 3 Dias",
    desc: "3 dias seguidos de treino",
    icon: "🔥",
    test: (s) => s.streak >= 3,
  },
  {
    id: "streak-7",
    name: "Semana Perfeita",
    desc: "7 dias seguidos de treino",
    icon: "⚡",
    test: (s) => s.streak >= 7,
  },
  {
    id: "blue-belt",
    name: "Faixa Azul",
    desc: "Alcançou 400 XP",
    icon: "🔷",
    test: (s) => s.levelIndex >= 2,
  },
  {
    id: "black-belt",
    name: "Faixa Preta",
    desc: "Alcançou 2.200 XP",
    icon: "🥋",
    test: (s) => s.levelIndex >= 5,
  },
  {
    id: "iron-elbow",
    name: "Cotovelo de Aço",
    desc: "Reabilitação feita em 10 dias",
    icon: "💪",
    test: (s) => s.rehabDays >= 10,
  },
  {
    id: "dao-sunday",
    name: "Domingo de Dao",
    desc: "2 domingos de Ba Duan Jin completos",
    icon: "🌅",
    test: (s) => s.baduanjinDays >= 2,
  },
  {
    id: "relentless",
    name: "Imparável",
    desc: "20 dias ativos no plano",
    icon: "👑",
    test: (s) => s.activeDays >= 20,
  },
  {
    id: "phoenix",
    name: "Fênix",
    desc: "Voltou a treinar após uma pausa de 3+ dias — voltar é habilidade, não fracasso",
    icon: "🦅",
    test: (s) => s.cameBackAfterBreak,
  },
];
