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
  const { mentors: staticMentors } = require("./data");
  const users = getUsers();
  const registeredMentors = users.filter((u) => u.role === "mentor");

  const dynamicMentors: import("./data").MentorData[] = registeredMentors.map((m) => {
    const initials = m.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return {
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
  });

  return [...staticMentors, ...dynamicMentors];
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
