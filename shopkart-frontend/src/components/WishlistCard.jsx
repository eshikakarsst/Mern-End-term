import { Link } from "react-router-dom";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price);

export default function WishlistCard({ product, removing, onRemove }) {
    const inStock = product.stock > 0;

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

                <div className="product-card__actions">
                    <Link
                        className="btn btn--solid product-card__button"
                        to={`/products/${product._id}`}
                    >
                        View Details
                    </Link>

                    <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => onRemove(product._id)}
                        disabled={removing}
                    >
                        {removing ? "Removing..." : "Remove ♥"}
                    </button>
                </div>
            </div>
        </article>
    );
}
