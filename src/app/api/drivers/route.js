import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/getUser";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const user = await getDbUser();
  if (!user || user.role !== "driver")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { data } = await supabaseAdmin
    .from("drivers").select("*").eq("user_id", user.id).maybeSingle();
  return NextResponse.json({ driver: data });
}

export async function PATCH(req) {
  const user = await getDbUser();
  if (!user || user.role !== "driver")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const b = await req.json();
  const update = {};
  if (typeof b.is_available === "boolean") update.is_available = b.is_available;
  if (Number.isFinite(b.lat) && Number.isFinite(b.lng)) {
    update.current_lat = b.lat;
    update.current_lng = b.lng;
  }
  const { error } = await supabaseAdmin
    .from("drivers").update(update).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}