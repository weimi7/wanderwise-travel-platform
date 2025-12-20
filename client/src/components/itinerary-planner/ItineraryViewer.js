"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { usePlanner } from "./PlannerProvider";
import { ChevronUp, ChevronRight, Expand, Minimize } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ItineraryActions from "./ItineraryActions";

// Enhanced Markdown components
const MD_COMPONENTS = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-cyan-400 underline hover:text-cyan-300 transition-colors"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="bg-gray-800 text-cyan-300 px-2 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  ),
  p: ({ children }) => <p className="my-3 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="my-3 space-y-2 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 space-y-2 pl-6 list-decimal">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h3: ({ children }) => (
    <h3 className="text-lg font-bold text-cyan-300 mt-6 mb-3">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-base font-semibold text-blue-300 mt-4 mb-2">{children}</h4>
  ),
  strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
};

// Clean LLM artifacts
function cleanLLMArtifactsClient(text) {
  if (!text) return "";
  let t = String(text);

  try {
    t = t.normalize("NFC");
  } catch (e) {}

  // Remove control characters
  t = t.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, " ");

  // Remove markdown artifacts
  t = t.replace(/```[\w]*\n?/g, "");
  t = t.replace(/```/g, "");
  t = t.replace(/#{1,6}\s+/g, "");

  // Normalize punctuation
  t = t.replace(/\*{3,}/g, "**");
  t = t.replace(/[-–—]{2,}/g, "—");

  // Clean up spacing
  t = t
    .split(/\r?\n/)
    .map((s) => s.trim())
    .join("\n");
  t = t.replace(/\n{3,}/g, "\n\n");
  t = t.replace(/\s{2,}/g, " ");

  return t.trim();
}

// Parse itinerary into days
function parseItineraryToDays(text) {
  if (!text || typeof text !== "string") return [];

  const dayHeadingRegex = /(^.*?DAY\s*\d+.*$)/gim;
  const matches = [... text.matchAll(dayHeadingRegex)];

  if (matches.length === 0)
    return [{ id: 0, title: "Itinerary", content: text }];

  const days = [];
  for (let i = 0; i < matches.length; i++) {
    const startIndex = matches[i].index;
    const endIndex = i + 1 < matches.length ? matches[i + 1]. index : text.length;
    const headingLine = matches[i][0]. trim();
    const content = text.slice(startIndex, endIndex).trim();

    days.push({
      id: i + 1,
      title:  headingLine. replace(/^DAY\s+\d+\s*-?\s*/i, ""),
      content,
    });
  }

  return days;
}

export default function ItineraryViewer() {
  const { generatedItinerary, itineraryMeta } = usePlanner();
  const [days, setDays] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [expandAll, setExpandAll] = useState(false);
  const containerRef = useRef(null);

  const cleanedItinerary = useMemo(
    () => cleanLLMArtifactsClient(generatedItinerary || ""),
    [generatedItinerary]
  );

  useEffect(() => {
    const parsed = parseItineraryToDays(cleanedItinerary || "");
    setDays(parsed);

    const initExpanded = {};
    parsed. forEach((d, i) => (initExpanded[d.id] = i < 1));
    setExpanded(initExpanded);
    setExpandAll(false);
  }, [cleanedItinerary]);

  useEffect(() => {
    if (! days || days.length === 0) return;
    const map = {};
    days.forEach((d) => (map[d.id] = expandAll));
    setExpanded(map);
  }, [expandAll, days]);

  const toggleDay = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const wordsAndReadTime = useMemo(() => {
    if (!cleanedItinerary) return { words: 0, readTime:  0 };
    const words = cleanedItinerary
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    return { words, readTime: Math. max(1, Math.ceil(words / 180)) };
  }, [cleanedItinerary]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            ✨ Your AI Itinerary
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            {wordsAndReadTime.words} words • {wordsAndReadTime.readTime} min read •{" "}
            {days.length} {days.length === 1 ?  "day" : "days"}
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col gap-6 overflow-hidden">
        {/* Export Actions */}
        {cleanedItinerary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 shadow-2xl"
          >
            <ItineraryActions
              itinerary={{
                title: itineraryMeta?. title || "My Sri Lanka Itinerary",
                days:  itineraryMeta?.days || days. length,
                dates: itineraryMeta?.dates,
                destinations: itineraryMeta?.destinations || [],
                preferences: itineraryMeta?.preferences,
              }}
              cleanedItinerary={cleanedItinerary}
            />
          </motion.div>
        )}

        {/* Itinerary content */}
        <main
          className="flex-1 overflow-auto rounded-2xl"
          ref={containerRef}
        >
          {! cleanedItinerary ? (
            <div className="p-8 rounded-2xl bg-white/5 text-gray-300 text-center">
              <p className="text-lg">
                No itinerary generated yet. Enter destinations and click Generate. 
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {days.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={MD_COMPONENTS}
                  >
                    {cleanedItinerary}
                  </ReactMarkdown>
                </motion. div>
              )}

              {days.map((d, index) => (
                <motion. article
                  key={d.id}
                  id={`day-${d.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/20 overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="p-6 lg:h-[680px] overflow-auto">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-xl font-bold text-cyan-400 uppercase tracking-wider mb-2">
                          Day {d.id}
                        </div>
                        <h3 className="font-normal text-white">
                          {d.title. replace(/\r?\n/g, " ")}
                        </h3>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}