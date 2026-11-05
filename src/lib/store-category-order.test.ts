import assert from "node:assert/strict";
import test from "node:test";
import { getStoreCategoryOrder } from "./store-category-order";

test("store category order respects saved ids and appends new categories by name", () => {
  const categories = [
    { id: "items", name: "Itens" },
    { id: "particles", name: "Partículas" },
    { id: "chests", name: "Baús" },
    { id: "coins", name: "Moedas" },
  ];

  assert.deepEqual(
    getStoreCategoryOrder(categories, JSON.stringify(["particles", "chests", "missing"])).map(category => category.id),
    ["particles", "chests", "items", "coins"],
  );
});

test("store category order safely falls back when saved data is invalid", () => {
  const categories = [
    { id: "z", name: "VIPs" },
    { id: "a", name: "Baús" },
  ];

  assert.deepEqual(getStoreCategoryOrder(categories, "{invalid").map(category => category.id), ["a", "z"]);
});
