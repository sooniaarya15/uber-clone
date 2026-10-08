"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();
  const [role, setRole] = useState("rider");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        vehicle_type: vehicleType,
        vehicle_number: vehicleNumber,
      }),
    });

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Aap kaun ho?</h1>

      <div className="mb-6 grid grid-cols-2 gap-4">
        {["rider", "driver"].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`rounded-lg border-2 p-6 text-lg font-semibold capitalize ${
              role === r ? "border-black bg-black text-white" : "border-gray-300 bg-white"
            }`}
          >
            {r === "rider" ? "🧍 Rider" : "🚗 Driver"}
          </button>
        ))}
      </div>

      {role === "driver" && (
        <div className="mb-6 space-y-3">
          <input
            className="w-full rounded border p-3"
            placeholder="Vehicle type (e.g. Sedan, Auto, Bike)"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
          />
          <input
            className="w-full rounded border p-3"
            placeholder="Vehicle number (e.g. HR26AB1234)"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
          />
        </div>
      )}

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full rounded bg-blue-600 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}