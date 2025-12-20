import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Parse itinerary into structured data
 */
const parseItinerary = (text) => {
  if (!text) return { days: [], extraInfo: "" };

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const days = [];
  let currentDay = null;
  let currentSection = null;
  let extraInfo = [];
  let inExtraSection = false;

  lines.forEach((line) => {
    // Check if we've reached extra info section
    if (/ESSENTIAL TRAVEL|PACKING|CULTURAL|EMERGENCY|MONEY/i.test(line)) {
      inExtraSection = true;
      if (currentDay) {
        days.push(currentDay);
        currentDay = null;
      }
    }

    if (inExtraSection) {
      extraInfo.push(line);
      return;
    }

    // Detect day header
    if (/^DAY\s+\d+/i.test(line)) {
      if (currentDay) days.push(currentDay);

      currentDay = {
        number: line.match(/\d+/)?.[0] || days.length + 1,
        title: line.replace(/^DAY\s+\d+\s*-?\s*/i, "").trim(),
        description: "",
        morning: [],
        afternoon: [],
        evening: [],
        budget: [],
        tips: [],
      };
      currentSection = null;
      return;
    }

    if (! currentDay) return;

    // Detect sections
    if (/MORNING/i.test(line)) {
      currentSection = "morning";
      return;
    }
    if (/AFTERNOON/i.test(line)) {
      currentSection = "afternoon";
      return;
    }
    if (/EVENING/i.test(line)) {
      currentSection = "evening";
      return;
    }
    if (/DAILY BUDGET|BUDGET/i.test(line)) {
      currentSection = "budget";
      return;
    }
    if (/TRAVEL TIPS|TIPS/i.test(line)) {
      currentSection = "tips";
      return;
    }
    if (line.match(/^-{3,}$/)) {
      return; // Skip separator lines
    }

    // Add content
    const cleanLine = line.replace(/^[-•*]\s*/, "").trim();
    if (! cleanLine) return;

    if (! currentSection && ! currentDay. description) {
      currentDay.description = cleanLine;
    } else if (currentSection === "morning") {
      currentDay.morning.push(cleanLine);
    } else if (currentSection === "afternoon") {
      currentDay. afternoon.push(cleanLine);
    } else if (currentSection === "evening") {
      currentDay.evening.push(cleanLine);
    } else if (currentSection === "budget") {
      currentDay.budget.push(cleanLine);
    } else if (currentSection === "tips") {
      currentDay.tips.push(cleanLine);
    }
  });

  if (currentDay) days.push(currentDay);

  return { days, extraInfo:  extraInfo.join("\n") };
};

/**
 * Generate beautiful PDF itinerary
 */
export const generateItineraryPDF = (itinerary, cleanedItinerary) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 20;

  // Color palette
  const colors = {
    primary: [67, 97, 238], // Blue
    secondary: [139, 92, 246], // Purple
    accent: [16, 185, 129], // Green
    text: [30, 41, 59], // Dark gray
    lightText: [100, 116, 139], // Light gray
    bg: [248, 250, 252], // Light background
    white: [255, 255, 255],
  };

  // Helper:  Check page break
  const checkPageBreak = (space = 20) => {
    if (y + space > pageHeight - 25) {
      doc.addPage();
      y = 20;
      return true;
    }
    return false;
  };

  // Helper: Add section header
  const addSectionHeader = (title, emoji = "") => {
    checkPageBreak(15);
    doc.setFillColor(... colors.primary);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 2, 2, "F");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(... colors.white);
    doc.text(`${emoji} ${title}`, margin + 4, y + 6.5);

    y += 14;
  };

  // Helper: Add content line
  const addContentLine = (text, indent = 0, fontSize = 10) => {
    checkPageBreak(8);
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.text);

    const maxWidth = pageWidth - margin * 2 - indent - 5;
    const lines = doc.splitTextToSize(text, maxWidth);

    doc.text(lines, margin + indent, y);
    y += lines.length * (fontSize * 0.4) + 2;
  };

  // ===== HEADER =====
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 55, "F");

  // Gradient overlay
  for (let i = 0; i < 55; i++) {
    const opacity = 0.15 - (i / 55) * 0.15;
    doc.setGState(new doc.GState({ opacity }));
    doc.setFillColor(0, 0, 0);
    doc.rect(0, i, pageWidth, 1, "F");
  }
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Logo
  doc.setFontSize(32);
  doc.text("✈️", margin, 28);

  // Title
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.white);
  doc.text("WanderWise", margin + 15, 28);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Your Sri Lanka Travel Itinerary", margin + 15, 38);

  // Date
  doc.setFontSize(9);
  doc.text(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    pageWidth - margin,
    28,
    { align: "right" }
  );

  y = 65;

  // ===== TRIP SUMMARY =====
  doc.setFillColor(...colors. bg);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 32, 3, 3, "F");

  y += 8;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors. text);
  doc.text(itinerary.title || "My Sri Lanka Adventure", margin + 5, y);

  y += 8;

  const tripDetails = [
    `📅 ${itinerary.dates || "Custom dates"}`,
    `⏱️ ${itinerary.days || "N/A"} Days`,
    `🎯 ${(itinerary.destinations || []).join(", ") || "Multiple destinations"}`,
    `💼 ${itinerary.preferences || "General travel"}`,
  ];

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.lightText);

  tripDetails.forEach((detail, i) => {
    const xPos = margin + 5 + (i % 2) * 90;
    const yPos = y + Math.floor(i / 2) * 6;
    doc.text(detail, xPos, yPos);
  });

  y += 22;

  // ===== PARSE AND RENDER DAYS =====
  const { days, extraInfo } = parseItinerary(cleanedItinerary);

  if (days.length === 0) {
    // Fallback:  render plain text
    checkPageBreak(30);
    addSectionHeader("Itinerary", "📋");

    const textLines = cleanedItinerary.split("\n");
    textLines.forEach((line) => {
      if (line. trim()) {
        addContentLine(line, 0, 10);
      }
    });
  } else {
    // Render structured days
    days.forEach((day) => {
      checkPageBreak(50);

      // Day header
      doc.setFillColor(...colors. primary);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 12, 3, 3, "F");

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.white);
      doc.text(`DAY ${day.number} - ${day.title}`, margin + 5, y + 8);

      y += 17;

      // Description
      if (day.description) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...colors.lightText);
        const descLines = doc.splitTextToSize(day. description, pageWidth - margin * 2 - 10);
        doc.text(descLines, margin + 5, y);
        y += descLines.length * 5 + 5;
      }

      // Morning
      if (day.morning.length > 0) {
        addSectionHeader("Morning", "☀️");
        day.morning.forEach((item) => {
          addContentLine(item, 8, 9);
        });
        y += 3;
      }

      // Afternoon
      if (day.afternoon.length > 0) {
        addSectionHeader("Afternoon", "🌤️");
        day.afternoon. forEach((item) => {
          addContentLine(item, 8, 9);
        });
        y += 3;
      }

      // Evening
      if (day.evening.length > 0) {
        addSectionHeader("Evening", "🌙");
        day.evening.forEach((item) => {
          addContentLine(item, 8, 9);
        });
        y += 3;
      }

      // Budget
      if (day.budget.length > 0) {
        addSectionHeader("Budget", "💰");
        day.budget.forEach((item) => {
          addContentLine(item, 8, 9);
        });
        y += 3;
      }

      // Tips
      if (day. tips.length > 0) {
        addSectionHeader("Travel Tips", "💡");
        day.tips.forEach((item) => {
          addContentLine(item, 8, 9);
        });
        y += 3;
      }

      y += 10;
    });
  }

  // ===== EXTRA INFO =====
  if (extraInfo && extraInfo.trim()) {
    checkPageBreak(40);
    addSectionHeader("Essential Travel Information", "📌");

    const infoLines = extraInfo.split("\n");
    infoLines.forEach((line) => {
      if (line.trim()) {
        if (line.match(/^[A-Z\s]{4,}$/)) {
          // Section header
          checkPageBreak(12);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...colors. secondary);
          doc.text(line, margin + 3, y);
          y += 7;
        } else {
          // Regular line
          addContentLine(line, 8, 9);
        }
      }
    });
  }

  // ===== FOOTER ON ALL PAGES =====
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    const footerY = pageHeight - 12;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

    doc.setFontSize(8);
    doc.setTextColor(...colors.lightText);
    doc.setFont("helvetica", "normal");

    doc.text("WanderWise - Your Sri Lanka Travel Companion", margin, footerY);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, footerY, { align: "center" });
    doc.text("www.wanderwise.com", pageWidth - margin, footerY, { align: "right" });
  }

  // ===== SAVE =====
  const fileName = `${(itinerary.title || "My-Sri-Lanka-Itinerary")
    .replace(/[^a-z0-9]/gi, "-")
    .substring(0, 40)}-${Date.now()}.pdf`;

  doc.save(fileName);
};

/**
 * Generate text version
 */
export const generateItineraryText = (cleanedItinerary) => {
  let text = "";

  text += "═══════════════════════════════════════════\n";
  text += "   ✈️ WANDERWISE - SRI LANKA ITINERARY\n";
  text += "═══════════════════════════════════════════\n\n";

  text += cleanedItinerary;

  text += "\n\n═══════════════════════════════════════════\n";
  text += "Generated by WanderWise\n";
  text += `${new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month:  "long",
    day: "numeric",
  })}\n`;
  text += "www.wanderwise.com\n";
  text += "═══════════════════════════════════════════\n";

  return text;
};

/**
 * Copy to clipboard
 */
export const copyItineraryToClipboard = async (cleanedItinerary) => {
  const text = generateItineraryText(cleanedItinerary);

  try {
    await navigator.clipboard. writeText(text);
    return { success: true, message: "Itinerary copied to clipboard!" };
  } catch (err) {
    console.error("Copy failed:", err);
    return { success: false, message: "Failed to copy itinerary" };
  }
};

/**
 * Download text file
 */
export const downloadItineraryText = (itinerary, cleanedItinerary) => {
  const text = generateItineraryText(cleanedItinerary);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const a = document. createElement("a");

  a.href = url;
  a.download = `${(itinerary.title || "My-Itinerary")
    .replace(/[^a-z0-9]/gi, "-")
    .substring(0, 40)}.txt`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};