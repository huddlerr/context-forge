export function downloadZip(files) {
  const content = Object.entries(files).map(([name, body]) =>
    `${"=".repeat(60)}\n== ${name}\n${"=".repeat(60)}\n\n${body}`
  ).join("\n\n");
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "context-forge-scaffold.txt";
  a.click();
  URL.revokeObjectURL(url);
}
