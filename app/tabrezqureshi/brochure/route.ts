import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/c/raftcon/brochure", request.url), 307);
}
