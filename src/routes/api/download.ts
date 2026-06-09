import { createFileRoute } from "@tanstack/react-router";
import JSZip from "jszip";

// Inline all project source files at build time so we can serve a zip from the Worker runtime.
const files = import.meta.glob(
  [
    "/src/**/*",
    "/public/**/*",
    "/package.json",
    "/bun.lock",
    "/tsconfig.json",
    "/vite.config.ts",
    "/index.html",
    "/README.md",
    "/.gitignore",
    "/app.config.ts",
    "/components.json",
  ],
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;

export const Route = createFileRoute("/api/download")({
  server: {
    handlers: {
      GET: async () => {
        const zip = new JSZip();
        for (const [path, content] of Object.entries(files)) {
          // strip leading slash
          zip.file(path.replace(/^\//, ""), content);
        }
        const blob = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
        return new Response(blob as unknown as BodyInit, {
          status: 200,
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": 'attachment; filename="operation-silent-watch.zip"',
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
