"use client";

import { useState } from "react";
import { IconGrid, IconList } from "@/app/components/ui/icons";

export function ResultsGrid({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div>
      <div className="flex justify-end">
        <div className="flex gap-1 rounded-md border border-outline-variant p-0.5">
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-label="Vista de tarjetas"
            aria-pressed={view === "grid"}
            className={`rounded p-1.5 transition-colors ${
              view === "grid" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            <IconGrid size={16} />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            aria-label="Vista de lista"
            aria-pressed={view === "list"}
            className={`rounded p-1.5 transition-colors ${
              view === "list" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            <IconList size={16} />
          </button>
        </div>
      </div>

      <div
        className={
          view === "grid"
            ? "mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            : "mt-3 flex flex-col gap-3"
        }
      >
        {children}
      </div>
    </div>
  );
}
