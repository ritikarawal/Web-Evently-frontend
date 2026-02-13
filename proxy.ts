import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/", "/features", "/pricing", "/about", "/login", "/register"];
const adminRoutes = ["/admin", "/admin/dashboard"];
const protectedRoutes = ["/home", "/profile", "/events", ...adminRoutes, "/user"];

const isRouteMatch = (pathname: string, route: string) => {
  if (route === "/") return pathname === "/";
  return pathname === route || pathname.startsWith(`${route}/`);
};

const isInRoutes = (pathname: string, routes: string[]) =>
  routes.some((route) => isRouteMatch(pathname, route));

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("auth_token")?.value || null;
  const userDataRaw = request.cookies.get("user_data")?.value || null;
  let user: { role?: string } | null = null;
  if (userDataRaw) {
    try {
      user = JSON.parse(userDataRaw);
    } catch {
      user = null;
    }
  }

  const isPublicRoute = isInRoutes(pathname, publicRoutes);
  const isProtectedRoute = isInRoutes(pathname, protectedRoutes);
  const isAdminRoute = isInRoutes(pathname, adminRoutes);
  const isHomeRoute = isRouteMatch(pathname, "/home");

  if (!token && isProtectedRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && user) {
    if (isAdminRoute && user.role !== "admin") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    if (pathname === "/") {
      const dashboardUrl = user.role === "admin" ? "/admin/dashboard" : "/home";
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/profile/:path*",
    "/events/:path*",
    "/admin/:path*",
    "/user/:path*"
  ],
};
