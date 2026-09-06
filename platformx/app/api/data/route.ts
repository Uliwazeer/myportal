import { NextResponse } from "next/server";
import { readDbAsync, writeDbAsync, dbMergeData } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await readDbAsync();
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.clientData) {
      const merged = await dbMergeData(body.clientData);
      return NextResponse.json({ ok: true, data: merged });
    }
    if (body.fullSync && body.data) {
      await writeDbAsync(body.data);
      return NextResponse.json({ ok: true });
    }
    const current = await readDbAsync();
    return NextResponse.json({ ok: true, data: current });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
