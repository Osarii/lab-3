# LABORATORIO #3: SISTEMA DE INVENTARIO ADUANERO
## Base de Datos Relacional y Agente de Inteligencia Artificial con n8n

* **Asignatura:** Bases de Datos  
* **Estudiante:** Jared Prendas Ramírez  
* **Modalidad:** Individual  
* **Fecha de Entrega:** Noviembre 2026  
* **Gestor Seleccionado:** MySQL 8.0+  

---

## 1. PARTE I – INVESTIGACIÓN TEÓRICA Y FUNDAMENTOS

### A. Bases de Datos y SQL

#### 1. ¿Qué es una Base de Datos? ¿Qué es un Sistema Gestor de Bases de Datos (SGBD)?
Una **Base de Datos (BD)** es una colección estructurada, organizada y persistente de información o datos integrados, diseñada para modelar aspectos del mundo real, facilitar el almacenamiento seguro y permitir consultas y modificaciones eficientes. A diferencia de almacenar datos en hojas de cálculo (Excel) o ficheros de texto plano dispersos, una base de datos garantiza consistencia, concurrencia de múltiples usuarios y mecanismos de respaldo.

Un **Sistema Gestor de Bases de Datos (SGBD o DBMS)** es el software intermediario que administra, controla, protege y manipula las bases de datos. El SGBD actúa como capa de abstracción entre los usuarios o aplicaciones (como un agente en n8n o un backend en Node.js/React) y el almacenamiento físico en disco. Ejemplos prominentes incluyen MySQL, PostgreSQL, Oracle y SQLite. Sus responsabilidades fundamentales son:
* Gestión de almacenamiento físico y concurrencia.
* Seguridad, autenticación y control de accesos (usuarios y privilegios).
* Preservación de las propiedades **ACID** (Atomicidad, Consistencia, Aislamiento y Durabilidad) en las transacciones.
* Optimización de consultas mediante motores de ejecución e índices.

#### 2. Diferencias entre Base de Datos Relacional y No Relacional (NoSQL)
* **Bases de Datos Relacionales (SQL / RDBMS):**
  * **Modelo:** Organizan los datos en tablas bidimensionales compuestas por filas (tuplas) y columnas (campos).
  * **Esquema:** Esquema rígido y tipado (*schema-on-write*), definido previamente mediante DDL.
  * **Relaciones e Integridad:** Implementan llaves primarias y foráneas que garantizan integridad referencial estricta.
  * **Lenguaje:** Estándar declarativo SQL (Structured Query Language).
  * **Escalabilidad:** Tradicionalmente vertical (*scale-up*), priorizando la consistencia sobre la partición distribuida.
  * **Caso de uso idóneo:** Aplicaciones financieras, inventarios aduaneros, facturación y sistemas contables donde la inconsistencia de datos es inadmisible.
* **Bases de Datos No Relacionales (NoSQL):**
  * **Modelo:** Modelos flexibles orientados a documentos (MongoDB, CouchDB), clave-valor (Redis), grafos (Neo4j) o familias de columnas (Cassandra).
  * **Esquema:** Esquema dinámico o inexistente (*schema-on-read*), lo que permite almacenar estructuras heterogéneas (JSON/BSON) sin migración previa de esquema.
  * **Escalabilidad:** Horizontal nativa (*scale-out*), distribuyendo datos a través de clusters de bajo costo bajo el teorema CAP (priorizando disponibilidad y tolerancia a particiones).
  * **Caso de uso idóneo:** Big Data, registros de telemetría IoT, redes sociales y catálogos de productos con atributos altamente dinámicos.

#### 3. Tabla, Registro (Fila), Campo (Columna) y Tipos de Datos más Comunes
* **Tabla (Relación):** Estructura fundamental bidimensional que representa una entidad del dominio (ejemplo: `contenedor`, `bodega`).
* **Campo (Columna o Atributo):** Característica individual de la entidad que almacena un dato específico con un tipo definido (ejemplo: `numero_dua`, `capacidad_maxima_m3`).
* **Registro (Fila o Tupla):** Instancia única y completa de la entidad que contiene valores concretos para cada campo (ejemplo: la fila con el contenedor `MSKU-781920-1`).
* **Tipos de datos más comunes en SQL:**
  * **Numéricos:** `INT` / `INTEGER` (enteros estándar), `BIGINT` (enteros grandes), `DECIMAL(M,D)` / `NUMERIC` (números de precisión exacta para dinero y peso aduanero), `FLOAT` / `DOUBLE` (precisión flotante aproximada).
  * **Cadenas y Texto:** `VARCHAR(N)` (longitud variable optimizada), `CHAR(N)` (longitud fija como códigos ISO `CR`, `US`), `TEXT` (textos extensos y observaciones periciales).
  * **Fecha y Hora:** `DATE` (`AAAA-MM-DD`), `TIME` (`HH:MM:SS`), `DATETIME` / `TIMESTAMP` (marcas de tiempo con soporte horario).
  * **Booleanos:** `BOOLEAN` / `TINYINT(1)` (verdadero/falso).
  * **Especiales:** `JSON` (documentos anidados) y `ENUM` (listas cerradas de estados permitidos).

#### 4. Llave Primaria (PK), Llave Foránea (FK) y Llave Compuesta
* **Llave Primaria (Primary Key - PK):** Campo (o conjunto de campos) que identifica de manera única y unívoca a cada registro en una tabla. No permite valores nulos (`NOT NULL`) y es estrictamente única (`UNIQUE`). En MySQL suele declararse con `INT AUTO_INCREMENT PRIMARY KEY`.
* **Llave Foránea (Foreign Key - FK):** Campo en una tabla que hace referencia directa a la llave primaria de otra tabla (o de sí misma en relaciones recursivas). Es el mecanismo mediante el cual se materializan las relaciones en el modelo relacional, asegurando que no existan referencias "huérfanas".
* **Llave Compuesta (Composite Key):** Llave primaria conformada por dos o más columnas combinadas para identificar un registro. Se utiliza típicamente en tablas intermedias de relaciones N:M (por ejemplo, en `detalle_declaracion`, la combinación de `id_declaracion` e `id_producto`).

#### 5. Tipos de Relaciones y Cómo se Implementan
* **Uno a Uno (1:1):**
  * *Concepto:* Un registro de la Tabla A se asocia a lo sumo con un registro de la Tabla B, y viceversa.
  * *Implementación:* Se coloca la PK de la tabla A como FK en la tabla B con restricción `UNIQUE`, o ambas tablas comparten exactamente la misma PK.
  * *Ejemplo aduanero:* Un `manifiesto_carga` y su `acta_recepcion_satelital`.
* **Uno a Muchos (1:N):**
  * *Concepto:* Un registro de la Tabla A puede estar relacionado con múltiples registros de la Tabla B, pero cada registro de B pertenece únicamente a uno de A.
  * *Implementación:* Se añade la llave primaria de la entidad "Uno" (tabla padre) como llave foránea (FK) en la entidad "Muchos" (tabla hija).
  * *Ejemplo aduanero:* Un `pais` es origen de muchas `declaracion_aduanera`, o una `declaracion_aduanera` ampara múltiples `contenedor`.
* **Muchos a Muchos (N:M):**
  * *Concepto:* Múltiples registros de la Tabla A se relacionan con múltiples registros de la Tabla B.
  * *Implementación:* Las bases de datos relacionales no admiten N:M directo. Se descompone creando una **tabla intermedia o asociativa** que contiene dos llaves foráneas (`FK_A` y `FK_B`), las cuales en conjunto forman una llave primaria compuesta o una restricción de unicidad (`UNIQUE (id_A, id_B)`), además de atributos propios de la relación.
  * *Ejemplo aduanero:* `declaracion_aduanera` y `producto`, unidas mediante la tabla intermedia `detalle_declaracion`, la cual registra la cantidad y el valor declarado de cada producto en esa declaración específica.
* **Relación Recursiva (Autorreferencial):**
  * *Concepto:* Una entidad se relaciona consigo misma para modelar jerarquías o dependencias.
  * *Implementación:* Una columna FK dentro de la misma tabla apunta a la PK de esa misma tabla.
  * *Ejemplo aduanero:* En la tabla `funcionario`, el campo `id_supervisor INT NULL` apunta a `funcionario(id_funcionario)`, permitiendo saber qué funcionario superior audita a un aforador operativo.

#### 6. Integridad Referencial y Restricciones
La **integridad referencial** garantiza que los vínculos entre tablas permanezcan siempre válidos. Si un registro en una tabla hija hace referencia a un registro padre, este último debe existir forzosamente. Si se intenta eliminar o actualizar un padre, entran en juego las cláusulas:
* `ON DELETE RESTRICT / NO ACTION`: Impide la eliminación del registro padre si tiene hijos asociados.
* `ON DELETE CASCADE`: Elimina en cascada los registros dependientes.
* `ON DELETE SET NULL`: Asigna `NULL` a la llave foránea del hijo.

**Restricciones de columna (Constraints):**
* `NOT NULL`: Impide que un campo quede vacío o sin definir.
* `UNIQUE`: Garantiza que ningún par de filas comparta el mismo valor en dicha columna (ej. cédula jurídica o número DUA).
* `CHECK`: Valida que el valor cumpla una condición lógica booleana (ej. `CHECK (porcentaje_arancel >= 0 AND porcentaje_arancel <= 100)`).
* `DEFAULT`: Establece un valor predeterminado si no se especifica uno en la sentencia `INSERT` (ej. `estado VARCHAR(20) DEFAULT 'Retenido'`).

#### 7. DDL y DML: Sentencias Fundamentales
* **DDL (Data Definition Language):** Sentencias encargadas de crear, alterar o destruir las estructuras y esquemas de la base de datos:
  * `CREATE`: Define nuevas tablas, vistas, índices o bases de datos (`CREATE TABLE bodega (...)`).
  * `ALTER`: Modifica la estructura de una tabla existente (`ALTER TABLE producto ADD COLUMN peso DECIMAL(8,2)`).
  * `DROP`: Elimina permanentemente una tabla o base de datos (`DROP TABLE temp_cargas`).
  * `TRUNCATE`: Vacía todos los registros de una tabla reseteando autoincrementables pero conservando su estructura.
* **DML (Data Manipulation Language):** Sentencias dedicadas a gestionar y consultar los datos que residen dentro de las tablas:
  * `INSERT INTO`: Inserta nuevos registros (`INSERT INTO pais (nombre, codigo_iso) VALUES ('China', 'CN')`).
  * `SELECT`: Consulta y extrae datos aplicando proyecciones, filtros, agrupaciones y ordenamientos.
  * `UPDATE`: Modifica valores en registros existentes (`UPDATE declaracion SET estado = 'Liberada' WHERE id = 1`).
  * `DELETE`: Elimina registros específicos bajo una condición (`DELETE FROM inspeccion WHERE id = 10`).
  * `JOIN`: Cláusula que combina columnas de una o más tablas basándose en una condición de igualdad entre llaves (`INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `FULL JOIN`).

#### 8. Normalización de Bases de Datos
La normalización es un proceso sistemático de diseño que organiza las tablas y atributos para **reducir la redundancia de datos**, **eliminar anomalías de inserción, actualización y borrado**, y garantizar que las dependencias lógicas tengan sentido.

* **Primera Forma Normal (1FN):**
  * *Regla:* Todos los atributos deben ser atómicos (indivisibles), no deben existir grupos repetitivos ni columnas que almacenen listas separadas por comas. Cada tabla debe poseer una llave primaria identificable.
  * *Ejemplo aduanero:* En lugar de tener una columna `productos = "Laptop, Monitor, Mouse"` dentro de la tabla de declaraciones, se crea una fila individual por cada producto en la tabla intermedia.
* **Segunda Forma Normal (2FN):**
  * *Regla:* Debe estar en 1FN y todos los atributos no clave deben depender por completo de la **llave primaria completa**, no de una parte de ella (elimina dependencias parciales en llaves compuestas).
  * *Ejemplo aduanero:* En `detalle_declaracion` (cuya PK compuesta es `id_declaracion + id_producto`), atributos como el `nombre_del_producto` o su `partida_arancelaria` no deben estar ahí porque dependen únicamente de `id_producto`, no de la declaración. Por ende, deben residir en la tabla independiente `producto`.
* **Tercera Forma Normal (3FN):**
  * *Regla:* Debe estar en 2FN y ningún atributo no clave debe depender transitivamente de la llave primaria a través de otro atributo no clave (elimina dependencias transitivas: si $A \rightarrow B$ y $B \rightarrow C$, entonces $C$ no debe estar en la misma tabla que $A$).
  * *Ejemplo aduanero:* En la tabla `declaracion_aduanera`, colocar el nombre del agente y su teléfono viola la 3FN, porque esos campos dependen de `id_agente` y no de la declaración en sí. Se aíslan en la tabla `agente_aduanal` y solo se conserva la foránea `id_agente`.

#### 9. Diagrama Entidad-Relación (DER) y Notaciones
Un **Diagrama Entidad-Relación (DER)** es una representación gráfica conceptual y lógica que modela la estructura de la base de datos, identificando las entidades del negocio, sus atributos, llaves y las relaciones que las interconectan con sus respectivas cardinalidades.

* **Notación de Peter Chen (1976):** Notación académica clásica. Representa entidades mediante rectángulos, atributos mediante elipses (con atributos clave subrayados) y relaciones mediante rombos unidos por líneas con etiquetas de cardinalidad $(1, 1)$, $(1, N)$ o $(N, M)$.
* **Notación Pata de Gallo (Crow's Foot / Martin):** Estándar de facto en la industria de software contemporánea (utilizado en herramientas como draw.io, dbdiagram.io y MySQL Workbench). Representa las tablas en bloques tabulares con sus tipos de datos y restricciones (PK, FK), y las relaciones mediante líneas cuyos extremos indican cardinalidad y opcionalidad:
  * Círculo y línea perpendicular: cero o uno $(0..1)$.
  * Dos líneas perpendiculares: exactamente uno $(1..1)$.
  * Pata de gallo con círculo: cero a muchos $(0..N)$.
  * Pata de gallo con línea perpendicular: uno a muchos $(1..N)$.

---

### B. Gestores de Bases de Datos

#### Tabla Comparativa

| Gestor | Arquitectura y Características Principales | Ventajas y Facilidad en n8n | Desventajas o Limitaciones |
|---|---|---|---|
| **SQLite** | Motor embebido sin servidor (*serverless*). La base de datos completa reside en un único archivo binario `.sqlite`/`.db` en el sistema de archivos local. | Extremadamente ligero, cero configuración inicial, ideal para pruebas locales unitarias o dispositivos embebidos. | No cuenta con nodo nativo directo en n8n Cloud; en n8n local requiere scripts en nodos Code o SQLite comunitario. Concurrencia limitada de escritura (bloquea el archivo completo). |
| **MySQL** | Motor relacional cliente-servidor líder en entornos web (InnoDB). Amplio soporte para tipos de datos, particionamiento y transacciones ACID. | **Nodo nativo oficial en n8n** (`n8n-nodes-base.mySql`). Conexión directa mediante puerto 3306, pooling de conexiones robusto y compatibilidad nativa con MySQL Workbench y XAMPP/Docker. | Configuración de usuarios y permisos en red local requiere gestionar privilegios de host (`%`). Consumo moderado de memoria RAM en el servidor. |
| **PostgreSQL** | Motor relacional objeto-relacional de alto rendimiento empresarial. Soporte avanzado para JSONB, extensiones (pgvector, PostGIS) y cumplimiento estricto del estándar ANSI SQL. | **Nodo nativo oficial y preferido en n8n** (`n8n-nodes-base.postgres`). Excelente oferta en la nube gratuita (Supabase, Neon) accesible desde cualquier workflow de n8n. | Mayor curva de aprendizaje en administración avanzada y sintaxis ligeramente más rigurosa en casting de tipos de datos. |

#### Justificación del Gestor Seleccionado: MySQL 8.0
Para este laboratorio se seleccionó **MySQL 8.0** debido a las siguientes razones técnicas:
1. **Compatibilidad Nativa con n8n:** n8n dispone de un nodo nativo preconfigurado para MySQL que permite parametrizar consultas de forma segura con credenciales encriptadas.
2. **Estabilidad y Familiaridad:** Es el estándar académico del curso y se integra de forma inmediata con herramientas de gestión visual como MySQL Workbench y DBeaver.
3. **Manejo Estricto de Restricciones:** En la versión 8.0+, el soporte para restricciones `CHECK`, llaves foráneas con integridad referencial activa por defecto (motor InnoDB) y funciones analíticas de ventana permite un modelado fiel a la normativa aduanera.

---

### C. n8n y Agentes de Inteligencia Artificial

#### 1. ¿Qué es n8n? ¿Qué es la Automatización de Flujos de Trabajo (Workflows)?
**n8n** es una plataforma de automatización de flujos de trabajo (*workflow automation*) de código abierto basada en nodos. Permite interconectar aplicaciones, bases de datos, APIs REST y modelos de inteligencia artificial sin necesidad de programar manualmente toda la infraestructura de red.
Un **flujo de trabajo (workflow)** es una secuencia lógica y orientada a eventos donde la salida (*output*) de un nodo se convierte en la entrada (*input*) del siguiente, permitiendo orquestar procesos complejos como la recepción de una consulta aduanera, la ejecución de una consulta SQL y la entrega de una respuesta en lenguaje natural.

#### 2. Conceptos Fundamentales: Nodo, Trigger y Credencial
* **Nodo:** Unidad básica de ejecución dentro de n8n que realiza una acción específica (ej. ejecutar una consulta SQL, llamar a un LLM, transformar un JSON mediante JavaScript o enviar un correo).
* **Trigger (Disparador):** Nodo de inicio que escucha activamente un evento externo para arrancar el flujo (ejemplo: un `Chat Trigger` cuando un funcionario escribe una pregunta, o un `Webhook` que recibe alertas de arribo de buques).
* **Credencial:** Objeto de seguridad cifrado dentro de n8n donde se almacenan nombres de usuario, contraseñas, tokens de API o claves privadas sin exponerlos en el lienzo del flujo ni en los archivos exportados.

#### 3. Diferencia entre un Agente de IA y un Chatbot Tradicional
* **Chatbot Tradicional (Basado en Reglas o Árboles de Decisión):** Funciona mediante coincidencias de palabras clave, expresiones regulares o árboles rígidos de preguntas y respuestas predefinidas. Si el usuario formula una pregunta fuera de su libreto, el chatbot no sabe qué responder y carece de capacidad para razonar o consultar dinámicamente un sistema externo.
* **Agente de IA (AI Agent / ReAct Framework):** Utiliza un Modelo de Lenguaje de Gran Escala (LLM) como "cerebro" o motor de razonamiento. El agente no solo comprende la intención y el contexto semántico del usuario, sino que puede **decidir de manera autónoma** si necesita usar una o más herramientas (*tools*), determinar qué parámetros pasarle a dicha herramienta (por ejemplo, escribir una consulta `SELECT`), interpretar el resultado de la base de datos y sintetizar una respuesta humana precisa.

#### 4. Modelos de Lenguaje (LLMs) y Herramientas (Tools)
* **LLM (Large Language Model):** Modelo de aprendizaje profundo entrenado con billones de tokens capaz de procesar, predecir y generar lenguaje natural comprensible (ejemplos: OpenAI GPT-4o, Google Gemini 1.5/2.0, Anthropic Claude 3.5).
* **Tools (Herramientas):** Interfaces o funciones que se le exponen al LLM para que pueda interactuar con el entorno real. Un LLM por sí solo tiene conocimiento estático; las herramientas le otorgan "manos" para buscar en la web, hacer cálculos matemáticos o conectarse a una base de datos MySQL/PostgreSQL para ejecutar queries en tiempo real.

#### 5. Seguridad en Consultas a Bases de Datos por Agentes de IA
Permitir que un agente de IA ejecute sentencias SQL sobre una base de datos de producción presenta riesgos graves (como inyección de código malicioso o alteración accidental de inventario). Para garantizar una arquitectura segura se aplican los siguientes controles:
1. **Usuario de Solo Lectura (Principio de Mínimo Privilegio):** La credencial que utiliza n8n en el motor SQL corresponde a un usuario exclusivo (`aduanas_readonly`) al que solo se le concede el permiso `GRANT SELECT`. Carece por completo de privilegios `INSERT`, `UPDATE`, `DELETE`, `DROP` o `ALTER`.
2. **System Prompt Estricto:** Se instruye al modelo en su directiva base que tiene terminantemente prohibido generar sentencias DDL o DML de modificación.
3. **Validación de Consultas en el Nodo:** Si el motor detecta sentencias destructivas o inyecciones, la transacción es rechazada automáticamente por el gestor de base de datos a nivel de permisos de usuario.
4. **Protección de Datos Sensibles:** Se restringe el acceso a tablas con información confidencial de contraseñas o datos personales no pertinentes al aforo.

---

### D. El Dominio Aduanero

#### 1. ¿Qué es una Aduana y qué es una Declaración Aduanera (DUA)?
* **Aduana:** Entidad pública gubernamental de control fiscal y fronterizo responsable de vigilar, fiscalizar e inspeccionar el ingreso, permanencia y salida de mercancías, personas y medios de transporte de un territorio aduanero nacional, garantizando el cobro de los tributos de importación y el cumplimiento de las normativas de seguridad, salud y comercio internacional.
* **Declaración Única Aduanera (DUA):** Documento legal obligatorio (físico o electrónico) mediante el cual el importador o exportador declara bajo juramento ante el Servicio Nacional de Aduanas las características precisas de la carga: tipo de mercancía, cantidad, país de procedencia, valor en aduana (valor CIF: Costo, Seguro y Flete), régimen solicitado y liquidación preliminar de tributos.

#### 2. Partida Arancelaria (Sistema Armonizado) y Arancel
* **Partida Arancelaria (Sistema Armonizado - SA / SAC):** Código numérico estandarizado internacionalmente por la Organización Mundial de Aduanas (OMA). Consta típicamente de 6 a 10 dígitos que clasifican cualquier bien comerciable en el planeta (por ejemplo: `8517.13.00` para teléfonos inteligentes; `8703.23.00` para automóviles de turismo). Permite una identificación universal sin ambigüedades lingüísticas.
* **Arancel (DAI - Derecho Arancelario a la Importación):** Impuesto o tarifa tributaria que grava las mercancías importadas o exportadas. Puede ser *ad-valorem* (porcentaje fijo sobre el valor CIF del producto, ej. 15%), específico (monto fijo por unidad física, peso o volumen) o mixto.

#### 3. Regímenes Aduaneros Básicos
* **Importación Definitiva:** La mercancía extranjera ingresa al territorio nacional para su consumo, uso o venta permanente, tras la cancelación de todos los impuestos arancelarios aplicables y la obtención del levante aduanero.
* **Exportación Definitiva:** Salida legal de mercancías nacionales o nacionalizadas del territorio aduanero para su uso o consumo definitivo en el exterior.
* **Tránsito Aduanero:** Régimen bajo el cual las mercancías se transportan bajo control aduanero desde una aduana de entrada hasta otra de salida o interior, sin el pago de tributos de importación durante el trayecto, siempre que permanezcan selladas con precintos de seguridad.
* **Depósito Fiscal / Almacén Aduanero:** Régimen que permite almacenar mercancías extranjeras en una bodega fiscal autorizada por un plazo legal determinado, postergando el pago de tributos hasta el momento en que se decida su nacionalización, reexportación o traslado.

#### 4. ¿Qué es un Agente Aduanal y qué papel cumple?
El **Agente Aduanal (o Agente de Aduanas)** es un profesional auxiliar de la función pública aduanera, debidamente acreditado y con licencia oficial otorgada por el Ministerio de Hacienda. Su función es asesorar a las empresas importadoras y exportadoras, clasificar arancelariamente los productos en el Sistema Armonizado, formalizar la Declaración Aduanera ante las autoridades fiscales y responder solidariamente con el importador por la veracidad de la información y la correcta liquidación tributaria.

---

## 2. USO DE INTELIGENCIA ARTIFICIAL (SECCIÓN OBLIGATORIA)

En concordancia con los lineamientos del laboratorio, la inteligencia artificial se utilizó como copiloto de aprendizaje, análisis de dominio y optimización de código.

### A. Herramientas Utilizadas
1. **Google Gemini / Antigravity AI:** Asistente principal para la conceptualización de arquitectura, diseño del diagrama relacional en notación Crow's Foot y redacción técnica de explicaciones.
2. **ChatGPT (OpenAI):** Utilizado durante la fase de investigación inicial (sesión del 23 de octubre: *Investigación en PDF Aduanero*) para explorar conceptos normativos del Servicio Nacional de Aduanas y partidas del SAC.

### B. Ejemplos de Prompts Ejecutados
* **Prompt 1 (Conceptualización del Esquema):**
  > *"Actúa como un arquitecto de bases de datos senior especializado en comercio exterior. Diseña un esquema normalizado en 3FN para un sistema de inventario aduanero en MySQL 8.0. Debe incluir control de DUAs, contenedores físicos, relación N:M resuelta con detalle de mercancías, depósitos/bodegas y una relación recursiva para la jerarquía de funcionarios supervisores e inspectores. Detalla llaves primarias, foráneas y restricciones CHECK."*
* **Prompt 2 (Generación de Datos Coherentes):**
  > *"Genera sentencias INSERT INTO en MySQL para 13 tablas de aduana con datos altamente realistas. Utiliza códigos ISO 3166 reales, números de contenedores con formato ISO 6346 (4 letras + 7 dígitos), partidas arancelarias reales del Sistema Armonizado y fechas lógicas entre octubre y noviembre de 2026. Asegura que los identificadores foráneos respeten la integridad referencial."*
* **Prompt 3 (Seguridad del Agente en n8n):**
  > *"¿Cómo configuro un usuario en MySQL con privilegios mínimos de solo lectura (SELECT) para que un agente de IA en n8n pueda responder preguntas de inventario aduanero sin riesgo de modificar o destruir datos mediante inyección SQL?"*

### C. Aprendizajes Obtenidos
* **Comprensión de la Normalización Práctica:** Se comprendió cómo la descomposición de una relación N:M (`declaracion_aduanera` y `producto`) en `detalle_declaracion` previene redundancias masivas y permite liquidar aranceles individuales con precisión matemática.
* **Seguridad Defensiva en Agentes Autónomos:** El uso de LLMs conectados a bases de datos exige una separación estricta de privilegios a nivel de motor de base de datos; el *system prompt* ayuda a guiar la semántica, pero la seguridad real reside en la cuenta de usuario de la BD (`GRANT SELECT`).
* **Pensamiento Crítico y Validación:** Las herramientas de IA son propensas a sugerir tipos de datos genéricos o relaciones directas no normalizadas; la intervención humana y el rigor técnico fueron esenciales para ajustar las restricciones `CHECK` y verificar las cardinalidades reales del negocio aduanero.

---

## 3. FUENTES CONSULTADAS

1. **Elmasri, R., & Navathe, S. B. (2017).** *Fundamentals of Database Systems* (7th ed.). Pearson.
2. **Silberschatz, A., Korth, H. F., & Sudarshan, S. (2020).** *Database System Concepts* (7th ed.). McGraw-Hill.
3. **Organización Mundial de Aduanas (OMA / WCO).** *Sistema Armonizado de Designación y Codificación de Mercancías (HS Nomenclature 2022/2026).* Sitio oficial: [wcoomd.org](https://www.wcoomd.org).
4. **Servicio Nacional de Aduanas de Costa Rica / Ministerio de Hacienda.** *Ley General de Aduanas (Ley N° 7557) y su Reglamento.* San José, Costa Rica.
5. **MySQL Documentation Team (2024).** *MySQL 8.0 Reference Manual: Constraints, Foreign Keys and Data Types.* Oracle Corporation.
6. **n8n GmbH (2024).** *n8n Documentation: AI Agent Node, LangChain integrations, and Database Tools.* Documentación oficial: [docs.n8n.io](https://docs.n8n.io).
