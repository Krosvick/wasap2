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
    },
  },
});
