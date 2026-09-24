import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSubtotal, calculateTotal, canReviewProduct, createDeliveryCode } from './checkout';

test('calculateSubtotal somando quantidade', () => {
  assert.equal(calculateSubtotal([
    { price: 25, quantity: 2 },
    { price: 10, quantity: 1 },
  ]), 60);
});

test('calculateTotal aplica cupom e arredonda', () => {
  assert.equal(calculateTotal([
    { price: 50, quantity: 1 },
    { price: 30, quantity: 1 },
  ], 10), 72);
});

test('canReviewProduct só permite produto comprado', () => {
  assert.equal(canReviewProduct(['p1','p2'], 'p1'), true);
  assert.equal(canReviewProduct(['p1','p2'], 'p3'), false);
});

test('createDeliveryCode gera código estável', () => {
  assert.match(createDeliveryCode('product-123'), /^VALORIA-/);
});
