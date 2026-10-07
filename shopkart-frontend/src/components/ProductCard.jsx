import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { Link } from "react-router-dom";

import {
    addToWishlist,
    readError,
    removeFromWishlist
} from "../services/api";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price);

export default function ProductCard({
    product,
    initialWishlisted = false,
    onWishlistChange
}) {
    const [wishlisted, setWishlisted] = useState(initialWishlisted);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const { addToCart, actionLoading, isInCart } = useCart();

    const inStock = product.stock > 0;
    const inCart = isInCart(product._id);
    const adding = Boolean(actionLoading[product._id]);

    useEffect(() => {
        setWishlisted(initialWishlisted);
    }, [initialWishlisted]);

    const handleAddToCart = async () => {
        if (adding || !inStock) return;
        setError("");
        const result = await addToCart(product._id);
        if (!result.success) {
            setError(result.error);
        }
    };

    const handleWishlist = async () => {
        if (saving) return;

        setSaving(true);
        setError("");

        try {
            if (wishlisted) {
                await removeFromWishlist(product._id);
                setWishlisted(false);
                onWishlistChange?.(product._id, false);
            } else {
                await addToWishlist(product._id);
                setWishlisted(true);
                onWishlistChange?.(product._id, true);
            }
        } catch (requestError) {
            setError(
                readError(
                    requestError,
                    wishlisted
                        ? "Unable to remove product. Please try again."
                        : "Unable to save product. Please try again."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <article className="product-card">
            <div className="product-card__image-wrap">
                <img
                    className="product-card__image"
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                />
            </div>

            <div className="product-card__body">
                <span className="product-card__category">{product.category}</span>
                <h2 className="product-card__name">{product.name}</h2>
                <p className="product-card__price">{formatPrice(product.price)}</p>

                <p className={`stock ${inStock ? "stock--in" : "stock--out"}`}>
                    {inStock ? `${product.stock} units left` : "Out of stock"}
                </p>

                {error && (
                    <p className="wishlist-error" role="alert">
                        {error}
                    </p>
                )}

                <div className="product-card__actions">
                    <Link
                        className="btn btn--solid product-card__button"
                        to={`/products/${product._id}`}
                    >
                        View Details
                    </Link>

                    <button
                        type="button"
                        className="btn btn--cart"
                        onClick={handleAddToCart}
                        disabled={adding || !inStock}
                    >
                        {adding ? "Adding..." : inCart ? "Add Another" : "Add to Cart"}
                    </button>

                    <button
                        type="button"
                        className={`btn wishlist-btn ${wishlisted ? "wishlist-btn--saved" : ""}`}
                        onClick={handleWishlist}
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : wishlisted
                                ? "♥ Added to Wishlist"
                                : "♡ Add to Wishlist"}
                    </button>
                </div>
            </div>
        </article>
    );
}
