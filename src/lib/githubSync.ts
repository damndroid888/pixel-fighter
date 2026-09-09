// Sincronização via GitHub Gist (sem backend — token fica só no navegador do usuário)

export interface GistSave {
  checks: Record<string, Record<string, boolean>>;
  startDate: string;
  updatedAt: string;
}

export interface SyncConfig {
  token: string;
  gistId: string;
}

const GIST_FILENAME = "pixel-fighter-save.json";
const TOKEN_KEY = "pixel-fighter-sync-token";
const GIST_KEY = "pixel-fighter-sync-gist";

export function loadSyncConfig(): SyncConfig | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const gistId = localStorage.getItem(GIST_KEY);
    if (token && gistId) return { token, gistId };
  } catch {
    /* ignore */
  }
  return null;
}

export function storeSyncConfig(cfg: SyncConfig | null): void {
  if (cfg) {
    localStorage.setItem(TOKEN_KEY, cfg.token);
    localStorage.setItem(GIST_KEY, cfg.gistId);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(GIST_KEY);
  }
}

async function gh(token: string, path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const msg = res.status === 401
      ? "Token inválido ou expirado. Verifique o escopo 'gist'."
      : `GitHub respondeu erro ${res.status}.`;
    throw new Error(msg);
  }
  return res.json();
}

interface GistListItem {
  id: string;
  files?: Record<string, { filename?: string }>;
}

/** Procura o gist do app na conta do usuário; se não existir, cria. Retorna o gistId. */
export async function findOrCreateGist(token: string, initial: GistSave): Promise<string> {
  const list = (await gh(token, "/gists?per_page=100")) as GistListItem[];
  const found = Array.isArray(list)
    ? list.find((g) => g.files && GIST_FILENAME in g.files)
    : undefined;
  if (found) return found.id;

  const created = (await gh(token, "/gists", {
    method: "POST",
    body: JSON.stringify({
      description: "Pixel Fighter — save do plano de treino (não edite)",
      public: false,
      files: { [GIST_FILENAME]: { content: JSON.stringify(initial, null, 2) } },
    }),
  })) as { id: string };
  return created.id;
}

/** Lê o save remoto. Retorna null se o gist ainda não tem o arquivo. */
export async function loadGistSave(token: string, gistId: string): Promise<GistSave | null> {
  const g = (await gh(token, `/gists/${gistId}`)) as {
    files: Record<string, { content?: string; raw_url?: string }>;
  };
  const file = g.files?.[GIST_FILENAME];
  if (!file) return null;
  let raw = file.content ?? "";
  if (file.content == null && file.raw_url) {
    const r = await fetch(file.raw_url);
    raw = await r.text();
  }
  try {
    const parsed = JSON.parse(raw) as GistSave;
    if (parsed && typeof parsed.checks === "object" && parsed.startDate) return parsed;
  } catch {
    /* conteúdo inválido */
  }
  return null;
}

export async function pushGistSave(token: string, gistId: string, data: GistSave): Promise<void> {
  await gh(token, `/gists/${gistId}`, {
    method: "PATCH",
    body: JSON.stringify({
      files: { [GIST_FILENAME]: { content: JSON.stringify(data, null, 2) } },
    }),
  });
}

/** Une dois saves: cada check marcado em qualquer um dos lados permanece marcado. */
export function mergeSaves(a: GistSave, b: GistSave): GistSave {
  const checks: Record<string, Record<string, boolean>> = {};
  for (const src of [a.checks, b.checks]) {
    for (const [date, day] of Object.entries(src)) {
      checks[date] = { ...(checks[date] ?? {}), ...day };
    }
  }
  // startDate mais antiga vence (marca o início real do plano)
  const startDate = a.startDate < b.startDate ? a.startDate : b.startDate;
  return { checks, startDate, updatedAt: new Date().toISOString() };
}
