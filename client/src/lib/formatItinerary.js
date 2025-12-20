export function textToHtmlSafe(text) {
  if (!text) return "";
  // Escape HTML
  const esc = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Convert double newlines to paragraph breaks
  const paragraphs = esc(text).split(/\n{2,}/).map((p) => {
    // convert lines starting with "- " to <li>
    if (p.trim().startsWith("- ")) {
      const items = p.split(/\n/).map((ln) => ln.replace(/^-+\s*/, "").trim());
      return `<ul>${items.map((it) => `<li>${it}</li>`).join("")}</ul>`;
    }
    // otherwise wrap as paragraph
    const inline = esc(p).replace(/\n/g, "<br/>");
    return `<p>${inline}</p>`;
  });
  return paragraphs.join("");
}
