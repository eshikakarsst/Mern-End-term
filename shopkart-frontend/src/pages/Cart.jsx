import { Link, useOutletContext } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import { useCart } from "../context/CartContext.jsx";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price);

export default function Cart() {
    const { customer } = useOutletContext();
    const {
        cartItems,
        loading,
        error,
        actionLoading,
        cartCount,
        subtotal,
        loadCart,
        updateQuantity,
        removeFromCart
    } = useCart();

    return (
        <div className="shell">
            <Navbar customer={customer} />

            <main className="cart-page">
                <div className="products-head">
                    <Link to="/products" className="back-link">
                        ← Continue shopping
                    </Link>
                    <h1 className="page-title">My Cart</h1>
                    {!loading && cartItems.length > 0 && (
                        <p className="page-sub">
                            {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
                        </p>
                    )}
                </div>

                {loading && (
                    <div className="state-card">
                        <span className="spinner" aria-hidden="true" />
                        <p>Loading your cart...</p>
                    </div>
                )}

                {!loading && error && cartItems.length === 0 && (
                    <div className="state-card state-card--error" role="alert">
                        <h2>Unable to load your cart.</h2>
                        <p>{error}</p>
                        <button type="button" className="btn btn--solid" onClick={loadCart}>
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && cartItems.length === 0 && (
                    <div className="state-card wishlist-empty">
                        <div className="wishlist-empty__icon" aria-hidden="true">🛒</div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added anything yet.</p>
                        <Link to="/products" className="btn btn--solid">
                            Browse Products
                        </Link>
                    </div>
                )}

                {!loading && cartItems.length > 0 && (
                    <>
                        {error && (
                            <div className="alert" role="alert">{error}</div>
                        )}

                        <div className="cart-layout">
                            <section className="cart-items" aria-label="Cart items">
                                {cartItems.map((item) => {
                                    const product = item.product;
                                    const busy = Boolean(actionLoading[product?._id]);
                                    const atStockLimit = item.quantity >= Number(product?.stock || 0);

                                    return (
                                        <article className="cart-item" key={product._id}>
                                            <img
                                                className="cart-item__image"
                                                src={product.image}
                                                alt={product.name}
                                            />

                                            <div className="cart-item__details">
                                                <div>
                                                    <span className="product-card__category">
                                                        {product.category}
                                                    </span>
                                                    <h2 className="product-card__name">{product.name}</h2>
                                                    <p className="cart-item__unit-price">{formatPrice(product.price)} each</p>
                                                    <p className={`stock ${product.stock > 0 ? "stock--in" : "stock--out"}`}>
                                                        {product.stock > 0 ? `${product.stock} units available` : "Out of stock"}
                                                    </p>
                                                </div>
                                                <p className="product-card__price">
                                                    {formatPrice(product.price * item.quantity)}
                                                </p>
                                            </div>

                                            <div className="cart-controls">
                                                <div className="qty-controls" aria-label={`Update quantity for ${product.name}`}>
                                                    <button
                                                        type="button"
                                                        className="btn btn--ghost qty-btn"
                                                        onClick={() => updateQuantity(product._id, item.quantity - 1)}
                                                        disabled={busy || item.quantity <= 1}
                                                        aria-label={`Decrease quantity of ${product.name}`}
                                                    >−</button>
                                                    <span className="qty-value">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        className="btn btn--ghost qty-btn"
                                                        onClick={() => updateQuantity(product._id, item.quantity + 1)}
                                                        disabled={busy || atStockLimit}
                                                        aria-label={`Increase quantity of ${product.name}`}
                                                    >+</button>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="btn btn--ghost cart-remove"
                                                    onClick={() => removeFromCart(product._id)}
                                                    disabled={busy}
                                                >
                                                    {busy ? "Updating..." : "Remove"}
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </section>

                            <aside className="cart-summary">
                                <h2>Order Summary</h2>
                                <div className="cart-summary__row">
                                    <span>Items</span>
                                    <strong>{cartCount}</strong>
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
                                    <strong>{formatPrice(subtotal)}</strong>
                                </div>
                                <Link to="/checkout" className="btn btn--solid cart-checkout">
                                    Proceed to Checkout
                                </Link>
                            </aside>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
