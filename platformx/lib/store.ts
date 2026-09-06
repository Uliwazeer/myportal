// ─── Global Store with Server-Side Persistence & Client Sync ───
// Data is stored centrally in the server database (data/db.json)
// and cached in localStorage for instant offline/low-latency client access.

import type { UserProfile, Booking, Review, Notification, SessionNote, VerifiedCertificate } from "./data";
import { sampleCertificates } from "./data";

// Initial fallback seeds in case localStorage is empty before first server sync
const DEFAULT_SEED_USERS: UserProfile[] = [
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

const DEFAULT_SEED_BOOKINGS: Booking[] = [
  {
    id: "MP-2026-104921",
    userId: "client-1",
    mentorId: "ali-wazeer",
    trackSlug: "platform-engineer",
    sessionType: "Consultation",
    date: "2026-08-20",
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
    date: "2026-08-24",
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
    date: "2026-08-28",
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
    date: "2026-08-30",
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
    date: "2026-09-02",
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
    date: "2026-09-04",
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
    date: "2026-09-05",
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
    date: "2026-09-10",
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
    date: "2026-09-12",
    time: "19:00",
    duration: 60,
    topic: "GraphQL Subscriptions & Event-Driven Architecture",
    status: "confirmed",
    createdAt: new Date().toISOString(),
  },
];

// ─── Helpers ──────────────────────────────────────────────────
function getItem<T>(key: string, fallback: T[] = []): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (fallback.length > 0) {
        localStorage.setItem(key, JSON.stringify(fallback));
      }
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ─── Realtime Server & Cloud Database Sync ────────────────────
let isSyncing = false;

export async function syncWithServer(): Promise<void> {
  if (typeof window === "undefined" || isSyncing) return;
  isSyncing = true;
  try {
    const localUsers = getItem<UserProfile>("px_users", []);
    const localBookings = getItem<Booking>("px_bookings", []);
    const localReviews = getItem<Review>("px_reviews", []);
    const localNotifications = getItem<Notification>("px_notifications", []);

    const res = await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientData: {
          users: localUsers,
          bookings: localBookings,
          reviews: localReviews,
          notifications: localNotifications,
        },
      }),
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      if (json.ok && json.data) {
        if (json.data.users && json.data.users.length > 0) {
          setItem("px_users", json.data.users);
        }
        if (json.data.bookings && json.data.bookings.length > 0) {
          setItem("px_bookings", json.data.bookings);
        }
        if (json.data.reviews && json.data.reviews.length > 0) {
          setItem("px_reviews", json.data.reviews);
        }
        if (json.data.notifications && json.data.notifications.length > 0) {
          setItem("px_notifications", json.data.notifications);
        }
      }
    }
  } catch (err) {
    console.warn("Could not sync with server API (offline or building):", err);
  } finally {
    isSyncing = false;
  }
}

// Auto-trigger sync on browser side
if (typeof window !== "undefined") {
  setTimeout(() => {
    syncWithServer();
  }, 100);
}

// ─── Users ────────────────────────────────────────────────────
export function getUsers(): UserProfile[] {
  return getItem<UserProfile>("px_users", DEFAULT_SEED_USERS);
}

export function getUserByEmail(email: string): UserProfile | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserByPhone(phone: string): UserProfile | undefined {
  return getUsers().find((u) => u.phone === phone);
}

export function getUserById(id: string): UserProfile | undefined {
  return getUsers().find((u) => u.id === id);
}

export function getAllMentors(): import("./data").MentorData[] {
  const { mentors: staticMentors, tracks: staticTracks } = require("./data");
  const users = getUsers();
  const bookings = getBookings();
  const reviews = getItem<Review>("px_reviews");
  const registeredMentors = users.filter((u) => u.role === "mentor");

  // Helper to compute dynamic data for ANY mentor (static or dynamic)
  function computeMentorStats(
    base: import("./data").MentorData,
    mentorId: string
  ): import("./data").MentorData {
    // 1. Find all bookings with this mentor
    const mentorBookings = bookings.filter((b) => b.mentorId === mentorId);
    
    // 2. Find all interns assigned to this mentor
    const assignedInterns = users.filter(
      (u) => u.role === "intern" && u.mentorId === mentorId
    );

    // 3. Unique client/student user IDs from bookings and assigned interns
    const bookingClientIds = mentorBookings.map((b) => b.userId);
    const internClientIds = assignedInterns.map((u) => u.id);
    const uniqueClientIds = Array.from(new Set([...bookingClientIds, ...internClientIds]));

    const dynamicMenteesCount = uniqueClientIds.length;
    const dynamicConsultations = mentorBookings.length;
    const dynamicHours = mentorBookings.reduce((sum, b) => sum + (b.duration || 40) / 60, 0);

    // 4. Generate real mentored people from actual bookings & intern registrations
    const realMentoredPeople: import("./data").MentoredPerson[] = [];

    // From actual bookings
    for (const b of mentorBookings) {
      const student = users.find((u) => u.id === b.userId);
      const studentReview = reviews.find((r) => r.bookingId === b.id || (r.userId === b.userId && r.mentorId === mentorId));
      const trackObj = staticTracks.find((t: import("./data").Track) => t.slug === b.trackSlug);
      const trackName = trackObj?.name || b.trackSlug;

      realMentoredPeople.push({
        name: student?.name || "Student",
        type: student?.role === "intern" ? "Internship" : "Consultation",
        topicOrTrack: b.topic ? `${trackName}: ${b.topic}` : trackName,
        rating: studentReview?.rating || 5,
        date: b.date ? new Date(b.date + "T00:00:00").toLocaleDateString("en", { month: "short", year: "numeric" }) : "Recent",
        feedback: studentReview?.comment || `Completed ${b.duration || 40}-min session on ${trackName}.`,
      });
    }

    // From assigned interns without explicit booking yet
    for (const intern of assignedInterns) {
      if (!mentorBookings.some((b) => b.userId === intern.id)) {
        const trackObj = staticTracks.find((t: import("./data").Track) => t.slug === intern.trackSlug);
        realMentoredPeople.push({
          name: intern.name,
          type: "Internship",
          topicOrTrack: trackObj?.name || intern.trackSlug || "Engineering Track",
          rating: 5,
          date: new Date(intern.createdAt).toLocaleDateString("en", { month: "short", year: "numeric" }),
          feedback: `Enrolled as an Intern in ${trackObj?.name || intern.trackSlug || "Track"}.`,
        });
      }
    }

    // Combine with static featured list if available
    const combinedMentored = [
      ...realMentoredPeople,
      ...(base.mentoredPeople || []).filter(
        (sp) => !realMentoredPeople.some((rp) => rp.name.toLowerCase() === sp.name.toLowerCase())
      ),
    ];

    const mentorReviews = reviews.filter((r) => r.mentorId === mentorId);
    const avgRating = mentorReviews.length > 0
      ? Math.round((mentorReviews.reduce((sum, r) => sum + r.rating, 0) / mentorReviews.length) * 10) / 10
      : base.rating;

    return {
      ...base,
      rating: avgRating,
      reviewCount: (base.reviewCount || 0) + mentorReviews.length,
      completedConsultations: (base.completedConsultations || 0) + dynamicConsultations,
      menteesCount: (base.menteesCount || 0) + dynamicMenteesCount,
      consultationHours: Math.round(((base.consultationHours || 0) + dynamicHours) * 10) / 10,
      mentoredPeople: combinedMentored,
    };
  }

  const enrichedStaticMentors = staticMentors.map((sm: import("./data").MentorData) =>
    computeMentorStats(sm, sm.id)
  );

  const dynamicMentors: import("./data").MentorData[] = registeredMentors.map((m) => {
    const initials = m.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const fallbackTrackSlug = m.title ? m.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : "software-engineer";
    const baseMentor: import("./data").MentorData = {
      id: m.id,
      name: m.name,
      title: m.title || "Mentor",
      bio: m.bio || `Specialist with ${m.yearsExperience || 3}+ years of industry experience.`,
      tracks: m.tracks && m.tracks.length > 0 ? m.tracks : [fallbackTrackSlug],
      skills: m.skills && m.skills.length > 0 ? m.skills : ["Engineering", "Architecture"],
      level: (m.level as import("./data").Level) || "Senior",
      yearsExperience: m.yearsExperience || 5,
      consultationPrice: m.consultationPrice || 250,
      rating: 5.0,
      reviewCount: 0,
      completedConsultations: 0,
      menteesCount: 0,
      consultationHours: 0,
      responseRate: 100,
      attendanceRate: 100,
      availability: [
        { day: "Monday", startTime: "18:00", endTime: "22:00" },
        { day: "Wednesday", startTime: "18:00", endTime: "22:00" },
        { day: "Saturday", startTime: "14:00", endTime: "20:00" },
      ],
      initials: initials || "M",
      color: "bg-red-600",
      mentoredPeople: [],
    };

    return computeMentorStats(baseMentor, m.id);
  });

  const staticIds = new Set(enrichedStaticMentors.map((m: import("./data").MentorData) => m.id));
  const uniqueDynamicMentors = dynamicMentors.filter((m: import("./data").MentorData) => !staticIds.has(m.id));

  return [...enrichedStaticMentors, ...uniqueDynamicMentors];
}

export function getAllTracks(): import("./data").Track[] {
  const { tracks: staticTracks } = require("./data");
  const mentorsList = getAllMentors();
  const allTracks = [...staticTracks];

  for (const m of mentorsList) {
    for (const tSlug of m.tracks || []) {
      if (!allTracks.some((t) => t.slug === tSlug)) {
        const formattedName = tSlug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        allTracks.push({
          slug: tSlug,
          name: formattedName,
          tagline: `Professional ${formattedName} track curated by verified mentors.`,
          level: (m.level as import("./data").Level) || "Junior",
          durationWeeks: 8,
          modules: [
            {
              week: 1,
              title: `${formattedName} Fundamentals`,
              topics: ["Core Concepts", "Best Practices", "Tooling Setup"],
            },
            {
              week: 2,
              title: "Hands-on Implementation",
              topics: ["Architecture Design", "Practical Exercises"],
            },
            {
              week: 8,
              title: "Final Capstone Project",
              topics: ["Production Deployment", "Mentor Review & Feedback"],
            },
          ],
          finalProject: `End-to-end production ${formattedName} project with mentor guidance`,
        });
      }
    }
  }

  return allTracks;
}

export function getMentorById(id: string): import("./data").MentorData | undefined {
  return getAllMentors().find((m) => m.id === id);
}

export function saveUser(user: Omit<UserProfile, "id" | "createdAt">): UserProfile {
  const users = getUsers();
  const newUser: UserProfile = {
    ...user,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  setItem("px_users", [...users, newUser]);

  // Sync with server API asynchronously
  if (typeof window !== "undefined") {
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    }).catch((err) => console.error("Server user sync failed:", err));
  }

  return newUser;
}

// ─── Session ──────────────────────────────────────────────────
export function getSession(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("px_session");
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function setSession(user: UserProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("px_session", JSON.stringify(user));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("px_session");
}

function generateBookingId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `MP-${year}-${randomNum}`;
}

// ─── Bookings ─────────────────────────────────────────────────
export function getBookings(): Booking[] {
  return getItem<Booking>("px_bookings", DEFAULT_SEED_BOOKINGS);
}

export function getBookingsByUser(userId: string): Booking[] {
  return getBookings().filter((b) => b.userId === userId);
}

export function getBookingsByMentor(mentorId: string): Booking[] {
  return getBookings().filter((b) => b.mentorId === mentorId);
}

export function checkDoubleBooking(
  mentorId: string,
  userId: string,
  date: string,
  time: string,
  excludeBookingId?: string
): { conflict: boolean; message?: string } {
  const activeBookings = getBookings().filter(
    (b) =>
      b.id !== excludeBookingId &&
      ["pending", "confirmed", "upcoming", "in-progress", "rescheduled"].includes(b.status) &&
      b.date === date &&
      b.time === time
  );

  // Check if student already has a session at this time
  const studentConflict = activeBookings.find((b) => b.userId === userId);
  if (studentConflict) {
    return {
      conflict: true,
      message: "You already have another session booked at this exact date and time.",
    };
  }

  // Check if mentor is already booked at this time
  const mentorConflict = activeBookings.find((b) => b.mentorId === mentorId);
  if (mentorConflict) {
    return {
      conflict: true,
      message: "This mentor is already booked for another session at this time slot. Please choose another time.",
    };
  }

  return { conflict: false };
}

export function saveBooking(booking: Omit<Booking, "id" | "createdAt" | "status">): Booking {
  const { conflict, message } = checkDoubleBooking(
    booking.mentorId,
    booking.userId,
    booking.date,
    booking.time
  );
  if (conflict) {
    throw new Error(message);
  }

  const bookings = getBookings();
  const newBooking: Booking = {
    ...booking,
    id: generateBookingId(),
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  setItem("px_bookings", [...bookings, newBooking]);

  // Sync with server API asynchronously
  if (typeof window !== "undefined") {
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBooking),
    }).catch((err) => console.error("Server booking sync failed:", err));
  }

  return newBooking;
}

export function rescheduleBooking(
  bookingId: string,
  newDate: string,
  newTime: string
): { success: boolean; message: string } {
  const booking = getBookings().find((b) => b.id === bookingId);
  if (!booking) return { success: false, message: "Booking not found." };

  const { conflict, message } = checkDoubleBooking(
    booking.mentorId,
    booking.userId,
    newDate,
    newTime,
    bookingId
  );
  if (conflict) return { success: false, message: message || "Time slot conflict." };

  const oldDate = booking.date;
  const oldTime = booking.time;

  const bookings = getBookings().map((b) =>
    b.id === bookingId
      ? {
          ...b,
          date: newDate,
          time: newTime,
          status: "rescheduled" as Booking["status"],
          rescheduledFrom: { date: oldDate, time: oldTime },
        }
      : b
  );
  setItem("px_bookings", bookings);

  // Sync with server API asynchronously
  if (typeof window !== "undefined") {
    fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: bookingId,
        updates: {
          date: newDate,
          time: newTime,
          status: "rescheduled",
          rescheduledFrom: { date: oldDate, time: oldTime },
        },
      }),
    }).catch((err) => console.error("Server reschedule sync failed:", err));
  }

  // Send notifications
  addNotification({
    userId: booking.userId,
    message: `🔄 [${booking.id}] Session rescheduled from ${oldDate} at ${oldTime} to ${newDate} at ${newTime}.`,
  });

  addNotification({
    userId: booking.mentorId,
    message: `🔄 [${booking.id}] Student rescheduled session from ${oldDate} at ${oldTime} to ${newDate} at ${newTime}.`,
  });

  return { success: true, message: "Session rescheduled successfully!" };
}

export function updateBookingStatus(bookingId: string, status: Booking["status"]): void {
  const bookings = getBookings().map((b) =>
    b.id === bookingId ? { ...b, status } : b
  );
  setItem("px_bookings", bookings);

  // Sync with server API
  if (typeof window !== "undefined") {
    fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookingId, updates: { status } }),
    }).catch((err) => console.error("Server booking update failed:", err));
  }
}

export function canCancelWithRefund(booking: Booking): { eligible: boolean; hoursRemaining: number } {
  const sessionDateTime = new Date(`${booking.date}T${booking.time}:00`);
  const now = new Date();
  const diffMs = sessionDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return {
    eligible: diffHours >= 12,
    hoursRemaining: Math.max(0, Math.round(diffHours * 10) / 10),
  };
}

export function cancelBookingByIntern(bookingId: string): { success: boolean; message: string; refunded: boolean } {
  const booking = getBookings().find((b) => b.id === bookingId);
  if (!booking) return { success: false, message: "Booking not found", refunded: false };

  const { eligible, hoursRemaining } = canCancelWithRefund(booking);
  updateBookingStatus(bookingId, "cancelled");

  const users = getUsers();
  const intern = users.find((u) => u.id === booking.userId);
  const internName = intern ? intern.name : "Intern";

  if (eligible) {
    addNotification({
      userId: booking.userId,
      message: `[${booking.id}] Your booking has been cancelled with full refund (${hoursRemaining}h before session).`,
    });
    addNotification({
      userId: booking.mentorId,
      message: `[${booking.id}] ${internName} cancelled their session scheduled for ${booking.date} at ${booking.time}.`,
    });
    return { success: true, message: `Booking cancelled successfully with full refund (cancelled ${hoursRemaining}h before session).`, refunded: true };
  } else {
    addNotification({
      userId: booking.userId,
      message: `[${booking.id}] Booking cancelled. Non-refundable as cancellation was made less than 12h before the session (${hoursRemaining}h left).`,
    });
    addNotification({
      userId: booking.mentorId,
      message: `[${booking.id}] ${internName} cancelled their session (less than 12h policy applied).`,
    });
    return { success: true, message: `Booking cancelled. Notice: Non-refundable because it is less than 12h before the session (${hoursRemaining}h left).`, refunded: false };
  }
}

export function confirmBookingByMentor(bookingId: string): { success: boolean } {
  const booking = getBookings().find((b) => b.id === bookingId);
  if (!booking) return { success: false };

  updateBookingStatus(bookingId, "confirmed");

  const users = getUsers();
  const mentor = users.find((u) => u.id === booking.mentorId);
  const intern = users.find((u) => u.id === booking.userId);
  const mentorName = mentor?.name || "Mentor";
  const internName = intern?.name || "Intern";

  // Notification to Intern
  addNotification({
    userId: booking.userId,
    message: `🎉 [${booking.id}] Great news! ${mentorName} has confirmed your session on ${booking.date} at ${booking.time}. Please be ready on time!`,
  });

  // Notification to Mentor
  addNotification({
    userId: booking.mentorId,
    message: `✅ [${booking.id}] You successfully confirmed the session with ${internName} on ${booking.date} at ${booking.time}. Be prepared!`,
  });

  return { success: true };
}

export function declineBookingByMentor(bookingId: string): { success: boolean } {
  const booking = getBookings().find((b) => b.id === bookingId);
  if (!booking) return { success: false };

  updateBookingStatus(bookingId, "cancelled");

  const users = getUsers();
  const mentor = users.find((u) => u.id === booking.mentorId);
  const mentorName = mentor?.name || "Mentor";

  addNotification({
    userId: booking.userId,
    message: `⚠️ [${booking.id}] ${mentorName} was unable to accept your booking for ${booking.date}. Full refund processed.`,
  });

  return { success: true };
}

// ─── Reviews ──────────────────────────────────────────────────
export function getReviews(): Review[] {
  return getItem<Review>("px_reviews");
}

export function getReviewsByMentor(mentorId: string): Review[] {
  return getReviews().filter((r) => r.mentorId === mentorId);
}

export function hasUserReviewedBooking(userId: string, bookingId: string): boolean {
  return getReviews().some((r) => r.userId === userId && r.bookingId === bookingId);
}

export function saveReview(review: Omit<Review, "id" | "createdAt">): Review {
  const reviews = getReviews();
  const newReview: Review = {
    ...review,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  setItem("px_reviews", [...reviews, newReview]);
  return newReview;
}

export function getMentorAverageRating(mentorId: string): number {
  const reviews = getReviewsByMentor(mentorId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

// ─── Notifications ────────────────────────────────────────────
export function getNotifications(userId: string): Notification[] {
  return getItem<Notification>("px_notifications").filter((n) => n.userId === userId);
}

export function addNotification(notification: Omit<Notification, "id" | "createdAt" | "read">): void {
  const notifications = getItem<Notification>("px_notifications");
  const newNotif: Notification = {
    ...notification,
    id: generateId(),
    read: false,
    createdAt: new Date().toISOString(),
  };
  setItem("px_notifications", [...notifications, newNotif]);
}

export function markNotificationsRead(userId: string): void {
  const notifications = getItem<Notification>("px_notifications").map((n) =>
    n.userId === userId ? { ...n, read: true } : n
  );
  setItem("px_notifications", notifications);
}

export function getUnreadCount(userId: string): number {
  return getItem<Notification>("px_notifications").filter(
    (n) => n.userId === userId && !n.read
  ).length;
}

// ─── Platform Stats ───────────────────────────────────────────
export function getPlatformStats() {
  const users = getUsers();
  const bookings = getBookings();
  return {
    totalLearners: users.filter((u) => u.role === "intern" || u.role === "consultation").length,
    totalInterns: users.filter((u) => u.role === "intern").length,
    totalConsultations: users.filter((u) => u.role === "consultation").length,
    totalBookings: bookings.length,
    completedBookings: bookings.filter((b) => b.status === "completed").length,
  };
}

// ─── Session Notes & Action Items (Homework) ─────────────────
const DEFAULT_SESSION_NOTES: SessionNote[] = [
  {
    id: "sn-001",
    bookingId: "MP-2026-104921",
    mentorId: "ali-wazeer",
    mentorName: "Ali Wazeer",
    userId: "intern-1",
    userName: "Ahmed Mahmoud",
    date: "2026-08-25",
    topicsDiscussed: [
      "Multi-cluster Kubernetes Architecture & CNI Selection (Cilium vs Calico)",
      "GitOps with ArgoCD ApplicationSets & Helm Values Matrix",
      "Production Prometheus Alerting & SLO/SLI design",
    ],
    homework: [
      { id: "hw-1", task: "Configure Cilium eBPF mesh with Hubble UI in local Kind cluster", completed: true, dueDate: "2026-08-28" },
      { id: "hw-2", task: "Write an ArgoCD ApplicationSet to deploy ingress-nginx across 3 virtual clusters", completed: true, dueDate: "2026-09-02" },
      { id: "hw-3", task: "Implement Prometheus Rule for pod crashlooping SLO with PagerDuty webhook", completed: false, dueDate: "2026-09-10" },
    ],
    nextSessionFocus: "Deep dive into Terraform custom modules & Crossplane control planes.",
    mentorAdvice: "Focus on clean Git commit history and declarative infrastructure code. Review Kubernetes RBAC least-privilege principles before our next sync.",
    recommendedResources: [
      { title: "Cilium eBPF Architecture Deep Dive", url: "https://cilium.io", type: "Doc" },
      { title: "ArgoCD Enterprise Best Practices Repository", url: "https://github.com/argoproj/argo-cd", type: "Repo" },
      { title: "Multi-Region Kubernetes Hands-on Lab", url: "/labs", type: "Lab" },
    ],
    updatedAt: "2026-08-26T14:30:00.000Z",
  },
  {
    id: "sn-002",
    bookingId: "MP-2026-218492",
    mentorId: "charles",
    mentorName: "Charles",
    userId: "intern-2",
    userName: "Youssef Ibrahim",
    date: "2026-08-27",
    topicsDiscussed: [
      "High-throughput Distributed Payment & Auth Microservices",
      "Redis Distributed Locking & Cache Stampede Prevention",
      "PostgreSQL Partitioning & Connection Pooling with PgBouncer",
    ],
    homework: [
      { id: "hw-201", task: "Implement Redlock algorithm with Node.js and Redis cluster", completed: true, dueDate: "2026-08-30" },
      { id: "hw-202", task: "Benchmark PgBouncer transaction pooling vs session pooling under 500 concurrent connections", completed: false, dueDate: "2026-09-08" },
    ],
    nextSessionFocus: "Apache Kafka event streaming, consumer groups, and idempotency guarantees.",
    mentorAdvice: "Always profile database queries using EXPLAIN ANALYZE before optimizing in application code.",
    recommendedResources: [
      { title: "Distributed Systems Patterns", url: "https://martinfowler.com", type: "Doc" },
      { title: "Redis Architecture & Patterns", url: "https://redis.io", type: "Doc" },
    ],
    updatedAt: "2026-08-28T10:15:00.000Z",
  },
];

export function getSessionNotes(): SessionNote[] {
  return getItem<SessionNote>("px_session_notes", DEFAULT_SESSION_NOTES);
}

export function getSessionNotesByUser(userId: string): SessionNote[] {
  return getSessionNotes().filter((n) => n.userId === userId);
}

export function getSessionNotesByMentor(mentorId: string): SessionNote[] {
  return getSessionNotes().filter((n) => n.mentorId === mentorId);
}

export function saveSessionNote(note: Omit<SessionNote, "id" | "updatedAt"> & { id?: string }): SessionNote {
  const notes = getSessionNotes();
  const id = note.id || "sn-" + generateId();
  const savedNote: SessionNote = {
    ...note,
    id,
    updatedAt: new Date().toISOString(),
  };

  const existingIdx = notes.findIndex((n) => n.id === id);
  let updatedNotes: SessionNote[];
  if (existingIdx >= 0) {
    updatedNotes = [...notes];
    updatedNotes[existingIdx] = savedNote;
  } else {
    updatedNotes = [savedNote, ...notes];
  }

  setItem("px_session_notes", updatedNotes);
  return savedNote;
}

export function toggleHomework(noteId: string, hwId: string): boolean {
  const notes = getSessionNotes();
  const noteIdx = notes.findIndex((n) => n.id === noteId);
  if (noteIdx < 0) return false;

  const note = notes[noteIdx];
  const updatedHw = note.homework.map((hw) =>
    hw.id === hwId ? { ...hw, completed: !hw.completed } : hw
  );

  const updatedNote: SessionNote = {
    ...note,
    homework: updatedHw,
    updatedAt: new Date().toISOString(),
  };

  const updatedNotes = [...notes];
  updatedNotes[noteIdx] = updatedNote;
  setItem("px_session_notes", updatedNotes);
  return true;
}

// ─── Verified Certificates ────────────────────────────────────
export function getCertificates(): VerifiedCertificate[] {
  return getItem<VerifiedCertificate>("px_certificates", sampleCertificates);
}

export function getCertificateByCode(code: string): VerifiedCertificate | undefined {
  return getCertificates().find((c) => c.code.toLowerCase() === code.toLowerCase().trim());
}

