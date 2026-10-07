import { Link } from "react-router-dom";

/*
 * Shared two-panel frame for the Login and Register pages.
 * The left panel is the shop side, the right panel holds the form.
 */
export default function AuthShell({ title, subtitle, children, footer }) {
    return (
        <div className="auth">
            <aside className="auth__aside">
                <Link to="/login" className="wordmark">
                    Shop<span className="wordmark__tail">Kart</span>
                </Link>

                <p className="auth__pitch">
                    Groceries, gadgets and everything in between, carried to
                    your door by evening.
                </p>

                <ul className="ticket">
                    <li>
                        <span>Free delivery over &#8377;499</span>
                        <span className="ticket__val">&#8377;0</span>
                    </li>
                    <li>
                        <span>Returns window</span>
                        <span className="ticket__val">7 days</span>
                    </li>
                    <li>
                        <span>Sellers on ShopKart</span>
                        <span className="ticket__val">12,400</span>
                    </li>
                </ul>
            </aside>

            <main className="auth__main">
                <div className="auth__form-wrap">
                    <h1 className="page-title">{title}</h1>
                    <p className="page-sub">{subtitle}</p>

                    {children}

                    <p className="auth__footer">{footer}</p>
                </div>
            </main>
        </div>
    );
}
