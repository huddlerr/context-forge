import { calcConf } from "../engines/calcConf";

export async function exportToAirtable(config, answers, files) {
  const { apiKey, baseId, tableId } = config;
  if (!apiKey || !baseId || !tableId) throw new Error("Missing Airtable config");
  const slug = (answers[0] || "untitled").substring(0, 40);
  const conf = calcConf(answers);
  const fields = {
    "Project": slug,
    "Soul": answers[0] || "",
    "User": answers[1] || "",
    "Stack": answers[2] || "",
    "Data Model": answers[3] || "",
    "User Flow": answers[4] || "",
    "Vibe": answers[5] || "",
    "Auth": answers[6] || "",
    "APIs": answers[7] || "",
    "Rules": answers[8] || "",
    "Done Criteria": answers[9] || "",
    "Confidence": Math.round(conf.overall * 100),
    "Files Generated": Object.keys(files).join(", "),
    "Generated At": new Date().toISOString(),
  };
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ records: [{ fields }] }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Airtable error ${res.status}`);
  }
  return await res.json();
}
