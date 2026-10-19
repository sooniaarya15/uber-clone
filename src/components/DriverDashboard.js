"use client";
import { useEffect } from "react";
import usePolling from "./usePolling";

export default function DriverDashboard() {
  const { data: mine, reload: reloadMine } = usePolling("/api/rides?scope=mine");
  const { data: avail, reload: reloadAvail } = usePolling("/api/rides?scope=available");
  const { data: me, reload: reloadMe } = usePolling("/api/drivers", 15000);

  const driver = me?.driver;
  const online = !!driver?.is_available;
  const rides = mine?.rides || [];
  const active = rides.find((r) => ["accepted", "in_progress"].includes(r.status));
  const earnings = rides
    .filter((r) => r.status === "completed" && r.payments?.[0]?.status === "paid")
    .reduce((s, r) => s + Number(r.fare), 0);

  // Online hone par har 10 sec me location bhejo
  useEffect(() => {
    if (!online || !navigator.geolocation) return;
    const send = () =>
      navigator.geolocation.getCurrentPosition((p) =>
        fetch("/api/drivers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: p.coords.latitude, lng: p.coords.longitude }),
        })
      );
    send();
    const t = setInterval(send, 10000);
    return () => clearInterval(t);
  }, [online]);

  async function toggle() {
    await fetch("/api/drivers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: !online }),
    });
    reloadMe(); reloadAvail();
  }

  async function act(id, action) {
    const res = await fetch(`/api/rides/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) alert((await res.json()).error);
    reloadMine(); reloadAvail();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4 shadow">
        <div>
          <p className="font-semibold">
            {driver?.vehicle_type} · {driver?.vehicle_number}
          </p>
          <p className="text-sm text-gray-600">
            ⭐ {Number(driver?.avg_rating || 0).toFixed(1)} · Earnings: ₹{earnings.toFixed(2)}
          </p>
        </div>
        <button onClick={toggle}
          className={`rounded px-5 py-2 font-semibold text-white ${online ? "bg-green-600" : "bg-gray-500"}`}>
          {online ? "Online (tap to go offline)" : "Offline (tap to go online)"}
        </button>
      </div>

      {active ? (
        <div className="rounded-lg border-2 border-black bg-white p-4 shadow">
          <h2 className="mb-2 text-lg font-semibold">Current ride ({active.status})</h2>
          <p>📍 {active.pickup_address}</p>
          <p>🏁 {active.drop_address}</p>
          <p className="mt-1 text-sm">
            Rider: {active.rider?.full_name} · {active.rider?.phone || "no phone"}
          </p>
          <p className="font-bold">Fare: ₹{active.fare}</p>
          <div className="mt-3 flex gap-2">
            {active.status === "accepted" && (
              <>
                <button onClick={() => act(active.id, "start")}
                  className="rounded bg-blue-600 px-4 py-2 text-white">Start ride</button>
                <button onClick={() => act(active.id, "cancel")}
                  className="rounded border px-4 py-2">Cancel</button>
              </>
            )}
            {active.status === "in_progress" && (
              <button onClick={() => act(active.id, "complete")}
                className="rounded bg-green-600 px-4 py-2 text-white">Complete ride</button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Ride requests</h2>
          {!online && <p className="text-gray-500">Go online to see ride requests.</p>}
          {online && !(avail?.rides?.length) && (
            <p className="text-gray-500">No requests right now...</p>
          )}
          {avail?.rides?.map((r) => (
            <div key={r.id} className="rounded-lg bg-white p-4 shadow">
              <p>📍 {r.pickup_address}</p>
              <p>🏁 {r.drop_address}</p>
              <p className="text-sm text-gray-600">
                {Number(r.distance_km).toFixed(1)} km · {r.ride_type}
                {r.pickup_distance_km != null &&
                  ` · pickup ${r.pickup_distance_km.toFixed(1)} km door`}
              </p>
              <p className="font-bold">₹{r.fare}</p>
              <div className="mt-2">
                <button onClick={() => act(r.id, "accept")}
                  className="rounded bg-black px-4 py-2 text-white">Accept</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}