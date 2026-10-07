import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { logoutCustomer } from "../services/api";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar({ customer }) {
    const [busy, setBusy] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { cartCount } = useCart();

    const handleLogout = async () => {
        setBusy(true);

        try {
            // The backend clears the HttpOnly cookie; the browser drops it.
            await logoutCustomer();
        } catch (error) {
            // Even if the call fails the session is unusable, so leave anyway.
            console.error(error);
        } finally {
            navigate("/login", { replace: true });
        }
    };

    return (
        <header className="nav">
            <span className="wordmark wordmark--sm">
                Shop<span className="wordmark__tail">Kart</span>
            </span>

            <nav className="nav__links" aria-label="Primary navigation">
                <Link
                    className={location.pathname.startsWith("/products") ? "nav__link nav__link--active" : "nav__link"}
                    to="/products"
                >
                    Products
                </Link>
                <Link
                    className={location.pathname.startsWith("/cart") ? "nav__link nav__link--active" : "nav__link"}
                    to="/cart"
                >
                    Cart {cartCount > 0 ? `(${cartCount})` : ""}
                </Link>
                <Link
                    className={location.pathname.startsWith("/orders") ? "nav__link nav__link--active" : "nav__link"}
                    to="/orders"
                >
                    Orders
                </Link>
                <Link
                    className={location.pathname.startsWith("/wishlist") ? "nav__link nav__link--active" : "nav__link"}
                    to="/wishlist"
                >
                    Wishlist
                </Link>
            </nav>

            <div className="nav__right">
                {customer && (
                    <span className="nav__who">{customer.fullName}</span>
                )}

                <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={handleLogout}
                    disabled={busy}
                >
                    {busy ? "Logging out" : "Log out"}
                </button>
            </div>
        </header>
    );
}
