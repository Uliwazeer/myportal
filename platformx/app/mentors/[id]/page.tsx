"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { mentors, tracks } from "@/lib/data";
import { getReviewsByMentor, getSession, saveReview } from "@/lib/store";
import type { Review, UserProfile } from "@/lib/data";

export default function MentorProfilePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [session, setSession] = useState<UserProfile | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const mentor = mentors.find(m => m.id === id);

  useEffect(() => {
    if (!mentor) return;
    setReviews(getReviewsByMentor(mentor.id));
    setSession(getSession());
  }, [mentor]);

  if (!mentor) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted text-lg">Mentor not found.</p>
        <Link href="/mentors" className="text-accent hover:underline text-sm mt-2 block">Back to Mentors</Link>
      </div>
    </div>
  );

  const mentorTracks = tracks.filter(t => mentor.tracks.includes(t.slug));
  const totalReviews = reviews.length || mentor.reviewCount;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : mentor.rating.toFixed(1);

  const ratingCounts = [5,4,3,2,1].map(star => ({
    star,
    pct: reviews.length ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0
  }));

  async function submitReview() {
    if (!session) { router.push("/login"); return; }
    setSubmitting(true);
    saveReview({ bookingId: "direct", userId: session.id, mentorId: mentor!.id, rating: reviewRating, comment: reviewComment, userName: session.name });
    setReviews(getReviewsByMentor(mentor!.id));
    setShowReviewForm(false);
    setReviewComment("");
    setReviewRating(5);
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-content px-4 md:px-6 py-12">
        <Link href="/mentors" className="text-sm text-muted hover:text-ink mb-6 block">Back to Mentors</Link>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-2xl border border-border p-6 text-center">
              <div className={`h-20 w-20 rounded-full ${mentor.color} flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg`}>{mentor.initials}</div>
              <h1 className="text-xl font-bold text-ink">{mentor.name}</h1>
              <p className="text-muted text-sm mt-1">{mentor.title}</p>
              <span className="inline-block mt-2 text-xs border border-border text-muted rounded px-2 py-0.5">{mentor.level}</span>
              <div className="flex items-center justify-center gap-1 mt-3">
                <span className="text-yellow-400 text-lg">★</span>
                <span className="text-lg font-bold text-ink">{avgRating}</span>
                <span className="text-sm text-muted">({totalReviews} reviews)</span>
              </div>
              <Link href={"/book?mentor=" + mentor.id} className="mt-5 w-full bg-accent text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 block text-center shadow-lg shadow-accent/20">Book a Session</Link>
            </motion.div>

            <div className="bg-surface rounded-2xl border border-border p-5">
              <h3 className="text-sm font-semibold text-ink mb-3">Session Pricing</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-surface2 rounded-lg border border-border">
                  <span className="text-sm text-ink">40 Minutes</span>
                  <span className="text-accent font-bold">{mentor.consultationPrice} EGP</span>
                </div>
                <div className="flex justify-between p-3 bg-surface2 rounded-lg border border-border">
                  <span className="text-sm text-ink">60 Minutes</span>
                  <span className="text-accent font-bold">{Math.round(mentor.consultationPrice * 1.4)} EGP</span>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-5">
              <h3 className="text-sm font-semibold text-ink mb-3">Availability</h3>
              <div className="space-y-2">
                {mentor.availability.map((a, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted">{a.day}</span>
                    <span className="font-mono text-xs text-ink">{a.startTime} → {a.endTime}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h2 className="text-sm font-semibold text-ink mb-2">About</h2>
              <p className="text-muted text-sm leading-relaxed">{mentor.bio}</p>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-6">
              <h2 className="text-sm font-semibold text-ink mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {mentor.skills.map(s => <span key={s} className="text-xs bg-surface2 border border-border text-muted rounded-full px-3 py-1">{s}</span>)}
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-6">
              <h2 className="text-sm font-semibold text-ink mb-3">Tracks</h2>
              <div className="grid gap-2">
                {mentorTracks.map(t => (
                  <Link key={t.slug} href={"/tracks/" + t.slug} className="flex justify-between p-3 bg-surface2 border border-border rounded-lg hover:border-accent/40 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-ink">{t.name}</p>
                      <p className="text-xs text-muted">{t.durationWeeks} weeks</p>
                    </div>
                    <span className="text-xs text-accent">View</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-ink">Reviews ({totalReviews})</h2>
                {session && !showReviewForm && (
                  <button onClick={() => setShowReviewForm(true)} className="text-xs text-accent border border-accent/30 rounded-md px-3 py-1.5 hover:bg-accent/10">Write a Review</button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-5 p-4 bg-surface2 rounded-xl border border-border">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-ink">{avgRating}</span>
                  <div className="text-yellow-400 text-lg mt-1">{"★".repeat(Math.min(5, Math.round(parseFloat(avgRating))))}</div>
                  <span className="text-xs text-muted mt-1">{totalReviews} reviews</span>
                </div>
                <div className="space-y-1.5">
                  {ratingCounts.map(rc => (
                    <div key={rc.star} className="flex items-center gap-2 text-xs">
                      <span className="text-muted w-3">{rc.star}</span>
                      <span className="text-yellow-400">★</span>
                      <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: rc.pct + "%" }} />
                      </div>
                      <span className="text-muted w-7 text-right">{rc.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {showReviewForm && (
                <div className="mb-5 p-4 bg-surface2 rounded-xl border border-border space-y-3">
                  <h4 className="text-sm font-medium text-ink">Your Review</h4>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} type="button" onClick={() => setReviewRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="text-2xl">
                        <span className={(hoverRating || reviewRating) >= star ? "text-yellow-400" : "text-muted"}>&#9733;</span>
                      </button>
                    ))}
                  </div>
                  <textarea rows={3} placeholder="Share your experience..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none resize-none" />
                  <div className="flex gap-2">
                    <button onClick={submitReview} disabled={submitting || !reviewComment.trim()} className="bg-accent text-white text-sm rounded-md px-4 py-2 hover:opacity-90 disabled:opacity-50">
                      {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                    <button onClick={() => setShowReviewForm(false)} className="text-sm text-muted border border-border rounded-md px-4 py-2 hover:text-ink">Cancel</button>
                  </div>
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-muted text-sm text-center py-8">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-yellow-400 text-sm">{"&#9733;".repeat(r.rating)}</span>
                            <span className="text-sm font-medium text-ink">{r.userName}</span>
                          </div>
                          <p className="text-sm text-muted">{r.comment}</p>
                        </div>
                        <span className="text-xs text-muted shrink-0">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}