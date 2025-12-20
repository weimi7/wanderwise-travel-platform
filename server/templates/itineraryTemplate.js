const marked = require('marked');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

function sanitizeHtml(html) {
  const window = new JSDOM('').window;
  const DOMPurify = createDOMPurify(window);
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: DOMPurify.getDefaultWhiteList().concat(['img', 'h4']),
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class']
  });
}

// NEW: improved cleaning function
function cleanLLMArtifacts(text) {
  if (!text) return '';
  let t = String(text);

  // 1) Unicode normalize to NFC
  try { t = t.normalize('NFC'); } catch (e) {}

  // 2) Remove C0/C1 control chars and zero-width spaces/nbps etc.
  t = t.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, ' ');

  // 3) Replace long clusters of non-alphanumeric symbols (junk like "Ø=ÝR") with a single space
  //    Keep punctuation and markdown markers (*, #, -, [, ], (, ), ., , : ; ? ! /) by allowing \p{P}
  //    Also allow emoji (we'll be conservative and not remove them here).
  t = t.replace(/([^\p{L}\p{N}\p{P}\s]){2,}/gu, ' ');

  // 4) Remove isolated single symbol tokens that are NOT common punctuation or markdown markers.
  //    This helps drop stray single "Ø" or similar characters that appear between words.
  //    We allow punctuation .,;:-*()[]{}'"` and common markdown markers * and # to remain.
  t = t.replace(/(?<=\s|^)([^\p{L}\p{N}\p{P}\s])(?!\s|$)/gu, ' ');

  // 5) Collapse multiple markdown asterisks or hashes into reasonable forms to keep bold/headings.
  t = t.replace(/\*{3,}/g, '**'); // collapse ***... → **
  t = t.replace(/#{3,}\s*/g, '### '); // collapse heading markers

  // 6) Trim each line and preserve single newlines for paragraphs
  t = t.split(/\r?\n/).map(s => s.trim()).join('\n');

  // 7) Collapse repeated whitespace
  t = t.replace(/[ \t]{2,}/g, ' ');
  t = t.replace(/\n{3,}/g, '\n\n');

  return t.trim();
}

function findImageUrls(text) {
  if (!text) return [];
  const re = /(https?:\/\/[^\s"'()]+?\.(?:png|jpe?g|webp|avif|gif)(?:\?[^\s"'()]*)?)/gi;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  return out;
}

function splitIntoDays(md) {
  if (!md) return [{ title: 'Itinerary', body: '' }];

  const lines = md.split(/\r?\n/);
  const dayRe = /^(?:#{1,6}\s*)?(?:day)\s*(\d{1,2})(?:\s*[-–—:]\s*(.*))?/i;
  const sections = [];
  let curr = { title: 'Overview', lines: [] };

  for (const ln of lines) {
    const t = ln.trim();
    const m = t.match(dayRe);
    if (m) {
      if (curr.lines.length || curr.title !== 'Overview') sections.push(curr);
      curr = { title: `Day ${m[1]}${m[2] ? ' — ' + m[2].trim() : ''}`, lines: [] };
      continue;
    }
    const h = t.match(/^#{1,6}\s*(Day\s*\d+.*)/i);
    if (h) {
      if (curr.lines.length || curr.title !== 'Overview') sections.push(curr);
      curr = { title: h[1].trim(), lines: [] };
      continue;
    }
    curr.lines.push(ln);
  }
  if (curr.lines.length || curr.title !== 'Overview') sections.push(curr);
  if (!sections.length) return [{ title: 'Itinerary', body: md }];
  return sections.map(s => ({ title: s.title, body: s.lines.join('\n') }));
}

function markdownToHtml(md) {
  const unsafe = marked.parse(md || '', { gfm: true, breaks: true });
  return sanitizeHtml(unsafe);
}

function escapeHtml(s) {
  if (s === undefined || s === null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

module.exports = function renderItineraryHtml({ name = 'Itinerary', payload = {}, exportedAt = new Date().toISOString(), user = {} }) {
  const raw = payload.generatedItinerary || '';
  const cleaned = cleanLLMArtifacts(raw);
  const destinations = Array.isArray(payload.destinations) ? payload.destinations.join(', ') : (payload.destinations || '');
  const heroImage = payload.header_image || findImageUrls(raw)[0] || '';
  const structuredDays = Array.isArray(payload.days) && payload.days.length ? payload.days : null;

  let daySections = [];
  if (structuredDays) {
    daySections = structuredDays.map((d, i) => {
      const header = d.title || `Day ${i+1}`;
      const body = [
        d.summary || '',
        (d.schedule && Array.isArray(d.schedule)) ? d.schedule.map(s => `- ${s}`).join('\n') : '',
        (d.locations && Array.isArray(d.locations)) ? d.locations.map(l => `- ${l}`).join('\n') : '',
        (d.activities && Array.isArray(d.activities)) ? d.activities.map(a => `- ${a}`).join('\n') : '',
        d.notes || ''
      ].filter(Boolean).join('\n\n');
      return { header, body, images: d.image ? [d.image] : findImageUrls(body) };
    });
  } else {
    const splits = splitIntoDays(cleaned);
    daySections = splits.map((s, idx) => ({ header: s.title || `Day ${idx+1}`, body: s.body || '', images: findImageUrls(s.body || '') }));
  }

  if (!daySections.length) daySections = [{ header: 'Overview', body: cleaned, images: [] }];

  const toc = daySections.map((d, idx) => ({ id: `day-${idx+1}`, title: d.header }));

  const dayBlocks = daySections.map((d, idx) => {
    const id = `day-${idx+1}`;
    const title = escapeHtml(d.header || `Day ${idx+1}`);
    const bodyHtml = markdownToHtml(d.body || '');
    const img = d.images && d.images.length ? d.images[0] : '';
    const imgHtml = img ? `<div class="day-image"><img src="${escapeHtml(img)}" alt="${title}" /></div>` : `<div class="day-image placeholder">No image</div>`;
    return `
      <section id="${id}" class="day-section">
        <div class="day">
          ${imgHtml}
          <div class="day-content">
            <h3>${title}</h3>
            <div class="day-body">${bodyHtml}</div>
          </div>
        </div>
      </section>
    `;
  }).join('\n');

  const nowLocal = new Date(exportedAt).toLocaleString();

  const css = `
    @page { margin: 20mm 18mm; }
    body { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; color:#0d1b2a; background:#f4f7fb; -webkit-font-smoothing:antialiased; }
    .wrapper { max-width: 900px; margin: 16px auto; background:white; padding:22px; border-radius:8px; }
    header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
    h1 { margin:0; font-size:30px; color:#07203a; letter-spacing:-0.3px; }
    .meta { color:#6b7280; margin-top:8px; font-size:12px; }
    .hero { margin-top:18px; border-radius:8px; overflow:hidden; height:240px; background:#eef6ff; }
    .hero img { width:100%; height:100%; object-fit:cover; display:block; }
    .toc { margin-top:18px; padding:12px; background:#fbfdff; border-radius:6px; border:1px solid #eef6ff; }
    .toc h2{ margin:0 0 8px 0; font-size:16px; color:#07203a; }
    .toc ul{ margin:6px 0 0 18px; color:#334155; font-size:13px; }
    .day-section{ margin-top:20px; page-break-inside: avoid; }
    .day{ display:flex; gap:16px; background:linear-gradient(180deg,#fff,#fbfdff); padding:14px; border-radius:8px; border:1px solid #eef5fb; box-shadow:0 6px 18px rgba(10,20,40,0.04); }
    .day-image{ width:220px; min-width:140px; height:140px; border-radius:6px; overflow:hidden; background:#f8fafc; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:12px; }
    .day-image img{ width:100%; height:100%; object-fit:cover; }
    .day-content{ flex:1; }
    .day h3{ margin:0 0 8px 0; font-size:18px; color:#07203a; }
    .day-body{ color:#334155; font-size:14px; line-height:1.65; }
    .day-body p{ margin:0 0 8px 0; }
    .day-body ul{ margin:8px 0 12px 18px; }
    a{ color:#0b63ff; text-decoration:underline; }
    footer.page-footer{ position:fixed; bottom:12mm; left:0; right:0; text-align:center; font-size:12px; color:#6b7280; }
    @media print { .wrapper { box-shadow:none; border-radius:0; margin:0; padding:12mm; } .hero{ height:160px; } }
  `;

  const hero = heroImage ? `<div class="hero"><img src="${escapeHtml(heroImage)}" alt="Hero image"/></div>` : '';

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>${escapeHtml(name)}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>${css}</style>
    </head>
    <body>
      <div class="wrapper">
        <header>
          <div>
            <h1>${escapeHtml(name)}</h1>
            <div class="meta">${escapeHtml(destinations || 'Multiple destinations')} • Generated ${escapeHtml(nowLocal)}</div>
          </div>
          <div style="text-align:right;">
            <div style="display:inline-block;background:#eef6ff;color:#0b63ff;padding:6px 10px;border-radius:999px;font-weight:600">WanderWise</div>
            <div style="margin-top:8px;color:#6b7280">${escapeHtml(user.name || 'Guest')}</div>
          </div>
        </header>

        ${hero}

        <div class="toc" role="navigation" aria-label="Table of contents">
          <h2>Contents</h2>
          <ul>
            ${toc.map((it, i) => `<li><a href="#${it.id}">${escapeHtml(it.title)}</a></li>`).join('')}
          </ul>
        </div>

        ${dayBlocks}

        <footer class="page-footer">Generated with WanderWise • ${escapeHtml(nowLocal)}</footer>
      </div>
    </body>
  </html>`;

  return html;
};