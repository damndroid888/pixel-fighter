import { useEffect, useMemo, useRef } from "react";
import { Toaster, toast } from "sonner";
import {
  ACTIVITIES,
  NEIGONG_DAILY,
  NEIGONG_DOMINGO,
  REST_DAYS,
  WEEK_FOCUS,
  WEEK_ORDER,
} from "@/data/plan";
import type { Activity } from "@/data/plan";
import { useGameState } from "@/hooks/useGameState";
import { PixelAvatar } from "@/components/PixelAvatar";
import { DayCard } from "@/components/DayCard";
import { AchievementsPanel } from "@/components/AchievementsPanel";
import { SyncChip } from "@/components/SyncChip";

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// datas da semana corrente: [seg, ter, qua, qui, sex, sáb, dom]
function weekDates(): Date[] {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // seg=0
  const monday = new Date(now);
  monday.setDate(now.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// weekday visual (Seg=1..Dom=0/7) -> índice 0..6
function visualIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export default function App() {
  const game = useGameState();
  const dates = useMemo(() => weekDates(), []);
  const todayISO = iso(new Date());
  const todayIdx = visualIndex(new Date());

  // toast de level up
  const prevLevel = useRef(game.level.index);
  useEffect(() => {
    if (game.level.index > prevLevel.current) {
      toast.success(`LEVEL UP! Você agora é ${game.level.name}`, {
        style: { background: "#1e293b", color: "#facc15", border: "2px solid #facc15" },
      });
    }
    prevLevel.current = game.level.index;
  }, [game.level.index, game.level.name]);

  // toast de conquista desbloqueada
  const prevUnlocked = useRef<Set<string>>(new Set());
  useEffect(() => {
    const current = new Set(game.achievements.filter((a) => a.unlocked).map((a) => a.id));
    for (const id of current) {
      if (!prevUnlocked.current.has(id)) {
        const ach = game.achievements.find((a) => a.id === id);
        if (ach && prevUnlocked.current.size > 0) {
          toast(`🏆 CONQUISTA DESBLOQUEADA: ${ach.name}!`, {
            style: { background: "#1e293b", color: "#fbbf24", border: "2px solid #f59e0b" },
          });
        }
      }
    }
    prevUnlocked.current = current;
  }, [game.achievements]);

  // atividade principal de cada dia da semana visual
  const mainByIdx = useMemo(() => {
    const map = new Map<number, Activity>();
    for (const a of ACTIVITIES) map.set((a.weekday + 6) % 7, a);
    map.set(6, NEIGONG_DOMINGO); // domingo = índice 6
    return map;
  }, []);

  const todayMain = mainByIdx.get(todayIdx) ?? null;
  const todayRest = REST_DAYS[new Date().getDay()];

  const pct = Math.round(game.level.progress * 100);

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100 bg-grid pb-10">
      <Toaster position="top-center" />

      {/* HEADER */}
      <header className="border-b-4 border-slate-700 bg-[#0e1526]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-pixel text-sm sm:text-base text-amber-400 drop-shadow-[2px_2px_0_#7c2d12]">
              PIXEL FIGHTER
            </h1>
            <p className="text-[11px] text-slate-400 mt-1">
              Fase 1 · Adaptação · Semana {game.weekNumber}/4 — preparação p/ boxe & BJJ
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SyncChip sync={game.sync} />
            <div className="pixel-panel px-3 py-2 text-center">
              <div className="font-pixel text-[8px] text-orange-400">
                {game.streak > 0 ? `${game.streak} DIA${game.streak > 1 ? "S" : ""}` : "—"}
              </div>
              <div className="text-[10px] text-slate-400">🔥 streak</div>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Zerar todo o progresso (XP, checks e streak)?")) game.reset();
              }}
              className="font-pixel text-[8px] text-slate-500 hover:text-red-400 border border-slate-700 px-2 py-2"
            >
              RESET
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
        {/* HERO: avatar + nível + XP */}
        <section className="pixel-panel p-4 flex flex-col sm:flex-row items-center gap-6">
          <PixelAvatar stage={game.level.stage} size={140} />
          <div className="flex-1 w-full">
            <div className="font-pixel text-[9px] text-slate-400">PATENTE ATUAL</div>
            <div className="font-pixel text-lg text-amber-300 mt-1">{game.level.name}</div>

            <div className="mt-3">
              <div className="flex justify-between font-pixel text-[8px] text-slate-400 mb-1">
                <span>XP {game.totalXp}</span>
                <span>{game.level.next ? `PRÓX: ${game.level.next.name} (${game.level.next.xp} XP)` : "NÍVEL MÁXIMO"}</span>
              </div>
              <div className="h-4 bg-slate-800 border-2 border-slate-600 p-[2px]">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="pixel-panel p-2">
                <div className="font-pixel text-[8px] text-sky-400">SEMANA {game.weekNumber}</div>
                <div className="text-[11px] text-slate-300 mt-1">
                  {game.weekProgress.done}/{game.weekProgress.total} treinos completos
                </div>
              </div>
              <div className="pixel-panel p-2">
                <div className="font-pixel text-[8px] text-emerald-400">FOCO DA SEMANA</div>
                <div className="text-[11px] text-slate-300 mt-1 leading-snug">
                  {WEEK_FOCUS[game.weekNumber - 1]}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOJE */}
        <section>
          <h2 className="font-pixel text-[10px] text-slate-300 mb-3">▶ MISSÕES DE HOJE</h2>
          {todayMain ? (
            <DayCard
              activity={todayMain}
              dateISO={todayISO}
              checks={game.dayChecks(todayISO)}
              onToggle={game.toggle}
            />
          ) : (
            <div className="pixel-panel p-4 text-[13px] text-slate-300">
              🌙 {todayRest ?? "Descanso"} — mas o neigong matinal continua valendo XP!
            </div>
          )}
          <div className="mt-3">
            <DayCard
              activity={NEIGONG_DAILY}
              dateISO={todayISO}
              checks={game.dayChecks(todayISO)}
              onToggle={game.toggle}
              compact
            />
          </div>
        </section>

        {/* SEMANA */}
        <section>
          <h2 className="font-pixel text-[10px] text-slate-300 mb-3">▶ GRADE DA SEMANA</h2>          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dates.map((d, i) => {
              const main = mainByIdx.get(i);
              const isToday = iso(d) === todayISO;
              const dow = d.getDay();
              const rest = REST_DAYS[dow];
              return (
                <div key={i} className={isToday ? "ring-2 ring-amber-400" : ""}>
                  <div className="font-pixel text-[8px] text-slate-500 mb-1 px-1">
                    {WEEK_ORDER[i].toUpperCase()} {String(d.getDate()).padStart(2, "0")}/
                    {String(d.getMonth() + 1).padStart(2, "0")}
                    {isToday ? " ◄ HOJE" : ""}
                  </div>
                  {main ? (
                    <DayCard
                      activity={main}
                      dateISO={iso(d)}
                      checks={game.dayChecks(iso(d))}
                      onToggle={game.toggle}
                    />
                  ) : (
                    <div className="pixel-panel p-3 text-[12px] text-slate-400">
                      🌙 {rest}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CONQUISTAS */}
        <section>
          <AchievementsPanel achievements={game.achievements} />
        </section>

        {/* REGRA DE OURO */}
        <footer className="pixel-panel p-4 border-red-900/60" style={{ borderColor: "#7f1d1d" }}>
          <div className="font-pixel text-[9px] text-red-400 mb-1">⚠ REGRA DO MÍNIMO VIÁVEL</div>
          <p className="text-[12px] text-slate-300 leading-snug">
            Nos dias ruins, aquecimento + 1 bloco (15 min) conta como treino feito. Nunca zerar 2x
            seguidas. Dor no cotovelo acima de 3/10 = reduza o exercício, não o plano inteiro.
          </p>
        </footer>
      </main>
    </div>
  );
}
