// ── INTEGRATION DEFINITIONS ───────────────────────────────────
// Configuration for third-party export targets.

export const INTEGRATIONS = [
  { id: "airtable", name: "Airtable", icon: "📊", color: "#18BFFF", desc: "Push project scaffolds to an Airtable base", fields: [
    { key: "apiKey", label: "Personal Access Token", type: "password", ph: "pat..." },
    { key: "baseId", label: "Base ID", ph: "appXXXXXXXX" },
    { key: "tableId", label: "Table Name", ph: "Projects" },
  ]},
  { id: "gsheets", name: "Google Sheets", icon: "📗", color: "#0F9D58", desc: "Append rows to a Google Sheet", fields: [
    { key: "apiKey", label: "API Key", type: "password", ph: "AIza..." },
    { key: "sheetId", label: "Sheet ID", ph: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" },
    { key: "sheetName", label: "Tab Name", ph: "Sheet1" },
  ]},
];
