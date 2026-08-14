import { createFileRoute } from "@tanstack/react-router";
import { MissionForm } from "../components/MissionForm";

export const Route = createFileRoute("/_app/missions/new/")({
    component: NewMissionPage,
});

function NewMissionPage() {
    return <MissionForm />;
}
