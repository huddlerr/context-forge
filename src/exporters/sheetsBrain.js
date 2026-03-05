/**
 * Export a Second Brain session to Google Sheets.
 * Appends a row with all 24 onboarding answers plus metadata.
 *
 * Recommended sheet columns (A–Z+):
 * Name | Role | Timezone | One-Liner | Top Priority | Company | Products |
 * Tools | MCP Servers | Team Size | Key People | Team Comms | Team Pain |
 * Focuses | Deadlines | Goals | Projects | Format Prefs | Pet Peeves |
 * Internal Tone | External Tone | Recurring Tasks | First Handoff | Automate |
 * Files Generated | Generated At | Mode
 */
export async function exportBrainToSheets(config, answers, files) {
  const { apiKey, sheetId, sheetName } = config;
  if (!apiKey || !sheetId) throw new Error("Missing Google Sheets config");

  const tab = sheetName || "Sheet1";

  const values = [[
    answers.name        || "",
    answers.role        || "",
    answers.timezone    || "",
    answers.oneliner    || "",
    answers.priority    || "",
    answers.company     || "",
    answers.products    || "",
    answers.tools       || "",
    answers.mcps        || "",
    answers.teamsize    || "",
    answers.keypeople   || "",
    answers.comms       || "",
    answers.teampain    || "",
    answers.focuses     || "",
    answers.deadlines   || "",
    answers.goals       || "",
    answers.projects    || "",
    answers.format      || "",
    answers.peeves      || "",
    answers.internal    || "",
    answers.external    || "",
    answers.recurring   || "",
    answers.handoff     || "",
    answers.automate    || "",
    Object.keys(files).filter(f => !f.endsWith(".gitkeep")).join(", "),
    new Date().toISOString(),
    "Second Brain",
  ]];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tab)}!A:AA:append?valueInputOption=USER_ENTERED&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Sheets error ${res.status}`);
  }
  return await res.json();
}
