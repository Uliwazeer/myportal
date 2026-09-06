import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = readDb();
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.fullSync) {
      writeDb(body.data);
      return NextResponse.json({ ok: true });
    }
    const current = readDb();
    return NextResponse.json({ ok: true, data: current });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
