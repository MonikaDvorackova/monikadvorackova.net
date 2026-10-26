import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
const root = process.cwd();
const candidates = ["app", "components"];
const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const file = path.join(dir, entry);
    if (statSync(file).isDirectory()) walk(file);
    else if (/\.(tsx|jsx|mdx)$/.test(file)) files.push(file);
  }
}
for (const dir of candidates) walk(path.join(root, dir));
const bad = [];
const urls = new Set();
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const href = match[1];
    if (/^https?:\/\//.test(href)) {
      try { const url = new URL(href); if (!url.hostname) bad.push(file + ": " + href); else urls.add(href); }
      catch { bad.push(file + ": " + href); }
    } else if (href.startsWith("/") && !href.startsWith("//") && !href.includes("[") && !href.includes("{")) {
      if (href.startsWith("/api/") || href.startsWith("/blog/") || href.startsWith("/tags/") || href === "/blog" || href === "/") continue;
      const publicPath = path.join(root, "public", href.split("?")[0].replace(/^\//, ""));
      const appPath = path.join(root, "app", href.replace(/^\//, ""), "page.tsx");
      try { statSync(publicPath); } catch { try { statSync(appPath); } catch { bad.push(file + ": missing " + href); } }
    }
  }
}
if (bad.length) { console.error(bad.join("\n")); process.exit(1); }
console.log("Checked", files.length, "files;", urls.size, "external URL formats (external availability not asserted).");
