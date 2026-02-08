// src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public pages only. Everything else requires a session.
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

// Treat all API routes as API (return 401 JSON instead of redirect HTML)
const isApiRoute = createRouteMatcher(["/api(.*)", "/trpc(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Public routes: do nothing
  if (isPublicRoute(req)) return NextResponse.next();

  // More control than auth.protect(): lets us return JSON for APIs.
  const { isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated) {
    // API callers should get 401 JSON (not HTML redirect)
    if (isApiRoute(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pages should redirect to sign-in and come back after auth
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
