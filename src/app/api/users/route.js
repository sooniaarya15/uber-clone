import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET: current user ka DB record
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("clerk_id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ user: data });
}

// POST: role choose karke user create karo
export async function POST(req) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role, vehicle_type, vehicle_number } = await req.json();
  if (!["rider", "driver"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const clerkUser = await currentUser();

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .upsert(
      {
        clerk_id: userId,
        email: clerkUser?.emailAddresses[0]?.emailAddress,
        full_name: `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim(),
        avatar_url: clerkUser?.imageUrl,
        role,
      },
      { onConflict: "clerk_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (role === "driver") {
    await supabaseAdmin.from("drivers").upsert(
      { user_id: user.id, vehicle_type, vehicle_number },
      { onConflict: "user_id" }
    );
  }

  return NextResponse.json({ user });
}