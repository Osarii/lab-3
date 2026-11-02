# EVIDENCIA DE EVALUACIÓN Y PRUEBAS DEL AGENTE DE IA EN n8n
## Sistema de Inventario para una Aduana - Laboratorio #3

* **Estudiante:** Jared Prendas Ramírez  
* **Asignatura:** Bases de Datos  
* **Flujo Evaluado:** `Prendas_Jared_Agente_Lab3.json`  
* **Motor de Base de Datos:** MySQL 8.0 (`aduana_inventario`) con usuario `aduanas_readonly`  
* **Modelo de Lenguaje:** Google Gemini 1.5 Flash / OpenAI GPT-4o  

---

### PRUEBA 1: Volumen y Valor de Declaraciones en Octubre 2026

* **Pregunta del Usuario:**  
  > *"¿Cuántas declaraciones de importación se registraron en octubre de 2026 y cuál fue el valor total declarado?"*
* **Razonamiento del Agente:**  
  El usuario solicita un cálculo cuantitativo filtrado por régimen ('Importacion') y un rango de fechas correspondiente a octubre de 2026. Invocaré la herramienta de base de datos con una consulta agregada sobre `declaracion_aduanera`.
* **Consulta SQL Generada:**  
  ```sql
  SELECT 
      COUNT(*) AS total_declaraciones, 
      SUM(total_cif_usd) AS valor_cif_total_usd,
      SUM(arancel_total_usd) AS total_aranceles_usd
  FROM declaracion_aduanera
  WHERE regimen = 'Importacion'
    AND fecha_registro BETWEEN '2026-10-01' AND '2026-10-31';
  ```
* **Respuesta Cruda de la Base de Datos:**  
  `{"total_declaraciones": 12, "valor_cif_total_usd": 778900.00, "total_aranceles_usd": 126945.00}`
* **Respuesta Sintetizada del Agente:**  
  > *"Durante el mes de octubre de 2026 se registraron un total de **12 declaraciones aduaneras bajo el régimen de Importación**. El valor total declarado (CIF) de estas importaciones ascendió a **$778,900.00 USD**, generando una recaudación arancelaria proyectada de **$126,945.00 USD**."*

---

### PRUEBA 2: Mercancías Retenidas en Bodega 2 Procedentes de China

* **Pregunta del Usuario:**  
  > *"¿Qué mercancías procedentes de China siguen retenidas en la bodega 2 y cuál es el motivo?"*
* **Razonamiento del Agente:**  
  Debo cruzar `inventario_stock`, `bodega`, `producto`, `declaracion_aduanera` y `pais`, filtrando por país 'China', bodega 'BOD-CAL-02' (Bodega 2) y estado 'Retenido'.
* **Consulta SQL Generada:**  
  ```sql
  SELECT 
      pr.codigo_sku,
      pr.descripcion AS producto,
      inv.cantidad AS unidades_retenidas,
      d.numero_dua,
      inv.observacion
  FROM inventario_stock inv
  JOIN bodega b ON inv.id_bodega = b.id_bodega
  JOIN producto pr ON inv.id_producto = pr.id_producto
  JOIN declaracion_aduanera d ON inv.id_declaracion = d.id_declaracion
  JOIN pais p ON d.id_pais_origen = p.id_pais
  WHERE p.nombre = 'China'
    AND (b.id_bodega = 2 OR b.codigo_bodega = 'BOD-CAL-02' OR b.nombre LIKE '%Bodega 2%')
    AND inv.estado_stock = 'Retenido';
  ```
* **Respuesta Cruda de la Base de Datos:**  
  1. `SMART-SAM-S24`: 60 unidades (DUA-2026-0016) | Observación: *Mercancía nueva de China retenida en Bodega 2 por aforo documental*.
  2. `TV-LG-OLED65`: 50 unidades (DUA-2026-0006) | Observación: *Mercancía de China retenida en Bodega 2 por inspección física roja*.
  3. `AC-SPLIT-INVER`: 20 unidades (DUA-2026-0006) | Observación: *Aires acondicionados retenidos por certificado de eficiencia energética*.
* **Respuesta Sintetizada del Agente:**  
  > *"En la **Bodega 2 (Depósito de Carga Retenida Caldera)** se encuentran actualmente retenidas 3 mercancías de origen chino:*  
  > *1. **60 unidades de Smartphones Samsung Galaxy S24** (DUA-2026-0016) retenidas por aforo documental pendiente.*  
  > *2. **50 unidades de Smart TV 65'' OLED** (DUA-2026-0006) retenidas por inspección física de canal rojo.*  
  > *3. **20 unidades de Aires Acondicionados Split** (DUA-2026-0006) retenidas por falta de certificado de eficiencia energética."*

---

### PRUEBA 3: País de Origen con Mayor Número de Contenedores

* **Pregunta del Usuario:**  
  > *"¿Cuál es el país de origen que ha enviado la mayor cantidad de contenedores y cuánto peso representa?"*
* **Razonamiento del Agente:**  
  Cruzaré `contenedor`, `declaracion_aduanera` y `pais`, agrupando por país y ordenando de forma descendente por la cantidad de contenedores.
* **Consulta SQL Generada:**  
  ```sql
  SELECT 
      p.nombre AS pais,
      COUNT(c.id_contenedor) AS total_contenedores,
      SUM(c.peso_bruto_kg) AS peso_total_kg
  FROM contenedor c
  JOIN declaracion_aduanera d ON c.id_declaracion = d.id_declaracion
  JOIN pais p ON d.id_pais_origen = p.id_pais
  GROUP BY p.id_pais, p.nombre
  ORDER BY total_contenedores DESC
  LIMIT 1;
  ```
* **Respuesta Cruda de la Base de Datos:**  
  `{"pais": "China", "total_contenedores": 7, "peso_total_kg": 147450.00}`
* **Respuesta Sintetizada del Agente:**  
  > *"El país de origen con mayor número de contenedores recibidos es **China**, con un total de **7 contenedores** (equivalentes a 147,450.00 kg o aproximadamente 147.45 toneladas métricas de carga)."*

---

### PRUEBA 4: Importador con Mayor Valor Declarado Acumulado

* **Pregunta del Usuario:**  
  > *"¿Qué empresa importadora ha declarado el mayor valor acumulado en mercancías en lo que va del periodo?"*
* **Razonamiento del Agente:**  
  Agruparé las declaraciones por `operador_comercial` sumando el valor CIF declarado y ordenando de mayor a menor.
* **Consulta SQL Generada:**  
  ```sql
  SELECT 
      op.razon_social,
      op.identificacion_tributaria,
      COUNT(d.id_declaracion) AS total_duas,
      SUM(d.total_cif_usd) AS valor_acumulado_usd
  FROM declaracion_aduanera d
  JOIN operador_comercial op ON d.id_operador = op.id_operador
  WHERE op.tipo_operador IN ('Importador', 'Ambos')
  GROUP BY op.id_operador, op.razon_social, op.identificacion_tributaria
  ORDER BY valor_acumulado_usd DESC
  LIMIT 1;
  ```
* **Respuesta Cruda de la Base de Datos:**  
  `{"razon_social": "Corporacion Automotriz del Valle S.A.", "identificacion_tributaria": "3-101-112233", "total_duas": 2, "valor_acumulado_usd": 286000.00}`
* **Respuesta Sintetizada del Agente:**  
  > *"El importador con mayor valor comercial acumulado es **Corporacion Automotriz del Valle S.A.** (Cédula: 3-101-112233), habiendo tramitado 2 DUAs por un valor total CIF de **$286,000.00 USD** (correspondientes a cargamentos de vehículos de turismo)."*

---

### PRUEBA 5: Inspecciones con Resultado "Con Observaciones" y Funcionarios

* **Pregunta del Usuario:**  
  > *"¿Cuáles inspecciones tuvieron resultado 'Con Observaciones', qué hallazgos se reportaron y quién las realizó?"*
* **Razonamiento del Agente:**  
  Consulto `inspeccion` con JOIN a `declaracion_aduanera` y `funcionario`, filtrando por `resultado = 'Con Observaciones'`.
* **Consulta SQL Generada:**  
  ```sql
  SELECT 
      i.fecha_inspeccion,
      d.numero_dua,
      i.canal_asignado,
      i.observaciones,
      f.nombre_completo AS funcionario,
      f.cargo
  FROM inspeccion i
  JOIN declaracion_aduanera d ON i.id_declaracion = d.id_declaracion
  JOIN funcionario f ON i.id_funcionario = f.id_funcionario
  WHERE i.resultado = 'Con Observaciones'
  ORDER BY i.fecha_inspeccion DESC;
  ```
* **Respuesta Cruda de la Base de Datos:**  
  * DUA-2026-0014 (31/10): *Verificación de certificación de seguridad eléctrica de motores* | Insp: Ignacio Venegas López.
  * DUA-2026-0013 (29/10): *Temperatura de cámara en -12C cuando la norma exige -18C continuo* | Insp: Verónica Gómez Salas.
  * DUA-2026-0009 (22/10): *Inspección química a paneles solares por componentes no reportados* | Insp: Felipe Castro Córdoba.
  * DUA-2026-0007 (18/10): *Pendiente de acreditación de pago de arancel e impuestos de venta* | Insp: Verónica Gómez Salas.
  * DUA-2026-0004 (10/10): *Falta permiso de importación emitido por Ministerio de Salud* | Insp: Mónica Quirós Chaves.
  * DUA-2026-0002 (05/10): *Se detectó subvaluación preliminar en factura comercial de laptops* | Insp: Karla Madrigal Vega.
* **Respuesta Sintetizada del Agente:**  
  > *"Se registraron **6 inspecciones con observaciones técnicas** relevantes, entre las que destacan hallazgos por subvaluación de laptops (a cargo de Karla Madrigal Vega), omisión de permisos del Ministerio de Salud (Mónica Quirós Chaves) y ruptura de cadena de frío en cárnicos (Verónica Gómez Salas)."*

---

### PRUEBA 6: Stock Consolidado de Laptops ThinkPad T14 en Bodegas

* **Pregunta del Usuario:**  
  > *"¿Cuánto stock queda del producto 'LAP-LEN-T14' en todas las bodegas y cuál es su estado?"*
* **Razonamiento del Agente:**  
  Filtro por SKU 'LAP-LEN-T14' agrupando por bodega y estado del stock.
* **Consulta SQL Generada:**  
  ```sql
  SELECT 
      b.nombre AS bodega,
      inv.cantidad,
      inv.estado_stock,
      inv.observacion
  FROM inventario_stock inv
  JOIN bodega b ON inv.id_bodega = b.id_bodega
  JOIN producto pr ON inv.id_producto = pr.id_producto
  WHERE pr.codigo_sku = 'LAP-LEN-T14';
  ```
* **Respuesta Cruda de la Base de Datos:**  
  1. Bodega General Puerto Caldera: 50 unidades | Estado: *Liberado* (Carga en tránsito autorizada).
  2. Depósito de Carga Retenida Caldera: 60 unidades | Estado: *Retenido* (Falta de factura comercial original).
* **Respuesta Sintetizada del Agente:**  
  > *"Del producto **Laptop Lenovo ThinkPad T14 (LAP-LEN-T14)** se registra una existencia total de **110 unidades** distribuida de la siguiente manera:*  
  > *- **50 unidades Liberadas** en la Bodega General Puerto Caldera.*  
  > *- **60 unidades Retenidas** en el Depósito de Carga Retenida Caldera por falta de factura comercial original."*

---

### PRUEBA 7: Contenedores Pesados (>20 Toneladas) de TechLogistics

* **Pregunta del Usuario:**  
  > *"¿Qué contenedores con peso superior a 20 toneladas ingresaron amparados para la empresa TechLogistics?"*
* **Razonamiento del Agente:**  
  Cruzo `contenedor`, `declaracion_aduanera` y `operador_comercial`, aplicando filtros de peso (`peso_bruto_kg > 20000`) y razón social.
* **Consulta SQL Generada:**  
  ```sql
  SELECT 
      c.numero_contenedor,
      c.tipo_contenedor,
      c.peso_bruto_kg,
      d.numero_dua,
      d.fecha_registro
  FROM contenedor c
  JOIN declaracion_aduanera d ON c.id_declaracion = d.id_declaracion
  JOIN operador_comercial op ON d.id_operador = op.id_operador
  WHERE op.razon_social LIKE '%TechLogistics%'
    AND c.peso_bruto_kg > 20000.00;
  ```
* **Respuesta Cruda de la Base de Datos:**  
  `{"numero_contenedor": "ONEU-552019-9", "tipo_contenedor": "40ft Dry High Cube", "peso_bruto_kg": 21400.00, "numero_dua": "DUA-2026-0006", "fecha_registro": "2026-10-15"}`
* **Respuesta Sintetizada del Agente:**  
  > *"Para la empresa **TechLogistics Importaciones S.A.** ingresó el contenedor **ONEU-552019-9** (tipo 40ft Dry High Cube) con un peso bruto de **21,400.00 kg** (21.4 toneladas), registrado el 15 de octubre de 2026 bajo la DUA-2026-0006."*

---

### PRUEBA 8: Supervisor a Cargo de la Inspección de la DUA-2026-0004

* **Pregunta del Usuario:**  
  > *"¿Quién es el supervisor inmediato del funcionario que inspeccionó la DUA-2026-0004?"*
* **Razonamiento del Agente:**  
  Hago un doble JOIN autorreferencial sobre la tabla `funcionario` para obtener el inspector y su supervisor a partir del registro de inspección de la DUA solicitada.
* **Consulta SQL Generada:**  
  ```sql
  SELECT 
      d.numero_dua,
      f.nombre_completo AS inspector,
      f.cargo AS cargo_inspector,
      sup.nombre_completo AS supervisor_inmediato,
      sup.cargo AS cargo_supervisor
  FROM inspeccion i
  JOIN declaracion_aduanera d ON i.id_declaracion = d.id_declaracion
  JOIN funcionario f ON i.id_funcionario = f.id_funcionario
  LEFT JOIN funcionario sup ON f.id_supervisor = sup.id_funcionario
  WHERE d.numero_dua = 'DUA-2026-0004';
  ```
* **Respuesta Cruda de la Base de Datos:**  
  `{"numero_dua": "DUA-2026-0004", "inspector": "Monica Quiros Chaves", "cargo_inspector": "Inspectora Quimica Farmaceutica", "supervisor_inmediato": "Laura Benavides Solis", "cargo_supervisor": "Supervisora de Fiscalizacion Normativa"}`
* **Respuesta Sintetizada del Agente:**  
  > *"La inspección de la DUA-2026-0004 fue llevada a cabo por la funcionaria **Mónica Quirós Chaves** (Inspectora Química Farmacéutica). Su supervisora inmediata responsable es **Laura Benavides Solís**, quien ostenta el cargo de **Supervisora de Fiscalización Normativa**."*
