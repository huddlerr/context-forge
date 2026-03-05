import { zipSync, strToU8 } from "fflate";

/**
 * Download files as a real ZIP archive, preserving folder structure.
 * @param {Record<string,string>} files  - flat map of { "path/file": "content" }
 * @param {string} [filename]            - base name for the zip (without .zip)
 */
export function downloadZip(files, filename = "context-forge-scaffold") {
  // Build fflate input: { "path/file": Uint8Array }
  const zipInput = {};
  for (const [path, content] of Object.entries(files)) {
    // Skip .gitkeep files — they're only needed for git tracking
    if (path.endsWith(".gitkeep")) continue;
    zipInput[path] = strToU8(content);
  }

  const zipped = zipSync(zipInput, { level: 6 });
  const blob = new Blob([zipped], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Legacy plain-text bundle download.
 */
export function downloadTextBundle(files, filename = "context-forge-scaffold") {
  const content = Object.entries(files)
    .map(([name, body]) => `${"=".repeat(60)}\n== ${name}\n${"=".repeat(60)}\n\n${body}`)
    .join("\n\n");
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
