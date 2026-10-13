import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/getUser";
import { supabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export async function POST(req) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rideId } = await req.json();
  const { data: ride } = await supabaseAdmin
    .from("rides").select("*, payments(status)").eq("id", rideId).maybeSingle();

  if (!ride || ride.rider_id !== user.id)
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  if (ride.status !== "completed")
    return NextResponse.json({ error: "Ride abhi complete nahi hui" }, { status: 400 });
  if (ride.payments?.[0]?.status === "paid")
    return NextResponse.json({ error: "Already paid" }, { status: 400 });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "inr",
          unit_amount: Math.round(Number(ride.fare) * 100),
          product_data: { name: `RideGo ride (${ride.distance_km} km)` },
        },
      },
    ],
    metadata: { rideId: ride.id },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}