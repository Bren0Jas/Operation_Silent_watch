import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createGeminiProvider } from "@/lib/ai-gateway.server";

type Body = {
  messages?: UIMessage[];
  caseData?: {
    suspectName: string;
    crime: string;
    persona: string;
    secretTruth: string;
    isGuilty: boolean;
  };
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, caseData } = (await request.json()) as Body;
        if (!Array.isArray(messages) || !caseData) {
          return new Response("Bad request", { status: 400 });
        }
        const key = process.env.GEMINI_API_KEY;
        if (!key) return new Response("Missing GEMINI_API_KEY", { status: 500 });

        const system = `Você está atuando o papel de ${caseData.suspectName}, um suspeito sendo interrogado em um caso de "${caseData.crime}".

PERSONALIDADE:
${caseData.persona}

VERDADE OCULTA (NUNCA revele diretamente, mas use para guiar suas respostas):
${caseData.secretTruth}

VOCÊ ${caseData.isGuilty ? "É CULPADO" : "É INOCENTE"} deste crime.

REGRAS DE ATUAÇÃO:
- Responda SEMPRE em português brasileiro, na primeira pessoa, como o suspeito.
- ${caseData.isGuilty ? "Você está mentindo para se proteger. Negue tudo, invente álibis, desvie perguntas. Pode escorregar em pequenas contradições sob pressão (perguntas diretas, repetidas ou específicas)." : "Você está dizendo a verdade, mas está nervoso/indignado por ser acusado injustamente. Pode parecer suspeito por ansiedade, mas seu álibi se sustenta."}
- Mostre emoção: medo, raiva, ironia, cansaço.
- Mantenha respostas CURTAS (1-3 frases). Sem narração, sem asteriscos, só fala direta.
- NUNCA quebre o personagem. NUNCA diga que é uma IA. NUNCA confesse abertamente.
- Se o detetive te pressionar com evidências fortes e específicas, ${caseData.isGuilty ? "fique mais nervoso, hesite, contradiga-se levemente" : "defenda-se com firmeza apontando incoerências"}.`;

        const gemini = createGeminiProvider(key);
        const result = streamText({
          // gemini-2.5-flash-lite: mais rápido e com menos demanda, ideal para respostas curtas do suspeito
          model: gemini("gemini-2.5-flash-lite"),
          system,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
