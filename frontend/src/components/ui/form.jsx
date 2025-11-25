export function FormField({ label, children, htmlFor }) {
    return (
        <div>
            <label
                htmlFor={htmlFor}
                className="block text-sm font-medium text-gray-700 mb-2"
            >
                {label}
            </label>
            {children}
        </div>
    );
}

export function Input({ id, value, onChange, placeholder, autoFocus, type = "text" }) {
    return (
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder={placeholder}
            autoFocus={autoFocus}
        />
    );
}