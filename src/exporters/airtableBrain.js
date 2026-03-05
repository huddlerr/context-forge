/**
 * Export a Second Brain session to Airtable.
 * Uses a flat key-value answers map (not the positional array used by Project Scaffold).
 */
export async function exportBrainToAirtable(config, answers, files) {
  const { apiKey, baseId, tableId } = config;
  if (!apiKey || !baseId || !tableId) throw new Error("Missing Airtable config");

  const name = (answers.name || "Untitled").substring(0, 40);

  const fields = {
    "Name":               answers.name        || "",
    "Role":               answers.role        || "",
    "Timezone":           answers.timezone    || "",
    "One-Liner":          answers.oneliner    || "",
    "Top Priority":       answers.priority    || "",
    "Company":            answers.company     || "",
    "Products":           answers.products    || "",
    "Tools":              answers.tools       || "",
    "MCP Servers":        answers.mcps        || "",
    "Team Size":          answers.teamsize    || "",
    "Key People":         answers.keypeople   || "",
    "Team Comms":         answers.comms       || "",
    "Team Pain":          answers.teampain    || "",
    "Current Focuses":    answers.focuses     || "",
    "Deadlines":          answers.deadlines   || "",
    "Goals":              answers.goals       || "",
    "Projects":           answers.projects    || "",
    "Format Prefs":       answers.format      || "",
    "Pet Peeves":         answers.peeves      || "",
    "Internal Tone":      answers.internal    || "",
    "External Tone":      answers.external    || "",
    "Recurring Tasks":    answers.recurring   || "",
    "First Handoff":      answers.handoff     || "",
    "Automate":           answers.automate    || "",
    "Files Generated":    Object.keys(files).filter(f => !f.endsWith(".gitkeep")).join(", "),
    "Generated At":       new Date().toISOString(),
    "Mode":               "Second Brain",
  };

  const res = await fetch(
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ records: [{ fields }] }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Airtable error ${res.status}`);
  }
  return await res.json();
}
