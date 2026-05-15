import { redirect } from 'next/navigation';

/**
 * /app — the workspace root. Always redirects to /app/home.
 * Per-project routes live at /app/[projectId]/*.
 */
export default function AppRootPage(): never {
  redirect('/app/home');
}
