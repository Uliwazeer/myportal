// ─── localStorage Store Helpers ───────────────────────────────
// All data is stored in localStorage for demo mode.
// Keys: px_users, px_bookings, px_reviews, px_notifications, px_session

import type { UserProfile, Booking, Review, Notification } from "./data";

// ─── Helpers ──────────────────────────────────────────────────
function getItem<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function setItem<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ─── Users ────────────────────────────────────────────────────
export function getUsers(): UserProfile[] {
  return getItem<UserProfile>("px_users");
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

    const baseMentor: import("./data").MentorData = {
      id: m.id,
      name: m.name,
      title: m.title || "Mentor",
      bio: m.bio || `Specialist with ${m.yearsExperience || 3}+ years of industry experience.`,
      tracks: m.tracks && m.tracks.length > 0 ? m.tracks : ["platform-engineer"],
      skills: m.skills && m.skills.length > 0 ? m.skills : ["Architecture", "Engineering"],
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

  return [...enrichedStaticMentors, ...dynamicMentors];
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
  return getItem<Booking>("px_bookings");
}

export function getBookingsByUser(userId: string): Booking[] {
  return getBookings().filter((b) => b.userId === userId);
}

export function getBookingsByMentor(mentorId: string): Booking[] {
  return getBookings().filter((b) => b.mentorId === mentorId);
}

export function saveBooking(booking: Omit<Booking, "id" | "createdAt" | "status">): Booking {
  const bookings = getBookings();
  const newBooking: Booking = {
    ...booking,
    id: generateBookingId(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  setItem("px_bookings", [...bookings, newBooking]);
  return newBooking;
}

export function updateBookingStatus(bookingId: string, status: Booking["status"]): void {
  const bookings = getBookings().map((b) =>
    b.id === bookingId ? { ...b, status } : b
  );
  setItem("px_bookings", bookings);
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

  // Notification & Email simulation to Intern
  addNotification({
    userId: booking.userId,
    message: `🎉 [${booking.id}] Great news! ${mentorName} has confirmed your session on ${booking.date} at ${booking.time}. Please be ready on time!`,
  });

  // Notification & Email simulation to Mentor
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
  return {
    totalLearners: users.filter((u) => u.role === "intern").length,
    totalConsultations: users.filter((u) => u.role === "consultation").length,
    totalBookings: getBookings().length,
    completedBookings: getBookings().filter((b) => b.status === "completed").length,
  };
}
