import {
  clerkMiddleware,
  createRouteMatcher,
} from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/app(.*)',
  '/onboarding(.*)',
  '/api/v1/companion(.*)',
  '/api/v1/progress(.*)',
  '/api/v1/onboarding(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};