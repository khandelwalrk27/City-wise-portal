const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const readmePath = path.join(rootDir, 'README.md');
const outputHtmlPath = path.join(rootDir, 'scratch', 'readme_doc.html');
const outputPdfPath = path.join(rootDir, 'CityWise_README.pdf');
const publicPdfPath = path.join(rootDir, 'frontend', 'public', 'CityWise_README.pdf');
const artifactPdfPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\dbc51891-ca62-46c4-bb03-9ffa291e815a\\CityWise_README.pdf';

console.log('Reading README.md...');
const readmeMd = fs.readFileSync(readmePath, 'utf8');

console.log('Parsing Markdown...');
const contentHtml = marked.parse(readmeMd);

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CityWise Jaipur - Project Documentation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

    @page {
      size: A4 portrait;
      margin: 18mm 16mm 20mm 16mm;
      @bottom-right {
        content: "Page " counter(page);
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 8pt;
        color: #94a3b8;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.6;
      font-size: 10.5pt;
      margin: 0;
      padding: 0;
    }

    /* Executive Header Banner */
    .doc-header {
      border-bottom: 2.5px solid #4f46e5;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .doc-brand {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .doc-badge {
      display: inline-block;
      align-self: flex-start;
      background: #eef2ff;
      color: #4338ca;
      border: 1px solid #c7d2fe;
      padding: 3px 9px;
      border-radius: 9999px;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .doc-meta {
      text-align: right;
      font-size: 8.5pt;
      color: #64748b;
      line-height: 1.4;
    }

    .doc-meta strong {
      color: #0f172a;
    }

    /* Typography */
    h1 {
      font-size: 20pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin: 0 0 10px 0;
      line-height: 1.25;
    }

    h2 {
      font-size: 13.5pt;
      font-weight: 800;
      color: #1e293b;
      letter-spacing: -0.3px;
      margin: 22px 0 10px 0;
      padding-bottom: 6px;
      border-bottom: 1.5px solid #f1f5f9;
      page-break-after: avoid;
      break-after: avoid;
    }

    h3 {
      font-size: 11.5pt;
      font-weight: 700;
      color: #334155;
      margin: 16px 0 8px 0;
      page-break-after: avoid;
      break-after: avoid;
    }

    p {
      margin: 0 0 10px 0;
      color: #334155;
    }

    /* Lists */
    ul, ol {
      margin: 0 0 12px 0;
      padding-left: 20px;
    }

    li {
      margin-bottom: 4px;
      color: #334155;
    }

    strong {
      color: #0f172a;
      font-weight: 700;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 14px 0;
      font-size: 9.5pt;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.6px;
      padding: 10px 14px;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
    }

    td {
      padding: 9px 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
      vertical-align: top;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:nth-child(even) td {
      background-color: #fbfcfe;
    }

    /* Code Blocks & Inlines */
    code {
      font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    pre {
      background: #0f172a;
      color: #e2e8f0;
      padding: 14px 16px;
      border-radius: 8px;
      font-size: 8.5pt;
      line-height: 1.5;
      overflow-x: auto;
      margin: 12px 0;
      page-break-inside: avoid;
      break-inside: avoid;
      border: 1px solid #1e293b;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      border: none;
      font-size: inherit;
    }

    /* Dividers */
    hr {
      border: none;
      height: 1px;
      background: #e2e8f0;
      margin: 20px 0;
    }

    /* Links */
    a {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 600;
    }

    /* Footer Note */
    .doc-footer {
      margin-top: 36px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #94a3b8;
    }
  </style>
</head>
<body>

  <!-- Top Executive Header -->
  <div class="doc-header">
    <div class="doc-brand">
      <span class="doc-badge">Official Architecture & Operational Manual</span>
      <div style="font-size: 11pt; font-weight: 800; color: #4f46e5; margin-top: 4px;">CityWise Jaipur Platform</div>
    </div>
    <div class="doc-meta">
      <div><strong>Nagar Nigam Jaipur</strong> (Greater & Heritage)</div>
      <div>Project Repository Documentation (README)</div>
      <div>Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    </div>
  </div>

  <!-- Markdown Content -->
  <div class="content">
    ${contentHtml}
  </div>

  <!-- Footer -->
  <div class="doc-footer">
    <div>CityWise Jaipur | Smart Civic Reporting & Resolution System</div>
    <div>Confidential & Proprietary • Government of Rajasthan Civic Tech Stack</div>
  </div>

</body>
</html>`;

fs.writeFileSync(outputHtmlPath, fullHtml, 'utf8');
console.log('Generated styled HTML at:', outputHtmlPath);

// Execute Microsoft Edge Headless Print to PDF
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
console.log('Generating PDF via headless Edge...');

const printCmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${outputPdfPath}" "file:///${outputHtmlPath.replace(/\\\\/g, '/')}"`;

try {
  execSync(printCmd, { stdio: 'inherit' });
  console.log('Successfully created PDF at:', outputPdfPath);

  // Copy to frontend/public for web download
  const publicDir = path.join(rootDir, 'frontend', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.copyFileSync(outputPdfPath, publicPdfPath);
  console.log('Copied PDF to web public directory:', publicPdfPath);

  // Copy to artifact directory
  fs.copyFileSync(outputPdfPath, artifactPdfPath);
  console.log('Copied PDF to artifact directory:', artifactPdfPath);

  const stats = fs.statSync(outputPdfPath);
  console.log(`PDF generation complete! Size: ${(stats.size / 1024).toFixed(1)} KB`);
} catch (err) {
  console.error('Failed to generate PDF:', err.message);
  process.exit(1);
}
