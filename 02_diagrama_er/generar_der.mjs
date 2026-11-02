import fs from 'fs';
import { execSync } from 'child_process';

// 1. Crear el archivo SVG de alta definición para el Diagrama Entidad-Relación
const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1700 1150" width="1700" height="1150">
  <defs>
    <style>
      .title-main { font-family: 'Segoe UI', Arial, sans-serif; font-size: 24px; font-weight: 800; fill: #0f172a; }
      .title-sub { font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; fill: #64748b; }
      .table-header { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; font-weight: 700; fill: #ffffff; }
      .row-pk { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 11px; font-weight: 700; fill: #b91c1c; }
      .row-fk { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 11px; font-weight: 700; fill: #0284c7; }
      .row-col { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 11px; fill: #334155; }
      .row-type { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; fill: #64748b; }
      .line-rel { stroke: #0284c7; stroke-width: 2; fill: none; }
      .card-text { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 700; fill: #0369a1; }
      .legend-text { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; fill: #334155; }
    </style>
    <!-- Marcadores de Pata de Gallo (Crow's Foot) -->
    <marker id="crow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 0 0 L 8 5 L 0 10 M 8 1 L 8 9" fill="none" stroke="#0284c7" stroke-width="1.5" />
    </marker>
    <marker id="one" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 2 1 L 2 9 M 6 1 L 6 9" fill="none" stroke="#0284c7" stroke-width="1.5" />
    </marker>
  </defs>

  <!-- Fondo general -->
  <rect width="100%" height="100%" fill="#f8fafc" />

  <!-- Cabecera del Diagrama -->
  <rect x="40" y="30" width="1620" height="85" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
  <text x="65" y="68" class="title-main">DIAGRAMA ENTIDAD-RELACIÓN: SISTEMA DE INVENTARIO ADUANERO</text>
  <text x="65" y="94" class="title-sub">Bases de Datos | Laboratorio #3 | Notación Pata de Gallo (Crow's Foot) | Jared Prendas Ramírez</text>
  
  <!-- Leyenda informativa -->
  <rect x="1280" y="45" width="360" height="55" rx="6" fill="#f1f5f9" stroke="#cbd5e1" />
  <text x="1295" y="66" class="row-pk">[PK] Llave Primaria</text>
  <text x="1420" y="66" class="row-fk">[FK] Llave Foránea</text>
  <text x="1295" y="88" class="card-text">|| Exactamente 1    |&lt; 1 a Muchos (1:N)</text>

  <!-- ================= TABLAS (ENTIDADES) ================= -->

  <!-- 1. PAIS (x: 50, y: 150) -->
  <g transform="translate(50, 150)">
    <rect width="220" height="150" rx="6" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
    <rect width="220" height="30" rx="6" fill="#0284c7" />
    <rect y="24" width="220" height="6" fill="#0284c7" />
    <text x="110" y="20" class="table-header" text-anchor="middle">pais</text>
    <text x="12" y="52" class="row-pk">PK id_pais</text><text x="150" y="52" class="row-type">INT AI</text>
    <text x="12" y="74" class="row-col">nombre</text><text x="150" y="74" class="row-type">VARCHAR(80) UQ</text>
    <text x="12" y="96" class="row-col">codigo_iso</text><text x="150" y="96" class="row-type">CHAR(2) UQ</text>
    <text x="12" y="118" class="row-col">continente</text><text x="150" y="118" class="row-type">VARCHAR(40)</text>
    <text x="12" y="140" class="row-col">acuerdo_comercial</text><text x="150" y="140" class="row-type">BOOLEAN</text>
  </g>

  <!-- 2. AGENTE ADUANAL (x: 50, y: 350) -->
  <g transform="translate(50, 350)">
    <rect width="220" height="170" rx="6" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
    <rect width="220" height="30" rx="6" fill="#0284c7" />
    <rect y="24" width="220" height="6" fill="#0284c7" />
    <text x="110" y="20" class="table-header" text-anchor="middle">agente_aduanal</text>
    <text x="12" y="52" class="row-pk">PK id_agente</text><text x="150" y="52" class="row-type">INT AI</text>
    <text x="12" y="74" class="row-col">nombre_completo</text><text x="150" y="74" class="row-type">VARCHAR(120)</text>
    <text x="12" y="96" class="row-col">numero_licencia</text><text x="150" y="96" class="row-type">VARCHAR(30) UQ</text>
    <text x="12" y="118" class="row-col">agencia_aduanal</text><text x="150" y="118" class="row-type">VARCHAR(150)</text>
    <text x="12" y="140" class="row-col">telefono / correo</text><text x="150" y="140" class="row-type">VARCHAR(100)</text>
    <text x="12" y="162" class="row-col">estado_licencia</text><text x="150" y="162" class="row-type">VARCHAR(20)</text>
  </g>

  <!-- 3. OPERADOR COMERCIAL (x: 50, y: 570) -->
  <g transform="translate(50, 570)">
    <rect width="220" height="190" rx="6" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
    <rect width="220" height="30" rx="6" fill="#0284c7" />
    <rect y="24" width="220" height="6" fill="#0284c7" />
    <text x="110" y="20" class="table-header" text-anchor="middle">operador_comercial</text>
    <text x="12" y="52" class="row-pk">PK id_operador</text><text x="150" y="52" class="row-type">INT AI</text>
    <text x="12" y="74" class="row-col">razon_social</text><text x="150" y="74" class="row-type">VARCHAR(150)</text>
    <text x="12" y="96" class="row-col">identificacion_trib</text><text x="150" y="96" class="row-type">VARCHAR(30) UQ</text>
    <text x="12" y="118" class="row-col">tipo_operador</text><text x="150" y="118" class="row-type">VARCHAR(20)</text>
    <text x="12" y="140" class="row-col">direccion / tel</text><text x="150" y="140" class="row-type">VARCHAR(100)</text>
    <text x="12" y="162" class="row-col">correo</text><text x="150" y="162" class="row-type">VARCHAR(100) UQ</text>
    <text x="12" y="184" class="row-fk">FK id_pais_sede</text><text x="150" y="184" class="row-type">INT</text>
  </g>

  <!-- 4. DECLARACION ADUANERA (DUA) (x: 370, y: 350) - ENTIDAD CENTRAL -->
  <g transform="translate(370, 350)">
    <rect width="250" height="230" rx="6" fill="#ffffff" stroke="#b91c1c" stroke-width="2.5" />
    <rect width="250" height="32" rx="6" fill="#b91c1c" />
    <rect y="26" width="250" height="6" fill="#b91c1c" />
    <text x="125" y="21" class="table-header" text-anchor="middle">declaracion_aduanera</text>
    <text x="12" y="54" class="row-pk">PK id_declaracion</text><text x="175" y="54" class="row-type">INT AI</text>
    <text x="12" y="76" class="row-col">numero_dua</text><text x="175" y="76" class="row-type">VARCHAR(30) UQ</text>
    <text x="12" y="98" class="row-col">fecha_registro</text><text x="175" y="98" class="row-type">DATE</text>
    <text x="12" y="120" class="row-col">regimen</text><text x="175" y="120" class="row-type">VARCHAR(25)</text>
    <text x="12" y="142" class="row-col">estado</text><text x="175" y="142" class="row-type">VARCHAR(30)</text>
    <text x="12" y="164" class="row-col">total_cif_usd</text><text x="175" y="164" class="row-type">DECIMAL(14,2)</text>
    <text x="12" y="186" class="row-col">arancel_total_usd</text><text x="175" y="186" class="row-type">DECIMAL(14,2)</text>
    <text x="12" y="206" class="row-fk">FK id_operador</text><text x="175" y="206" class="row-type">INT</text>
    <text x="12" y="222" class="row-fk">FK id_agente, id_pais_origen</text>
  </g>

  <!-- 5. DETALLE DECLARACION (TABLA INTERMEDIA N:M) (x: 720, y: 350) -->
  <g transform="translate(720, 350)">
    <rect width="240" height="170" rx="6" fill="#ffffff" stroke="#7c3aed" stroke-width="2" />
    <rect width="240" height="30" rx="6" fill="#7c3aed" />
    <rect y="24" width="240" height="6" fill="#7c3aed" />
    <text x="120" y="20" class="table-header" text-anchor="middle">detalle_declaracion (N:M)</text>
    <text x="12" y="52" class="row-pk">PK id_detalle</text><text x="160" y="52" class="row-type">INT AI</text>
    <text x="12" y="74" class="row-fk">FK id_declaracion</text><text x="160" y="74" class="row-type">INT</text>
    <text x="12" y="96" class="row-fk">FK id_producto</text><text x="160" y="96" class="row-type">INT</text>
    <text x="12" y="118" class="row-col">cantidad</text><text x="160" y="118" class="row-type">INT (>0)</text>
    <text x="12" y="140" class="row-col">valor_declarado_usd</text><text x="160" y="140" class="row-type">DECIMAL(12,2)</text>
    <text x="12" y="162" class="row-col">arancel_aplicado_usd</text><text x="160" y="162" class="row-type">DECIMAL(12,2)</text>
  </g>

  <!-- 6. PRODUCTO (x: 1040, y: 350) -->
  <g transform="translate(1040, 350)">
    <rect width="230" height="190" rx="6" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
    <rect width="230" height="30" rx="6" fill="#0284c7" />
    <rect y="24" width="230" height="6" fill="#0284c7" />
    <text x="115" y="20" class="table-header" text-anchor="middle">producto</text>
    <text x="12" y="52" class="row-pk">PK id_producto</text><text x="155" y="52" class="row-type">INT AI</text>
    <text x="12" y="74" class="row-col">codigo_sku</text><text x="155" y="74" class="row-type">VARCHAR(40) UQ</text>
    <text x="12" y="96" class="row-col">descripcion</text><text x="155" y="96" class="row-type">VARCHAR(180)</text>
    <text x="12" y="118" class="row-col">unidad_medida</text><text x="155" y="118" class="row-type">VARCHAR(30)</text>
    <text x="12" y="140" class="row-col">valor_unitario_usd</text><text x="155" y="140" class="row-type">DECIMAL(12,2)</text>
    <text x="12" y="162" class="row-col">peso_unitario_kg</text><text x="155" y="162" class="row-type">DECIMAL(8,2)</text>
    <text x="12" y="184" class="row-fk">FK id_categoria</text><text x="155" y="184" class="row-type">INT</text>
  </g>

  <!-- 7. CATEGORIA ARANCELARIA (x: 1360, y: 350) -->
  <g transform="translate(1360, 350)">
    <rect width="240" height="150" rx="6" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
    <rect width="240" height="30" rx="6" fill="#0284c7" />
    <rect y="24" width="240" height="6" fill="#0284c7" />
    <text x="120" y="20" class="table-header" text-anchor="middle">categoria_arancelaria</text>
    <text x="12" y="52" class="row-pk">PK id_categoria</text><text x="160" y="52" class="row-type">INT AI</text>
    <text x="12" y="74" class="row-col">codigo_partida (SAC)</text><text x="160" y="74" class="row-type">VARCHAR(20) UQ</text>
    <text x="12" y="96" class="row-col">descripcion</text><text x="160" y="96" class="row-type">VARCHAR(255)</text>
    <text x="12" y="118" class="row-col">porcentaje_arancel</text><text x="160" y="118" class="row-type">DECIMAL(5,2)</text>
    <text x="12" y="140" class="row-col">requiere_permiso</text><text x="160" y="140" class="row-type">BOOLEAN</text>
  </g>

  <!-- 8. CONTENEDOR (x: 370, y: 150) -->
  <g transform="translate(370, 150)">
    <rect width="250" height="150" rx="6" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
    <rect width="250" height="30" rx="6" fill="#0284c7" />
    <rect y="24" width="250" height="6" fill="#0284c7" />
    <text x="125" y="20" class="table-header" text-anchor="middle">contenedor</text>
    <text x="12" y="52" class="row-pk">PK id_contenedor</text><text x="175" y="52" class="row-type">INT AI</text>
    <text x="12" y="74" class="row-col">numero_contenedor</text><text x="175" y="74" class="row-type">VARCHAR(20) UQ</text>
    <text x="12" y="96" class="row-col">tipo_contenedor</text><text x="175" y="96" class="row-type">VARCHAR(30)</text>
    <text x="12" y="118" class="row-col">peso_bruto_kg</text><text x="175" y="118" class="row-type">DECIMAL(10,2)</text>
    <text x="12" y="140" class="row-fk">FK id_declaracion</text><text x="175" y="140" class="row-type">INT</text>
  </g>

  <!-- 9. INSPECCION (x: 370, y: 650) -->
  <g transform="translate(370, 650)">
    <rect width="250" height="170" rx="6" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
    <rect width="250" height="30" rx="6" fill="#0284c7" />
    <rect y="24" width="250" height="6" fill="#0284c7" />
    <text x="125" y="20" class="table-header" text-anchor="middle">inspeccion</text>
    <text x="12" y="52" class="row-pk">PK id_inspeccion</text><text x="175" y="52" class="row-type">INT AI</text>
    <text x="12" y="74" class="row-col">fecha_inspeccion</text><text x="175" y="74" class="row-type">DATETIME</text>
    <text x="12" y="96" class="row-col">canal_asignado</text><text x="175" y="96" class="row-type">ENUM(V,A,R)</text>
    <text x="12" y="118" class="row-col">resultado</text><text x="175" y="118" class="row-type">VARCHAR(30)</text>
    <text x="12" y="140" class="row-fk">FK id_declaracion</text><text x="175" y="140" class="row-type">INT</text>
    <text x="12" y="162" class="row-fk">FK id_funcionario</text><text x="175" y="162" class="row-type">INT</text>
  </g>

  <!-- 10. FUNCIONARIO (CON RELACIÓN RECURSIVA SUPERVISOR) (x: 370, y: 890) -->
  <g transform="translate(370, 890)">
    <rect width="250" height="200" rx="6" fill="#ffffff" stroke="#059669" stroke-width="2.5" />
    <rect width="250" height="32" rx="6" fill="#059669" />
    <rect y="26" width="250" height="6" fill="#059669" />
    <text x="125" y="21" class="table-header" text-anchor="middle">funcionario (Recursiva)</text>
    <text x="12" y="54" class="row-pk">PK id_funcionario</text><text x="175" y="54" class="row-type">INT AI</text>
    <text x="12" y="76" class="row-col">nombre_completo</text><text x="175" y="76" class="row-type">VARCHAR(120)</text>
    <text x="12" y="98" class="row-col">codigo_empleado</text><text x="175" y="98" class="row-type">VARCHAR(20) UQ</text>
    <text x="12" y="120" class="row-col">cargo</text><text x="175" y="120" class="row-type">VARCHAR(80)</text>
    <text x="12" y="142" class="row-col">departamento</text><text x="175" y="142" class="row-type">VARCHAR(80)</text>
    <text x="12" y="164" class="row-col">correo_institucional</text><text x="175" y="164" class="row-type">VARCHAR(100) UQ</text>
    <text x="12" y="188" class="row-fk" style="fill:#059669;">FK id_supervisor [Rec]</text><text x="175" y="188" class="row-type">INT NULL</text>
  </g>

  <!-- 11. BODEGA / DEPÓSITO (x: 1040, y: 650) -->
  <g transform="translate(1040, 650)">
    <rect width="230" height="170" rx="6" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
    <rect width="230" height="30" rx="6" fill="#0284c7" />
    <rect y="24" width="230" height="6" fill="#0284c7" />
    <text x="115" y="20" class="table-header" text-anchor="middle">bodega</text>
    <text x="12" y="52" class="row-pk">PK id_bodega</text><text x="155" y="52" class="row-type">INT AI</text>
    <text x="12" y="74" class="row-col">codigo_bodega</text><text x="155" y="74" class="row-type">VARCHAR(20) UQ</text>
    <text x="12" y="96" class="row-col">nombre</text><text x="155" y="96" class="row-type">VARCHAR(100)</text>
    <text x="12" y="118" class="row-col">ubicacion</text><text x="155" y="118" class="row-type">VARCHAR(150)</text>
    <text x="12" y="140" class="row-col">capacidad_max_m3</text><text x="155" y="140" class="row-type">DECIMAL(10,2)</text>
    <text x="12" y="162" class="row-col">temperatura_control</text><text x="155" y="162" class="row-type">BOOLEAN</text>
  </g>

  <!-- 12. INVENTARIO STOCK (x: 720, y: 650) -->
  <g transform="translate(720, 650)">
    <rect width="240" height="200" rx="6" fill="#ffffff" stroke="#d97706" stroke-width="2" />
    <rect width="240" height="30" rx="6" fill="#d97706" />
    <rect y="24" width="240" height="6" fill="#d97706" />
    <text x="120" y="20" class="table-header" text-anchor="middle">inventario_stock</text>
    <text x="12" y="52" class="row-pk">PK id_stock</text><text x="160" y="52" class="row-type">INT AI</text>
    <text x="12" y="74" class="row-fk">FK id_bodega</text><text x="160" y="74" class="row-type">INT</text>
    <text x="12" y="96" class="row-fk">FK id_producto</text><text x="160" y="96" class="row-type">INT</text>
    <text x="12" y="118" class="row-fk">FK id_declaracion</text><text x="160" y="118" class="row-type">INT</text>
    <text x="12" y="140" class="row-col">cantidad</text><text x="160" y="140" class="row-type">INT (>=0)</text>
    <text x="12" y="162" class="row-col">fecha_ingreso</text><text x="160" y="162" class="row-type">DATETIME</text>
    <text x="12" y="184" class="row-col">estado_stock</text><text x="160" y="184" class="row-type">VARCHAR(30)</text>
  </g>

  <!-- 13. MOVIMIENTO INVENTARIO (x: 1040, y: 890) -->
  <g transform="translate(1040, 890)">
    <rect width="240" height="190" rx="6" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
    <rect width="240" height="30" rx="6" fill="#0284c7" />
    <rect y="24" width="240" height="6" fill="#0284c7" />
    <text x="120" y="20" class="table-header" text-anchor="middle">movimiento_inventario</text>
    <text x="12" y="52" class="row-pk">PK id_movimiento</text><text x="160" y="52" class="row-type">INT AI</text>
    <text x="12" y="74" class="row-col">tipo_movimiento</text><text x="160" y="74" class="row-type">VARCHAR(25)</text>
    <text x="12" y="96" class="row-col">cantidad</text><text x="160" y="96" class="row-type">INT (>0)</text>
    <text x="12" y="118" class="row-fk">FK id_producto</text><text x="160" y="118" class="row-type">INT</text>
    <text x="12" y="140" class="row-fk">FK id_bodega_origen</text><text x="160" y="140" class="row-type">INT NULL</text>
    <text x="12" y="162" class="row-fk">FK id_bodega_destino</text><text x="160" y="162" class="row-type">INT NULL</text>
    <text x="12" y="184" class="row-fk">FK id_funcionario</text><text x="160" y="184" class="row-type">INT</text>
  </g>

  <!-- ================= LÍNEAS DE RELACIÓN Y CARDINALIDADES ================= -->

  <!-- 1:N pais -> declaracion_aduanera -->
  <path d="M 270 210 L 320 210 L 320 400 L 370 400" class="line-rel" marker-start="url(#one)" marker-end="url(#crow)" />
  <text x="285" y="202" class="card-text">1</text><text x="345" y="392" class="card-text">N</text>

  <!-- 1:N agente_aduanal -> declaracion_aduanera -->
  <path d="M 270 420 L 370 420" class="line-rel" marker-start="url(#one)" marker-end="url(#crow)" />
  <text x="285" y="412" class="card-text">1</text><text x="345" y="412" class="card-text">N</text>

  <!-- 1:N operador_comercial -> declaracion_aduanera -->
  <path d="M 270 610 L 320 610 L 320 480 L 370 480" class="line-rel" marker-start="url(#one)" marker-end="url(#crow)" />
  <text x="285" y="602" class="card-text">1</text><text x="345" y="472" class="card-text">N</text>

  <!-- 1:N declaracion_aduanera -> contenedor -->
  <path d="M 495 350 L 495 300" class="line-rel" marker-start="url(#one)" marker-end="url(#crow)" />
  <text x="505" y="335" class="card-text">1</text><text x="505" y="315" class="card-text">N</text>

  <!-- 1:N declaracion_aduanera -> detalle_declaracion (N:M lado Izq) -->
  <path d="M 620 430 L 720 430" class="line-rel" marker-start="url(#one)" marker-end="url(#crow)" />
  <text x="635" y="422" class="card-text">1</text><text x="695" y="422" class="card-text">N</text>

  <!-- 1:N producto -> detalle_declaracion (N:M lado Der) -->
  <path d="M 1040 430 L 960 430" class="line-rel" marker-start="url(#one)" marker-end="url(#crow)" />
  <text x="1015" y="422" class="card-text">1</text><text x="975" y="422" class="card-text">N</text>

  <!-- 1:N categoria_arancelaria -> producto -->
  <path d="M 1360 430 L 1270 430" class="line-rel" marker-start="url(#one)" marker-end="url(#crow)" />
  <text x="1335" y="422" class="card-text">1</text><text x="1285" y="422" class="card-text">N</text>

  <!-- 1:N declaracion_aduanera -> inspeccion -->
  <path d="M 495 580 L 495 650" class="line-rel" marker-start="url(#one)" marker-end="url(#crow)" />
  <text x="505" y="600" class="card-text">1</text><text x="505" y="635" class="card-text">N</text>

  <!-- 1:N funcionario -> inspeccion -->
  <path d="M 495 890 L 495 820" class="line-rel" marker-start="url(#one)" marker-end="url(#crow)" />
  <text x="505" y="875" class="card-text">1</text><text x="505" y="840" class="card-text">N</text>

  <!-- Relación Recursiva en funcionario (supervisor) -->
  <path d="M 620 950 C 670 950, 670 1020, 620 1020" class="line-rel" style="stroke:#059669;" marker-start="url(#one)" marker-end="url(#crow)" />
  <text x="675" y="990" class="card-text" style="fill:#059669;">1:N (Supervisor)</text>

  <!-- 1:N bodega -> inventario_stock -->
  <path d="M 1040 730 L 960 730" class="line-rel" marker-start="url(#one)" marker-end="url(#crow)" />
  <text x="1015" y="722" class="card-text">1</text><text x="975" y="722" class="card-text">N</text>

  <!-- 1:N producto -> inventario_stock -->
  <path d="M 1100 540 L 1100 590 L 850 590 L 850 650" class="line-rel" marker-start="url(#one)" marker-end="url(#crow)" />
  <text x="1108" y="560" class="card-text">1</text><text x="860" y="635" class="card-text">N</text>

  <!-- 1:N declaracion_aduanera -> inventario_stock -->
  <path d="M 620 520 L 750 520 L 750 650" class="line-rel" marker-start="url(#one)" marker-end="url(#crow)" />
  <text x="640" y="512" class="card-text">1</text><text x="760" y="635" class="card-text">N</text>

  <!-- 1:N bodega -> movimiento_inventario (origen y destino) -->
  <path d="M 1150 820 L 1150 890" class="line-rel" marker-start="url(#one)" marker-end="url(#crow)" />
  <text x="1158" y="840" class="card-text">1</text><text x="1158" y="875" class="card-text">N</text>

  <!-- 1:N funcionario -> movimiento_inventario -->
  <path d="M 620 1050 L 1040 1050" class="line-rel" marker-start="url(#one)" marker-end="url(#crow)" />
  <text x="640" y="1042" class="card-text">1</text><text x="1010" y="1042" class="card-text">N</text>

</svg>`;

// Guardar SVG
const svgPath = '/Users/osariii/Documents/lab-3/02_diagrama_er/Prendas_Jared_DER_Lab3.svg';
fs.writeFileSync(svgPath, svgContent, 'utf8');
console.log('SVG generado:', svgPath);

// 2. Renderizar SVG a PNG de alta resolución usando Google Chrome Headless
const htmlWrapper = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8fafc;"><img src="${svgPath}" width="1700" height="1150" /></body></html>`;
const tempHtml = '/tmp/render_der.html';
fs.writeFileSync(tempHtml, htmlWrapper, 'utf8');

const pngOut1 = '/Users/osariii/Documents/lab-3/02_diagrama_er/Prendas_Jared_DER_Lab3.png';
const pngOut2 = '/Users/osariii/Documents/lab-3/entregables/Prendas_Jared_DER_Lab3.png';

const chromeBin = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
execSync(`"${chromeBin}" --headless --disable-gpu --window-size=1720,1180 --screenshot="${pngOut1}" "${tempHtml}"`, { stdio: 'inherit' });
fs.copyFileSync(pngOut1, pngOut2);
console.log('PNG generado exitosamente en:', pngOut1, 'y', pngOut2);
