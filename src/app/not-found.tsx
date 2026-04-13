import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="mt-2 text-base text-gray-500">
        This yield source could not be found.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Back to Explore
      </Link>
    </main>
  );
}
