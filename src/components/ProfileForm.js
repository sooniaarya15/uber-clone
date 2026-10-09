"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileForm({ user }) {
  const router = useRouter();
  const [name, setName] = useState(user.full_name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [msg, setMsg] = useState("");

  async function save() {
    setMsg("Saving...");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: name, phone }),
    });
    const data = await res.json();
    setMsg(res.ok ? "Saved ✅" : data.error);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <input className="w-full rounded border p-3" value={name}
        onChange={(e) => setName(e.target.value)} placeholder="Full name" />
      <input className="w-full rounded border p-3" value={phone}
        onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
      <p className="text-sm text-gray-500">Email: {user.email}</p>
      <button onClick={save} className="w-full rounded bg-black py-3 text-white">Save</button>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}