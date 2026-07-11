import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

// Standard TanStack Start + Vite configuration.
// Plugin order matters: resolve tsconfig paths -> Tailwind -> TanStack Start -> React.
// `server.entry: "server"` points SSR at src/server.ts (our error-wrapped entry).
export default defineConfig({
  server: { port: 5177, strictPort: true },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({ server: { entry: "server" } }),
    viteReact(),
  ],
});
