import Link from "next/link";
import { redirect } from "next/navigation";
import { getDbUser } from "@/lib/getUser";
import { supabaseAdmin } from "@/lib/supabase";
import ReviewForm from "@/components/ReviewForm";

export default async function History() {
  const user = await getDbUser();
  if (!user) redirect("/onboarding");

  const { data: rides } = await supabaseAdmin
    .from("rides")
    .select(`*, rider:users!rides_rider_id_fkey(full_name),
      driver:users!rides_driver_id_fkey(full_name), payments(status), reviews(rating)`)
    .or(`rider_id.eq.${user.id},driver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Ride History</h1>
      {!rides?.length && <p className="text-gray-500">No rides yet.</p>}

      {rides?.map((r) => {
        const paid = r.payments?.[0]?.status === "paid";
        const reviewed = r.reviews?.length > 0;
        return (
          <div key={r.id} className="rounded-lg bg-white p-4 shadow">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{new Date(r.created_at).toLocaleString("en-IN")}</span>
              <span className="font-semibold capitalize">{r.status.replace("_", " ")}</span>
            </div>
            <p className="mt-1">📍 {r.pickup_address}</p>
            <p>🏁 {r.drop_address}</p>
            <p className="text-sm text-gray-600">
              {user.role === "rider" ? `Driver: ${r.driver?.full_name || "-"}` : `Rider: ${r.rider?.full_name}`}
              {" · "}{Number(r.distance_km).toFixed(1)} km
            </p>
            <p className="font-bold">
              ₹{r.fare} {paid && <span className="text-green-600">· Paid</span>}
            </p>

            {paid && (
              <Link href={`/receipt/${r.id}`} className="text-sm text-blue-600 underline">
                View / Download receipt
              </Link>
            )}
            {user.role === "rider" && r.status === "completed" && paid && !reviewed && (
              <ReviewForm rideId={r.id} />
            )}
            {reviewed && user.role === "rider" && (
              <p className="text-sm">Your rating: {"⭐".repeat(r.reviews[0].rating)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}