function validPrice(value) {
  return (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) &&
    Number(value) >= 0 && Number.isSafeInteger(Math.round(Number(value) * 100));
}

export function calculateSubtotal(items) {
  const cents = items.reduce((total, item) => {
    const price = Number(item.price);
    if (!validPrice(item.price) || !Number.isSafeInteger(item.cantidad) || item.cantidad <= 0) {
      throw new Error('Precio o cantidad inválidos');
    }
    const next = total + Math.round(price * 100) * item.cantidad;
    if (!Number.isSafeInteger(next)) throw new Error('Total fuera de rango');
    return next;
  }, 0);
  return cents / 100;
}

export function calculateTax(subtotal) {
  if (!validPrice(subtotal)) throw new Error('Subtotal inválido');
  return Math.round(Math.round(subtotal * 100) * 0.1) / 100;
}

export function hasAvailableStock(item, products) {
  const product = products.find(candidate => candidate.id === item.id);
  return Boolean(product) && Number.isSafeInteger(item.cantidad) && item.cantidad > 0 &&
    Number.isSafeInteger(Number(product.stock)) && item.cantidad <= Number(product.stock);
}

export function addCartItem(cart, product) {
  const existing = cart.find(item => item.id === product.id);
  const quantity = (existing?.cantidad ?? 0) + 1;
  if (!hasAvailableStock({id: product.id, cantidad: quantity}, [product]) ||
      !validPrice(product.price)) return cart;
  const next = existing ? cart.map(item => item.id === product.id ? {...item, cantidad: quantity} : item)
    : [...cart, {...product, cantidad: 1}];
  try { calculateSubtotal(next); return next; } catch { return cart; }
}
export function updateCartQuantity(cart, id, quantity, products) {
  if (!Number.isSafeInteger(quantity)) return cart;
  if (quantity <= 0) return removeCartItem(cart, id);
  if (!hasAvailableStock({id, cantidad: quantity}, products)) return cart;
  const next = cart.map(item => item.id === id ? {...item, cantidad: quantity} : item);
  try { calculateSubtotal(next); return next; } catch { return cart; }
}
export function removeCartItem(cart, id) {
  return cart.filter(item => item.id !== id);
}
