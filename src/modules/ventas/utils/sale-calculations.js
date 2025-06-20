export function calculateSubtotal(items) {
  const cents = items.reduce((total, item) => {
    const price = Number(item.price);
    if (!Number.isFinite(price) || price < 0 || !Number.isSafeInteger(item.cantidad) || item.cantidad <= 0) {
      throw new Error('Precio o cantidad inválidos');
    }
    const next = total + Math.round(price * 100) * item.cantidad;
    if (!Number.isSafeInteger(next)) throw new Error('Total fuera de rango');
    return next;
  }, 0);
  return cents / 100;
}

export function calculateTax(subtotal) {
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
      !Number.isFinite(Number(product.price)) || Number(product.price) < 0) return cart;
  return existing ? cart.map(item => item.id === product.id ? {...item, cantidad: quantity} : item)
    : [...cart, {...product, cantidad: 1}];
}
export function updateCartQuantity(cart, id, quantity, products) {
  if (!Number.isSafeInteger(quantity)) return cart;
  if (quantity <= 0) return removeCartItem(cart, id);
  if (!hasAvailableStock({id, cantidad: quantity}, products)) return cart;
  return cart.map(item => item.id === id ? {...item, cantidad: quantity} : item);
}
export function removeCartItem(cart, id) {
  return cart.filter(item => item.id !== id);
}
