import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell.jsx";
import Field from "../components/Field.jsx";
import { loginCustomer, readError } from "../services/api";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [busy, setBusy] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Set by Register after a successful sign-up.
    const notice = location.state?.notice;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({ ...previous, [name]: value }));
        setErrors((previous) => ({ ...previous, [name]: "" }));
        setServerError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const found = {};
        if (!form.email.trim()) found.email = "Enter your email";
        if (!form.password) found.password = "Enter your password";

        setErrors(found);

        if (Object.keys(found).length > 0) {
            return;
        }

        setBusy(true);
        setServerError("");

        try {
            /*
             * No token is stored here on purpose. The response only carries a
             * success message; the session arrives as a Set-Cookie header that
             * the browser keeps and replays on later requests.
             */
            await loginCustomer({
                email: form.email.trim(),
                password: form.password
            });

            navigate("/home", { replace: true });
        } catch (error) {
            setServerError(readError(error, "Invalid credentials"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthShell
            title="Log in"
            subtitle="Pick up where your cart left off."
            footer={
                <>
                    New to ShopKart? <Link to="/register">Create an account</Link>
                </>
            }
        >
            <form className="form" onSubmit={handleSubmit} noValidate>
                {notice && <p className="notice">{notice}</p>}

                <Field
                    id="email"
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    autoComplete="email"
                    placeholder="ananya@example.com"
                />

                <Field
                    id="password"
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    autoComplete="current-password"
                    placeholder="Your password"
                />

                {serverError && (
                    <p className="alert" role="alert">
                        {serverError}
                    </p>
                )}

                <button type="submit" className="btn btn--solid" disabled={busy}>
                    {busy ? "Logging in" : "Log in"}
                </button>
            </form>
        </AuthShell>
    );
}
