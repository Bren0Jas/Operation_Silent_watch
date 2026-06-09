import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadCase } from "@/lib/case-storage";
import type { Case } from "@/lib/case.functions";

export const Route = createFileRoute("/briefing")({
  head: () => ({ meta: [{ title: "BRIEFING // SILENT WATCH" }] }),
  component: Briefing,
});

function Briefing() {
  const navigate = useNavigate();
  const [c, setC] = useState<Case | null>(null);
  const [now, setNow] = useState("");

  useEffect(() => {
    const loaded = loadCase();
    if (!loaded) {
      navigate({ to: "/" });
      return;
    }
    setC(loaded);
    setNow(new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC");
  }, [navigate]);

  if (!c) return null;

  return (
    <div className="min-h-screen bg-background text-on-surface relative crt-flicker">
      <div className="crt-overlay" />
      <div className="scanline" />

      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-surface border-b border-outline-variant">
        <h1 className="font-mono text-xs tracking-widest text-primary uppercase">
          OPERATION: SILENT WATCH
        </h1>
        <div className="font-mono text-[10px] text-on-surface-variant">{now}</div>
      </header>

      <main className="pt-16 min-h-screen relative z-10">
        <div className="relative w-full h-[35vh] min-h-[260px] border-b border-outline-variant flex items-end overflow-hidden">
          <div
            className="absolute inset-0 opacity-30 grayscale"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDXa0uHPeqMJxodvRSA94_w64tin-2cuf7ASNWEFZRaPAZ-My2qCmJV-q0Szopp3-Ow-EWqHQ7mopj_bro103Nzn6Y49p95xxITHy7SFPviNNvsoVp1th5ZapjiH_98_sohRfZpfPhDYqki-vnnQN9EMRT_W7iGjHFWBuoOgBEp9XdvhCpMNM_PqAKq7fUVzECLgx1ivlXuw-WPQy_3lCmqP2adO3sybiTGbcHXPdQF9mUPSE0eKPIMOmycLD5TXc-YnSSGGVbhZtE')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
          <div className="relative z-10 w-full px-6 py-6 max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-primary/20 text-primary border border-primary/50 font-mono text-[10px] uppercase tracking-wider">
                STATUS: ACTIVE
              </span>
              <span className="px-2 py-1 bg-error/20 text-error border border-error/50 font-mono text-[10px] uppercase tracking-wider">
                PRIORITY: HIGH
              </span>
            </div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold uppercase tracking-tight">
              {c.suspectName} <span className="text-primary">// {c.crime}</span>
            </h2>
            <div className="font-mono text-xs text-on-surface-variant flex flex-wrap items-center gap-3 mt-2">
              <span>CASE_ID: {c.caseId}</span>
              <span>//</span>
              <span>
                INITIATED: <span className="text-primary">{now}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 flex flex-col gap-8">
            <section>
              <div className="flex items-center gap-2 border-b border-outline-variant pb-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  description
                </span>
                <h3 className="font-mono text-xs text-primary tracking-widest uppercase">
                  BREVE DO CASO
                </h3>
                <div className="flex-1 border-t border-outline-variant/30 ml-4" />
              </div>
              <div className="bg-surface-container-low border border-outline-variant/50 p-6 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
                <p className="font-body text-base leading-relaxed whitespace-pre-line">
                  {c.briefing}
                </p>
              </div>
            </section>

            <section>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="ALVO" value={c.suspectName.split(" ")[0]} />
                <Stat label="LOCALIZAÇÃO" value={c.location} />
                <Stat label="AMEAÇA" value="Nível 4" tone="error" />
                <Stat label="PRAZO" value="48 Horas" tone="primary" pulse />
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-8">
            <section>
              <div className="flex items-center gap-2 border-b border-outline-variant pb-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  visibility
                </span>
                <h3 className="font-mono text-xs text-primary tracking-widest uppercase">
                  EVIDÊNCIA INICIAL
                </h3>
                <div className="flex-1 border-t border-outline-variant/30 ml-4" />
              </div>
              <ul className="space-y-2">
                {c.evidence.map((ev, i) => (
                  <li
                    key={i}
                    className="bg-surface-container-low border border-outline-variant p-3 flex gap-3"
                  >
                    <span className="font-mono text-[10px] text-primary mt-1">
                      EV-{String(i + 1).padStart(3, "0")}
                    </span>
                    <span className="font-body text-sm text-on-surface-variant">{ev}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="mt-auto pt-4">
              <button
                onClick={() => navigate({ to: "/interrogation" })}
                className="w-full py-4 bg-primary text-on-primary font-headline text-base font-semibold uppercase tracking-wider hover:bg-primary-fixed-dim transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="material-symbols-outlined">forum</span>
                INICIAR INTERROGATÓRIO
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  pulse,
}: {
  label: string;
  value: string;
  tone?: "error" | "primary";
  pulse?: boolean;
}) {
  const color =
    tone === "error" ? "text-error" : tone === "primary" ? "text-primary" : "text-on-surface";
  return (
    <div className="bg-surface-container p-3 border border-outline-variant/30 flex flex-col gap-1">
      <span className="font-mono text-[10px] text-on-surface-variant">{label}</span>
      <span className={`font-mono text-xs ${color} ${pulse ? "animate-pulse" : ""}`}>{value}</span>
    </div>
  );
}
