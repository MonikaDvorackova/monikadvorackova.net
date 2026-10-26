import { chromium } from "playwright";
const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
try {
  for (const pathname of ["/", "/blog"]) {
    const response = await page.goto(new URL(pathname, base).toString(), { waitUntil: "networkidle", timeout: 45000 });
    if (!response?.ok()) throw new Error(pathname + " HTTP " + response?.status());
    await page.locator("body").waitFor({ state: "visible" });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 4)) throw new Error(pathname + " has horizontal overflow");
  }
  await page.getByText("Research & Software", { exact: true }).waitFor();
  await page.getByText("Publications", { exact: true }).waitFor();
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("Mobile smoke passed for / and /blog at 390×844.");
} finally { await browser.close(); }
