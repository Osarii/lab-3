import fs from 'fs';

const systemPrompt = fs.readFileSync('/Users/osariii/Documents/lab-3/04_agente_n8n/system_prompt_aduanas.md', 'utf8');

const workflow = {
  name: "Agente IA Inventario Aduanero - Lab 3",
  nodes: [
    {
      parameters: {
        options: {}
      },
      id: "a1000000-0000-0000-0000-000000000001",
      name: "When chat message received",
      type: "@n8n/n8n-nodes-langchain.chatTrigger",
      typeVersion: 1.1,
      position: [240, 300],
      webhookId: "aduana-chat-trigger-v1"
    },
    {
      parameters: {
        options: {
          systemMessage: systemPrompt
        }
      },
      id: "a1000000-0000-0000-0000-000000000002",
      name: "AI Agent - Asistente Aduanero",
      type: "@n8n/n8n-nodes-langchain.agent",
      typeVersion: 1.7,
      position: [480, 300]
    },
    {
      parameters: {
        modelName: "models/gemini-1.5-flash",
        options: {
          temperature: 0.1
        }
      },
      id: "a1000000-0000-0000-0000-000000000003",
      name: "Google Gemini Chat Model",
      type: "@n8n/n8n-nodes-langchain.lmChatGoogleGemini",
      typeVersion: 1,
      position: [420, 520],
      credentials: {
        googlePalmApi: {
          id: "aduanas-gemini-cred-id",
          name: "Google Gemini API Key"
        }
      }
    },
    {
      parameters: {
        sessionIdType: "customKey",
        sessionKey: "={{ $json.sessionId || 'aduana-session-default' }}",
        contextWindowLength: 10
      },
      id: "a1000000-0000-0000-0000-000000000004",
      name: "Simple Window Buffer Memory",
      type: "@n8n/n8n-nodes-langchain.memoryBufferWindow",
      typeVersion: 1.3,
      position: [560, 520]
    },
    {
      parameters: {
        name: "consultar_base_datos_aduana",
        description: "Ejecuta consultas de solo lectura (SELECT) sobre la base de datos de aduana_inventario en MySQL/PostgreSQL. Entrada: la consulta SQL en texto plano.",
        operation: "executeQuery",
        query: "={{ $fromAI('sqlQuery', 'Consulta SELECT a ejecutar sobre la base de datos de aduana') }}"
      },
      id: "a1000000-0000-0000-0000-000000000005",
      name: "Herramienta BD Aduana (MySQL / Postgres)",
      type: "n8n-nodes-base.mySql",
      typeVersion: 2.4,
      position: [700, 520],
      credentials: {
        mySql: {
          id: "aduanas-mysql-readonly-cred",
          name: "MySQL Aduanas (Solo Lectura)"
        }
      }
    }
  ],
  connections: {
    "When chat message received": {
      main: [
        [
          {
            node: "AI Agent - Asistente Aduanero",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Google Gemini Chat Model": {
      ai_languageModel: [
        [
          {
            node: "AI Agent - Asistente Aduanero",
            type: "ai_languageModel",
            index: 0
          }
        ]
      ]
    },
    "Simple Window Buffer Memory": {
      ai_memory: [
        [
          {
            node: "AI Agent - Asistente Aduanero",
            type: "ai_memory",
            index: 0
          }
        ]
      ]
    },
    "Herramienta BD Aduana (MySQL / Postgres)": {
      ai_tool: [
        [
          {
            node: "AI Agent - Asistente Aduanero",
            type: "ai_tool",
            index: 0
          }
        ]
      ]
    }
  },
  active: false,
  settings: {
    executionOrder: "v1"
  },
  versionId: "b8c4d2e1-0000-0000-0000-000000000001",
  meta: {
    templateCredsSetupCompleted: true,
    instanceId: "aduanas-n8n-lab3"
  },
  tags: [
    {
      name: "Aduana",
      id: "tag-aduana-01"
    },
    {
      name: "Base de Datos",
      id: "tag-bd-02"
    },
    {
      name: "Lab 3",
      id: "tag-lab3-03"
    }
  ]
};

const jsonStr = JSON.stringify(workflow, null, 2);

const path1 = '/Users/osariii/Documents/lab-3/04_agente_n8n/Prendas_Jared_Agente_Lab3.json';
const path2 = '/Users/osariii/Documents/lab-3/entregables/Prendas_Jared_Agente_Lab3.json';

fs.writeFileSync(path1, jsonStr, 'utf8');
fs.copyFileSync(path1, path2);

console.log('n8n Workflow JSON exportado exitosamente en:');
console.log('-', path1);
console.log('-', path2);
