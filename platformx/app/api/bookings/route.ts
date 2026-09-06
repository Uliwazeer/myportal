import { NextResponse } from "next/server";
import { dbGetBookings, dbSaveBooking, dbUpdateBooking, dbAddNotification, dbGetUsers } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const mentorId = searchParams.get("mentorId");

    let bookings = dbGetBookings();
    if (userId) bookings = bookings.filter((b) => b.userId === userId);
    if (mentorId) bookings = bookings.filter((b) => b.mentorId === mentorId);

    return NextResponse.json({ ok: true, bookings });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.userId || !body.mentorId || !body.date || !body.time) {
      return NextResponse.json(
        { ok: false, error: "Missing required booking details." },
        { status: 400 }
      );
    }

    // Check double booking
    const bookings = dbGetBookings();
    const active = bookings.filter(
      (b) =>
        ["pending", "confirmed", "upcoming", "in-progress", "rescheduled"].includes(b.status) &&
        b.date === body.date &&
        b.time === body.time
    );

    const userConflict = active.find((b) => b.userId === body.userId);
    if (userConflict) {
      return NextResponse.json(
        { ok: false, error: "You already have another session booked at this exact date and time." },
        { status: 409 }
      );
    }

    const mentorConflict = active.find((b) => b.mentorId === body.mentorId);
    if (mentorConflict) {
      return NextResponse.json(
        { ok: false, error: "This mentor is already booked for another session at this time slot." },
        { status: 409 }
      );
    }

    const saved = dbSaveBooking(body);

    // Notifications
    const users = dbGetUsers();
    const user = users.find((u) => u.id === body.userId);
    const userName = user?.name || "A learner";

    dbAddNotification({
      userId: body.userId,
      message: `📅 [${saved.id}] Session booked for ${saved.date} at ${saved.time}. Check your dashboard for details.`,
    });

    dbAddNotification({
      userId: body.mentorId,
      message: `🔔 [${saved.id}] New booking request from ${userName} on ${saved.date} at ${saved.time}.`,
    });

    return NextResponse.json({ ok: true, booking: saved });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ ok: false, error: "Missing booking id" }, { status: 400 });
    }

    const updated = dbUpdateBooking(body.id, body.updates);
    if (!updated) {
      return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, booking: updated });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
