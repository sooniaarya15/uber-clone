import Link from "next/link";
import { getDbUser } from "@/lib/getUser";
import { supabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";
import { sendReceipt } from "@/lib/mail";

export default async function Success({ searchParams }) {
  const { session_id } = await searchParams;
  const user = await getDbUser();
  let ok = false;

  if (user && session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const rideId = session.metadata?.rideId;
      const { data: ride } = await supabaseAdmin
        .from("rides").select("*").eq("id", rideId).maybeSingle();

      if (session.payment_status === "paid" && ride?.rider_id === user.id) {
        const { data: updated } = await supabaseAdmin
          .from("payments")
          .update({ status: "paid", stripe_payment_id: session.payment_intent })
          .eq("ride_id", rideId).eq("status", "pending").select();

        if (updated?.length) await sendReceipt(user.email, ride); // sirf pehli baar
        ok = true;
      }
    } catch (e) {
      console.error(e.message);
    }
  }

  return (
    <div className="mx-auto max-w-md p-10 text-center">
      <h1 className="text-2xl font-bold">{ok ? "Payment successful ✅" : "Payment verify nahi hui"}</h1>
      <Link href="/history" className="mt-6 inline-block rounded bg-black px-6 py-3 text-white">
        Ride history dekho
      </Link>
    </div>
  );
}