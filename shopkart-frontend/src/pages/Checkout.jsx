import { useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import { createPaymentOrder, readError, verifyPayment } from "../services/api";
import { useCart } from "../context/CartContext.jsx";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price);

const initialForm = {
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: ""
};

const validate = (form) => {
    const errors = {};
    Object.entries(form).forEach(([key, value]) => {
        if (!value.trim()) errors[key] = "This field is required.";
    });

    if (form.phone.trim() && !/^[0-9]{10}$/.test(form.phone.trim())) {
        errors.phone = "Phone number must contain 10 digits.";
    }

    if (form.pincode.trim() && !/^[0-9]{6}$/.test(form.pincode.trim())) {
        errors.pincode = "Pincode must contain 6 digits.";
    }

    return errors;
};

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const existing = document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

        if (existing) {
            existing.addEventListener("load", () => resolve(true), { once: true });
            existing.addEventListener("error", () => resolve(false), { once: true });
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

export default function Checkout() {
    const { customer } = useOutletContext();
    const { cartItems, loading, subtotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [busy, setBusy] = useState(false);

    const total = useMemo(
        () => cartItems.reduce(
            (sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 0),
            0
        ),
        [cartItems]
    );

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: "" }));
        setServerError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validate(form);
        setErrors(validationErrors);
        setServerError("");

        if (Object.keys(validationErrors).length > 0 || cartItems.length === 0) {
            if (cartItems.length === 0) setServerError("Your cart is empty.");
            return;
        }

        setBusy(true);

        try {
            const createResponse = await createPaymentOrder({
                fullName: form.fullName.trim(),
                phone: form.phone.trim(),
                addressLine1: form.addressLine1.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                pincode: form.pincode.trim()
            });

            const data = createResponse.data;

            if (data.mockPayment) {
                const verification = await verifyPayment({
                    shopKartOrderId: data.shopKartOrderId,
                    razorpay_order_id: data.razorpayOrderId,
                    razorpay_payment_id: `mock_payment_${Date.now()}`,
                    razorpay_signature: "mock_signature"
                });

                clearCart();
                navigate(`/orders/${verification.data.order._id}`, {
                    replace: true,
                    state: { justPlaced: true }
                });
                return;
            }

            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error("Unable to load Razorpay Checkout. Please try again.");
            }

            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: "ShopKart",
                description: "ShopKart Order",
                order_id: data.razorpayOrderId,
                prefill: {
                    name: form.fullName.trim(),
                    contact: form.phone.trim(),
                    email: customer?.email || ""
                },
                handler: async (response) => {
                    try {
                        setServerError("");

                        const verification = await verifyPayment({
                            shopKartOrderId: data.shopKartOrderId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        clearCart();
                        navigate(`/orders/${verification.data.order._id}`, {
                            replace: true,
                            state: { justPlaced: true }
                        });
                    } catch (error) {
                        setServerError(
                            readError(error, "Payment could not be verified. Your cart has not been cleared.")
                        );
                        setBusy(false);
                    }
                },
                modal: {
                    ondismiss: () => setBusy(false)
                },
                theme: {}
            };

            const paymentObject = new window.Razorpay(options);

            paymentObject.on("payment.failed", (response) => {
                console.error("Payment failed", response.error);
                setServerError("Payment failed. Your cart has not been cleared. Please try again.");
                setBusy(false);
            });

            paymentObject.open();
        } catch (error) {
            setServerError(
                readError(error, error?.message || "Unable to start checkout.")
            );
            setBusy(false);
        }
    };

    if (loading) {
        return (
            <div className="shell">
                <Navbar customer={customer} />
                <main className="checkout-page">
                    <div className="state-card">
                        <span className="spinner" aria-hidden="true" />
                        <p>Loading checkout...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="shell">
                <Navbar customer={customer} />
                <main className="checkout-page">
                    <div className="state-card wishlist-empty">
                        <div className="wishlist-empty__icon" aria-hidden="true">🛒</div>
                        <h2>Your cart is empty</h2>
                        <p>Add products before starting checkout.</p>
                        <Link to="/products" className="btn btn--solid">Browse Products</Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="shell">
            <Navbar customer={customer} />

            <main className="checkout-page">
                <div className="products-head">
                    <Link to="/cart" className="back-link">← Back to cart</Link>
                    <h1 className="page-title">Checkout</h1>
                    <p className="page-sub">Enter your shipping details and complete your test payment.</p>
                </div>

                <div className="checkout-layout">
                    <form className="checkout-form" onSubmit={handleSubmit} noValidate>
                        <section className="checkout-card">
                            <h2>Shipping Details</h2>

                            {serverError && (
                                <p className="alert" role="alert">{serverError}</p>
                            )}

                            {[
                                ["fullName", "Full Name", "text", "Aarav Sharma"],
                                ["phone", "Phone Number", "tel", "9876543210"],
                                ["addressLine1", "Address Line", "text", "22 MG Road"],
                                ["city", "City", "text", "Bengaluru"],
                                ["state", "State", "text", "Karnataka"],
                                ["pincode", "Pincode", "text", "560001"]
                            ].map(([name, label, type, placeholder]) => (
                                <div className={`field ${errors[name] ? "field--bad" : ""}`} key={name}>
                                    <label className="field__label" htmlFor={name}>{label}</label>
                                    <input
                                        id={name}
                                        name={name}
                                        type={type}
                                        value={form[name]}
                                        onChange={handleChange}
                                        placeholder={placeholder}
                                        className="field__input"
                                        inputMode={name === "phone" || name === "pincode" ? "numeric" : undefined}
                                        maxLength={name === "phone" ? 10 : name === "pincode" ? 6 : undefined}
                                    />
                                    {errors[name] && <p className="field__error">{errors[name]}</p>}
                                </div>
                            ))}

                            <button type="submit" className="btn btn--solid" disabled={busy}>
                                {busy ? "Opening Payment..." : `Pay ${formatPrice(total)}`}
                            </button>
                        </section>
                    </form>

                    <aside className="checkout-card checkout-summary">
                        <h2>Order Summary</h2>

                        <div className="checkout-items">
                            {cartItems.map((item) => (
                                <div className="checkout-item" key={item.product._id}>
                                    <div>
                                        <strong>{item.product.name}</strong>
                                        <span>× {item.quantity}</span>
                                    </div>
                                    <strong>
                                        {formatPrice(Number(item.product.price) * Number(item.quantity))}
                                    </strong>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary__row">
                            <span>Subtotal</span>
                            <strong>{formatPrice(subtotal)}</strong>
                        </div>
                        <div className="cart-summary__row">
                            <span>Delivery</span>
                            <strong>Free</strong>
                        </div>
                        <div className="cart-summary__total">
                            <span>Total</span>
                            <strong>{formatPrice(total)}</strong>
                        </div>

                        <p className="checkout-note">
                            Razorpay is running in Test Mode. No real money is charged.
                        </p>
                    </aside>
                </div>
            </main>
        </div>
    );
}
