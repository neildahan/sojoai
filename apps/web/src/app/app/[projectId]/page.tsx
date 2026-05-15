import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

/**
 * /app/[projectId] — always redirects to the project's Team Room.
 * Per the design spec, the Team Room is the canonical project landing.
 */
export default async function ProjectRootPage({ params }: PageProps): Promise<never> {
  const { projectId } = await params;
  redirect(`/app/${projectId}/team-room`);
}
