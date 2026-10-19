"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ rideId }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [err, setErr] = useState("");

  async function submit() {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rideId, rating, feedback }),
    });
    if (res.ok) router.refresh();
    else setErr((await res.json()).error);
  }

  return (
    <div className="mt-3 space-y-2 rounded bg-gray-100 p-3">
      <p className="text-sm font-semibold">Rate your driver</p>
      <div className="flex gap-1 text-2xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)}>
            {n <= rating ? "⭐" : "☆"}
          </button>
        ))}
      </div>
      <textarea
        className="w-full rounded border p-2 text-sm"
        rows={2}
        placeholder="Feedback (optional)"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
      <button onClick={submit} className="rounded bg-black px-4 py-2 text-sm text-white">
        Submit review
      </button>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}