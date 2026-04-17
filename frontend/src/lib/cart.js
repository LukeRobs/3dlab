// frontend/src/lib/cart.js
// localStorage cart for guests. Keys: product_id -> { product_id, quantity, name, price, image }

const CART_KEY = 'cart';

export function getLocalCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    localStorage.removeItem(CART_KEY);
    return [];
  }
}

export function addToLocalCart(product, quantity = 1) {
  const cart = getLocalCart();
  const existing = cart.find(i => i.product_id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ product_id: product.id, quantity, name: product.name, price: product.price, image: product.primary_image });
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
}

export function updateLocalCart(productId, quantity) {
  const cart = getLocalCart().map(i =>
    i.product_id === productId ? { ...i, quantity } : i
  ).filter(i => i.quantity > 0);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
}

export function removeFromLocalCart(productId) {
  const cart = getLocalCart().filter(i => i.product_id !== productId);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
}

export function clearLocalCart() {
  localStorage.removeItem(CART_KEY);
}
