import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Markdown simplificado a HTML con tipografía académica elegante
const mdPath = '/Users/osariii/Documents/lab-3/01_investigacion/INVESTIGACION_TEORICA.md';
const content = fs.readFileSync(mdPath, 'utf8');

// Conversión estructurada
function markdownToHtml(md) {
  let html = md
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>');

  // Listas y tablas básicas
  const lines = html.split('\n');
  let inList = false;
  let inTable = false;
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
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (!inTable) {
          result.push('<table class="data-table">');
          inTable = true;
        }
        if (trimmed.includes('---')) continue; // separador de cabecera
        const cols = trimmed.split('|').slice(1, -1).map(c => c.trim());
        const isHeader = result[result.length - 1] === '<table class="data-table">';
        const tag = isHeader ? 'th' : 'td';
        result.push('<tr>' + cols.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>');
      } else {
        if (inTable) {
          result.push('</table>');
          inTable = false;
        }
        if (trimmed === '---') {
          result.push('<hr/>');
        } else if (trimmed.length > 0 && !trimmed.startsWith('<h') && !trimmed.startsWith('<blockquote')) {
          result.push(`<p>${trimmed}</p>`);
        } else if (trimmed.length > 0) {
          result.push(trimmed);
        }
      }
    }
  }
  if (inList) result.push('</ul>');
  if (inTable) result.push('</table>');

  return result.join('\n');
}

const bodyHtml = markdownToHtml(content);

const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Laboratorio #3 - Investigación de Bases de Datos y Aduana</title>
  <style>
    @page {
      size: letter;
      margin: 20mm 18mm 20mm 18mm;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.55;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .header-box {
      border-bottom: 3px solid #0284c7;
      padding-bottom: 14px;
      margin-bottom: 22px;
    }
    h1 {
      color: #0f172a;
      font-size: 18pt;
      margin: 0 0 4px 0;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    h2 {
      color: #0369a1;
      font-size: 13.5pt;
      margin: 18px 0 8px 0;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 4px;
      page-break-after: avoid;
    }
    h3 {
      color: #0f172a;
      font-size: 11.5pt;
      margin: 14px 0 6px 0;
      page-break-after: avoid;
    }
    h4 {
      color: #334155;
      font-size: 10.5pt;
      margin: 10px 0 4px 0;
      page-break-after: avoid;
    }
    p {
      margin: 0 0 8px 0;
      text-align: justify;
    }
    ul {
      margin: 4px 0 10px 20px;
      padding: 0;
    }
    li {
      margin-bottom: 4px;
    }
    blockquote {
      border-left: 4px solid #0284c7;
      background: #f0f9ff;
      margin: 10px 0;
      padding: 8px 14px;
      font-style: italic;
      color: #0369a1;
      border-radius: 0 4px 4px 0;
    }
    code {
      background: #f1f5f9;
      color: #0f172a;
      padding: 1px 5px;
      border-radius: 4px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 9pt;
      border: 1px solid #e2e8f0;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: left;
    }
    table.data-table th {
      background: #f8fafc;
      color: #0f172a;
      font-weight: 700;
    }
    table.data-table tr:nth-child(even) {
      background: #f8fafc;
    }
    hr {
      border: none;
      border-top: 1px solid #cbd5e1;
      margin: 18px 0;
    }
    .badge {
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 8.5pt;
      font-weight: 600;
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;

const tempHtmlPath = '/tmp/documento_investigacion.html';
fs.writeFileSync(tempHtmlPath, fullHtml, 'utf8');

const outputPdf1 = '/Users/osariii/Documents/lab-3/01_investigacion/Prendas_Jared_Investigacion_Lab3.pdf';
const outputPdf2 = '/Users/osariii/Documents/lab-3/entregables/Prendas_Jared_Investigacion_Lab3.pdf';

const chromeBin = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
console.log('Compilando PDF con Google Chrome Headless...');

execSync(`"${chromeBin}" --headless --disable-gpu --print-to-pdf="${outputPdf1}" --no-pdf-header-footer "${tempHtmlPath}"`, { stdio: 'inherit' });
fs.copyFileSync(outputPdf1, outputPdf2);

console.log(`PDF generado con éxito en:\n- ${outputPdf1}\n- ${outputPdf2}`);
