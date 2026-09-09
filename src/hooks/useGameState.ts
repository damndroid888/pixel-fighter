import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ACTIVITIES,
  ACHIEVEMENTS,
  LEVELS,
  NEIGONG_DAILY,
  NEIGONG_DOMINGO,
} from "@/data/plan";
import type { Exercise, Activity, Stats } from "@/data/plan";
import {
  findOrCreateGist,
  loadGistSave,
  loadSyncConfig,
  mergeSaves,
  pushGistSave,
  storeSyncConfig,
} from "@/lib/githubSync";
import type { GistSave, SyncConfig } from "@/lib/githubSync";

const STORAGE_KEY = "pixel-fighter-state-v1";

// checks: { "2026-09-08": { "forca_a:fi": true, ... } }
export interface GameState {
  checks: Record<string, Record<string, boolean>>;
  startDate: string; // ISO da primeira abertura — define a semana da fase
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GameState;
      if (parsed && typeof parsed.checks === "object" && parsed.startDate) return parsed;
    }
  } catch {
    /* ignora e recomeça */
  }
  return { checks: {}, startDate: todayISO() };
}

export interface ActivityResult {
  activity: Activity;
  exIds: string[]; // ids completos nesta data
  done: number;
  total: number;
  complete: boolean;
  xp: number; // inclui bônus se completo
}

function allActivities(): Activity[] {
  return [...ACTIVITIES, NEIGONG_DAILY, NEIGONG_DOMINGO];
}

function activityKey(a: Activity, ex: Exercise): string {
  return `${a.id}:${ex.id}`;
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const toggle = useCallback((dateISO: string, activity: Activity, ex: Exercise) => {
    setState((s) => {
      const day = { ...(s.checks[dateISO] ?? {}) };
      const key = activityKey(activity, ex);
      if (day[key]) delete day[key];
      else day[key] = true;
      const checks = { ...s.checks };
      if (Object.keys(day).length === 0) delete checks[dateISO];
      else checks[dateISO] = day;
      return { ...s, checks };
    });
  }, []);

  const reset = useCallback(() => {
    setState({ checks: {}, startDate: todayISO() });
  }, []);

  // ---- derivados ----
  const { totalXp, results } = useMemo(() => {
    let xp = 0;
    const res: Record<string, ActivityResult> = {};
    for (const a of allActivities()) {
      const exIds: string[] = [];
      let base = 0;
      for (const ex of a.exercises) {
        for (const day of Object.values(state.checks)) {
          if (day[activityKey(a, ex)]) {
            exIds.push(activityKey(a, ex));
            base += ex.xp;
            break;
          }
        }
      }
      const complete = exIds.length === a.exercises.length;
      const gained = base + (complete ? a.bonusXp : 0);
      xp += gained;
      res[a.id] = {
        activity: a,
        exIds,
        done: exIds.length,
        total: a.exercises.length,
        complete,
        xp: gained,
      };
    }
    return { totalXp: xp, results: res };
  }, [state]);

  const level = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < LEVELS.length; i++) if (totalXp >= LEVELS[i].xp) idx = i;
    const cur = LEVELS[idx];
    const next = LEVELS[idx + 1];
    const progress = next
      ? (totalXp - cur.xp) / (next.xp - cur.xp)
      : 1;
    return { index: idx, ...cur, next, progress };
  }, [totalXp]);

  // streak: dias consecutivos com ao menos 1 check, contando de hoje (ou ontem se hoje ainda vazio)
  const streak = useMemo(() => {
    const days = new Set(Object.keys(state.checks));
    if (days.size === 0) return 0;
    const d = new Date();
    const has = (date: Date) => days.has(date.toISOString().slice(0, 10));
    if (!has(d)) d.setDate(d.getDate() - 1); // hoje ainda pode render
    let count = 0;
    while (has(d)) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [state]);

  // semana da fase (1-4) a partir da data de início
  const weekNumber = useMemo(() => {
    const start = new Date(state.startDate + "T00:00:00");
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 3600 * 1000));
    return Math.min(Math.max(diff + 1, 1), 4);
  }, [state.startDate]);

  // progresso da semana corrente: atividades principais completas / 4
  const weekProgress = useMemo(() => {
    const ids = ACTIVITIES.map((a) => a.id);
    const done = ids.filter((id) => results[id]?.complete).length;
    return { done, total: ids.length };
  }, [results]);

  // checks de uma data específica
  const dayChecks = useCallback(
    (dateISO: string) => state.checks[dateISO] ?? {},
    [state]
  );

  // ===== sincronização com GitHub (gist) =====
  const [syncCfg, setSyncCfg] = useState<SyncConfig | null>(() => loadSyncConfig());
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "error">("idle");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ref espelho do estado para callbacks estáveis
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const buildSave = useCallback((): GistSave => {
    return {
      checks: stateRef.current.checks,
      startDate: stateRef.current.startDate,
      updatedAt: new Date().toISOString(),
    };
  }, []);

  const doPush = useCallback(async () => {
    if (!syncCfg) return;
    setSyncStatus("syncing");
    try {
      await pushGistSave(syncCfg.token, syncCfg.gistId, buildSave());
      setSyncStatus("idle");
      setSyncError(null);
      setLastSync(new Date().toLocaleString());
    } catch (e) {
      setSyncStatus("error");
      setSyncError(e instanceof Error ? e.message : "Falha ao sincronizar.");
    }
  }, [syncCfg, buildSave]);

  const doSyncNow = useCallback(async () => {
    if (!syncCfg) return;
    setSyncStatus("syncing");
    setSyncError(null);
    try {
      const remote = await loadGistSave(syncCfg.token, syncCfg.gistId);
      const local = buildSave();
      const merged = remote ? mergeSaves(remote, local) : local;
      if (remote) {
        setState(() => ({ checks: merged.checks, startDate: merged.startDate }));
      }
      await pushGistSave(syncCfg.token, syncCfg.gistId, merged);
      setSyncStatus("idle");
      setLastSync(new Date().toLocaleString());
    } catch (e) {
      setSyncStatus("error");
      setSyncError(e instanceof Error ? e.message : "Falha ao sincronizar.");
    }
  }, [syncCfg, buildSave]);

  // autosave (debounce 2s) a cada mudança quando sincronizado
  useEffect(() => {
    if (!syncCfg) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void doPush();
    }, 2000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.checks, syncCfg]);

  const enableSync = useCallback(
    async (token: string): Promise<boolean> => {
      setSyncStatus("syncing");
      setSyncError(null);
      try {
        const cfg = { token: token.trim(), gistId: "" };
        const gistId = await findOrCreateGist(cfg.token, buildSave());
        const full = { token: cfg.token, gistId };
        setSyncCfg(full);
        storeSyncConfig(full);
        // baixa remoto, faz merge bidirecional e sobe o resultado
        const remote = await loadGistSave(full.token, full.gistId);
        const local = buildSave();
        const merged = remote ? mergeSaves(remote, local) : local;
        if (remote && JSON.stringify(merged.checks) !== JSON.stringify(local.checks)) {
          setState(() => ({ checks: merged.checks, startDate: merged.startDate }));
        }
        await pushGistSave(full.token, full.gistId, merged);
        setSyncStatus("idle");
        setLastSync(new Date().toLocaleString());
        return true;
      } catch (e) {
        setSyncStatus("error");
        setSyncError(e instanceof Error ? e.message : "Falha ao conectar.");
        setSyncCfg(null);
        storeSyncConfig(null);
        return false;
      }
    },
    [buildSave]
  );

  const disableSync = useCallback(() => {
    setSyncCfg(null);
    storeSyncConfig(null);
    setSyncStatus("idle");
    setSyncError(null);
    setLastSync(null);
  }, []);

  // ===== conquistas =====
  const achievements = useMemo(() => {
    let rehabDays = 0;
    let baduanjinDays = 0;
    const bjKeys = NEIGONG_DOMINGO.exercises.map((e) => `baduanjin:${e.id}`);
    for (const day of Object.values(state.checks)) {
      if (Object.keys(day).some((k) => k.endsWith(":rc"))) rehabDays++;
      if (bjKeys.every((k) => day[k])) baduanjinDays++;
    }
    const stats: Stats = {
      totalXp,
      streak,
      weekDone: weekProgress.done,
      weekTotal: weekProgress.total,
      levelIndex: level.index,
      neigongDailyComplete: !!results.neigong_daily?.complete,
      baduanjinComplete: !!results.baduanjin?.complete,
      mainTrainingComplete: weekProgress.done >= 1,
      activeDays: Object.keys(state.checks).length,
      rehabDays,
      baduanjinDays,
    };
    return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: a.test(stats) }));
  }, [state, totalXp, streak, weekProgress, level, results]);

  return {
    state,
    toggle,
    reset,
    totalXp,
    level,
    streak,
    weekNumber,
    weekProgress,
    results,
    dayChecks,
    achievements,
    sync: {
      enabled: syncCfg !== null,
      status: syncStatus,
      error: syncError,
      lastSync,
      enable: enableSync,
      disable: disableSync,
      syncNow: doSyncNow,
    },
  };
}
