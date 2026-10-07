import { useEffect, useState } from "react";
import { Link, useLocation, useOutletContext, useParams } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import { getOrderById, readError } from "../services/api";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price);

const formatDate = (date) =>
    new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(date));

export default function OrderDetails() {
    const { customer } = useOutletContext();
    const { id } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        getOrderById(id)
            .then((response) => {
                if (active) setOrder(response.data.order);
            })
            .catch((requestError) => {
                if (active) setError(readError(requestError, "Unable to load this order."));
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [id]);

    return (
        <div className="shell">
            <Navbar customer={customer} />

            <main className="order-details-page">
                <Link to="/orders" className="back-link">← My Orders</Link>

                {loading && (
                    <div className="state-card">
                        <span className="spinner" aria-hidden="true" />
                        <p>Loading order...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="state-card state-card--error">
                        <h2>Unable to load order</h2>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && order && (
                    <>
                        {location.state?.justPlaced && (
                            <div className="success-banner" role="status">
                                <strong>✓ Order placed successfully.</strong>
                                <span>Your payment was verified and your cart has been cleared.</span>
                            </div>
                        )}

                        <div className="order-details-head">
                            <div>
                                <h1 className="page-title">Order Details</h1>
                                <p className="page-sub">
                                    Order #{order._id} · {formatDate(order.createdAt)}
                                </p>
                            </div>
                            <span className={`status status--${order.status.toLowerCase().replaceAll("_", "-")}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="order-details-grid">
                            <section className="checkout-card">
                                <h2>Items</h2>
                                {order.items.map((item) => (
                                    <div className="detail-item" key={`${order._id}-${item.product}`}>
                                        {item.image && <img src={item.image} alt="" />}
                                        <div>
                                            <strong>{item.name}</strong>
                                            <span>{item.quantity} × {formatPrice(item.price)}</span>
                                        </div>
                                        <strong>{formatPrice(item.price * item.quantity)}</strong>
                                    </div>
                                ))}

                                <div className="cart-summary__total">
                                    <span>Total</span>
                                    <strong>{formatPrice(order.totalAmount)}</strong>
                                </div>
                            </section>

                            <section className="checkout-card">
                                <h2>Shipping Address</h2>
                                <address className="shipping-address">
                                    <strong>{order.shippingAddress.fullName}</strong>
                                    <span>{order.shippingAddress.phone}</span>
                                    <span>{order.shippingAddress.addressLine1}</span>
                                    <span>{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                                    <span>{order.shippingAddress.pincode}</span>
                                </address>

                                <div className="payment-box">
                                    <span>Payment</span>
                                    <strong>{order.paymentStatus}</strong>
                                    {order.razorpayPaymentId && (
                                        <small>Payment ID: {order.razorpayPaymentId}</small>
                                    )}
                                </div>
                            </section>
                        </div>

                        <div className="order-actions">
                            <Link to="/products" className="btn btn--solid">Continue Shopping</Link>
                            <Link to="/orders" className="btn btn--ghost">View All Orders</Link>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
