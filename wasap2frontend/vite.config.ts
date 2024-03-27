import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/

// in vite you should use VITE_ANY_KEY for the variables being loaded from .env
// relative to wasap2frontend.
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": {
      ...process.env,
      DEVELOPMENT_API_URL:
        "https://crispy-spork-p5w99wrxp5w2rp4q-3000.app.github.dev/api",
    },
  },
});
