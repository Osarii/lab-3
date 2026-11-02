// Datos sincronizados con el script SQL de MySQL 8.0
const retenidosData = [
  { bodega: "BOD-CAL-02 (Bodega 2)", pais: "China", dua: "DUA-2026-0002", sku: "LAP-LEN-T14", desc: "Laptop Lenovo ThinkPad T14", cant: 60, estado: "Retenido", obs: "Falta de factura comercial original" },
  { bodega: "BOD-CAL-02 (Bodega 2)", pais: "China", dua: "DUA-2026-0002", sku: "LAP-APL-M3", desc: "Apple MacBook Air 15 M3", cant: 40, estado: "Retenido", obs: "Discrepancia en valor CIF declarado" },
  { bodega: "BOD-CAL-02 (Bodega 2)", pais: "China", dua: "DUA-2026-0006", sku: "TV-LG-OLED65", desc: "Smart TV 65 OLED 4K", cant: 50, estado: "Retenido", obs: "Aforo físico rojo con observaciones" },
  { bodega: "BOD-CAL-02 (Bodega 2)", pais: "China", dua: "DUA-2026-0006", sku: "AC-SPLIT-INVER", desc: "Aire Acondicionado Inverter", cant: 20, estado: "Retenido", obs: "Certificado de eficiencia energética pendiente" },
  { bodega: "BOD-CAL-02 (Bodega 2)", pais: "China", dua: "DUA-2026-0016", sku: "SMART-SAM-S24", desc: "Samsung Galaxy S24 Ultra", cant: 60, estado: "Retenido", obs: "Diferencia de 20 unidades en manifiesto" },
  { bodega: "BOD-MOI-02 (Moin Frío)", pais: "España", dua: "DUA-2026-0004", sku: "MED-AMOXI-500", desc: "Amoxicilina 500mg (Cajas)", cant: 1000, estado: "Retenido", obs: "Falta permiso del Ministerio de Salud" },
  { bodega: "BOD-MOI-02 (Moin Frío)", pais: "España", dua: "DUA-2026-0004", sku: "MED-INSUL-GLA", desc: "Insulina Glargina Solución", cant: 500, estado: "Retenido", obs: "Cadena de frío en revisión técnica" },
  { bodega: "BOD-MOI-02 (Moin Frío)", pais: "EE.UU.", dua: "DUA-2026-0013", sku: "CARN-CORTE-RIB", desc: "Corte Fino Ribeye Angus Congelado", cant: 200, estado: "Retenido", obs: "Inspección fitosanitaria SENASA pendiente" },
  { bodega: "BOD-SJO-02 (La Uruca)", pais: "China", dua: "DUA-2026-0011", sku: "SMART-IPH-16P", desc: "iPhone 16 Pro 128GB", cant: 80, estado: "Retenido", obs: "En depósito fiscal pendiente de nacionalización" },
  { bodega: "BOD-FAR-01 (Metropolitana)", pais: "España", dua: "DUA-2026-0010", sku: "VIN-RIOJA-RES", desc: "Vino Rioja Reserva (Cajas)", cant: 180, estado: "Retenido", obs: "Sin registro sanitario de timbres fiscales" }
];

// Pestañas
function switchTab(tabId) {
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  
  document.getElementById('tab-' + tabId).classList.add('active');
  const index = tabId === 'dashboard' ? 0 : tabId === 'agent' ? 1 : 2;
  document.querySelectorAll('.nav-item')[index].classList.add('active');
}

// Llenar tabla de retenidos
function populateTable() {
  const tbody = document.getElementById('table-body-retenidos');
  if (!tbody) return;
  tbody.innerHTML = retenidosData.map(r => `
    <tr>
      <td><strong>${r.bodega}</strong></td>
      <td>${r.pais}</td>
      <td><code>${r.dua}</code></td>
      <td><code>${r.sku}</code></td>
      <td>${r.desc}</td>
      <td><strong>${r.cant}</strong></td>
      <td><span class="badge-retenido">${r.estado}</span></td>
      <td>${r.obs}</td>
    </tr>
  `).join('');
}

// Inicializar Gráficos con Chart.js
function initCharts() {
  const ctxPaises = document.getElementById('chartPaises')?.getContext('2d');
  if (ctxPaises) {
    new Chart(ctxPaises, {
      type: 'bar',
      data: {
        labels: ['China', 'EE.UU.', 'Alemania', 'Japón', 'España', 'Vietnam', 'Corea'],
        datasets: [
          {
            label: 'Contenedores (Unidades)',
            data: [7, 3, 2, 1, 1, 1, 1],
            backgroundColor: '#0284c7'
          },
          {
            label: 'Peso Bruto (Toneladas)',
            data: [147.4, 59.2, 50.4, 25.6, 16.7, 19.8, 11.4],
            backgroundColor: '#38bdf8'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#94a3b8' } }
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
        }
      }
    });
  }

  const ctxEstados = document.getElementById('chartEstados')?.getContext('2d');
  if (ctxEstados) {
    new Chart(ctxEstados, {
      type: 'doughnut',
      data: {
        labels: ['Mercancías Retenidas', 'Mercancías Liberadas', 'En Cuarentena / Muestra', 'Despachado / Tránsito'],
        datasets: [{
          data: [11, 4, 3, 2],
          backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#0284c7']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#94a3b8' }, position: 'bottom' }
        }
      }
    });
  }
}

// Simulación del Agente de IA Aduanero
function sendQuickPrompt(text) {
  const input = document.getElementById('chat-input');
  if (input) {
    input.value = text;
    sendMessage();
  }
}

function handleKey(e) {
  if (e.key === 'Enter') sendMessage();
}

function appendMessage(sender, htmlText) {
  const chatMessages = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}`;
  msgDiv.innerHTML = `<div class="msg-bubble">${htmlText}</div>`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const query = input.value.trim();
  if (!query) return;

  appendMessage('user', query);
  input.value = '';

  // Respuesta inteligente basada en la consulta
  setTimeout(() => {
    let sql = "";
    let answer = "";
    const qLower = query.toLowerCase();

    if (qLower.includes('china') && qLower.includes('bodega 2')) {
      sql = `SELECT pr.descripcion, inv.cantidad, inv.estado_stock, inv.observacion\\nFROM inventario_stock inv\\nJOIN bodega b ON inv.id_bodega = b.id_bodega\\nJOIN producto pr ON inv.id_producto = pr.id_producto\\nJOIN declaracion_aduanera d ON inv.id_declaracion = d.id_declaracion\\nJOIN pais p ON d.id_pais_origen = p.id_pais\\nWHERE p.nombre = 'China' AND b.id_bodega = 2 AND inv.estado_stock = 'Retenido';`;
      answer = `Actualmente en la <strong>Bodega 2 (Depósito de Carga Retenida Caldera)</strong> se encuentran retenidas las siguientes mercancías procedentes de China:<br>
      • <strong>60 unidades</strong> de Smartphones Samsung Galaxy S24 Ultra (DUA-2026-0016).<br>
      • <strong>50 unidades</strong> de Televisores Smart TV 65'' OLED (DUA-2026-0006).<br>
      • <strong>20 unidades</strong> de Aires Acondicionados Split (DUA-2026-0006).<br>
      <em>Motivo común:</em> Inspección física roja y certificados pendientes.`;
    } else if (qLower.includes('octubre')) {
      sql = `SELECT COUNT(*) AS total_declaraciones, SUM(total_cif_usd) AS valor_cif\\nFROM declaracion_aduanera\\nWHERE regimen = 'Importacion' AND fecha_registro BETWEEN '2026-10-01' AND '2026-10-31';`;
      answer = `En octubre de 2026 se registraron <strong>12 declaraciones de importación</strong> por un valor total CIF declarado de <strong>$778,900.00 USD</strong> y aranceles recaudados por <strong>$126,945.00 USD</strong>.`;
    } else if (qLower.includes('país') || qLower.includes('pais') || qLower.includes('contenedores')) {
      sql = `SELECT p.nombre, COUNT(c.id_contenedor) AS total_contenedores, SUM(c.peso_bruto_kg) AS peso_kg\\nFROM contenedor c\\nJOIN declaracion_aduanera d ON c.id_declaracion = d.id_declaracion\\nJOIN pais p ON d.id_pais_origen = p.id_pais\\nGROUP BY p.id_pais ORDER BY total_contenedores DESC LIMIT 1;`;
      answer = `El país con más contenedores recibidos es <strong>China</strong> con <strong>7 contenedores</strong> y un peso total registrado de <strong>147,450 kg (147.45 toneladas)</strong>.`;
    } else if (qLower.includes('dua-2026-0004') || qLower.includes('supervisor')) {
      sql = `SELECT f.nombre_completo AS inspector, sup.nombre_completo AS supervisor\\nFROM inspeccion i\\nJOIN declaracion_aduanera d ON i.id_declaracion = d.id_declaracion\\nJOIN funcionario f ON i.id_funcionario = f.id_funcionario\\nLEFT JOIN funcionario sup ON f.id_supervisor = sup.id_funcionario\\nWHERE d.numero_dua = 'DUA-2026-0004';`;
      answer = `La inspección de la DUA-2026-0004 fue realizada por <strong>Mónica Quirós Chaves</strong> (Inspectora Química Farmacéutica). Su supervisora inmediata es <strong>Laura Benavides Solís</strong> (Supervisora de Fiscalización Normativa).`;
    } else {
      sql = `SELECT * FROM inventario_stock WHERE estado_stock = 'Retenido' LIMIT 5;`;
      answer = `He consultado la base de datos de inventario aduanero. Para tu consulta específica se analizaron los registros correspondientes en las tablas relacionadas.`;
    }

    const responseHtml = `${answer}<div class="sql-block"><strong>Consulta SQL ejecutada (SELECT de solo lectura):</strong><br>${sql}</div>`;
    appendMessage('bot', responseHtml);
  }, 600);
}

document.addEventListener('DOMContentLoaded', () => {
  populateTable();
  initCharts();
});
