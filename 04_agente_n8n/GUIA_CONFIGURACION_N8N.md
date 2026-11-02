# GUÍA PASO A PASO: CONFIGURACIÓN Y EJECUCIÓN DEL AGENTE EN n8n

**Laboratorio #3:** Sistema de inventario para una aduana: base de datos relacional y agente de IA con n8n  
**Estudiante:** Jared Prendas Ramírez

---

## 1. Opciones para Levantar n8n

Puedes utilizar cualquiera de las siguientes tres modalidades:
* **Opción A (n8n Cloud):** Prueba gratuita en [n8n.io](https://n8n.io/).
* **Opción B (Local con NPX - Sin instalación previa):**
  ```bash
  npx n8n
  ```
  Abre tu navegador en `http://localhost:5678`.
* **Opción C (Docker):**
  ```bash
  docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n docker.n8n.io/n8nio/n8n
  ```

---

## 2. Importar el Flujo de Trabajo en n8n

1. En la barra lateral izquierda de n8n, haz clic en **Workflows**.
2. En la esquina superior derecha, haz clic en los tres puntos (`···`) y selecciona **Import from File**.
3. Selecciona el archivo [`Prendas_Jared_Agente_Lab3.json`](file:///Users/osariii/Documents/lab-3/entregables/Prendas_Jared_Agente_Lab3.json).
4. El lienzo desplegará automáticamente los 5 nodos conectados:
   * **Chat Trigger**
   * **AI Agent (Asistente Aduanero)**
   * **Chat Model (Google Gemini o OpenAI)**
   * **Simple Memory (Window Buffer Memory)**
   * **Herramienta de Base de Datos (MySQL / Postgres Tool)**

---

## 3. Configurar Credenciales

### A. Credencial del Modelo de Lenguaje (LLM)
* Haz doble clic en el nodo **Google Gemini Chat Model** (o reemplázalo por OpenAI si prefieres).
* Selecciona o crea una credencial con tu API Key gratuita de [Google AI Studio](https://aistudio.google.com/apikey).

### B. Credencial de Base de Datos (MySQL)
* Haz doble clic en el nodo **Herramienta BD Aduana (MySQL)**.
* Ingresa los datos de conexión correspondientes al usuario de solo lectura:
  * **Host:** `localhost` (o la IP de tu servidor Docker / nube)
  * **Database:** `aduana_inventario`
  * **User:** `aduanas_readonly` (creado con el script `seguridad_solo_lectura.sql`)
  * **Password:** `Aduana2026#ReadOnlySecure`
  * **Port:** `3306`
* Haz clic en **Test Connection** para verificar que la conexión sea exitosa.

---

## 4. Probar el Agente en el Chat Integrado

1. En la parte inferior del nodo **When chat message received**, pulsa el botón **Chat** o haz clic en **Test Step**.
2. Escribe cualquiera de las preguntas de evaluación:
   * *"¿Qué mercancías de China siguen retenidas en la bodega 2?"*
   * *"¿Cuántas declaraciones de importación se registraron en octubre?"*
   * *"¿Cuál es el país de origen con más contenedores recibidos?"*
   * *"¿Qué importador ha declarado el mayor valor total en mercancías?"*
3. Observa cómo el agente razona, formula la consulta `SELECT` correspondiente mediante la herramienta, analiza los datos devueltos por MySQL y te responde en lenguaje natural claro y conciso.
