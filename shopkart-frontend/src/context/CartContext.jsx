import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
    addToCart as addToCartRequest,
    getCart,
    readError,
    removeFromCart as removeFromCartRequest,
    updateCartQuantity as updateCartQuantityRequest
} from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState({});

    const loadCart = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await getCart();
            setCartItems(response.data.cart || []);
        } catch (requestError) {
            setError(readError(requestError, "Unable to load your cart."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const runAction = async (productId, action) => {
        setActionLoading((current) => ({ ...current, [productId]: true }));
        setError("");
        try {
            const response = await action();
            setCartItems(response.data.cart || []);
            return { success: true };
        } catch (requestError) {
            const message = readError(requestError, "Unable to update your cart.");
            setError(message);
            return { success: false, error: message };
        } finally {
            setActionLoading((current) => {
                const next = { ...current };
                delete next[productId];
                return next;
            });
        }
    };

    const addToCart = (productId) =>
        runAction(productId, () => addToCartRequest(productId));

    const updateQuantity = (productId, quantity) =>
        runAction(productId, () => updateCartQuantityRequest(productId, quantity));

    const removeFromCart = (productId) =>
        runAction(productId, () => removeFromCartRequest(productId));

    const cartCount = useMemo(
        () => cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0),
        [cartItems]
    );

    const subtotal = useMemo(
        () => cartItems.reduce(
            (total, item) => total + Number(item.product?.price || 0) * Number(item.quantity || 0),
            0
        ),
        [cartItems]
    );

    const clearCart = useCallback(() => {
        setCartItems([]);
        setError("");
    }, []);

    const value = {
        cartItems,
        loading,
        error,
        actionLoading,
        cartCount,
        subtotal,
        loadCart,
        clearCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        isInCart: (productId) => cartItems.some((item) => item.product?._id === productId)
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used inside CartProvider");
    }
    return context;
}
