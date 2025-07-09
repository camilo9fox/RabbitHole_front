import { NextRequest, NextResponse } from "next/server";
// Rutas protegidas (puedes ajustar el array según tus necesidades)
const protectedRoutes = [
  "/account",
  "/my-orders",
  "/settings",
  "/admin/orders",
];

// Endpoint backend para validar el token
const VALIDATE_TOKEN_URL =
  process.env.NEXT_PUBLIC_VALIDATE_TOKEN_URL ??
  "http://localhost:8080/api/usuarios/validate-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("authToken")?.value;

  // 1. Validar expiración de token en TODAS las páginas
  if (token) {
    try {
      const response = await fetch(VALIDATE_TOKEN_URL, {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (data.message.includes("expired") && !pathname.includes("/auth")) {
        // Redirige a una página cliente donde se ejecuta signOut
        const res = NextResponse.redirect(new URL("/auth/expired", request.url));
        res.cookies.delete("authToken");
        return res;
      }
    } catch {
      // Si no se puede validar, redirige igual
      const res2 = NextResponse.redirect(new URL("/auth/expired", request.url));
      res2.cookies.delete("authToken");
      return res2;
    }
  }

  // 1.5 Validar acceso a rutas de administrador
  if (pathname.startsWith("/admin")) {
    // Requiere token
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    try {
      const response = await fetch(VALIDATE_TOKEN_URL, {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      // Si el usuario no es admin, redirigir al home
      if (!data.admin) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      // Ante cualquier error, redirigir al home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 2. Validar acceso SOLO en rutas protegidas
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    try {
      const response = await fetch(VALIDATE_TOKEN_URL, {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!data.valid) {
        return NextResponse.redirect(new URL("/auth/signin", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  return NextResponse.next();
}

// Middleware en todas las rutas, excepto archivos estáticos y API
export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"],
};
