import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Activity, EnergyMode, Exercise } from "@/data/plan";

interface Props {
  activity: Activity;
  dateISO: string;
  checks: Record<string, boolean>;
  onToggle: (dateISO: string, activity: Activity, ex: Exercise) => void;
  compact?: boolean;
  mode?: EnergyMode; // semáforo de energia do dia
}

const MODE_META: Record<EnergyMode, { label: string; color: string; bg: string }> = {
  red: { label: "VERSÃO MÍNIMA", color: "#f87171", bg: "#450a0a" },
  yellow: { label: "VERSÃO BASE", color: "#facc15", bg: "#422006" },
  green: { label: "VERSÃO COMPLETA", color: "#4ade80", bg: "#052e16" },
};

export function DayCard({ activity, dateISO, checks, onToggle, compact, mode }: Props) {
  const [guideEx, setGuideEx] = useState<Exercise | null>(null);
  const doneCount = activity.exercises.filter((e) => checks[`${activity.id}:${e.id}`]).length;
  const complete = doneCount === activity.exercises.length;
  const versionText = mode && activity.versions ? activity.versions[mode] : null;
  const modeMeta = mode ? MODE_META[mode] : null;

  return (
    <div
      className="pixel-panel p-3"
      style={{ borderColor: complete ? activity.accent : undefined }}
    >
      {versionText && modeMeta && (
        <div
          className="mb-2 px-2 py-1.5 border-2"
          style={{ borderColor: modeMeta.color, backgroundColor: modeMeta.bg }}
        >
          <div className="font-pixel text-[7px]" style={{ color: modeMeta.color }}>
            {modeMeta.label} {mode === "red" ? "· CONTA COMO TREINO ✓" : ""}
          </div>
          <div className="text-[11px] text-slate-200 leading-snug mt-0.5">{versionText}</div>
        </div>
      )}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg leading-none">{activity.emoji}</span>
          <div className="min-w-0">
            <div className="font-pixel text-[9px] truncate" style={{ color: activity.accent }}>
              {activity.dayLabel.toUpperCase()}
            </div>
            {!compact && (
              <div className="text-[11px] text-slate-300 truncate">{activity.title}</div>
            )}
          </div>
        </div>
        <div className="font-pixel text-[8px] text-slate-400 whitespace-nowrap">
          {doneCount}/{activity.exercises.length}
        </div>
      </div>

      {/* barra de progresso pixelada */}
      <div className="h-2 bg-slate-800 border border-slate-700 mb-2">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${(doneCount / activity.exercises.length) * 100}%`,
            backgroundColor: activity.accent,
          }}
        />
      </div>

      <div className="space-y-1">
        {activity.exercises.map((ex) => {
          const key = `${activity.id}:${ex.id}`;
          const on = !!checks[key];
          return (
            <div
              key={key}
              className={`w-full flex items-center gap-2 text-left px-2 py-1.5 border transition-colors ${
                on
                  ? "bg-slate-800 border-slate-600 text-slate-400"
                  : "bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-600"
              }`}
            >
              <button
                onClick={() => onToggle(dateISO, activity, ex)}
                aria-label={on ? `Desmarcar ${ex.name}` : `Marcar ${ex.name}`}
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
              >
                <span
                  className="inline-block w-3.5 h-3.5 border-2 shrink-0"
                  style={{
                    borderColor: on ? activity.accent : "#475569",
                    backgroundColor: on ? activity.accent : "transparent",
                  }}
                />
                <span className={`text-[12px] leading-tight flex-1 ${on ? "line-through" : ""}`}>
                  {ex.name}
                </span>
                {ex.hint && (
                  <span className="text-[10px] text-slate-500 shrink-0 hidden sm:inline">
                    {ex.hint}
                  </span>
                )}
                <span className="font-pixel text-[7px] text-slate-500 shrink-0">+{ex.xp}</span>
              </button>
              {ex.guide && (
                <button
                  onClick={() => setGuideEx(ex)}
                  aria-label={`Como fazer: ${ex.name}`}
                  className="font-pixel text-[9px] text-slate-400 hover:text-amber-300 border border-slate-700 hover:border-amber-500 px-1.5 py-0.5 shrink-0 transition-colors"
                >
                  ?
                </button>
              )}
            </div>
          );
        })}
      </div>

      {complete && (
        <div className="mt-2 font-pixel text-[8px] text-center py-1" style={{ color: activity.accent }}>
          ▶ DIA COMPLETO +{activity.bonusXp} XP BÔNUS ◀
        </div>
      )}

      <Dialog open={guideEx !== null} onOpenChange={(open) => !open && setGuideEx(null)}>
        <DialogContent className="bg-[#101728] border-[3px] border-slate-600 text-slate-100 sm:max-w-lg pixel-panel-dialog">
          <DialogHeader>
            <DialogTitle className="font-pixel text-[11px] leading-relaxed" style={{ color: activity.accent }}>
              {guideEx?.name.toUpperCase()}
            </DialogTitle>
            {guideEx?.hint && (
              <DialogDescription className="text-slate-400 text-[12px]">
                {activity.dayLabel} · {guideEx.hint}
              </DialogDescription>
            )}
          </DialogHeader>
          {guideEx?.guide && (
            <div className="text-[13px] leading-relaxed text-slate-200 space-y-2 max-h-[55vh] overflow-y-auto pr-1">
              {guideEx.guide.split("\n").map((line, i) => {
                const isTitle = line.endsWith(":");
                const isBullet = line.startsWith("•");
                return isTitle ? (
                  <p key={i} className="font-pixel text-[8px] text-amber-300 pt-1">
                    {line.toUpperCase()}
                  </p>
                ) : (
                  <p key={i} className={isBullet ? "pl-3" : ""}>
                    {line}
                  </p>
                );
              })}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                if (guideEx) onToggle(dateISO, activity, guideEx);
                setGuideEx(null);
              }}
              className="font-pixel text-[8px] px-3 py-2 border border-slate-600 hover:border-amber-400 hover:text-amber-300 transition-colors"
            >
              {guideEx && checks[`${activity.id}:${guideEx.id}`] ? "DESMARCAR" : "CONCLUÍ ✓"}
            </button>
            <button
              onClick={() => setGuideEx(null)}
              className="font-pixel text-[8px] px-3 py-2 border border-slate-600 hover:border-slate-400 transition-colors"
            >
              FECHAR
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
