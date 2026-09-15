import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    plugins: [
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true,
            routesDirectory: "./src/pages",
            generatedRouteTree: "./src/routeTree.gen.ts",
            routeToken: "layout",
            routeFileIgnorePattern: "^(components|tests|utils|hooks|_module)$",
        }),
        tailwindcss(),
        react(),
    ],
});
