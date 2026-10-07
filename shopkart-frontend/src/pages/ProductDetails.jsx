import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import { getProductById, readError } from "../services/api";
import { useCart } from "../context/CartContext.jsx";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price);

export default function ProductDetails() {
    const { customer } = useOutletContext();
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState("");
    const { addToCart, actionLoading, isInCart } = useCart();

    useEffect(() => {
        let active = true;

        const loadProduct = async () => {
            setStatus("loading");
            setError("");

            try {
                const response = await getProductById(id);

                if (!active) return;

                setProduct(response.data.product);
                setStatus("ready");
            } catch (requestError) {
                if (!active) return;

                setError(
                    readError(
                        requestError,
                        "Something went wrong while loading the product."
                    )
                );
                setStatus("error");
            }
        };

        loadProduct();

        return () => {
            active = false;
        };
    }, [id]);

    const handleAddToCart = async () => {
        if (!product || product.stock === 0 || actionLoading[product._id]) {
            return;
        }

        await addToCart(product._id);
    };

    return (
        <div className="shell">
            <Navbar customer={customer} />

            <main className="details-page">
                <Link to="/products" className="back-link">
                    ← Back to products
                </Link>

                {status === "loading" && (
                    <div className="state-card">
                        <span className="spinner" aria-hidden="true" />
                        <p>Loading product...</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="state-card state-card--error" role="alert">
                        <h1>Product unavailable</h1>
                        <p>{error}</p>
                    </div>
                )}

                {status === "ready" && product && (
                    <article className="product-details">
                        <div className="product-details__image-wrap">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="product-details__image"
                            />
                        </div>

                        <div className="product-details__content">
                            <span className="product-card__category">
                                {product.category}
                            </span>
                            <h1 className="page-title">{product.name}</h1>
                            <p className="product-details__price">
                                {formatPrice(product.price)}
                            </p>
                            <p className="product-details__description">
                                {product.description}
                            </p>

                            <dl className="product-meta">
                                <div>
                                    <dt>Category</dt>
                                    <dd>{product.category}</dd>
                                </div>
                                <div>
                                    <dt>Stock</dt>
                                    <dd>
                                        {product.stock > 0
                                            ? `${product.stock} units available`
                                            : "Out of stock"}
                                    </dd>
                                </div>
                            </dl>

                            <button
                                type="button"
                                className="btn btn--solid product-details__cart"
                                disabled={product.stock === 0 || Boolean(actionLoading[product._id])}
                                onClick={handleAddToCart}
                            >
                                {actionLoading[product._id]
                                    ? "Adding..."
                                    : product.stock > 0
                                        ? isInCart(product._id)
                                            ? "Add Another"
                                            : "Add to Cart"
                                        : "Out of Stock"}
                            </button>
                        </div>
                    </article>
                )}
            </main>
        </div>
    );
}
