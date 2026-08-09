import { NextResponse, type NextRequest } from "next/server";

// El admin maneja la autenticación 100% del lado del cliente
// con storageKey independiente. El middleware solo sirve como proxy.
export async function middleware(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
