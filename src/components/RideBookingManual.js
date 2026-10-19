"use client";
import { useState } from "react";
import { calcFare, RATES } from "@/lib/fare";

export default function RideBookingManual({ onBooked }) {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [km, setKm] = useState("");
  const [type, setType] = useState("economy");
  const [promo, setPromo] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const distance = Number(km) || 0;

  async function book() {
    setLoading(true);
    setErr("");
    const res = await fetch("/api/rides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickup_address: pickup,
        pickup_lat: 28.6139,
        pickup_lng: 77.209,
        drop_address: drop,
        drop_lat: 28.7041,
        drop_lng: 77.1025,
        distance_km: distance,
        ride_type: type,
        promo,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) onBooked?.();
    else setErr(data.error);
  }

  return (
    <div className="max-w-md space-y-3 rounded-lg bg-white p-4 shadow">
      <h2 className="text-lg font-semibold">Book a ride (test mode, no map)</h2>

      <input className="w-full rounded border p-3" placeholder="Pickup address"
        value={pickup} onChange={(e) => setPickup(e.target.value)} />
      <input className="w-full rounded border p-3" placeholder="Drop address"
        value={drop} onChange={(e) => setDrop(e.target.value)} />
      <input className="w-full rounded border p-3" type="number" min="0" step="0.1"
        placeholder="Distance in km (e.g. 10)"
        value={km} onChange={(e) => setKm(e.target.value)} />

      {distance > 0 && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(RATES).map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={`rounded border p-3 text-sm capitalize ${
                  type === t ? "border-black bg-black text-white" : "bg-white"
                }`}>
                {t}
                <br />₹{calcFare(distance, t, promo)}
              </button>
            ))}
          </div>
          <input className="w-full rounded border p-3" placeholder="Promo code (WELCOME10)"
            value={promo} onChange={(e) => setPromo(e.target.value)} />
          <p className="text-xl font-bold">Estimated fare: ₹{calcFare(distance, type, promo)}</p>
          <button onClick={book} disabled={loading || !pickup || !drop}
            className="w-full rounded bg-blue-600 py-3 font-semibold text-white disabled:opacity-50">
            {loading ? "Requesting..." : "Confirm booking"}
          </button>
        </>
      )}
      {err && <p className="text-red-600">{err}</p>}
    </div>
  );
}