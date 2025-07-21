'use client';
import React, { createContext, useContext } from 'react';

type CartContextType = {
  [key: string]: any;
};

export const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = React.useState<any[]>([]);
  const [checkoutItems, setCheckoutItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: any, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.inventory) return prevItems;
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setItems(prevItems => {
      const product = prevItems.find(item => item.product.id === productId)?.product;
      if (product && quantity > product.inventory) return prevItems;
      return prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const proceedToCheckout = (products: any | any[], quantity: number = 1) => {
    const productArray = Array.isArray(products) ? products : [products];
    const checkout = productArray.map(product => ({
      product,
      quantity: Array.isArray(products) ? 1 : quantity
    }));
    setCheckoutItems(checkout);
  };

  const clearCheckout = () => {
    setCheckoutItems([]);
  };

  const getCartItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotal = () => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const isInCart = (productId: string) => {
    return items.some(item => item.product.id === productId);
  };

  const getCartItemQuantity = (productId: string) => {
    const item = items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const totalItems = getCartItemCount();
  const totalPrice = getCartTotal();

  const contextValue = {
    items,
    checkoutItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    proceedToCheckout,
    clearCheckout,
    getCartItemCount,
    getCartTotal,
    isInCart,
    getCartItemQuantity,
    totalItems,
    totalPrice
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
