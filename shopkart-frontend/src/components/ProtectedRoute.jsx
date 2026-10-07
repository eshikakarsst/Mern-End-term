import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { fetchCurrentCustomer } from "../services/api";
import { CartProvider } from "../context/CartContext.jsx";

/*
 * The only way to know whether the visitor is logged in is to ask the server,
 * because the session lives in an HttpOnly cookie that this code cannot read.
 * So: call /customers/me. 200 means a valid session, 401 means back to login.
 */
export default function ProtectedRoute() {
    const [status, setStatus] = useState("checking");
    const [customer, setCustomer] = useState(null);

    useEffect(() => {
        let active = true;

        fetchCurrentCustomer()
            .then((response) => {
                if (!active) return;
                setCustomer(response.data);
                setStatus("in");
            })
            .catch(() => {
                if (!active) return;
                setStatus("out");
            });

        return () => {
            active = false;
        };
    }, []);

    if (status === "checking") {
        return (
            <div className="checking">
                <span className="spinner" aria-hidden="true" />
                <p>Checking your session</p>
            </div>
        );
    }

    if (status === "out") {
        return <Navigate to="/login" replace />;
    }

    return (
        <CartProvider>
            <Outlet context={{ customer }} />
        </CartProvider>
    );
}
