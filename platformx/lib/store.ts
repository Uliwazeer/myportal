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
    id: generateId(),
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
