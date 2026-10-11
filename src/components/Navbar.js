import Link from "next/link";
import { Show, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 bg-black px-4 py-3 text-white sm:px-6">
      <Link href="/" className="text-xl font-bold">RideGo</Link>
      <div className="flex flex-wrap items-center gap-3 text-sm sm:gap-4 sm:text-base">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="rounded px-3 py-2 hover:bg-gray-800">Login</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="rounded bg-white px-3 py-2 text-black">Sign Up</button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/history" className="hover:underline">History</Link>
          <Link href="/profile" className="hover:underline">Profile</Link>
          <UserButton />
        </Show>
      </div>
    </nav>
  );
}