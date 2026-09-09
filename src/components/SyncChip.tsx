import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SyncApi {
  enabled: boolean;
  status: "idle" | "syncing" | "error";
  error: string | null;
  lastSync: string | null;
  enable: (token: string) => Promise<boolean>;
  disable: () => void;
  syncNow: () => Promise<void>;
}

export function SyncChip({ sync }: { sync: SyncApi }) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);

  const connect = async () => {
    if (!token.trim()) return;
    setBusy(true);
    const ok = await sync.enable(token);
    setBusy(false);
    if (ok) setToken("");
  };

  const chipColor = !sync.enabled
    ? "text-slate-400 border-slate-700"
    : sync.status === "error"
      ? "text-red-400 border-red-800"
      : sync.status === "syncing"
        ? "text-sky-300 border-sky-700"
        : "text-emerald-300 border-emerald-700";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`pixel-panel px-3 py-2 text-center border ${chipColor}`}
        title="Sincronização entre aparelhos"
      >
        <div className="font-pixel text-[8px]">
          {sync.status === "syncing" ? "···" : sync.enabled ? "☁ ON" : "☁ OFF"}
        </div>
        <div className="text-[10px] text-slate-400">sync</div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#101728] border-[3px] border-slate-600 text-slate-100 sm:max-w-lg pixel-panel-dialog">
          <DialogHeader>
            <DialogTitle className="font-pixel text-[11px] leading-relaxed text-sky-300">
              ☁ SINCRONIZAÇÃO ENTRE APARELHOS
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-[12px]">
              Celular e PC compartilham o mesmo progresso via um gist privado na sua conta GitHub.
            </DialogDescription>
          </DialogHeader>

          {!sync.enabled ? (
            <div className="space-y-3">
              <div className="text-[13px] text-slate-200 space-y-2">
                <p className="font-pixel text-[8px] text-amber-300">COMO CONECTAR (1 vez, 2 min):</p>
                <ol className="list-decimal list-inside space-y-1 text-[12px] text-slate-300">
                  <li>
                    Abra{" "}
                    <a
                      href="https://github.com/settings/tokens/new"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-300 underline"
                    >
                      github.com/settings/tokens/new
                    </a>{" "}
                    (faça login se pedir)
                  </li>
                  <li>Nome: <b>pixel-fighter</b> · Expiração: sem expiração</li>
                  <li>Marque <b>SOMENTE</b> a caixa <b>gist</b> e gere o token</li>
                  <li>Cole o token abaixo neste app (PC e celular)</li>
                </ol>
                <p className="text-[11px] text-slate-500">
                  🔒 O token fica salvo apenas no navegador deste aparelho e só pode ler/escrever gists.
                </p>
              </div>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-900 border-2 border-slate-700 px-3 py-2 text-[13px] text-slate-100 focus:border-sky-500 outline-none"
              />
              {sync.error && <p className="text-[12px] text-red-400">⚠ {sync.error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={connect}
                  disabled={busy || !token.trim()}
                  className="font-pixel text-[8px] px-3 py-2 border border-sky-600 text-sky-300 hover:bg-sky-500/10 disabled:opacity-40 transition-colors"
                >
                  {busy ? "CONECTANDO..." : "CONECTAR"}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="font-pixel text-[8px] px-3 py-2 border border-slate-600 hover:border-slate-400 transition-colors"
                >
                  FECHAR
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="pixel-panel p-3 text-[12px] text-slate-200">
                <p>
                  ✅ Sincronização ativa.{" "}
                  {sync.status === "syncing"
                    ? "Sincronizando agora..."
                    : `Última sync: ${sync.lastSync ?? "agora"}`}
                </p>
                <p className="text-slate-400 mt-1">
                  A cada exercício marcado, o progresso sobe automaticamente (2s). Ao abrir em outro
                  aparelho, conecte com o mesmo token para baixar tudo.
                </p>
              </div>
              {sync.error && <p className="text-[12px] text-red-400">⚠ {sync.error}</p>}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => void sync.syncNow()}
                  disabled={sync.status === "syncing"}
                  className="font-pixel text-[8px] px-3 py-2 border border-sky-600 text-sky-300 hover:bg-sky-500/10 disabled:opacity-40 transition-colors"
                >
                  SINCRONIZAR AGORA
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Desconectar a sincronização deste aparelho? (o progresso local continua)")) {
                      sync.disable();
                    }
                  }}
                  className="font-pixel text-[8px] px-3 py-2 border border-red-800 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  DESCONECTAR
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="font-pixel text-[8px] px-3 py-2 border border-slate-600 hover:border-slate-400 transition-colors"
                >
                  FECHAR
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
