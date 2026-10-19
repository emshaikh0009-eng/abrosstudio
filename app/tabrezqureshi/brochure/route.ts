import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const cleanHost = host.split(":")[0].toLowerCase();
  const isApex =
    cleanHost === "ambrosstudio.com" ||
    cleanHost === "www.ambrosstudio.com" ||
    cleanHost === "ambrosstudio.space" ||
    cleanHost === "www.ambrosstudio.space";

  if (isApex) {
    return NextResponse.redirect("https://raftconconstruction.ambrosstudio.com/brochure", 308);
  }

  return NextResponse.redirect(new URL("/c/raftcon/brochure", request.url), 307);
}

