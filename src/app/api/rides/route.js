import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/getUser";
import { supabaseAdmin } from "@/lib/supabase";
import { calcFare, RATES } from "@/lib/fare";
import { haversine } from "@/lib/geo";

const JOIN = `*,
  rider:users!rides_rider_id_fkey(full_name, phone),
  driver:users!rides_driver_id_fkey(full_name, phone),
  payments(status)`;

export async function GET(req) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scope = new URL(req.url).searchParams.get("scope") || "mine";

  // DRIVER: nearby requested rides (Day 5)
  if (scope === "available") {
    if (user.role !== "driver")
      return NextResponse.json({ error: "Drivers only" }, { status: 403 });

    const { data: d } = await supabaseAdmin
      .from("drivers").select("*").eq("user_id", user.id).maybeSingle();
    if (!d?.is_available) return NextResponse.json({ rides: [] });

    const { data: rides } = await supabaseAdmin
      .from("rides")
      .select("*, rider:users!rides_rider_id_fkey(full_name)")
      .eq("status", "requested")
      .neq("rider_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    const nearby = (rides || [])
      .map((r) => ({
        ...r,
        pickup_distance_km:
          d.current_lat != null && r.pickup_lat != null
            ? haversine(d.current_lat, d.current_lng, r.pickup_lat, r.pickup_lng)
            : null,
      }))
      .filter((r) => r.pickup_distance_km == null || r.pickup_distance_km <= 10);

    return NextResponse.json({ rides: nearby });
  }

  // MINE: rider ya driver ki apni rides
  const { data: rides, error } = await supabaseAdmin
    .from("rides")
    .select(JOIN)
    .or(`rider_id.eq.${user.id},driver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Driver ki live location + rating attach karo
  const ids = [...new Set((rides || []).map((r) => r.driver_id).filter(Boolean))];
  let infoMap = {};
  if (ids.length) {
    const { data: infos } = await supabaseAdmin
      .from("drivers")
      .select("user_id,current_lat,current_lng,avg_rating,vehicle_type,vehicle_number")
      .in("user_id", ids);
    infoMap = Object.fromEntries((infos || []).map((i) => [i.user_id, i]));
  }
  const out = (rides || []).map((r) => ({ ...r, driver_info: infoMap[r.driver_id] || null }));
  return NextResponse.json({ rides: out });
}

export async function POST(req) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "rider")
    return NextResponse.json({ error: "Only riders can book" }, { status: 403 });

  const b = await req.json();
  const km = Number(b.distance_km);
  const nums = [b.pickup_lat, b.pickup_lng, b.drop_lat, b.drop_lng].map(Number);

  if (!b.pickup_address || !b.drop_address || !(km > 0) || nums.some(Number.isNaN))
    return NextResponse.json({ error: "Invalid ride data" }, { status: 400 });
  if (!RATES[b.ride_type])
    return NextResponse.json({ error: "Invalid ride type" }, { status: 400 });

  // Ek time pe ek hi active ride
  const { data: active } = await supabaseAdmin
    .from("rides").select("id")
    .eq("rider_id", user.id)
    .in("status", ["requested", "accepted", "in_progress"]).limit(1);
  if (active?.length)
    return NextResponse.json({ error: "You already have an active ride" }, { status: 409 });

  // Fare server pe dobara calculate hota hai (client pe bharosa nahi)
  const fare = calcFare(km, b.ride_type, b.promo);

  const { data, error } = await supabaseAdmin
    .from("rides")
    .insert({
      rider_id: user.id,
      pickup_address: String(b.pickup_address).slice(0, 300),
      pickup_lat: nums[0], pickup_lng: nums[1],
      drop_address: String(b.drop_address).slice(0, 300),
      drop_lat: nums[2], drop_lng: nums[3],
      ride_type: b.ride_type,
      distance_km: km,
      fare,
    })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ride: data });
}