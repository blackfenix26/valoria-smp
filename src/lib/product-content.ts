export type ProductBenefit = { title: string; detail: string };

export function parseProductBenefits(description: string): ProductBenefit[] {
  const text = description.trim();
  if (!text) return [];

  const markers = [...text.matchAll(/[\p{Extended_Pictographic}]/gu)];
  if (!markers.length) {
    return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
      const [title, ...rest] = line.split(/\s+[—·:]\s+/);
      return { title: title.trim(), detail: rest.join(" · ").trim() };
    });
  }

  return markers.map((marker, index) => {
    const start = marker.index ?? 0;
    const end = markers[index + 1]?.index ?? text.length;
    const content = text.slice(start + marker[0].length, end).trim();
    const [title, ...rest] = content.split(/\s+[—·:]\s+/);
    return { title: title.trim() || content, detail: rest.join(" · ").trim() };
  }).filter(benefit => benefit.title.length > 0);
}