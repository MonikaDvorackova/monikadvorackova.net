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

test("REST mutations and abuse controls operate over real HTTP", async ({
  request,
}) => {
  const answer = await request.post("/api/v1/ask", {
    data: { question: "What is AIGov?" },
  });
  expect(answer.status()).toBe(200);
  expect((await answer.json()).data.citations.length).toBeGreaterThan(0);
  expect(
    (
      await request.post("/api/v1/ask", {
        data: { question: "x".repeat(17000) },
      })
    ).status(),
  ).toBe(413);
  expect(
    (
      await request.post("/api/v1/ask", {
        data: { question: "AIGov" },
        headers: { Origin: "https://attacker.example" },
      })
    ).status(),
  ).toBe(403);
});
test("A2A and idempotent inquiries operate over real HTTP with isolated PostgreSQL", async ({
  request,
}) => {
  test.skip(
    !!process.env.BASE_URL || !process.env.AGENT_DATABASE_URL,
    "Requires isolated CI/local PostgreSQL and test-only credentials.",
  );
  const headers = { Authorization: "Bearer " + "e2e-a2a-" + "x".repeat(32) };
  const response = await request.post("/a2a", {
    headers,
    data: {
      jsonrpc: "2.0",
      id: 1,
      method: "message/send",
      params: {
        message: {
          kind: "message",
          role: "user",
          messageId: crypto.randomUUID(),
          parts: [{ kind: "text", text: "What is AIGov?" }],
        },
      },
    },
  });
  expect(response.status()).toBe(200);
  const task = (await response.json()).result;
  expect(task.status.state).toBe("completed");
  expect(task.artifacts.length).toBeGreaterThan(0);
  const get = await request.post("/a2a", {
    headers,
    data: {
      jsonrpc: "2.0",
      id: 2,
      method: "tasks/get",
      params: { id: task.id },
    },
  });
  expect((await get.json()).result.id).toBe(task.id);
  const canceled = await request.post("/a2a", {
    headers,
    data: {
      jsonrpc: "2.0",
      id: 3,
      method: "tasks/cancel",
      params: { id: task.id },
    },
  });
  expect((await canceled.json()).error.code).toBe(-32002);
  const inquiryHeaders = {
    Authorization: "Bearer " + "e2e-inquiry-" + "x".repeat(32),
    "Idempotency-Key": crypto.randomUUID(),
  };
  const data = {
    type: "research",
    name: "Test Researcher",
    email: "researcher@example.com",
    message: "Research collaboration for automated integration testing.",
    consent: true,
  };
  const first = await request.post("/api/v1/inquiries", {
    headers: inquiryHeaders,
    data,
  });
  const second = await request.post("/api/v1/inquiries", {
    headers: inquiryHeaders,
    data,
  });
  expect(first.status()).toBe(201);
  expect((await first.json()).data.id).toBe((await second.json()).data.id);
});
