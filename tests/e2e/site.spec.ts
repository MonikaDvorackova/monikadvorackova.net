import { test, expect } from "@playwright/test";
for (const path of ["/", "/blog", "/open-source", "/blog/aigov", "/agent/docs"])
  test("existing route " + path, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
    expect(errors).toEqual([]);
  });
test("discovery API and evidence operate through real HTTP", async ({
  request,
}) => {
  for (const path of [
    "/llms.txt",
    "/llms-full.txt",
    "/.well-known/agent.json",
    "/.well-known/agent-card.json",
    "/openapi.json",
    "/robots.txt",
    "/sitemap.xml",
    "/api/v1/profile",
    "/api/v1/search?q=AIGov",
  ])
    expect((await request.get(path)).status()).toBe(200);
  const evidence = await (await request.get("/api/v1/evidence?limit=1")).json();
  const e = evidence.data.items[0];
  const verified = await (
    await request.get(
      "/api/v1/evidence/verify?" +
        new URLSearchParams({ id: e.id, digest: e.integrity.digest }),
    )
  ).json();
  expect(verified.data.valid).toBe(true);
});
