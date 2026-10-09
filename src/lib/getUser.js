import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "./supabase";

export async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;
  const { data } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("clerk_id", userId)
    .maybeSingle();
  return data;
}