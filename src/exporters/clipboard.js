export function copyAll(files) {
  const content = Object.entries(files).map(([n, c]) => `== ${n} ==\n\n${c}`).join("\n\n");
  navigator.clipboard?.writeText(content);
}
