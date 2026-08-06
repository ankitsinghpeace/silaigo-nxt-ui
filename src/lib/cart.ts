const CART_KEY = "silai_cart";
const DEFAULT_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

const hasStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const getCart = () => {
  if (!hasStorage()) return [];
  const cart = localStorage.getItem(CART_KEY);
  if (cart) {
    try {
      const parsedCart = JSON.parse(cart);
      const now = new Date().getTime();
      const validCart = parsedCart.filter((item: any) => {
        return (
          item.timestamp &&
          now - new Date(item.timestamp).getTime() < DEFAULT_EXPIRY
        );
      });

      if (validCart.length !== parsedCart.length) {
        localStorage.setItem(CART_KEY, JSON.stringify(validCart));
      }

      return validCart;
    } catch (error) {
      localStorage.removeItem(CART_KEY);
      return [];
    }
  }
  return [];
};

export const addToCart = (cart: any) => {
  if (!hasStorage()) return;
  const cartItem = {
    ...cart,
    timestamp: new Date().toISOString(),
  };
  const existingCart = getCart();
  const updatedCart = [...existingCart, cartItem];
  localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
};

export const removeFromCart = (timestamp: string) => {
  if (!hasStorage()) return [];
  const existingCart = getCart();
  const updatedCart = existingCart.filter(
    (item: any) => item.timestamp !== timestamp,
  );
  localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
  return updatedCart;
};

export const clearCart = () => {
  if (!hasStorage()) return [];
  localStorage.removeItem(CART_KEY);
  return [];
};
