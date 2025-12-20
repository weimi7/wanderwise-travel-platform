"use client";

import { useState } from "react";
import { ChevronDown, Clock, MapPin, List, Utensils, Info } from "lucide-react";
import Markdown from "react-markdown";
import Image from "next/image";

export default function DayCard({ day, initiallyOpen = false }) {
  const [open, setOpen] = useState(initiallyOpen);

  return (
    <article className="bg-white/5 border border-white/6 rounded-2xl p-4 shadow-sm">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{day.title}</h3>
          {day.summary && <p className="text-sm text-gray-300 mt-1 max-w-prose">{day.summary}</p>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 text-white hover:bg-white/8 transition"
          >
            <ChevronDown className={`w-4 h-4 transform ${open ? "rotate-180" : "rotate-0"}`} />
            <span className="text-sm font-medium">{open ? "Collapse" : "Expand"}</span>
          </button>
        </div>
      </header>

      {open && (
        <div className="mt-4 space-y-4">
          {/* Hero image if available */}
          {day.images && day.images.length > 0 && (
            <div className="rounded-lg overflow-hidden">
              <Image src={day.images[0]} alt={day.title} className="w-full h-48 object-cover rounded-md" />
            </div>
          )}

          {/* Schedule timeline */}
          {day.schedule && day.schedule.length > 0 && (
            <section>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-2">
                <Clock className="w-4 h-4" /> Schedule
              </h4>
              <ul className="space-y-2">
                {day.schedule.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-20 text-xs text-gray-300 font-mono">{s.time}</div>
                    <div className="text-sm text-gray-200">{s.text}</div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Locations */}
            <div>
              <h5 className="text-xs font-semibold text-gray-300 flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4" /> Locations
              </h5>
              {day.locations && day.locations.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {day.locations.map((l, i) => (
                    <span key={i} className="px-3 py-1 text-xs rounded-full bg-white/6 text-gray-100">
                      {l}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No structured locations found. See raw notes below.</p>
              )}
            </div>

            {/* Activities */}
            <div>
              <h5 className="text-xs font-semibold text-gray-300 flex items-center gap-2 mb-2">
                <List className="w-4 h-4" /> Activities
              </h5>
              {day.activities && day.activities.length > 0 ? (
                <ul className="list-inside list-disc text-sm text-gray-200 space-y-1">
                  {day.activities.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              ) : (
                <p className="text-xs text-gray-400">No structured activities found.</p>
              )}
            </div>

            {/* Food / Budget */}
            <div>
              <h5 className="text-xs font-semibold text-gray-300 flex items-center gap-2 mb-2">
                <Utensils className="w-4 h-4" /> Food
              </h5>
              {day.food && day.food.length > 0 ? (
                <ul className="text-sm text-gray-200 space-y-1">
                  {day.food.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              ) : (
                <p className="text-xs text-gray-400">No food suggestions found.</p>
              )}
            </div>
          </div>

          {/* Budget & Notes */}
          <div className="mt-2">
            {day.budget && day.budget.length > 0 && (
              <>
                <h6 className="text-xs font-semibold text-gray-300 mb-1">Budget</h6>
                <ul className="text-sm text-gray-200 space-y-1">
                  {day.budget.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </>
            )}

            {day.notes && day.notes.length > 0 && (
              <>
                <h6 className="text-xs font-semibold text-gray-300 mt-3 mb-1">Notes</h6>
                <div className="text-sm text-gray-200">
                  {day.notes.map((n, i) => <p key={i} className="mb-1">{n}</p>)}
                </div>
              </>
            )}
          </div>

          {/* Raw markdown fallback */}
          <div className="mt-3 p-3 bg-white/3 rounded">
            <details className="text-sm text-gray-200">
              <summary className="cursor-pointer text-xs text-gray-300 flex items-center gap-2">
                <Info className="w-3 h-3" /> Raw itinerary snippet
              </summary>
              <div className="mt-2 prose prose-invert text-xs">
                <Markdown>{day.raw}</Markdown>
              </div>
            </details>
          </div>
        </div>
      )}
    </article>
  );
}