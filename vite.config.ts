import { defineConfig } from "vite";
import { ViteAliases } from "vite-aliases";
import checker from "vite-plugin-checker";
import reactJsx from "vite-react-jsx";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  build: {
    minify: mode !== "development",
    sourcemap: true
  },
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "react-router-dom",
      "@mui/material",
      "@mui/lab",
      "@mui/icons-material",
    ],
  },
  
  server: {
    port: parseInt(process.env.PORT) || 3000,
    hmr: {
      port: process.env.PORT || process.env.CODESPACES ? 443 : 3000,
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  plugins: [
    ViteAliases(),
    checker({ typescript: true } /** TS options */),
    reactJsx(),
  ],
}));
