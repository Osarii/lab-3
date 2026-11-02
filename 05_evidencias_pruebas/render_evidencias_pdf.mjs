import fs from 'fs';
import { execSync } from 'child_process';

const mdPath = '/Users/osariii/Documents/lab-3/05_evidencias_pruebas/EVIDENCIAS_TESTING.md';
const content = fs.readFileSync(mdPath, 'utf8');

function markdownToHtml(md) {
  let html = md
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/```sql([\s\S]*?)```/gim, '<pre class="code-box"><code>$1</code></pre>')
    .replace(/```([\s\S]*?)```/gim, '<pre class="code-box"><code>$1</code></pre>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>');

  const lines = html.split('\n');
  let inList = false;
  let result = [];

  for (let line of lines) {
    let trimmed = line.trim();
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push(`<li>${trimmed.substring(2)}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (trimmed === '---') {
        result.push('<hr/>');
      } else if (trimmed.length > 0 && !trimmed.startsWith('<h') && !trimmed.startsWith('<blockquote') && !trimmed.startsWith('<pre') && !trimmed.startsWith('<code>') && !trimmed.startsWith('</pre>')) {
        result.push(`<p>${trimmed}</p>`);
      } else if (trimmed.length > 0) {
        result.push(trimmed);
      }
    }
  }
  if (inList) result.push('</ul>');
  return result.join('\n');
}

const bodyHtml = markdownToHtml(content);

const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Evidencias de Evaluación - Agente n8n Lab 3</title>
  <style>
    @page {
      size: letter;
      margin: 18mm 18mm 18mm 18mm;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    h1 {
      color: #0f172a;
      font-size: 17pt;
      margin: 0 0 4px 0;
      font-weight: 800;
    }
    h2 {
      color: #0369a1;
      font-size: 12.5pt;
      margin: 4px 0 16px 0;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 6px;
    }
    h3 {
      color: #0f172a;
      font-size: 11pt;
      margin: 16px 0 6px 0;
      background: #f1f5f9;
      padding: 6px 10px;
      border-left: 4px solid #0284c7;
      border-radius: 0 4px 4px 0;
      page-break-after: avoid;
    }
    p {
      margin: 0 0 6px 0;
      text-align: justify;
    }
    ul {
      margin: 4px 0 8px 18px;
      padding: 0;
    }
    li {
      margin-bottom: 3px;
    }
    blockquote {
      border-left: 3px solid #059669;
      background: #f0fdf4;
      margin: 6px 0 10px 0;
      padding: 6px 12px;
      font-style: italic;
      color: #065f46;
      border-radius: 0 4px 4px 0;
    }
    pre.code-box {
      background: #0f172a;
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 8.5pt;
      line-height: 1.45;
      overflow-x: auto;
      margin: 6px 0 10px 0;
      page-break-inside: avoid;
    }
    code {
      font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
    }
    p code {
      background: #f1f5f9;
      color: #0f172a;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 8.5pt;
      border: 1px solid #e2e8f0;
    }
    hr {
      border: none;
      border-top: 1px dashed #cbd5e1;
      margin: 16px 0;
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;

const tempHtml = '/tmp/documento_evidencias.html';
fs.writeFileSync(tempHtml, fullHtml, 'utf8');

const out1 = '/Users/osariii/Documents/lab-3/05_evidencias_pruebas/Prendas_Jared_Evidencia_Lab3.pdf';
const out2 = '/Users/osariii/Documents/lab-3/entregables/Prendas_Jared_Evidencia_Lab3.pdf';

const chromeBin = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
console.log('Compilando PDF de Evidencias...');
execSync(`"${chromeBin}" --headless --disable-gpu --print-to-pdf="${out1}" --no-pdf-header-footer "${tempHtml}"`, { stdio: 'inherit' });
fs.copyFileSync(out1, out2);
console.log('Evidencias generadas en:', out1, 'y', out2);
