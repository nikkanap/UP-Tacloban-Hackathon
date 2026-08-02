import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The Django backend has no CORS middleware installed, so the browser must see
// the API as same-origin. Everything under /api is proxied to it instead.
//
// Default target is `manage.py runserver` on 8000. Set VITE_API_PROXY_TARGET in
// frontend/.env to point somewhere else — http://localhost for the nginx
// container in backend/docker-compose.yml, or a deployed backend's URL.
export default defineConfig(({ mode }) => {
  // "" prefix so non-VITE_ vars in .env are readable here too. Only what this
  // file references is used; nothing extra reaches the client bundle.
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_API_PROXY_TARGET || "http://localhost:8000";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // Matches CORS_ALLOWED_ORIGINS / CSRF_TRUSTED_ORIGINS in backend settings.
      port: 9000,
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          configure: (proxy) => {
            // Without this a stopped backend surfaces as a bare 502 with an
            // HTML body, which tells nobody anything. Answer with JSON the API
            // client can turn into a readable message.
            proxy.on("error", (error, _req, res) => {
              const detail = `Cannot reach the backend at ${target} (${error.code || error.message}). Is it running?`;
              console.error(`[api proxy] ${detail}`);
              if (res.writableEnded || !res.writeHead) return;
              res.writeHead(502, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ detail }));
            });
          },
        },
      },
    },
  };
});
