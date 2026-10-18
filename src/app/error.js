"use client";
export default function Error({ error, reset }) {
  return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold">Something went wrong 😕</h2>
      <p className="my-2 text-gray-600">{error.message}</p>
      <button onClick={reset} className="rounded bg-black px-4 py-2 text-white">Try again</button>
    </div>
  );
}