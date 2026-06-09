import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { generateCase } from "@/lib/case.functions";
import { saveCase, clearCase } from "@/lib/case-storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OPERATION: SILENT WATCH" },
      {
        name: "description",
        content: "Jogo noir de interrogatório com IA. Descubra se o suspeito é culpado.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const gen = useServerFn(generateCase);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      clearCase();
      const c = await gen();
      saveCase(c);
      navigate({ to: "/briefing" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao gerar caso");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface relative overflow-hidden crt-flicker">
      <div className="crt-overlay" />
      <div className="scanline" />
      <div className="scan-bar" />

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <div className="absolute top-4 left-6 right-6 flex justify-between font-mono text-[10px] text-primary opacity-50">
          <span>SENTINEL_OS v4.2 // TERMINAL_82</span>
          <span>SEC.LEVEL.9 // STATUS: STANDBY</span>
        </div>

        <div className="max-w-2xl w-full text-center">
          <div className="inline-block px-3 py-1 border border-primary/50 text-primary font-mono text-[10px] tracking-widest mb-6">
            CLEARANCE: TOP SECRET
          </div>
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight uppercase text-on-surface mb-3">
            OPERATION:
            <br />
            <span className="text-primary text-glow">SILENT WATCH</span>
          </h1>
          <p className="font-mono text-xs text-on-surface-variant mb-10 tracking-wider">
            // INTERROGUE. ANALISE. DECIDA.
          </p>

          <div className="bg-surface-container-low border border-outline-variant p-6 text-left mb-8">
            <div className="font-mono text-[10px] text-primary tracking-widest mb-3">
              {">"} BRIEFING
            </div>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              A IA irá gerar um caso criminal único e atuar como o suspeito principal. Cabe a você
              interrogá-lo, identificar mentiras, cruzar evidências e proferir o veredito. O
              suspeito pode ser <span className="text-primary">culpado</span> ou{" "}
              <span className="text-error">inocente</span> — você não saberá até decidir.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 border border-error/50 bg-error/10 text-error font-mono text-xs">
              ERRO: {error}
            </div>
          )}

          <button
            onClick={start}
            disabled={loading}
            className="w-full py-4 bg-primary text-on-primary font-headline text-lg font-semibold uppercase tracking-widest hover:bg-primary-fixed-dim transition-all disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <span className="absolute inset-0 w-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="material-symbols-outlined">
              {loading ? "hourglass_top" : "power_settings_new"}
            </span>
            {loading ? "GERANDO CASO..." : "INICIAR NOVA INVESTIGAÇÃO"}
          </button>

          <a
            href="/api/download"
            download="operation-silent-watch.zip"
            className="mt-3 w-full py-3 bg-surface-container text-on-surface font-mono text-xs uppercase tracking-widest hover:bg-surface-container-high transition-colors border border-outline-variant flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            BAIXAR PROJETO (.ZIP)
          </a>

          <div className="mt-8 font-mono text-[10px] text-outline">
            AI_CORE: gemini-3-flash // RESPONSE_MODE: ROLEPLAY
          </div>
        </div>
      </main>
    </div>
  );
}
