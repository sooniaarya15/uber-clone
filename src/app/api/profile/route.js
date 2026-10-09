import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/getUser";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(req) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const full_name = String(body.full_name || "").trim().slice(0, 80);
  const phone = String(body.phone || "").trim().slice(0, 20);

  if (phone && !/^[0-9+\-\s]{7,20}$/.test(phone)) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ full_name, phone })
    .eq("id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user: data });
}