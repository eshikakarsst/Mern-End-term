import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell.jsx";
import Field from "../components/Field.jsx";
import { readError, registerCustomer } from "../services/api";

const EMPTY = {
    fullName: "",
    email: "",
    password: "",
    phone: ""
};

// Mirrors what the backend will accept, so the user finds out before the call.
const validate = (form) => {
    const errors = {};

    if (!form.fullName.trim()) {
        errors.fullName = "Enter your full name";
    }

    if (!form.email.trim()) {
        errors.email = "Enter your email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        errors.email = "That email address is not valid";
    }

    if (!form.password) {
        errors.password = "Enter a password";
    } else if (form.password.length < 6) {
        errors.password = "Use at least 6 characters";
    }

    if (!form.phone.trim()) {
        errors.phone = "Enter your phone number";
    } else if (!/^[0-9]{10}$/.test(form.phone.trim())) {
        errors.phone = "Enter a 10 digit number";
    }

    return errors;
};

export default function Register() {
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [busy, setBusy] = useState(false);

    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({ ...previous, [name]: value }));
        setErrors((previous) => ({ ...previous, [name]: "" }));
        setServerError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const found = validate(form);
        setErrors(found);

        if (Object.keys(found).length > 0) {
            return;
        }

        setBusy(true);
        setServerError("");

        try {
            await registerCustomer({
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                password: form.password,
                phone: form.phone.trim()
            });

            navigate("/login", {
                replace: true,
                state: { notice: "Account created. Log in to continue." }
            });
        } catch (error) {
            setServerError(readError(error, "Could not create the account"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthShell
            title="Create your account"
            subtitle="One account for orders, addresses and returns."
            footer={
                <>
                    Already shopping with us? <Link to="/login">Log in</Link>
                </>
            }
        >
            <form className="form" onSubmit={handleSubmit} noValidate>
                <Field
                    id="fullName"
                    label="Full name"
                    value={form.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                    autoComplete="name"
                    placeholder="Ananya Rao"
                />

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
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                />

                <Field
                    id="phone"
                    label="Phone number"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    autoComplete="tel"
                    inputMode="numeric"
                    placeholder="9876543210"
                />

                {serverError && (
                    <p className="alert" role="alert">
                        {serverError}
                    </p>
                )}

                <button type="submit" className="btn btn--solid" disabled={busy}>
                    {busy ? "Creating account" : "Create account"}
                </button>
            </form>
        </AuthShell>
    );
}
