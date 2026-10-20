import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/getUser";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await req.json();
  const { data: ride } = await supabaseAdmin
    .from("rides").select("*").eq("id", id).maybeSingle();
  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

  let update, from;
  let cancelFee = 0;

  if (action === "accept" && user.role === "driver" && ride.rider_id !== user.id) {
    update = { driver_id: user.id, status: "accepted" };
    from = ["requested"];
  } else if (action === "start" && ride.driver_id === user.id) {
    update = { status: "in_progress" };
    from = ["accepted"];
  } else if (action === "complete" && ride.driver_id === user.id) {
    update = { status: "completed" };
    from = ["in_progress"];
  } else if (action === "cancel" && ride.rider_id === user.id) {
    update = { status: "cancelled" };
    from = ["requested", "accepted"];
    if (ride.status === "accepted") cancelFee = 20; // sirf information; charge nahi kiya
  } else if (action === "cancel" && ride.driver_id === user.id) {
    // Driver cancel kare to ride wapas "requested" ho jati hai
    update = { status: "requested", driver_id: null };
    from = ["accepted"];
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("rides").update(update).eq("id", id).in("status", from)
    .select().maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Ride status has already changed" }, { status: 409 });

  if (action === "complete") {
    await supabaseAdmin.from("payments").insert({ ride_id: id, amount: ride.fare });
  }
  return NextResponse.json({ ride: data, cancel_fee: cancelFee });
}