import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Next.js 16 Proxy (renamed from middleware) — protects authenticated routes.
 *
 * Clerk's `clerkMiddleware` is API-stable across the rename: it just runs on
 * each request. We use `auth.protect()` to redirect unauthenticated visitors
 * to the sign-in page for any `/app/*` route.
 *
 * Public routes (marketing, /login, /sign-up, /api/webhooks/*) fall through.
 */

const isProtectedRoute = createRouteMatcher(['/app(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run on API routes
    '/(api|trpc)(.*)',
  ],
};
