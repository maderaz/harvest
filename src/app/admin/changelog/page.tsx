import { readFileSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog",
  robots: { index: false, follow: false },
};

interface Change {
  type: "added" | "changed" | "fixed" | "removed";
  description: string;
  reasoning: string;
  files: string[];
}

interface ChangelogEntry {
  date: string;
  changes: Change[];
}

const TYPE_STYLES: Record<Change["type"], string> = {
  added: "bg-green-100 text-green-800",
  changed: "bg-blue-100 text-blue-800",
  fixed: "bg-yellow-100 text-yellow-800",
  removed: "bg-red-100 text-red-800",
};

function loadChangelog(): ChangelogEntry[] {
  try {
    const raw = readFileSync(
      join(process.cwd(), "data", "changelog.json"),
      "utf-8",
    );
    return JSON.parse(raw) as ChangelogEntry[];
  } catch {
    return [];
  }
}

export default function ChangelogPage() {
  const entries = loadChangelog();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Changelog</h1>
      <p className="mb-8 text-sm text-gray-500">
        Project history and reasoning behind each change.
      </p>

      {entries.length === 0 && (
        <p className="text-gray-400">No changelog entries found.</p>
      )}

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />

        <div className="space-y-10">
          {entries.map((entry) => (
            <div key={entry.date} className="relative pl-10">
              {/* Timeline dot */}
              <div className="absolute left-1.5 top-1 h-3 w-3 rounded-full border-2 border-gray-300 bg-white" />

              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {new Date(entry.date + "T00:00:00").toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </h2>

              <div className="space-y-4">
                {entry.changes.map((change, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="mb-2 flex items-start gap-2">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[change.type]}`}
                      >
                        {change.type}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {change.description}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-gray-500">
                      {change.reasoning}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {change.files.map((file) => (
                        <span
                          key={file}
                          className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600"
                        >
                          {file}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
