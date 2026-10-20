import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/getUser";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rideId, rating, feedback } = await req.json();
  const stars = Number(rating);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5)
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });

  const { data: ride } = await supabaseAdmin
    .from("rides").select("*").eq("id", rideId).maybeSingle();
  if (!ride || ride.rider_id !== user.id || ride.status !== "completed" || !ride.driver_id)
    return NextResponse.json({ error: "Review not allowed" }, { status: 403 });

  const { data: existing } = await supabaseAdmin
    .from("reviews").select("id").eq("ride_id", rideId).maybeSingle();
  if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  const { error } = await supabaseAdmin.from("reviews").insert({
    ride_id: rideId,
    rider_id: user.id,
    driver_id: ride.driver_id,
    rating: stars,
    feedback: String(feedback || "").slice(0, 500),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: all } = await supabaseAdmin
    .from("reviews").select("rating").eq("driver_id", ride.driver_id);
  const avg = all.reduce((s, x) => s + x.rating, 0) / all.length;
  await supabaseAdmin.from("drivers")
    .update({ avg_rating: Math.round(avg * 100) / 100 })
    .eq("user_id", ride.driver_id);

  return NextResponse.json({ ok: true });
}