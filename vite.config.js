import path from "node:path";
import { pathToFileURL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Runs the handlers in /api inside the dev and preview servers, so the contact form
// works locally exactly as it does on Vercel.
async function readBody(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return raw;
  }
}

// Gives Node's response the res.status().json() helpers that Vercel Functions provide.
function withVercelHelpers(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
    return res;
  };
  return res;
}

function localApi() {
  const mount = (middlewares, fresh) =>
    middlewares.use(async (req, res, next) => {
      const { pathname } = new URL(req.url, "http://localhost");
      if (!pathname.startsWith("/api/")) return next();

      const file = path.resolve("api", `${pathname.slice(5).replace(/[^\w-]/g, "")}.js`);
      withVercelHelpers(res);
      try {
        // In dev, re-import on every request so edits to the handler apply immediately.
        const { default: handler } = await import(pathToFileURL(file).href + (fresh ? `?t=${Date.now()}` : ""));
        req.body = await readBody(req);
        await handler(req, res);
      } catch (err) {
        const missing = err.code === "ERR_MODULE_NOT_FOUND" && err.message.includes(file);
        if (!missing) console.error(err);
        if (!res.headersSent) res.status(missing ? 404 : 500).json({ error: missing ? "Not found." : "Server error." });
      }
    });

  // Block bodies on purpose: a function returned from these hooks is treated by Vite as a post-hook.
  return {
    name: "local-api",
    configureServer(server) {
      mount(server.middlewares, true);
    },
    configurePreviewServer(server) {
      mount(server.middlewares, false);
    },
  };
}

// Fills in absolute URLs (needed for link previews) and writes robots.txt + sitemap.xml.
// On Vercel the production URL is picked up automatically; elsewhere set SITE_URL.
function siteMeta(siteUrl) {
  return {
    name: "site-meta",
    transformIndexHtml: (html) => html.replaceAll("__SITE_URL__", siteUrl),
    generateBundle() {
      const sitemap = siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml\n` : "";
      this.emitFile({ type: "asset", fileName: "robots.txt", source: `User-agent: *\nAllow: /\n${sitemap}` });
      if (siteUrl) {
        this.emitFile({
          type: "asset",
          fileName: "sitemap.xml",
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc></url>\n</urlset>\n`,
        });
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  // Make .env / .env.local values (SMTP_USER, SITE_URL, …) visible to the API handlers.
  for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), ""))) {
    process.env[key] ??= value;
  }
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const siteUrl = (process.env.SITE_URL || (vercelUrl ? `https://${vercelUrl}` : "")).replace(/\/$/, "");

  return {
    plugins: [react(), localApi(), siteMeta(siteUrl)],
    build: {
      // three.js is big, but it is lazy-loaded after the page has painted.
      chunkSizeWarningLimit: 1100,
      rollupOptions: {
        output: {
          // Keep the heavy 3D libraries in their own chunk so the page text paints first.
          manualChunks(id) {
            if (id.includes("node_modules/three") || id.includes("@react-three")) return "three";
            if (id.includes("node_modules/gsap")) return "gsap";
          },
        },
      },
    },
  };
});
