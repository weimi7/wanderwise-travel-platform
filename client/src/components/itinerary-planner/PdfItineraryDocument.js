// PdfItineraryDocument.js
import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

/**
 * PdfItineraryDocument
 * Props:
 *  - title (string)
 *  - destinations (string)
 *  - generatedItinerary (string) - raw AI text (should be cleaned before passing)
 *  - exportedAt (string)
 *  - author (string)
 *
 * Simple parser: splits itinerary into day sections using heuristics
 * and renders headings, bullet lists and paragraphs. Supports inline **bold** markers.
 */

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 40,
    lineHeight: 1.45,
    color: "#0b1220",
  },
  coverTitle: { fontSize: 28, fontWeight: 700, color: "#062a46", marginBottom: 8 },
  coverMeta: { fontSize: 10, color: "#666", marginBottom: 6 },
  sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 6, color: "#062a46" },
  small: { fontSize: 9, color: "#6b7280" },
  paragraph: { marginBottom: 6 },
  ul: { marginLeft: 8, marginBottom: 6 },
  li: { flexDirection: "row", marginBottom: 3 },
  bullet: { width: 8 },
  liText: { flex: 1 },
  tocItem: { marginBottom: 4 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, textAlign: "center", fontSize: 9, color: "#6b7280" },
  hr: { height: 1, backgroundColor: "#eef2f6", marginVertical: 6 },
});

/* Heuristics: split into Day sections */
function splitIntoDays(text) {
  if (!text) return [{ title: "Itinerary", body: "" }];
  const lines = text.split(/\r?\n/);
  const dayRe = /^(?:#{1,6}\s*)?(?:day)\s*(\d{1,2})(?:\s*[-–—:]\s*(.*))?/i;
  const sections = [];
  let current = { title: "Overview", lines: [] };

  for (const ln of lines) {
    const trimmed = ln.trim();
    const m = trimmed.match(dayRe);
    if (m) {
      if (current.lines.length || current.title !== "Overview") sections.push(current);
      current = { title: `Day ${m[1]}${m[2] ? " — " + m[2].trim() : ""}`, lines: [] };
      continue;
    }
    const h = trimmed.match(/^#{1,6}\s*(Day\s*\d+.*)/i);
    if (h) {
      if (current.lines.length || current.title !== "Overview") sections.push(current);
      current = { title: h[1].trim(), lines: [] };
      continue;
    }
    current.lines.push(ln);
  }
  if (current.lines.length || current.title !== "Overview") sections.push(current);
  if (!sections.length) return [{ title: "Itinerary", body: text }];
  return sections.map((s) => ({ header: s.title, body: s.lines.join("\n") }));
}

/* Parse paragraph into pieces that handle **bold** by splitting on ** */
function renderRichText(text) {
  if (!text) return null;
  const parts = text.split("**");
  // parts at odd indexes should be bold
  return parts.map((p, idx) => (
    <Text key={idx} style={idx % 2 === 1 ? { fontWeight: 700 } : {}}>
      {p}
    </Text>
  ));
}

/* Render a body string: paragraphs and bullet lists */
function renderBody(body) {
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((blk, i) => {
    const lines = blk.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    // if first line starts with - or * treat block as list
    if (lines.length > 0 && /^[-*]\s+/.test(lines[0])) {
      return (
        <View key={i} style={styles.ul}>
          {lines.map((li, idx) => {
            const text = li.replace(/^[-*]\s+/, "");
            return (
              <View key={idx} style={styles.li}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.liText}>{renderRichText(text)}</Text>
              </View>
            );
          })}
        </View>
      );
    }
    // else paragraph
    return (
      <Text key={i} style={styles.paragraph}>
        {renderRichText(lines.join(" "))}
      </Text>
    );
  });
}

export default function PdfItineraryDocument({ title = "WanderWise Itinerary", destinations = "", generatedItinerary = "", exportedAt = new Date().toLocaleString(), author = "Guest" }) {
  const cleaned = generatedItinerary || "";
  const days = splitIntoDays(cleaned);

  return (
    <Document>
      {/* Cover + TOC */}
      <Page style={styles.page} size="A4">
        <View>
          <Text style={styles.coverTitle}>{title}</Text>
          <Text style={styles.coverMeta}>Generated: {exportedAt}</Text>
          {destinations ? <Text style={styles.small}>Destinations: {destinations}</Text> : null}
          <View style={styles.hr} />
          <Text style={{ marginTop: 8, fontWeight: 700 }}>Contents</Text>
          <View style={{ marginTop: 8 }}>
            {days.map((d, idx) => (
              <Text key={idx} style={styles.tocItem}>
                {idx + 1}. {d.header}
              </Text>
            ))}
          </View>
        </View>
        <Text style={styles.footer}>Generated with WanderWise • {exportedAt}</Text>
      </Page>

      {/* Day pages */}
      {days.map((d, idx) => (
        <Page key={idx} style={styles.page} size="A4">
          <View>
            <Text style={styles.sectionTitle}>{d.header}</Text>
            {renderBody(d.body)}
          </View>
          <Text style={styles.footer}>WanderWise • Page {idx + 2}</Text>
        </Page>
      ))}
    </Document>
  );
}