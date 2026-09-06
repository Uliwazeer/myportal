import fs from "fs";
import path from "path";
import type { UserProfile, Booking, Review, Notification, Activity, VisitorEvent, PlatformAnalytics } from "./data";
import { mentors as staticMentors } from "./data";

export type DbSchema = {
  users: UserProfile[];
  bookings: Booking[];
  reviews: Review[];
  notifications: Notification[];
  activities: Activity[];
  events: VisitorEvent[];
};

const DB_PATH = path.join(process.cwd(), "data", "db.json");

// Ensure data directory and initial seed file exist
function getInitialData(): DbSchema {
  const now = new Date();
  const dateStr = (daysAgo: number) => {
    const d = new Date();
    d.setDate(now.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  };

  const seedUsers: UserProfile[] = [
    {
      id: "intern-1",
      name: "Ahmed Mahmoud",
      email: "ahmed.mahmoud@example.com",
      phone: "+201011112222",
      role: "intern",
      university: "Cairo University — Computer Engineering",
      level: "Junior",
      trackSlug: "platform-engineer",
      mentorId: "ali-wazeer",
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      progress: 85,
    },
    {
      id: "intern-2",
      name: "Youssef Ibrahim",
      email: "youssef.ibrahim@example.com",
      phone: "+201033334444",
      role: "intern",
      university: "Ain Shams University",
      level: "Mid-Level",
      trackSlug: "backend-engineer",
      mentorId: "charles",
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      progress: 90,
    },
    {
      id: "intern-3",
      name: "Omar Kamal",
      email: "omar.kamal@example.com",
      phone: "+201055556666",
      role: "intern",
      university: "Helwan University — Cybersecurity",
      level: "Junior",
      trackSlug: "cyber-security",
      mentorId: "xilie",
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      progress: 75,
    },
    {
      id: "intern-4",
      name: "Salma Saeed",
      email: "salma.saeed@example.com",
      phone: "+201077778888",
      role: "intern",
      university: "Alexandria University",
      level: "Junior",
      trackSlug: "cyber-security",
      mentorId: "xilie",
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      progress: 100,
    },
    {
      id: "intern-5",
      name: "Ziad Fathi",
      email: "ziad.fathi@example.com",
      phone: "+201099990000",
      role: "intern",
      university: "Mansoura University",
      level: "Mid-Level",
      trackSlug: "devops-engineer",
      mentorId: "sajid",
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      progress: 60,
    },
    {
      id: "intern-6",
      name: "Hany Mansour",
      email: "hany.mansour@example.com",
      phone: "+201112223344",
      role: "intern",
      university: "GUC (German University in Cairo)",
      level: "Senior",
      trackSlug: "platform-engineer",
      mentorId: "waleed-gharieb",
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      progress: 70,
    },
    {
      id: "intern-7",
      name: "Mariam Lotfy",
      email: "mariam.lotfy@example.com",
      phone: "+201133335555",
      role: "intern",
      university: "AUC (American University in Cairo)",
      level: "Junior",
      trackSlug: "platform-engineer",
      mentorId: "ahmed-moustafa",
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      progress: 80,
    },
    {
      id: "intern-8",
      name: "Yasmine Soliman",
      email: "yasmine.soliman@example.com",
      phone: "+201155557777",
      role: "intern",
      university: "Zagazig University",
      level: "Junior",
      trackSlug: "devops-engineer",
      mentorId: "ahmed-gamal",
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      progress: 45,
    },
    {
      id: "client-1",
      name: "Khaled Hassan",
      email: "khaled.hassan@example.com",
      phone: "+201211112233",
      role: "consultation",
      topic: "Kubernetes Cluster Ingress & SSL Troubleshooting",
      createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
    },
    {
      id: "client-2",
      name: "Mohamed Samir",
      email: "mohamed.samir@example.com",
      phone: "+201233334455",
      role: "consultation",
      topic: "Microservices & Redis Caching Architecture",
      createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
    },
    {
      id: "client-3",
      name: "Amr Nabil",
      email: "amr.nabil@example.com",
      phone: "+201255556677",
      role: "consultation",
      topic: "AWS Security Audit & IAM Policy Hardening",
      createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    },
    {
      id: "client-4",
      name: "Karim Tawfik",
      email: "karim.tawfik@example.com",
      phone: "+201277778899",
      role: "consultation",
      topic: "Linux Server Performance Tuning & Storage LVM",
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id: "client-5",
      name: "Tarek Abdelrahman",
      email: "tarek.abdelrahman@example.com",
      phone: "+201299990011",
      role: "consultation",
      topic: "Infrastructure Automation & Multi-Cloud Terraform",
      createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    },
    {
      id: "client-6",
      name: "Kareem Fahmy",
      email: "kareem.fahmy@example.com",
      phone: "+201012345678",
      role: "consultation",
      topic: "Platform Strategy & IDP (Internal Developer Platform)",
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
      id: "client-7",
      name: "Hassan Bakr",
      email: "hassan.bakr@example.com",
      phone: "+201098765432",
      role: "consultation",
      topic: "Linux Systems Patching & Ansible Automation",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ];

  const seedBookings: Booking[] = [
    {
      id: "MP-2026-104921",
      userId: "client-1",
      mentorId: "ali-wazeer",
      trackSlug: "platform-engineer",
      sessionType: "Consultation",
      date: dateStr(18),
      time: "18:00",
      duration: 60,
      topic: "Kubernetes Cluster Ingress & SSL Troubleshooting",
      status: "completed",
      createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
    },
    {
      id: "MP-2026-218492",
      userId: "client-2",
      mentorId: "charles",
      trackSlug: "backend-engineer",
      sessionType: "Technical Review",
      date: dateStr(14),
      time: "19:00",
      duration: 60,
      topic: "Microservices & Redis Caching Architecture",
      status: "completed",
      createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
    },
    {
      id: "MP-2026-339102",
      userId: "client-3",
      mentorId: "xilie",
      trackSlug: "cyber-security",
      sessionType: "Consultation",
      date: dateStr(10),
      time: "20:00",
      duration: 40,
      topic: "AWS Security Audit & IAM Policy Hardening",
      status: "completed",
      createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    },
    {
      id: "MP-2026-442819",
      userId: "client-4",
      mentorId: "sajid",
      trackSlug: "devops-engineer",
      sessionType: "Consultation",
      date: dateStr(7),
      time: "18:00",
      duration: 40,
      topic: "Linux Server Performance Tuning & Storage LVM",
      status: "completed",
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id: "MP-2026-558291",
      userId: "client-5",
      mentorId: "waleed-gharieb",
      trackSlug: "platform-engineer",
      sessionType: "Consultation",
      date: dateStr(4),
      time: "18:00",
      duration: 60,
      topic: "Infrastructure Automation & Multi-Cloud Terraform",
      status: "completed",
      createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    },
    {
      id: "MP-2026-667182",
      userId: "client-6",
      mentorId: "ahmed-moustafa",
      trackSlug: "platform-engineer",
      sessionType: "Career Guidance",
      date: dateStr(2),
      time: "19:00",
      duration: 60,
      topic: "Platform Strategy & IDP (Internal Developer Platform)",
      status: "completed",
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
      id: "MP-2026-778291",
      userId: "client-7",
      mentorId: "ahmed-gamal",
      trackSlug: "devops-engineer",
      sessionType: "Technical Review",
      date: dateStr(1),
      time: "17:00",
      duration: 40,
      topic: "Linux Systems Patching & Ansible Automation",
      status: "confirmed",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: "MP-2026-889102",
      userId: "intern-1",
      mentorId: "ali-wazeer",
      trackSlug: "platform-engineer",
      sessionType: "Mentorship",
      date: dateStr(-3),
      time: "18:00",
      duration: 60,
      topic: "GitOps with ArgoCD & Multi-Cluster Sync",
      status: "confirmed",
      createdAt: new Date().toISOString(),
    },
    {
      id: "MP-2026-991203",
      userId: "intern-2",
      mentorId: "charles",
      trackSlug: "backend-engineer",
      sessionType: "Mentorship",
      date: dateStr(-5),
      time: "19:00",
      duration: 60,
      topic: "GraphQL Subscriptions & Event-Driven Architecture",
      status: "confirmed",
      createdAt: new Date().toISOString(),
    },
  ];

  const seedReviews: Review[] = [
    {
      id: "rev-1",
      bookingId: "MP-2026-104921",
      userId: "client-1",
      mentorId: "ali-wazeer",
      rating: 5,
      comment: "Super in-depth Kubernetes session. Solved our production ingress issue in 40 minutes!",
      userName: "Khaled Hassan",
      createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    },
    {
      id: "rev-2",
      bookingId: "MP-2026-218492",
      userId: "client-2",
      mentorId: "charles",
      rating: 5,
      comment: "Charles helped architect our microservices communication with Redis and Kafka seamlessly.",
      userName: "Mohamed Samir",
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id: "rev-3",
      bookingId: "MP-2026-339102",
      userId: "client-3",
      mentorId: "xilie",
      rating: 5,
      comment: "Outstanding mentor. XiLie conducted security hardening and identified open S3 permissions instantly.",
      userName: "Amr Nabil",
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: "rev-4",
      bookingId: "MP-2026-442819",
      userId: "client-4",
      mentorId: "sajid",
      rating: 5,
      comment: "Extremely knowledgeable in Linux performance troubleshooting and server clustering.",
      userName: "Karim Tawfik",
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: "rev-5",
      bookingId: "MP-2026-558291",
      userId: "client-5",
      mentorId: "waleed-gharieb",
      rating: 5,
      comment: "Waleed revamped our entire multi-DC infrastructure architecture and automated our Terraform provisioning flawlessly.",
      userName: "Tarek Abdelrahman",
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: "rev-6",
      bookingId: "MP-2026-667182",
      userId: "client-6",
      mentorId: "ahmed-moustafa",
      rating: 5,
      comment: "Ahmed's leadership and deep platform architecture insights completely transformed our engineering velocity.",
      userName: "Kareem Fahmy",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];

  const seedActivities: Activity[] = [
    {
      id: "act-1",
      type: "consultation_booked",
      userName: "Hassan Bakr",
      mentorName: "Ahmed Gamal",
      details: "Booked Linux Systems Patching & Ansible Automation session",
      timestamp: "10 minutes ago",
    },
    {
      id: "act-2",
      type: "review_added",
      userName: "Kareem Fahmy",
      mentorName: "Ahmed Moustafa",
      details: "Rated 5.0 ★ 'Ahmed's leadership transformed our platform.'",
      timestamp: "1 hour ago",
    },
    {
      id: "act-3",
      type: "internship_started",
      userName: "Hany Mansour",
      mentorName: "Waleed Gharieb",
      details: "Started 8-week Platform Engineering apprenticeship",
      timestamp: "3 hours ago",
    },
    {
      id: "act-4",
      type: "consultation_completed",
      userName: "Tarek Abdelrahman",
      mentorName: "Waleed Gharieb",
      details: "Completed 60-min Infrastructure Automation consultation",
      timestamp: "Yesterday",
    },
  ];

  // Seed initial realistic visitor events over the past 7 days
  const seedEvents: VisitorEvent[] = [];
  const pagesList = ["/", "/tracks", "/mentors", "/interns", "/consultations", "/book", "/labs"];
  for (let d = 6; d >= 0; d--) {
    const dayDate = new Date();
    dayDate.setDate(now.getDate() - d);
    const count = 18 + Math.floor(Math.random() * 25);
    for (let i = 0; i < count; i++) {
      const page = pagesList[Math.floor(Math.random() * pagesList.length)];
      const vId = `vis-${(i % 12) + (d * 5)}`;
      seedEvents.push({
        id: `ev-${d}-${i}`,
        visitorId: vId,
        page,
        device: i % 3 === 0 ? "Mobile" : "Desktop",
        browser: i % 2 === 0 ? "Chrome" : "Safari",
        createdAt: dayDate.toISOString(),
      });
    }
  }

  return {
    users: seedUsers,
    bookings: seedBookings,
    reviews: seedReviews,
    notifications: [],
    activities: seedActivities,
    events: seedEvents,
  };
}

let inMemoryDb: DbSchema | null = null;

// Cloud DB credentials from environment (Upstash Redis / Vercel KV / Supabase)
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function fetchFromCloudKv(): Promise<DbSchema | null> {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}/get/platformx_db`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.result) {
      const parsed = typeof json.result === "string" ? JSON.parse(json.result) : json.result;
      return parsed as DbSchema;
    }
  } catch (e) {
    console.warn("Cloud KV read failed, falling back to local store:", e);
  }
  return null;
}

async function saveToCloudKv(data: DbSchema): Promise<boolean> {
  if (!KV_URL || !KV_TOKEN) return false;
  try {
    const res = await fetch(`${KV_URL}/set/platformx_db`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(JSON.stringify(data)),
      cache: "no-store",
    });
    return res.ok;
  } catch (e) {
    console.warn("Cloud KV write failed:", e);
    return false;
  }
}

function ensureDbFile(): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initial = getInitialData();
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
}

export function readDb(): DbSchema {
  if (inMemoryDb) return inMemoryDb;
  try {
    ensureDbFile();
    const content = fs.readFileSync(DB_PATH, "utf8");
    const data = JSON.parse(content) as DbSchema;
    if (!data.users) data.users = [];
    if (!data.bookings) data.bookings = [];
    if (!data.reviews) data.reviews = [];
    if (!data.notifications) data.notifications = [];
    if (!data.activities) data.activities = [];
    if (!data.events) data.events = [];
    inMemoryDb = data;
    return data;
  } catch (err) {
    console.error("Error reading database:", err);
    inMemoryDb = getInitialData();
    return inMemoryDb;
  }
}

export async function readDbAsync(): Promise<DbSchema> {
  const cloudData = await fetchFromCloudKv();
  if (cloudData) {
    inMemoryDb = cloudData;
    return cloudData;
  }
  return readDb();
}

export function writeDb(data: DbSchema): void {
  inMemoryDb = data;
  try {
    ensureDbFile();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database to disk:", err);
  }
  // Also write to cloud asynchronously if configured
  if (KV_URL && KV_TOKEN) {
    saveToCloudKv(data).catch((e) => console.error("Async Cloud KV save error:", e));
  }
}

export async function writeDbAsync(data: DbSchema): Promise<void> {
  writeDb(data);
  await saveToCloudKv(data);
}

// ─── Smart Merge (Guarantees no accounts or bookings are ever deleted) ────────
export async function dbMergeData(incoming: Partial<DbSchema>): Promise<DbSchema> {
  const current = await readDbAsync();

  // 1. Merge users
  if (incoming.users && Array.isArray(incoming.users)) {
    for (const u of incoming.users) {
      const idx = current.users.findIndex(
        (cu) => cu.id === u.id || cu.email.toLowerCase() === u.email.toLowerCase()
      );
      if (idx >= 0) {
        current.users[idx] = { ...current.users[idx], ...u };
      } else {
        current.users.push(u);
      }
    }
  }

  // 2. Merge bookings
  if (incoming.bookings && Array.isArray(incoming.bookings)) {
    for (const b of incoming.bookings) {
      const idx = current.bookings.findIndex((cb) => cb.id === b.id);
      if (idx >= 0) {
        current.bookings[idx] = { ...current.bookings[idx], ...b };
      } else {
        current.bookings.push(b);
      }
    }
  }

  // 3. Merge reviews
  if (incoming.reviews && Array.isArray(incoming.reviews)) {
    for (const r of incoming.reviews) {
      const idx = current.reviews.findIndex((cr) => cr.id === r.id);
      if (idx >= 0) {
        current.reviews[idx] = { ...current.reviews[idx], ...r };
      } else {
        current.reviews.push(r);
      }
    }
  }

  // 4. Merge notifications
  if (incoming.notifications && Array.isArray(incoming.notifications)) {
    for (const n of incoming.notifications) {
      if (!current.notifications.some((cn) => cn.id === n.id)) {
        current.notifications.push(n);
      }
    }
  }

  // 5. Merge activities
  if (incoming.activities && Array.isArray(incoming.activities)) {
    for (const a of incoming.activities) {
      if (!current.activities.some((ca) => ca.id === a.id)) {
        current.activities.push(a);
      }
    }
  }

  await writeDbAsync(current);
  return current;
}

// ─── Users CRUD ───────────────────────────────────────────────
export function dbGetUsers(): UserProfile[] {
  return readDb().users;
}

export function dbSaveUser(user: Omit<UserProfile, "id" | "createdAt"> & { id?: string }): UserProfile {
  const db = readDb();
  const existingIdx = db.users.findIndex(
    (u) => u.email.toLowerCase() === user.email.toLowerCase() || (user.phone && u.phone === user.phone)
  );

  if (existingIdx >= 0) {
    const updated: UserProfile = {
      ...db.users[existingIdx],
      ...user,
    };
    db.users[existingIdx] = updated;
    writeDb(db);
    return updated;
  }

  const newUser: UserProfile = {
    ...user,
    id: user.id || "u-" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36),
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Log activity
  if (user.role === "intern") {
    dbAddActivity({
      type: "internship_started",
      userName: user.name,
      mentorName: user.mentorId || "Dedicated Mentor",
      details: `Enrolled in ${user.trackSlug || "Engineering Track"}`,
      timestamp: "Just now",
    });
  }

  writeDb(db);
  return newUser;
}

export function dbUpdateUser(id: string, updates: Partial<UserProfile>): UserProfile | null {
  const db = readDb();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  db.users[idx] = { ...db.users[idx], ...updates };
  writeDb(db);
  return db.users[idx];
}

// ─── Bookings CRUD ────────────────────────────────────────────
export function dbGetBookings(): Booking[] {
  return readDb().bookings;
}

export function dbSaveBooking(booking: Omit<Booking, "id" | "createdAt" | "status"> & { id?: string; status?: Booking["status"] }): Booking {
  const db = readDb();
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);

  const newBooking: Booking = {
    ...booking,
    id: booking.id || `MP-${year}-${randomNum}`,
    status: booking.status || "confirmed",
    createdAt: new Date().toISOString(),
  };

  db.bookings.push(newBooking);

  // Activity log
  const user = db.users.find((u) => u.id === booking.userId);
  dbAddActivity({
    type: "consultation_booked",
    userName: user?.name || "A learner",
    mentorName: booking.mentorId,
    details: `Booked ${booking.sessionType || "Consultation"} on ${booking.topic || booking.trackSlug}`,
    timestamp: "Just now",
  });

  writeDb(db);
  return newBooking;
}

export function dbUpdateBooking(id: string, updates: Partial<Booking>): Booking | null {
  const db = readDb();
  const idx = db.bookings.findIndex((b) => b.id === id);
  if (idx < 0) return null;
  db.bookings[idx] = { ...db.bookings[idx], ...updates };

  if (updates.status === "completed") {
    const booking = db.bookings[idx];
    const user = db.users.find((u) => u.id === booking.userId);
    dbAddActivity({
      type: "consultation_completed",
      userName: user?.name || "Client",
      mentorName: booking.mentorId,
      details: `Completed ${booking.topic || "consultation session"}`,
      timestamp: "Just now",
    });
  }

  writeDb(db);
  return db.bookings[idx];
}

// ─── Reviews CRUD ─────────────────────────────────────────────
export function dbGetReviews(): Review[] {
  return readDb().reviews;
}

export function dbSaveReview(review: Omit<Review, "id" | "createdAt">): Review {
  const db = readDb();
  const newRev: Review = {
    ...review,
    id: "rev-" + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
  };
  db.reviews.push(newRev);

  // Activity log
  dbAddActivity({
    type: "review_added",
    userName: review.userName || "A client",
    mentorName: review.mentorId,
    details: `Rated ${review.rating}.0 ★ "${review.comment.slice(0, 60)}..."`,
    timestamp: "Just now",
  });

  writeDb(db);
  return newRev;
}

// ─── Activities CRUD ──────────────────────────────────────────
export function dbGetActivities(): Activity[] {
  return readDb().activities || [];
}

export function dbAddActivity(act: Omit<Activity, "id">): Activity {
  const db = readDb();
  const newAct: Activity = {
    ...act,
    id: "act-" + Math.random().toString(36).slice(2, 9),
  };
  if (!db.activities) db.activities = [];
  db.activities.unshift(newAct);
  if (db.activities.length > 50) db.activities = db.activities.slice(0, 50);
  writeDb(db);
  return newAct;
}

// ─── Analytics & Event Tracking ───────────────────────────────
export function dbRecordVisit(event: Omit<VisitorEvent, "id" | "createdAt">): VisitorEvent {
  const db = readDb();
  const newEv: VisitorEvent = {
    ...event,
    id: "ev-" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36),
    createdAt: new Date().toISOString(),
  };
  if (!db.events) db.events = [];
  db.events.push(newEv);
  // Keep up to last 10,000 events in json file
  if (db.events.length > 10000) db.events = db.events.slice(-10000);
  writeDb(db);
  return newEv;
}

export function dbGetAnalytics(): PlatformAnalytics {
  const db = readDb();
  const events = db.events || [];
  const users = db.users || [];
  const bookings = db.bookings || [];
  const reviews = db.reviews || [];

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 86400000);

  const totalVisits = events.length;
  const uniqueVisitors = new Set(events.map((e) => e.visitorId)).size;

  const todayVisits = events.filter((e) => e.createdAt && e.createdAt.startsWith(todayStr)).length;
  const thisWeekVisits = events.filter((e) => new Date(e.createdAt) >= oneWeekAgo).length;
  const thisMonthVisits = events.filter((e) => new Date(e.createdAt) >= oneMonthAgo).length;

  const totalInterns = users.filter((u) => u.role === "intern").length;
  const dynamicMentorsCount = users.filter((u) => u.role === "mentor").length;
  const totalMentors = staticMentors.length + dynamicMentorsCount;

  const totalConsultations = bookings.length;
  const completedConsultations = bookings.filter((b) => b.status === "completed").length;
  const totalReviews = reviews.length;

  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 4.9;

  // Popular Pages aggregation
  const pageMap: Record<string, number> = {};
  for (const e of events) {
    pageMap[e.page] = (pageMap[e.page] || 0) + 1;
  }
  const popularPages = Object.entries(pageMap)
    .map(([page, visits]) => ({ page, visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 6);

  // Popular Mentors aggregation
  const mentorMap: Record<string, number> = {};
  for (const b of bookings) {
    mentorMap[b.mentorId] = (mentorMap[b.mentorId] || 0) + 1;
  }
  const popularMentors = staticMentors.map((m) => {
    const count = mentorMap[m.id] || 0;
    const mRevs = reviews.filter((r) => r.mentorId === m.id);
    const mRating = mRevs.length > 0
      ? Math.round((mRevs.reduce((s, r) => s + r.rating, 0) / mRevs.length) * 10) / 10
      : m.rating;
    return {
      mentorId: m.id,
      mentorName: m.name,
      bookingsCount: count,
      rating: mRating,
    };
  }).sort((a, b) => b.bookingsCount - a.bookingsCount);

  // 7-day Daily Traffic aggregation
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyTraffic = [];
  for (let d = 6; d >= 0; d--) {
    const dayDate = new Date();
    dayDate.setDate(now.getDate() - d);
    const dateStr = dayDate.toISOString().split("T")[0];
    const dayName = daysOfWeek[dayDate.getDay()];

    const dayEvents = events.filter((e) => e.createdAt && e.createdAt.startsWith(dateStr));
    const dayVisits = dayEvents.length;
    const dayUniques = new Set(dayEvents.map((e) => e.visitorId)).size;

    dailyTraffic.push({
      date: dateStr,
      day: dayName,
      visits: dayVisits,
      uniqueVisitors: dayUniques,
    });
  }

  return {
    totalVisits: Math.max(totalVisits, 1),
    uniqueVisitors: Math.max(uniqueVisitors, 1),
    todayVisits,
    thisWeekVisits,
    thisMonthVisits,
    registeredUsers: users.length,
    totalInterns,
    totalMentors,
    totalConsultations,
    completedConsultations,
    totalReviews,
    averageRating: avgRating,
    popularPages,
    popularMentors,
    dailyTraffic,
  };
}

// ─── Notifications CRUD ───────────────────────────────────────
export function dbGetNotifications(userId: string): Notification[] {
  return readDb().notifications.filter((n) => n.userId === userId);
}

export function dbAddNotification(notif: Omit<Notification, "id" | "createdAt" | "read">): Notification {
  const db = readDb();
  const newNotif: Notification = {
    ...notif,
    id: "notif-" + Math.random().toString(36).slice(2, 9),
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.push(newNotif);
  writeDb(db);
  return newNotif;
}
