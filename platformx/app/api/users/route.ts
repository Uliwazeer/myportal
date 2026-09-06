import { NextResponse } from "next/server";
import { dbGetUsers, dbSaveUser, dbUpdateUser } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = dbGetUsers();
    return NextResponse.json({ ok: true, users });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.email || !body.role) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: name, email, role" },
        { status: 400 }
      );
    }
    const saved = dbSaveUser(body);
    return NextResponse.json({ ok: true, user: saved });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ ok: false, error: "Missing user id" }, { status: 400 });
    }
    const updated = dbUpdateUser(body.id, body.updates);
    if (!updated) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
