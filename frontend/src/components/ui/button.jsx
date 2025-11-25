export function Button({
    children,
    onClick,
    type = "button",
    variant = "primary",
    disabled = false,
    className = ""
}) {
    const baseStyles = "px-4 py-2 text-sm font-medium rounded-lg transition-colors";

    const variants = {
        primary: "text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300",
        secondary: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50",
        danger: "text-white bg-red-500 hover:bg-red-600",
        ghost: "text-gray-700 hover:bg-gray-100"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}