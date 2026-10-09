import { redirect } from "next/navigation";
import { getDbUser } from "@/lib/getUser";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const user = await getDbUser();
  if (!user) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold">My Profile</h1>
      {user.avatar_url && (
        <img src={user.avatar_url} alt="avatar" className="mb-4 h-20 w-20 rounded-full" />
      )}
      <p className="mb-4 text-sm text-gray-500">
        Photo badalne ke liye upar navbar me profile icon → Manage account.
      </p>
      <ProfileForm user={user} />
    </div>
  );
}