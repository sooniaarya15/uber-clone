import { currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const user = await currentUser();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.firstName || "User"} 👋</h1>
      <p className="mt-2 text-gray-600">
        {user?.emailAddresses[0]?.emailAddress}
      </p>
    </div>
  );
}