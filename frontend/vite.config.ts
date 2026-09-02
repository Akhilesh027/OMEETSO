import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { fileURLToPath, URL } from "node:url";

function crawlerOpenGraphPlugin() {
  return {
    name: "crawler-opengraph-plugin",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const ua = req.headers["user-agent"] || "";
        const isCrawler = /whatsapp|facebookexternalhit|facebot|twitterbot|telegrambot|linkedinbot|discordbot|slackbot|curl/i.test(ua);
        if (isCrawler && req.url && (req.url.startsWith("/product/") || req.url.startsWith("/p/") || req.url.startsWith("/store/"))) {
          try {
            const backendRes = await fetch(`https://api.omeetso.in${req.url}`, {
              headers: { "user-agent": ua }
            });
            const html = await backendRes.text();
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(html);
            return;
          } catch {
            // fallthrough
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  server: {
    host: true,
    port: 5173,
  },
  plugins: [
    crawlerOpenGraphPlugin(),
    TanStackRouterVite({ target: "react", autoCodeSplitting: false }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});

