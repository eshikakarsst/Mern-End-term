import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import WishlistCard from "../components/WishlistCard.jsx";
import {
    getWishlist,
    readError,
    removeFromWishlist
} from "../services/api";

export default function Wishlist() {
    const { customer } = useOutletContext();
    const [wishlist, setWishlist] = useState([]);
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState(null);
    const [removeError, setRemoveError] = useState("");

    const loadWishlist = useCallback(async () => {
        setStatus("loading");
        setError("");
        setRemoveError("");

        try {
            const response = await getWishlist();
            setWishlist(response.data.wishlist || []);
            setStatus("ready");
        } catch (requestError) {
            setError(
                readError(
                    requestError,
                    "We couldn't load your wishlist."
                )
            );
            setStatus("error");
        }
    }, []);

    useEffect(() => {
        loadWishlist();
    }, [loadWishlist]);

    const handleRemove = async (productId) => {
        if (removingId) return;

        setRemovingId(productId);
        setRemoveError("");

        try {
            await removeFromWishlist(productId);
            setWishlist((current) =>
                current.filter((product) => product._id !== productId)
            );
        } catch (requestError) {
            setRemoveError(
                readError(
                    requestError,
                    "Unable to remove product. Please try again."
                )
            );
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="shell">
            <Navbar customer={customer} />

            <main className="products-page">
                <div className="products-head">
                    <Link to="/products" className="back-link">
                        ← Continue shopping
                    </Link>
                    <h1 className="page-title">My Wishlist</h1>
                    {status === "ready" && wishlist.length > 0 && (
                        <p className="page-sub">
                            {wishlist.length}{" "}
                            {wishlist.length === 1 ? "product" : "products"} saved
                        </p>
                    )}
                </div>

                {status === "loading" && (
                    <div className="state-card">
                        <span className="spinner" aria-hidden="true" />
                        <p>Loading your wishlist...</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="state-card state-card--error" role="alert">
                        <h2>Something went wrong.</h2>
                        <p>We couldn't load your wishlist.</p>
                        <p>{error}</p>
                        <button
                            type="button"
                            className="btn btn--solid"
                            onClick={loadWishlist}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {status === "ready" && wishlist.length === 0 && (
                    <div className="state-card wishlist-empty">
                        <div className="wishlist-empty__icon" aria-hidden="true">
                            ❤️
                        </div>
                        <h2>Your wishlist is empty</h2>
                        <p>Save products you love and find them here later.</p>
                        <Link to="/products" className="btn btn--solid">
                            Browse Products
                        </Link>
                    </div>
                )}

                {status === "ready" && wishlist.length > 0 && (
                    <>
                        {removeError && (
                            <div className="alert" role="alert">
                                {removeError}
                            </div>
                        )}

                        <section className="product-grid" aria-label="Wishlist products">
                            {wishlist.map((product) => (
                                <WishlistCard
                                    key={product._id}
                                    product={product}
                                    removing={removingId === product._id}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
