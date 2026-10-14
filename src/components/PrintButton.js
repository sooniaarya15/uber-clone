"use client";
export default function PrintButton() {
  return (
    <button onClick={() => window.print()}
      className="mt-6 rounded bg-black px-4 py-2 text-white print:hidden">
      Download / Print (Save as PDF)
    </button>
  );
}