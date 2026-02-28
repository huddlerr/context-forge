import { calcConf } from "../engines/calcConf";

export async function exportToSheets(config, answers, files) {
  const { apiKey, sheetId, sheetName } = config;
  if (!apiKey || !sheetId) throw new Error("Missing Google Sheets config");
  const tab = sheetName || "Sheet1";
  const conf = calcConf(answers);
  const values = [[
    (answers[0] || "untitled").substring(0, 40),
    ...answers,
    Math.round(conf.overall * 100),
    Object.keys(files).join(", "),
    new Date().toISOString(),
  ]];
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tab)}!A:O:append?valueInputOption=USER_ENTERED&key=${apiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ values }) }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Sheets error ${res.status}`);
  }
  return await res.json();
}
