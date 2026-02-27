// src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/", // landing
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow all routes through in E2E test mode (disabled by default in production)
  if (process.env.E2E_TEST_MODE === "true") return;
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Next.js recommended matcher for middleware/proxy
    "/((?!_next|.*\\.(?:css|js|json|png|jpg|jpeg|gif|svg|webp|ico|txt|map)$).*)",
    "/(api|trpc)(.*)",
  ],
};
