"use client";
import { useEffect, useRef, useState } from "react";
import usePolling from "./usePolling";
// import RideBooking from "./RideBooking";
import RideBooking from "./RideBookingManual";
import { haversine } from "@/lib/geo";

const MESSAGES = {
  requested: "Driver dhundha ja raha hai...",
  accepted: "🚗 Driver mil gaya, wo aa raha hai!",
  in_progress: "▶️ Ride shuru ho gayi.",
  completed: "🏁 Ride complete! Ab payment karo.",
  cancelled: "❌ Ride cancel ho gayi.",
};

export default function RiderDashboard() {
  const { data, reload } = usePolling("/api/rides?scope=mine");
  const rides = data?.rides || [];
  const active =
    rides.find((r) => ["requested", "accepted", "in_progress"].includes(r.status)) ||
    rides.find((r) => r.status === "completed" && r.payments?.[0]?.status !== "paid");

  const prev = useRef({});
  const [toast, setToast] = useState("");
  useEffect(() => {
    rides.forEach((r) => {
      const old = prev.current[r.id];
      if (old && old !== r.status) {
        setToast(MESSAGES[r.status]);
        setTimeout(() => setToast(""), 6000);
      }
      prev.current[r.id] = r.status;
    });
  }, [data]);

  async function cancel(id) {
    const res = await fetch(`/api/rides/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const d = await res.json();
    if (res.ok && d.cancel_fee) alert(`Driver assign ho chuka tha, cancellation fee ₹${d.cancel_fee} lag sakti hai.`);
    reload();
  }

  // async function pay(id) {
  //   const res = await fetch("/api/payments/checkout", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ rideId: id }),
  //   });
  //   const d = await res.json();
  //   if (d.url) window.location.href = d.url;
  //   else alert(d.error);
  // }

  async function pay(id) {
  const res = await fetch("/api/payments/mock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rideId: id }),
  });
  const d = await res.json();
  if (res.ok) reload();
  else alert(d.error);
}

  const di = active?.driver_info;
  let eta = null;
  if (active?.status === "accepted" && di?.current_lat != null) {
    const km = haversine(di.current_lat, di.current_lng, active.pickup_lat, active.pickup_lng);
    eta = Math.max(1, Math.round((km / 25) * 60)); 
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="rounded bg-blue-600 p-3 text-white shadow">{toast}</div>
      )}

      {active ? (
        <div className="rounded-lg border-2 border-black bg-white p-4 shadow">
          <h2 className="mb-1 text-lg font-semibold">{MESSAGES[active.status]}</h2>
          <p>📍 {active.pickup_address}</p>
          <p>🏁 {active.drop_address}</p>
          <p className="font-bold">Fare: ₹{active.fare}</p>

          {active.driver && (
            <div className="mt-3 rounded bg-gray-100 p-3 text-sm">
              <p className="font-semibold">
                {active.driver.full_name} · ⭐ {Number(di?.avg_rating || 0).toFixed(1)}
              </p>
              <p>{di?.vehicle_type} · {di?.vehicle_number} · {active.driver.phone || ""}</p>
              {eta && <p>ETA: ~{eta} min</p>}
              {di?.current_lat != null && active.status !== "completed" && (
                <a className="text-blue-600 underline" target="_blank"
                  href={`https://www.google.com/maps?q=${di.current_lat},${di.current_lng}`}>
                  See live location of driver 
                </a>
              )}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            {["requested", "accepted"].includes(active.status) && (
              <button onClick={() => cancel(active.id)} className="rounded border px-4 py-2">
                Cancel ride
              </button>
            )}
            {active.status === "completed" && (
              <button onClick={() => pay(active.id)}
                className="rounded bg-green-600 px-4 py-2 text-white">
                Pay ₹{active.fare}
              </button>
            )}
          </div>
        </div>
      ) : (
        <RideBooking onBooked={reload} />
      )}
    </div>
  );
}