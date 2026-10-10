"use client";
import { useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, Autocomplete, DirectionsRenderer } from "@react-google-maps/api";
import { calcFare, RATES } from "@/lib/fare";

const libraries = ["places"];
const center = { lat: 28.6139, lng: 77.209 };

export default function RideBooking({ onBooked }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const pickupAC = useRef(null);
  const dropAC = useRef(null);
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [directions, setDirections] = useState(null);
  const [km, setKm] = useState(0);
  const [type, setType] = useState("economy");
  const [promo, setPromo] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const read = (ref) => {
    const p = ref.current?.getPlace();
    if (!p?.geometry) return null;
    return {
      address: p.formatted_address || p.name,
      lat: p.geometry.location.lat(),
      lng: p.geometry.location.lng(),
    };
  };

  useEffect(() => {
    if (!isLoaded || !pickup || !drop) return;
    new window.google.maps.DirectionsService().route(
      {
        origin: { lat: pickup.lat, lng: pickup.lng },
        destination: { lat: drop.lat, lng: drop.lng },
        travelMode: "DRIVING",
      },
      (res, status) => {
        if (status === "OK") {
          setDirections(res);
          setKm(res.routes[0].legs[0].distance.value / 1000);
          setErr("");
        } else {
          setErr("Route nahi mila: " + status);
        }
      }
    );
  }, [isLoaded, pickup, drop]);

  async function book() {
    setLoading(true);
    setErr("");
    const res = await fetch("/api/rides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickup_address: pickup.address, pickup_lat: pickup.lat, pickup_lng: pickup.lng,
        drop_address: drop.address, drop_lat: drop.lat, drop_lng: drop.lng,
        distance_km: km, ride_type: type, promo,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) onBooked?.();
    else setErr(data.error);
  }

  if (!isLoaded) return <p className="p-4">Loading map...</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3 rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Book a ride</h2>

        <Autocomplete onLoad={(a) => (pickupAC.current = a)}
          onPlaceChanged={() => setPickup(read(pickupAC))}>
          <input className="w-full rounded border p-3" placeholder="Pickup location" />
        </Autocomplete>

        <Autocomplete onLoad={(a) => (dropAC.current = a)}
          onPlaceChanged={() => setDrop(read(dropAC))}>
          <input className="w-full rounded border p-3" placeholder="Drop location" />
        </Autocomplete>

        {km > 0 && (
          <>
            <p className="text-sm text-gray-600">Distance: {km.toFixed(1)} km</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(RATES).map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={`rounded border p-3 text-sm capitalize ${
                    type === t ? "border-black bg-black text-white" : "bg-white"
                  }`}>
                  {t}
                  <br />₹{calcFare(km, t, promo)}
                </button>
              ))}
            </div>
            <input className="w-full rounded border p-3" placeholder="Promo code (WELCOME10)"
              value={promo} onChange={(e) => setPromo(e.target.value)} />
            <p className="text-xl font-bold">Estimated fare: ₹{calcFare(km, type, promo)}</p>
            <button onClick={book} disabled={loading}
              className="w-full rounded bg-blue-600 py-3 font-semibold text-white disabled:opacity-50">
              {loading ? "Requesting..." : "Confirm booking"}
            </button>
          </>
        )}
        {err && <p className="text-red-600">{err}</p>}
      </div>

      <GoogleMap mapContainerClassName="h-72 w-full rounded-lg md:h-full md:min-h-[320px]"
        center={center} zoom={11}>
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
}