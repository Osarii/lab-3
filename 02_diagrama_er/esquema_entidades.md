# DICCIONARIO DE DATOS Y JUSTIFICACIÓN DEL MODELO ENTIDAD-RELACIÓN

**Sistema de Inventario Aduanero**  
**Estudiante:** Jared Prendas Ramírez  
**Herramienta de Modelado:** draw.io (app.diagrams.net) / Notación Pata de Gallo (Crow's Foot)

---

## 1. Justificación de Entidades y Cardinalidades

El modelo consta de **13 entidades relacionales**, superando el mínimo requerido de 8 entidades, y cubriendo el ciclo completo de la operativa fiscal aduanera.

### A. Entidades Principales y Cardinalidades

1. **`pais` (Catálogo maestro)**
   * *Relación 1:N con `declaracion_aduanera`:* Un país de origen puede amparar muchas declaraciones aduaneras registradas en el puerto, pero una declaración específica proviene de exactamente un país de procedencia.
   * *Relación 1:N con `operador_comercial`:* Un país es la sede legal de múltiples empresas importadoras o exportadoras.

2. **`agente_aduanal` (Auxiliar de la función pública)**
   * *Relación 1:N con `declaracion_aduanera`:* Un agente de aduanas con licencia activa puede formalizar y suscribir múltiples DUAs ante el fisco. Toda DUA debe tener asignado exactamente un agente responsable.

3. **`operador_comercial` (Importadores / Exportadores)**
   * *Relación 1:N con `declaracion_aduanera`:* Un importador tramita múltiples declaraciones a lo largo del año fiscal.

4. **`declaracion_aduanera` (DUA - Entidad Central)**
   * Representa el documento público y legal de nacionalización, tránsito o depósito. Contiene fecha, régimen, estado operativo (Retenida, Liberada, etc.) y totales liquidados.
   * *Relación 1:N con `contenedor`:* Una declaración de gran volumen puede requerir uno o más contenedores físicos (`20ft`, `40ft High Cube`, `Refrigerados`).
   * *Relación 1:N con `inspeccion`:* Una DUA puede ser objeto de inspecciones físicas (aforo rojo), documentales (amarillo) o levante directo (verde).
   * *Relación 1:N con `inventario_stock`:* Ampara lotes de mercancía ingresados en bodegas fiscales.

5. **`detalle_declaracion` (Resolución de Relación N:M)**
   * *Regla de Negocio:* Una declaración contiene múltiples productos, y un mismo producto tipo (ej. `Smartphone Galaxy S24`) puede ser importado en múltiples declaraciones diferentes.
   * *Resolución:* Tabla intermedia que descompone la relación N:M en dos relaciones 1:N:
     * `declaracion_aduanera (1) ----< (N) detalle_declaracion`
     * `producto (1) ----< (N) detalle_declaracion`
   * Almacena atributos específicos de la transacción: `cantidad`, `valor_declarado_usd` y `arancel_aplicado_usd`.

6. **`funcionario` (Entidad con Relación Recursiva)**
   * Modela la plantilla oficial de aduanas.
   * *Relación Recursiva (1:N):* Un funcionario directivo o supervisor (`id_funcionario`) supervisa a múltiples inspectores y aforadores operativos (`id_supervisor`). Si el funcionario es la máxima autoridad (Director General), su `id_supervisor` es `NULL`.

7. **`bodega` e `inventario_stock` (Control Físico y Retenciones)**
   * Una bodega alberga stock de múltiples productos y DUAs.
   * El estado del stock (`Retenido`, `En Cuarentena`, `Liberado`) permite a los funcionarios y al agente de IA consultar exactamente qué mercancías están bloqueadas en una bodega específica (ej. Bodega 2 de Caldera).

8. **`movimiento_inventario` (Auditoría y Trazabilidad)**
   * Registra cada movimiento de entrada, salida o traslado entre bodegas, vinculando al producto, las bodegas origen/destino y al funcionario custodio que autorizó la operación.

---

## 2. Coherencia con el Script SQL

Todas las tablas, columnas, restricciones `CHECK`, valores `DEFAULT` y llaves foráneas (`ON DELETE`, `ON UPDATE`) declaradas en este diagrama coinciden al 100% con el script [`Prendas_Jared_Aduana_Lab3.sql`](file:///Users/osariii/Documents/lab-3/03_base_datos_sql/Prendas_Jared_Aduana_Lab3.sql).
