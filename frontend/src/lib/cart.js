const STORAGE_KEY = 'product_cart';

export function getCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { salonId: null, salonName: '', items: [] };
  } catch {
    return { salonId: null, salonName: '', items: [] };
  }
}

export function setCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem(STORAGE_KEY);
}

export function addToCart({ salonId, salonName, product }) {
  const cart = getCart();
  const nextCart = cart.salonId && cart.salonId !== salonId
    ? { salonId, salonName, items: [] }
    : { ...cart, salonId, salonName };

  const existing = nextCart.items.find((item) => item.product_id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    nextCart.items.push({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image_urls: product.image_urls || (product.image_url ? [product.image_url] : []),
    });
  }

  setCart(nextCart);
  return nextCart;
}

export function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  cart.items = cart.items
    .map((item) => item.product_id === productId ? { ...item, quantity } : item)
    .filter((item) => item.quantity > 0);
  if (cart.items.length === 0) {
    clearCart();
    return { salonId: null, salonName: '', items: [] };
  }
  setCart(cart);
  return cart;
}

export function removeFromCart(productId) {
  return updateCartQuantity(productId, 0);
}
