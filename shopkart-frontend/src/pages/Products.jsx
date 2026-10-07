import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import {
    getProducts,
    getWishlist,
    readError
} from "../services/api";

const CATEGORIES = ["All Categories", "Electronics", "Fashion", "Books", "Home"];

export default function Products() {
    const { customer } = useOutletContext();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All Categories");
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState("");
    const [wishlistIds, setWishlistIds] = useState(new Set());

    useEffect(() => {
        let active = true;

        const loadProducts = async () => {
            setStatus("loading");
            setError("");

            try {
                const response = await getProducts({ search, category });

                if (!active) return;

                setProducts(response.data.products || []);
                setStatus("ready");
            } catch (requestError) {
                if (!active) return;

                setError(
                    readError(
                        requestError,
                        "Something went wrong while loading products."
                    )
                );
                setStatus("error");
            }
        };

        loadProducts();

        return () => {
            active = false;
        };
    }, [search, category]);

    useEffect(() => {
        let active = true;

        getWishlist()
            .then((response) => {
                if (!active) return;

                const ids = (response.data.wishlist || []).map((item) => item._id);
                setWishlistIds(new Set(ids));
            })
            .catch(() => {
                // Product browsing still works if the initial wishlist lookup fails.
                if (active) setWishlistIds(new Set());
            });

        return () => {
            active = false;
        };
    }, []);

    const handleWishlistChange = (productId, saved) => {
        setWishlistIds((current) => {
            const next = new Set(current);
            if (saved) {
                next.add(productId);
            } else {
                next.delete(productId);
            }
            return next;
        });
    };

    return (
        <div className="shell">
            <Navbar customer={customer} />

            <main className="products-page">
                <div className="products-head">
                    <div>
                        <Link to="/home" className="back-link">
                            ← Account
                        </Link>
                        <h1 className="page-title">Product Discovery</h1>
                        <p className="page-sub">
                            Browse the latest products available on ShopKart.
                        </p>
                    </div>
                </div>

                <section className="product-controls" aria-label="Product search and filters">
                    <div className="search-wrap">
                        <label htmlFor="product-search">Search products</label>
                        <input
                            id="product-search"
                            className="field__input"
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search products..."
                        />
                    </div>

                    <div className="category-wrap">
                        <label htmlFor="product-category">Category</label>
                        <select
                            id="product-category"
                            className="field__input"
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                        >
                            {CATEGORIES.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                {status === "loading" && (
                    <div className="state-card">
                        <span className="spinner" aria-hidden="true" />
                        <p>Loading products...</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="state-card state-card--error" role="alert">
                        <h2>Could not load products</h2>
                        <p>{error}</p>
                    </div>
                )}

                {status === "ready" && products.length === 0 && (
                    <div className="state-card">
                        <h2>No products found.</h2>
                        <p>Try a different search term or category.</p>
                    </div>
                )}

                {status === "ready" && products.length > 0 && (
                    <section className="product-grid" aria-label="Products">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                initialWishlisted={wishlistIds.has(product._id)}
                                onWishlistChange={handleWishlistChange}
                            />
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
}
