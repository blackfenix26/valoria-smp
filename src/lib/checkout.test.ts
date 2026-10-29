import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSubtotal, calculateTotal, canReviewProduct, createDeliveryCode, isValidDeliveryCode, normalizePixPhoneKey } from './checkout';
import { parseProductBenefits } from './product-content';

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
  assert.match(createDeliveryCode('product-123'), /^VLR-[A-HJ-NP-Z2-9]{6}$/);
});

test('isValidDeliveryCode rejeita caracteres ambíguos e formato incorreto', () => {
  assert.equal(isValidDeliveryCode('VLR-ABCD23'), true);
  assert.equal(isValidDeliveryCode('VLR-ABIO23'), false);
  assert.equal(isValidDeliveryCode('VALORIA-ABCD23'), false);
});

test('normalizePixPhoneKey normaliza celular nacional e internacional', () => {
  assert.equal(normalizePixPhoneKey('11912089765'), '+5511912089765');
  assert.equal(normalizePixPhoneKey('+55 (11) 91208-9765'), '+5511912089765');
});

test('parseProductBenefits separa benefícios VIP sem perder descrições', () => {
  assert.deepEqual(parseProductBenefits('✨ Personalidade Real — 3 Partículas exclusivas 📜 Menu VIP — Menu exclusivo (Java Edition)'), [
    { title: 'Personalidade Real', detail: '3 Partículas exclusivas' },
    { title: 'Menu VIP', detail: 'Menu exclusivo (Java Edition)' },
  ]);
});
