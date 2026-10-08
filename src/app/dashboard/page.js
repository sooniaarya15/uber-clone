import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export default async function Dashboard() {
  const { userId } = await auth();

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("clerk_id", userId)
    .maybeSingle();

  // Agar role abhi choose nahi kiya
  if (!user) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">
        Welcome, {user.full_name || "User"} 👋
      </h1>
      <p className="mt-1 text-gray-600">
        Role: <span className="font-semibold capitalize">{user.role}</span>
      </p>

      <div className="mt-8 rounded-lg bg-white p-6 shadow">
        {user.role === "rider" ? (
          <p>🧍 Rider Dashboard (ride booking Day 4 me aayega)</p>
        ) : (
          <p>🚗 Driver Dashboard (ride requests Day 5 me aayenge)</p>
        )}
      </div>
    </div>
  );
}