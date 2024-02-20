/* eslint-disable no-undef */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        "process.env": {},
        _global: {},
    },
    resolve: {
        alias: [{ find: "~", replacement: "/src" }],
    },
    server: {
        host: true,
    },
});
