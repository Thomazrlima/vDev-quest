import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QuestLoader } from "@/components/ui/QuestLoader";
import "./index.css";

const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPendingComponent: () => <QuestLoader fullscreen hint="Preparando sua jornada" label="Abrindo o portal..." />,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
