// Lightweight parser for AI-generated itinerary text.
// Converts plain markdown-like itinerary into array of day objects.
//
// Each day object:
// {
//   id: string,
//   title: "Day 1 — Title",
//   summary: "short paragraph",
//   schedule: [{ time: "06:30–08:00", text: "Sunrise at ..." }, ...],
//   locations: ["Place 1", "Place 2"],
//   activities: ["Activity 1", ...],
//   food: ["Restaurant 1 (price)", ...],
//   budget: ["Cheap: ...", "Medium: ..."],
//   notes: ["..."],
//   images: ["https://..."],
//   raw: "raw body text"
// }
//
// Heuristics: recognizes headings containing 'Schedule', 'Locations', 'Activities', 'Food', 'Budget', 'Notes'.
// Falls back to splitting by Day headings if structure is loose.

export function parseItinerary(rawText) {
  if (!rawText) return [];

  const text = String(rawText).replace(/\r\n/g, "\n");
  // Split into day sections using common Day headings (case-insensitive)
  const dayHeadingRegex = /^(?:#{1,6}\s*)?(?:🌅\s*)?(Day|Itinerary Day)\s*[-:]*\s*(\d{1,2})(?:\s*[:\-–]\s*(.*))?/gim;

  // find indexes of day headings
  const matches = [];
  let m;
  while ((m = dayHeadingRegex.exec(text)) !== null) {
    matches.push({ idx: m.index, match: m[0], num: m[2], title: m[3] || "" });
  }

  const sections = [];
  if (matches.length === 0) {
    // No explicit Day headings — treat whole text as single "Overview"
    sections.push({ header: "Overview", body: text });
  } else {
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].idx;
      const end = i + 1 < matches.length ? matches[i + 1].idx : text.length;
      const headerRaw = matches[i].match.trim();
      const body = text.slice(start + headerRaw.length, end).trim();
      const title = headerRaw.replace(/^#+\s*/g, "");
      sections.push({ header: title || `Day ${matches[i].num}`, body: body });
    }
  }

  // Helper to find section blocks like "Schedule", "Locations", etc.
  const extractSection = (body, sectionNames) => {
    if (!body) return null;
    const combined = sectionNames.join("|");
    const re = new RegExp(`(^|\\n)\\s*(?:#{1,6}\\s*)?(?:\\*\\*|__)?\\s*(${combined})\\s*(?:\\*\\*|__)?\\s*[:\\n]`, "im");
    const m = body.match(re);
    if (!m) return null;

    const startIdx = m.index + m[0].length;
    // look for next section heading (simple heuristic)
    const nextHeadingMatch = body.slice(startIdx).search(/\n\s*(?:#{1,6}\s*|\n[A-Z][a-z0-9 ]{1,40}:|\n📍|\n🕒|\n🎯|\n🍽|\n💸|\nNotes|Travel Notes)/im);
    let sectionText;
    if (nextHeadingMatch === -1) {
      sectionText = body.slice(startIdx).trim();
    } else {
      sectionText = body.slice(startIdx, startIdx + nextHeadingMatch).trim();
    }
    return sectionText;
  };

  const findImages = (s) => {
    if (!s) return [];
    const str = String(s);
    const re = /(https?:\/\/\S+\.(?:png|jpe?g|webp|gif)(?:\?\S+)*)/gi;
    const imgs = [];
    let mm;
    while ((mm = re.exec(str)) !== null) imgs.push(mm[1]);
    return imgs;
  };

  // Robust parseList: accept string, array, or null
  const parseList = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) {
      return input.map((l) => String(l).replace(/^[\-\*\u2022]\s*/, "").trim()).filter(Boolean);
    }
    const s = String(input);
    // If it's a single-line but separated by commas
    if (s.indexOf("\n") === -1 && s.indexOf(",") !== -1) {
      return s.split(",").map((p) => p.trim()).filter(Boolean);
    }
    return s
      .split(/\n/)
      .map((l) => l.replace(/^[\-\*\u2022]\s*/, "").trim())
      .filter(Boolean);
  };

  // Robust schedule parser (handles arrays or strings)
  const parseSchedule = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) {
      // normalize array of lines
      return input
        .map((ln) => String(ln).trim())
        .filter(Boolean)
        .map((ln) => {
          const timeRe = /(\d{1,2}[:.]\d{2})(?:\s*[–\-—to]+\s*(\d{1,2}[:.]\d{2}))?/;
          const t = ln.match(timeRe);
          if (t) {
            const timeStr = t[0].trim();
            const desc = ln.replace(timeStr, "").replace(/^[-–—:\s]+/, "").trim();
            return { time: timeStr, text: desc || ln };
          }
          return { time: "", text: ln };
        });
    }

    const text = String(input);
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const items = [];
    const timeRe = /(\d{1,2}[:.]\d{2})(?:\s*[–\-—to]+\s*(\d{1,2}[:.]\d{2}))?/;
    for (const ln of lines) {
      const t = ln.match(timeRe);
      if (t) {
        const timeStr = t[0].trim();
        const desc = ln.replace(timeStr, "").replace(/^[-–—:\s]+/, "").trim();
        items.push({ time: timeStr, text: desc || ln });
      } else if (/^[\-\*\u2022]/.test(ln)) {
        items.push({ time: "", text: ln.replace(/^[\-\*\u2022]\s*/, "") });
      } else {
        const parts = ln.split(/\s+[–—-]\s+/);
        if (parts.length >= 2 && /^\d{1,2}/.test(parts[0])) items.push({ time: parts[0].trim(), text: parts.slice(1).join(" - ").trim() });
        else items.push({ time: "", text: ln });
      }
    }
    return items;
  };

  // Build day objects
  const days = sections.map((s, idx) => {
    const body = s.body || "";

    const scheduleText =
      extractSection(body, ["Schedule", "🕒\\s*Schedule"]) ||
      extractSection(body, ["Itinerary", "Schedule"]) ||
      null;

    const locationsText = extractSection(body, ["Locations", "📍\\s*Locations"]) || null;
    const activitiesText = extractSection(body, ["Activities", "🎯\\s*Activities"]) || null;
    const foodText = extractSection(body, ["Food Suggestions", "🍽\\s*Food", "Food"]) || null;
    const budgetText = extractSection(body, ["Budget", "💸\\s*Budget"]) || null;
    const notesText = extractSection(body, ["Travel Notes", "Notes", "Additional Tips", "Tips"]) || null;

    const images = findImages(body);
    const schedule = parseSchedule(scheduleText || body);
    const locations = parseList(locationsText || "");
    const activities = parseList(activitiesText || "");
    const food = parseList(foodText || "");
    const budget = parseList(budgetText || "");
    const notes = Array.isArray(notesText) ? notesText.map(String).filter(Boolean) : (notesText ? String(notesText).split("\n").map(x => x.trim()).filter(Boolean) : []);

    // Summary: first paragraph in body (non-empty, > 10 chars)
    const firstPara = (String(body).split(/\n{2,}/).find(p => p.trim().length > 10) || "").trim();

    return {
      id: `day-${idx + 1}`,
      title: s.header || `Day ${idx + 1}`,
      summary: firstPara,
      schedule,
      locations,
      activities,
      food,
      budget,
      notes,
      images,
      raw: body,
    };
  });

  return days;
}