export type CheckoutItem = { price: number; quantity?: number };

export function calculateSubtotal(items: CheckoutItem[]) {
  return Number(items.reduce((sum, item) => sum + Number(item.price || 0) * Math.max(1, Number(item.quantity || 1)), 0).toFixed(2));
}

export function calculateTotal(items: CheckoutItem[], discountPercent = 0) {
  const subtotal = calculateSubtotal(items);
  const discounted = subtotal * (1 - Math.min(Math.max(discountPercent, 0), 100) / 100);
  return Number(discounted.toFixed(2));
}

export function canReviewProduct(boughtProductIds: string[], productId: string) {
  return boughtProductIds.includes(productId);
}

export function createDeliveryCode(productId: string) {
  return `VALORIA-${String(productId).slice(0, 8).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
