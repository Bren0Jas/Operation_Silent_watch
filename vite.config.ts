// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// CORREÇÃO: Usar objeto simples em vez de factory function.
// Quando uma factory function é passada, o @lovable.dev/vite-tanstack-config envolve o resultado
// em `{ vite: userConfig }`, fazendo com que `options.nitro` fique em `options.vite.nitro` (undefined).
// Usando um objeto simples, a chave `nitro` é detectada corretamente no nível raiz das opções,
// ativando o plugin Nitro com o preset da Vercel para o deploy serverless funcionar.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    // Preset da Vercel: gera a estrutura .vercel/output/ compatível com o Build Output API v3
    preset: "vercel",
  },
});
