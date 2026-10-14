import { notFound } from "next/navigation";
import { getDbUser } from "@/lib/getUser";
import { supabaseAdmin } from "@/lib/supabase";
import PrintButton from "@/components/PrintButton";

export default async function Receipt({ params }) {
  const { id } = await params;
  const user = await getDbUser();
  if (!user) notFound();

  const { data: r } = await supabaseAdmin
    .from("rides")
    .select(`*, rider:users!rides_rider_id_fkey(full_name,email),
      driver:users!rides_driver_id_fkey(full_name), payments(status, stripe_payment_id, created_at)`)
    .eq("id", id).maybeSingle();

  if (!r || (r.rider_id !== user.id && r.driver_id !== user.id)) notFound();

  return (
    <div className="mx-auto max-w-lg bg-white p-8 shadow print:shadow-none">
      <h1 className="text-2xl font-bold">RideGo Receipt</h1>
      <p className="text-sm text-gray-500">Ride ID: {r.id}</p>
      <hr className="my-4" />
      <p><b>Date:</b> {new Date(r.created_at).toLocaleString("en-IN")}</p>
      <p><b>Rider:</b> {r.rider?.full_name} ({r.rider?.email})</p>
      <p><b>Driver:</b> {r.driver?.full_name || "-"}</p>
      <p><b>From:</b> {r.pickup_address}</p>
      <p><b>To:</b> {r.drop_address}</p>
      <p><b>Distance:</b> {Number(r.distance_km).toFixed(1)} km ({r.ride_type})</p>
      <p><b>Payment:</b> {r.payments?.[0]?.status}</p>
      <hr className="my-4" />
      <p className="text-2xl font-bold">Total: ₹{r.fare}</p>
      <PrintButton />
    </div>
  );
}