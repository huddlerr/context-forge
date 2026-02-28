export interface IntegrationField {
  key: string;
  label: string;
  type?: string;
  ph: string;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  desc: string;
  fields: IntegrationField[];
}

export const INTEGRATIONS: IntegrationConfig[] = [
  { id: "airtable", name: "Airtable", icon: "\uD83D\uDCCA", color: "#18BFFF", desc: "Push project scaffolds to an Airtable base", fields: [
    { key: "apiKey", label: "Personal Access Token", type: "password", ph: "pat..." },
    { key: "baseId", label: "Base ID", ph: "appXXXXXXXX" },
    { key: "tableId", label: "Table Name", ph: "Projects" },
  ]},
  { id: "gsheets", name: "Google Sheets", icon: "\uD83D\uDCD7", color: "#0F9D58", desc: "Append rows to a Google Sheet", fields: [
    { key: "apiKey", label: "API Key", type: "password", ph: "AIza..." },
    { key: "sheetId", label: "Sheet ID", ph: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" },
    { key: "sheetName", label: "Tab Name", ph: "Sheet1" },
  ]},
];
