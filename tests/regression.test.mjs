import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
async function load(relativePath) {
  const source = await readFile(new URL(relativePath, import.meta.url), 'utf8');
  return import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
}
const {calculateSubtotal, calculateTax, hasAvailableStock, addCartItem, updateCartQuantity} = await load('../src/modules/ventas/utils/sale-calculations.js');
test('calculates prices and displayed ten percent tax', () => {
  const total = calculateSubtotal([{price: 0.1, cantidad: 3}, {price: 0.2, cantidad: 1}]);
  assert.equal(total, 0.5);
  assert.equal(calculateTax(total), 0.05);
});
test('rejects invalid quantities and insufficient stock', () => {
  assert.throws(() => calculateSubtotal([{price: 2, cantidad: -1}]));
  assert.equal(hasAvailableStock({id: 1, cantidad: 3}, [{id: 1, stock: 2}]), false);
  assert.equal(hasAvailableStock({id: 1, cantidad: 1}, []), false);
});
test('repeated additions cannot exceed stock', () => {
  const product = {id: 1, price: 2, stock: 1};
  const cart = addCartItem([], product);
  assert.equal(addCartItem(cart, product), cart);
  assert.equal(updateCartQuantity(cart, 1, 2, [product]), cart);
});

test('rejects missing prices and unsafe totals without changing the cart', () => {
  for (const price of [null, '', '  ', true, Infinity]) {
    assert.throws(() => calculateSubtotal([{price, cantidad: 1}]));
    const cart = [];
    assert.equal(addCartItem(cart, {id: 1, price, stock: 1}), cart);
  }
  assert.throws(() => calculateTax(-1));
  assert.throws(() => calculateSubtotal([{price: Number.MAX_SAFE_INTEGER, cantidad: 2}]));
});
