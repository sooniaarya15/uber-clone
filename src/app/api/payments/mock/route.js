import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/getUser";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req) {
  if (process.env.NODE_ENV === "production")
    return NextResponse.json({ error: "Not available" }, { status: 404 });

  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rideId } = await req.json();
  const { data: ride } = await supabaseAdmin
    .from("rides").select("*").eq("id", rideId).maybeSingle();

  if (!ride || ride.rider_id !== user.id)
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  if (ride.status !== "completed")
    return NextResponse.json({ error: "Ride is not completed yet" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("payments")
    .update({ status: "paid", stripe_payment_id: "TEST_MOCK" })
    .eq("ride_id", rideId)
    .eq("status", "pending");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}