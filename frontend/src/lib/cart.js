// frontend/src/lib/cart.js
// localStorage cart for guests. Supports selected_variants per item.

const CART_KEY = 'cart';

function variantKey(productId, variants) {
  return `${productId}::${JSON.stringify(variants || {})}`;
}

export function getLocalCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    localStorage.removeItem(CART_KEY);
    return [];
  }
}

export function addToLocalCart(product, quantity = 1, selectedVariants = {}) {
  const cart = getLocalCart();
  const key = variantKey(product.id, selectedVariants);
  const existing = cart.find(i => variantKey(i.product_id, i.selected_variants) === key);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      product_id: product.id,
      quantity,
      name: product.name,
      price: product.price,
      image: product.primary_image,
      selected_variants: selectedVariants,
    });
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
}

export function updateLocalCart(productId, quantity, selectedVariants = {}) {
  const key = variantKey(productId, selectedVariants);
  const cart = getLocalCart()
    .map(i => variantKey(i.product_id, i.selected_variants) === key ? { ...i, quantity } : i)
    .filter(i => i.quantity > 0);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
}

export function removeFromLocalCart(productId, selectedVariants = {}) {
  const key = variantKey(productId, selectedVariants);
  const cart = getLocalCart().filter(i => variantKey(i.product_id, i.selected_variants) !== key);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
}

export function clearLocalCart() {
  localStorage.removeItem(CART_KEY);
}
