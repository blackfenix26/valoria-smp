export const COMMUNITY_IMAGE_TYPES: Record<string, { extension: string; signature: (bytes: Uint8Array) => boolean }> = {
  "image/png": { extension: "png", signature: bytes => bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte) },
  "image/jpeg": { extension: "jpg", signature: bytes => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  "image/webp": { extension: "webp", signature: bytes => bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP" },
  "image/gif": { extension: "gif", signature: bytes => bytes.length >= 6 && ["GIF87a", "GIF89a"].includes(String.fromCharCode(...bytes.slice(0, 6))) },
};

export function isValidImageFile(type: string, bytes: Uint8Array) {
  return COMMUNITY_IMAGE_TYPES[type]?.signature(bytes) ?? false;
}
