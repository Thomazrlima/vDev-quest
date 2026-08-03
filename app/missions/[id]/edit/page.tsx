"use client";

import { useParams } from "next/navigation";
import { MissionForm } from "@/components/MissionForm";

export default function EditMissionPage() {
  const params = useParams<{ id: string }>();
  return <MissionForm missionId={params.id} />;
}
