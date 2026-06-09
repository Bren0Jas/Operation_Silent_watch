import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { clearCase, loadCase } from "@/lib/case-storage";
import type { Case } from "@/lib/case.functions";

export const Route = createFileRoute("/verdict/$result")({
  head: () => ({ meta: [{ title: "VEREDITO // SILENT WATCH" }] }),
  component: Verdict,
});

function Verdict() {
  const { result } = useParams({ from: "/verdict/$result" });
  const navigate = useNavigate();
  const [c, setC] = useState<Case | null>(null);

  useEffect(() => {
    setC(loadCase());
  }, []);

  // Comentário em português: Verifica se o jogador escolheu acusar
  const accused = result === "accused";
  // Comentário em português: A decisão é correta se o jogador acusou um culpado ou liberou um inocente
  const correct = c ? (accused ? c.isGuilty : !c.isGuilty) : false;

  const title = accused ? "VEREDITO: CULPADO" : "VEREDITO: INCONCLUSIVO";

  let body = "";
  if (accused) {
    if (correct) {
      body = `Justiça feita. ${c?.suspectName ?? "O suspeito"} foi condenado e o caso foi encerrado.`;
    } else {
      body = `Erro grave. ${c?.suspectName ?? "O suspeito"} foi condenado injustamente. O verdadeiro culpado continua à solta nas ruas.`;
    }
  } else {
    if (correct) {
      body = `Justiça feita. ${c?.suspectName ?? "O suspeito"} foi liberado. Suas suspeitas estavam corretas: ele foi incriminado de forma injusta.`;
    } else {
      body = `O suspeito escapou. ${c?.suspectName ?? "O suspeito"} era culpado e foi liberado devido à falta de provas ou erro de julgamento.`;
    }
  }

  const img = accused
    ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCVZ4NNJdg9qHzeZVLmufZwxA74pmQxf9FkLa2YbiZt1bA5yCDdS1GkPKeDyJxVLibZH21DeGWJEaZePKc1scgOsvMzNuYwnNxZlOYiav8Qz6JrU7GP1JkFQb81sFJNkVSIo92XUbnr8GmErvU1sQeZ65Fo3eNt8RVuAULki5BFHKKfNoAqMlef67Stkl2T8ArW_pQv69dINqMif5E3tcRTJVWx9FRefX8bCn1BcnR_zwNyKXJYepdX2UNUeiCCS5p7E8IqD5oTc-w"
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuBsLrhmuiFtOf7Lawoe-tAkMBScx-FjweVbIkJEWW8bpfz5_91N6lIsyQeEm5YcxlSPfF8oHjlxndBINT0QyHgDBNh9FoVBlEGIjCyP5cDtNw0PZ_duETu7xvBUCoqaAk27WEJj8ovZOkW-76JArOa6FrlcOu3ws1XL23MSlFO_Kcvk6IXrbgyBLzI1C2hf0ElXlsNDMVjTl_gzxU80KcmHEbWhWqeEnl_9iBJ8BApLqziZYxyoVvGo4X6cxhzS9anyA73HBegFstM";

  function reset() {
    clearCase();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col antialiased relative crt-flicker">
      <div className="scanline" />
      <div className="crt-overlay" />

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-1 relative">
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-primary opacity-50" />
          <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-primary opacity-50" />
          <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-primary opacity-50" />
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-primary opacity-50" />

          <div className="md:col-span-7 bg-surface-container border border-outline-variant relative overflow-hidden h-64 md:h-auto">
            <div className="absolute top-4 right-4 z-20 bg-surface-container-high border border-outline-variant px-3 py-1 font-mono text-[10px] flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${accused ? "bg-primary" : "bg-error"} animate-pulse`}
              />
              <span className={accused ? "text-primary" : "text-error"}>
                {accused ? "INCARCERATED" : "FEED_LOST"}
              </span>
            </div>
            <img
              alt="Verdict"
              className="w-full h-full object-cover grayscale opacity-80"
              src={img}
            />
          </div>

          <div className="md:col-span-5 bg-surface border border-outline-variant p-6 flex flex-col justify-center">
            <div className="mb-6 border-b border-outline-variant pb-2">
              <div className="font-mono text-[10px] text-primary mb-1 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">gavel</span>
                CASE RESOLUTION
              </div>
              <h1
                className={`font-headline text-3xl font-bold uppercase tracking-tighter ${correct ? "text-primary text-glow" : "text-on-surface"}`}
              >
                {title}
              </h1>
            </div>

            <div className="font-body text-sm text-on-surface-variant mb-6 leading-relaxed">
              <p className="mb-3">{body}</p>
              {c && (
                <p className="border-l-2 border-outline-variant pl-3 py-1 italic opacity-80 text-xs">
                  <span className="text-primary not-italic font-mono">VERDADE:</span>{" "}
                  {c.suspectName} {c.isGuilty ? "era de fato o culpado." : "era inocente."}{" "}
                  {c.secretTruth}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1 mb-6 font-mono text-[10px]">
              <div className="bg-surface-container p-2 border border-outline-variant flex flex-col">
                <span className="text-outline mb-1">DECISÃO</span>
                <span className={`font-bold ${accused ? "text-primary" : "text-error"}`}>
                  {accused ? "ACUSADO" : "LIBERADO"}
                </span>
              </div>
              <div className="bg-surface-container p-2 border border-outline-variant flex flex-col">
                <span className="text-outline mb-1">RESULTADO</span>
                <span className={`font-bold ${correct ? "text-primary" : "text-error"}`}>
                  {correct ? "CORRETO" : "FALHOU"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={reset}
                className="w-full bg-primary text-on-primary font-mono text-xs py-3 px-4 flex items-center justify-center gap-2 hover:bg-primary-fixed-dim transition-colors uppercase tracking-widest border border-primary"
              >
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                NOVA MISSÃO
              </button>
              <a
                href="/api/download"
                download="operation-silent-watch.zip"
                className="w-full bg-surface-container text-on-surface font-mono text-xs py-3 px-4 flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors uppercase tracking-widest border border-outline-variant"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                BAIXAR PROJETO (.ZIP)
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-8 border-t border-outline-variant bg-surface-container flex items-center px-4 font-mono text-[10px] text-on-surface-variant z-10">
        <span className="text-primary font-bold mr-3">SYS_LOG:</span>
        <span>Case archive compiled... Awaiting next operational directive...</span>
      </footer>
    </div>
  );
}
