import { createFileRoute } from "@tanstack/react-router";
import { MissionForm } from "../../components/MissionForm";

export const Route = createFileRoute("/_app/missions/$id/edit/")({
    component: EditMissionPage,
});

function EditMissionPage() {
    const { id } = Route.useParams();
    return <MissionForm missionId={id} />;
}
