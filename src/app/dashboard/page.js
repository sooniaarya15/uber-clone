import { redirect } from "next/navigation";
import { getDbUser } from "@/lib/getUser";
import RiderDashboard from "@/components/RiderDashboard";
import DriverDashboard from "@/components/DriverDashboard";

export default async function Dashboard() {
  const user = await getDbUser();
  if (!user) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <h1 className="text-2xl font-bold">
        Welcome, {user.full_name || user.email?.split("@")[0] || "Friend"} 👋
      </h1>
      <p className="mb-6 text-gray-600">
        Role: <span className="font-semibold capitalize">{user.role}</span>
      </p>
      {user.role === "rider" ? <RiderDashboard /> : <DriverDashboard />}
    </div>
  );
}