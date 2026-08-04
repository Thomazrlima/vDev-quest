"use client";

import { useParams } from "next/navigation";
import { MissionForm } from "@/components/organisms/MissionForm";

export default function EditMissionPage() {
  const params = useParams<{ id: string }>();
  return <MissionForm missionId={params.id} />;
}
