import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createGeminiProvider } from "./ai-gateway.server";

const CaseSchema = z.object({
  caseId: z.string(),
  title: z.string(),
  suspectName: z.string(),
  location: z.string(),
  crime: z.string(),
  briefing: z.string(),
  evidence: z.array(z.string()).min(2).max(4),
  isGuilty: z.boolean(),
  persona: z.string(),
  secretTruth: z.string(),
});

export type Case = z.infer<typeof CaseSchema>;

export const generateCase = createServerFn({ method: "POST" }).handler(async () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Missing GEMINI_API_KEY");

  const isGuilty = Math.random() > 0.5;
  const gemini = createGeminiProvider(key);

  const prompt = `Você é o gerador de casos de um jogo noir de investigação chamado "OPERATION: SILENT WATCH". Gere um caso criminal CURTO e original em português brasileiro.

REGRA SECRETA: o suspeito ${isGuilty ? "É O VERDADEIRO CULPADO" : "É INOCENTE (alguém quer incriminá-lo)"}.

Responda APENAS com JSON válido (sem markdown, sem \`\`\`), no formato:
{
  "caseId": "ex: #884-XX-99",
  "title": "TÍTULO CURTO DO CASO EM CAIXA ALTA",
  "suspectName": "Nome completo do suspeito",
  "location": "Bairro/Cidade (ex: Setor Sul, SP)",
  "crime": "Tipo do crime em 2-4 palavras (ex: Roubo de Identidade)",
  "briefing": "2 parágrafos densos descrevendo o caso, evidências circunstanciais e por que o suspeito é o alvo principal. Tom de relatório de inteligência classificado.",
  "evidence": ["evidência curta 1", "evidência curta 2", "evidência curta 3"],
  "isGuilty": ${isGuilty},
  "persona": "Descrição da personalidade do suspeito, seu álibi, segredos, manias e como ele reage sob pressão (3-5 frases)",
  "secretTruth": "A VERDADE OCULTA: o que realmente aconteceu. Detalhe usado internamente pela IA para manter coerência. ${isGuilty ? "Detalhe como ele cometeu o crime e o que tenta esconder." : "Detalhe quem realmente é o culpado e por que esse suspeito foi incriminado."}"
}`;

  const { text } = await generateText({
    model: gemini("gemini-2.5-flash"),
    prompt,
  });

  const cleaned = text
    .replace(/```json\s*/g, "")
    .replace(/```/g, "")
    .trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Resposta da IA inválida");
  const parsed = CaseSchema.parse(JSON.parse(jsonMatch[0]));
  return parsed;
});
