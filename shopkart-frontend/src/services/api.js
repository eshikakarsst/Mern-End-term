import axios from "axios";

/*
 * One axios instance for the whole app.
 *
 * withCredentials: true is the important part. The backend logs a customer in
 * by setting an HttpOnly cookie named "token". JavaScript cannot read that
 * cookie, so the browser has to attach it to requests by itself, and it only
 * does that on cross-origin calls when withCredentials is true.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

export const registerCustomer = (payload) =>
    api.post("/customers/register", payload);

export const loginCustomer = (payload) =>
    api.post("/customers/login", payload);

// Returns the customer document straight from the backend, minus the password.
export const fetchCurrentCustomer = () => api.get("/customers/me");

export const logoutCustomer = () => api.post("/customers/logout");

export const getProducts = (params = {}) => api.get("/products", { params });

export const getProductById = (id) => api.get(`/products/${id}`);

export const getWishlist = () => api.get("/wishlist");

export const addToWishlist = (productId) =>
    api.post(`/wishlist/${productId}`);

export const removeFromWishlist = (productId) =>
    api.delete(`/wishlist/${productId}`);

export const getCart = () => api.get("/cart");

export const addToCart = (productId) =>
    api.post(`/cart/${productId}`);

export const updateCartQuantity = (productId, quantity) =>
    api.patch(`/cart/${productId}`, { quantity });

export const removeFromCart = (productId) =>
    api.delete(`/cart/${productId}`);


export const createPaymentOrder = (shippingAddress) =>
    api.post("/orders/create-payment-order", { shippingAddress });

export const verifyPayment = (payload) =>
    api.post("/orders/verify-payment", payload);

export const getOrders = () => api.get("/orders");

export const getOrderById = (id) => api.get(`/orders/${id}`);

// Pulls a readable message out of an axios error, whatever shape it arrived in.
export const readError = (error, fallback = "Something went wrong") => {
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }

    if (error?.code === "ERR_NETWORK") {
        return "Cannot reach the server. Is the backend running on port 5000?";
    }

    return fallback;
};

export default api;
