import Link from "next/link";

export default function Home() {
  return (
    <section className="mx-auto flex min-h-[80vh] max-w-4xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold md:text-6xl">
        Go anywhere with <span className="text-blue-600">RideGo</span>
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Request a ride, track your driver live, and pay securely.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/sign-up"
          className="rounded bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          Get Started
        </Link>
        <Link
          href="/sign-in"
          className="rounded border border-black px-6 py-3 hover:bg-gray-100"
        >
          Login
        </Link>
      </div>
    </section>
  );
}