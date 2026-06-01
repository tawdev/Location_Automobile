import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const backendUrl = `http://192.168.100.198:8000/storage/${path.join("/")}`;
  try {
    const res = await fetch(backendUrl);
    if (!res.ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const blob = await res.blob();
    return new NextResponse(blob, {
      headers: { "Content-Type": res.headers.get("Content-Type") || "image/jpeg" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });
  }
}
