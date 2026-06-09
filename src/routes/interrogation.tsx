import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { loadCase, loadMessages, saveMessages } from "@/lib/case-storage";
import type { Case } from "@/lib/case.functions";

export const Route = createFileRoute("/interrogation")({
  head: () => ({ meta: [{ title: "INTERROGATÓRIO // SILENT WATCH" }] }),
  component: Interrogation,
});

function Interrogation() {
  const navigate = useNavigate();
  const [c, setC] = useState<Case | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);

  useEffect(() => {
    const loaded = loadCase();
    if (!loaded) {
      navigate({ to: "/" });
      return;
    }
    setC(loaded);
    setInitialMessages(loadMessages<UIMessage>());
  }, [navigate]);

  if (!c || initialMessages === null) return null;
  return (
    <Chat
      caseData={c}
      initial={initialMessages}
      onVerdict={(v) => navigate({ to: "/verdict/$result", params: { result: v } })}
    />
  );
}

function Chat({
  caseData,
  initial,
  onVerdict,
}: {
  caseData: Case;
  initial: UIMessage[];
  onVerdict: (v: "accused" | "released") => void;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    id: caseData.caseId,
    messages: initial,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        caseData: {
          suspectName: caseData.suspectName,
          crime: caseData.crime,
          persona: caseData.persona,
          secretTruth: caseData.secretTruth,
          isGuilty: caseData.isGuilty,
        },
      },
    }),
  });

  useEffect(() => {
    saveMessages(messages);
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [status]);

  const busy = status === "submitted" || status === "streaming";

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const t = input.trim();
    if (!t || busy) return;
    setInput("");
    await sendMessage({ text: t });
  }

  function accuse() {
    if (confirm("ACUSAR este suspeito? Esta decisão é final.")) {
      // Comentário em português: Envia a decisão de acusar para a tela de veredito
      onVerdict("accused");
    }
  }
  function release() {
    if (confirm("LIBERAR o suspeito? Esta decisão é final.")) {
      // Comentário em português: Envia a decisão de liberar para a tela de veredito
      onVerdict("released");
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface relative crt-flicker flex flex-col">
      <div className="crt-overlay" />
      <div className="scanline" />

      <header className="sticky top-0 z-50 flex flex-wrap justify-between items-center gap-2 px-6 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">graphic_eq</span>
          <div>
            <h1 className="font-mono text-xs tracking-widest text-primary uppercase leading-tight">
              INTERROGATION_LIVE
            </h1>
            <div className="font-mono text-[10px] text-on-surface-variant">
              SUBJECT: {caseData.suspectName} // {caseData.caseId}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-error/20 text-error border border-error/50 font-mono text-[10px] uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" /> REC
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col relative z-10">
        <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4">
          {messages.length === 0 && (
            <div className="border border-outline-variant/50 bg-surface-container-low p-4 font-mono text-xs text-on-surface-variant">
              {">"} {caseData.suspectName} foi trazido para a sala de interrogatório. Inicie a
              conversa. Faça perguntas, pressione, observe contradições.
            </div>
          )}
          {messages.map((m) => {
            const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${isUser ? "" : "w-full"}`}>
                  <div
                    className={`font-mono text-[10px] mb-1 ${isUser ? "text-primary text-right" : "text-error"}`}
                  >
                    {isUser ? "DETETIVE >" : `${caseData.suspectName.toUpperCase()} >`}
                  </div>
                  {isUser ? (
                    <div className="bg-primary text-on-primary px-4 py-2 font-body text-sm">
                      {text}
                    </div>
                  ) : (
                    <div className="border-l-2 border-error/60 bg-surface-container-low pl-4 pr-3 py-2 font-body text-sm text-on-surface whitespace-pre-wrap">
                      {text}
                      {status === "streaming" && m === messages[messages.length - 1] && (
                        <span className="inline-block w-2 h-4 bg-error/80 ml-1 animate-pulse align-middle" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {status === "submitted" && (
            <div className="font-mono text-[10px] text-error opacity-70">
              {caseData.suspectName.toUpperCase()} está pensando...
            </div>
          )}
        </div>

        <form
          onSubmit={submit}
          className="border border-outline-variant bg-surface-container-low p-3 flex flex-col gap-2"
        >
          <div className="flex gap-2 items-end">
            <span className="font-mono text-primary text-sm pt-2">{">"}</span>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={2}
              placeholder="Faça uma pergunta ao suspeito..."
              className="flex-1 bg-transparent font-body text-sm text-on-surface outline-none resize-none placeholder:text-outline"
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="bg-primary text-on-primary px-4 py-2 font-mono text-xs uppercase tracking-widest disabled:opacity-40 hover:bg-primary-fixed-dim transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              ENVIAR
            </button>
          </div>
        </form>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={release}
            disabled={messages.length === 0}
            className="py-3 border border-outline-variant text-on-surface-variant font-mono text-xs uppercase tracking-widest hover:bg-surface-container-high transition-colors disabled:opacity-30 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">door_open</span>
            LIBERAR SUSPEITO
          </button>
          <button
            onClick={accuse}
            disabled={messages.length === 0}
            className="py-3 bg-error/20 border border-error text-error font-mono text-xs uppercase tracking-widest hover:bg-error/30 transition-colors disabled:opacity-30 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">gavel</span>
            ACUSAR FORMALMENTE
          </button>
        </div>
      </main>
    </div>
  );
}
