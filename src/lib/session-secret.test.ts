import test from "node:test";
import assert from "node:assert/strict";
import { getSessionSecret } from "./session-secret";

test("development can start without production signing secrets", () => {
  assert.match(getSessionSecret({ NODE_ENV: "development" }), /development-only$/);
});

test("production requires a configured secret", () => {
  assert.throws(() => getSessionSecret({ NODE_ENV: "production" }), /Configure AUTH_SECRET/);
});

test("production rejects weak and placeholder secrets", () => {
  assert.throws(() => getSessionSecret({ NODE_ENV: "production", AUTH_SECRET: "short" }), /at least 32 characters/);

  assert.throws(() => getSessionSecret({ NODE_ENV: "production", AUTH_SECRET: "troque-this-long-secret-value-for-a-real-secret" }), /must not be a placeholder/);
});

test("production accepts a sufficiently long configured secret", () => {
  const secret = "a-production-secret-with-more-than-thirty-two-characters";
  assert.equal(getSessionSecret({ NODE_ENV: "production", AUTH_SECRET: secret }), secret);
});
