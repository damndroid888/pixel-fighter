interface AchievementState {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
}

export function AchievementsPanel({ achievements }: { achievements: AchievementState[] }) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  return (
    <div className="pixel-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-pixel text-[10px] text-amber-300">▶ DOJO DE CONQUISTAS</h2>
        <span className="font-pixel text-[8px] text-slate-400">
          {unlockedCount}/{achievements.length}
        </span>
      </div>
      <div className="h-2 bg-slate-800 border border-slate-700 mb-4">
        <div
          className="h-full bg-gradient-to-r from-amber-600 to-amber-300 transition-all duration-500"
          style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {achievements.map((a) => (
          <div
            key={a.id}
            title={a.desc}
            className={`border-2 p-3 text-center transition-all ${
              a.unlocked
                ? "border-amber-500 bg-amber-500/10"
                : "border-slate-800 bg-slate-900/40 opacity-50"
            }`}
          >
            <div
              className={`text-2xl ${a.unlocked ? "" : "grayscale"}`}
              style={{ filter: a.unlocked ? undefined : "grayscale(1) brightness(0.6)" }}
            >
              {a.unlocked ? a.icon : "❓"}
            </div>
            <div
              className={`font-pixel text-[7px] mt-2 leading-relaxed ${
                a.unlocked ? "text-amber-300" : "text-slate-500"
              }`}
            >
              {a.name.toUpperCase()}
            </div>
            <div className={`text-[10px] mt-1 ${a.unlocked ? "text-slate-300" : "text-slate-600"}`}>
              {a.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
