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
  "http://localhost:8081/api/usuarios/validate-token";

export async function middleware(request: NextRequest) {
  // Solo proteger rutas definidas
  console.log("MIDDLEWARE RUNNING: ", request.nextUrl.pathname);
  const { pathname } = request.nextUrl;
  if (!protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Intenta obtener el token desde cookies (ajusta el nombre si es necesario)
  const token = request.cookies.get("authToken")?.value;

  if (!token) {
    // Si no hay token, redirige a login
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Llama al endpoint de validación
  try {
    const response = await fetch(VALIDATE_TOKEN_URL, {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    const data = await response.json();
    console.log("DATA VALIDATION: ", data);
    if (!data.valid) {
      // Token inválido, redirige a login
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    // Si quieres proteger solo admin, puedes hacer:
    // if (pathname.startsWith('/app/admin') && !data.admin) {
    //   return NextResponse.redirect(new URL('/login', request.url));
    // }
    return NextResponse.next();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Error en la validación, redirige a login
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
}

export const config = {
  matcher: ["/account", "/my-orders", "/settings", "/admin/orders"],
};
