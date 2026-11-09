import test from "node:test";
import assert from "node:assert/strict";
import { isValidImageFile } from "./image-validation";

test("validates supported image signatures", () => {
  assert.equal(isValidImageFile("image/png", new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])), true);
  assert.equal(isValidImageFile("image/jpeg", new Uint8Array([255, 216, 255])), true);
  assert.equal(isValidImageFile("image/webp", new TextEncoder().encode("RIFF1234WEBP")), true);
  assert.equal(isValidImageFile("image/gif", new TextEncoder().encode("GIF89a")), true);
});

test("rejects mismatched and unsupported image signatures", () => {
  assert.equal(isValidImageFile("image/png", new TextEncoder().encode("not an image")), false);
  assert.equal(isValidImageFile("image/svg+xml", new TextEncoder().encode("<svg />")), false);
});
