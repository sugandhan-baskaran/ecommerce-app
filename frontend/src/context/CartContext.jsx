import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api, { getErrorMessage } from "../services/api.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setCart(data.data.cart);
    } catch {
      // silent fail on background refresh
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const { data } = await api.post("/cart/items", { productId, quantity });
      setCart(data.data.cart);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await api.put(`/cart/items/${productId}`, { quantity });
      setCart(data.data.cart);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const removeItem = async (productId) => {
    try {
      const { data } = await api.delete(`/cart/items/${productId}`);
      setCart(data.data.cart);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const clearCart = async () => {
    try {
      const { data } = await api.delete("/cart");
      setCart(data.data.cart);
    } catch {
      // ignore
    }
  };

  const totalItems = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const totalPrice = cart.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalItems,
        totalPrice,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
