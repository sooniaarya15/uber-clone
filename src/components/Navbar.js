import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-black px-6 py-4 text-white">
      <Link href="/" className="text-xl font-bold">
        RideGo
      </Link>

      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="rounded px-4 py-2 hover:bg-gray-800">
              Login
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="rounded bg-white px-4 py-2 text-black">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
}