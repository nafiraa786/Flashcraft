import { notFound } from "next/navigation";
import { getStudioSession } from "@/lib/studio-store";
import StudioWorkspaceClient from "./studio-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudioPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getStudioSession(id);

  if (!session) {
    notFound();
  }

  return <StudioWorkspaceClient sessionId={id} initialPrompt={session.prompt} />;
}
