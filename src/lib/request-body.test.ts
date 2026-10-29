import test from "node:test";
import assert from "node:assert/strict";
import { readJsonBody } from "./request-body";

test("readJsonBody parses valid bounded JSON", async () => {
  const request = new Request("https://valoria.test/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Atualização" }),
  });
  assert.deepEqual(await readJsonBody<{ title: string }>(request), { data: { title: "Atualização" } });
});

test("readJsonBody rejects invalid JSON", async () => {
  const request = new Request("https://valoria.test/api", { method: "POST", body: "{" });
  assert.deepEqual(await readJsonBody(request), { error: "invalid" });
});

test("readJsonBody rejects oversized bodies", async () => {
  const request = new Request("https://valoria.test/api", { method: "POST", body: JSON.stringify({ value: "12345" }) });
  assert.deepEqual(await readJsonBody(request, 8), { error: "too_large" });
});

test("readJsonBody rejects oversized declared content length before reading", async () => {
  const request = new Request("https://valoria.test/api", {
    method: "POST",
    headers: { "content-length": "1000" },
    body: "{}",
  });
  assert.deepEqual(await readJsonBody(request, 8), { error: "too_large" });
});
