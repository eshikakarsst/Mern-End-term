import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import { getOrders, readError } from "../services/api";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price);

const formatDate = (date) =>
    new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(new Date(date));

export default function Orders() {
    const { customer } = useOutletContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadOrders = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getOrders();
            setOrders(response.data.orders || []);
        } catch (requestError) {
            setError(readError(requestError, "Unable to load your orders."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    return (
        <div className="shell">
            <Navbar customer={customer} />

            <main className="orders-page">
                <div className="products-head">
                    <h1 className="page-title">My Orders</h1>
                    <p className="page-sub">Your completed and in-progress ShopKart orders.</p>
                </div>

                {loading && (
                    <div className="state-card">
                        <span className="spinner" aria-hidden="true" />
                        <p>Loading your orders...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="state-card state-card--error">
                        <h2>Unable to load orders</h2>
                        <p>{error}</p>
                        <button className="btn btn--solid" type="button" onClick={loadOrders}>
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <div className="state-card wishlist-empty">
                        <div className="wishlist-empty__icon" aria-hidden="true">📦</div>
                        <h2>You have not placed any orders yet.</h2>
                        <p>Your completed purchases will appear here.</p>
                        <Link to="/products" className="btn btn--solid">Start Shopping</Link>
                    </div>
                )}

                {!loading && !error && orders.length > 0 && (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <article className="order-card" key={order._id}>
                                <div className="order-card__head">
                                    <div>
                                        <span className="order-card__label">Order #{order._id}</span>
                                        <strong>{formatDate(order.createdAt)}</strong>
                                    </div>
                                    <span className={`status status--${order.status.toLowerCase().replaceAll("_", "-")}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="order-card__items">
                                    {order.items.map((item) => (
                                        <div className="order-line" key={`${order._id}-${item.product}`}>
                                            <span>{item.name} × {item.quantity}</span>
                                            <strong>{formatPrice(item.price * item.quantity)}</strong>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-card__footer">
                                    <strong>Total: {formatPrice(order.totalAmount)}</strong>
                                    <Link to={`/orders/${order._id}`} className="btn btn--ghost">
                                        View Details
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
