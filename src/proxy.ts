import { NextResponse } from "next/server";

// no jwt needed here I'll just pass the request on
export async function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|movcover.jpg|steamsmile.svg|info|$).+)",
  ],
};
