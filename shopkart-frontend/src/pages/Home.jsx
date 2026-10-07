import { Link, useOutletContext } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";

// Turns "Ananya Rao" into "AR" for the badge.
const initialsOf = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");

const formatJoined = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
};

export default function Home() {
    // ProtectedRoute already fetched /customers/me and passes it down here.
    const { customer } = useOutletContext();

    return (
        <div className="shell">
            <Navbar customer={customer} />

            <main className="home">
                <section className="greeting">
                    <span className="badge" aria-hidden="true">
                        {initialsOf(customer.fullName)}
                    </span>

                    <div>
                        <h1 className="page-title">
                            Welcome back, {customer.fullName.split(" ")[0]}
                        </h1>
                        <p className="page-sub">
                            Your session is live and your account details are
                            below.
                        </p>
                    </div>
                </section>

                <div className="home-actions">
                    <Link to="/products" className="btn btn--solid">Browse Products</Link>
                </div>

                <section className="details">
                    <h2 className="details__head">Account</h2>

                    <dl className="rows">
                        <div className="row">
                            <dt>Name</dt>
                            <dd>{customer.fullName}</dd>
                        </div>
                        <div className="row">
                            <dt>Email</dt>
                            <dd>{customer.email}</dd>
                        </div>
                        <div className="row">
                            <dt>Phone</dt>
                            <dd>{customer.phone}</dd>
                        </div>
                        <div className="row">
                            <dt>Customer since</dt>
                            <dd>{formatJoined(customer.createdAt)}</dd>
                        </div>
                    </dl>
                </section>
            </main>
        </div>
    );
}
