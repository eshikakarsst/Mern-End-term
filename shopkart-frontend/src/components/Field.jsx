/*
 * Controlled input with its label and error message.
 * Keeping it in one place means every form field behaves the same way.
 */
export default function Field({
    id,
    label,
    type = "text",
    value,
    onChange,
    error,
    ...rest
}) {
    return (
        <div className={`field ${error ? "field--bad" : ""}`}>
            <label className="field__label" htmlFor={id}>
                {label}
            </label>

            <input
                id={id}
                name={id}
                type={type}
                className="field__input"
                value={value}
                onChange={onChange}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                {...rest}
            />

            {error && (
                <p className="field__error" id={`${id}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
}
