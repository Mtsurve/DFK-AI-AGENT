const ReusableButton = ({
  type = "button",
  onClick,
  loading = false,
  className = "",
  children,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`w-full py-3 rounded-lg text-white text-sm font-semibold transition duration-300 ${
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      } ${className}`}
      {...props}
    >
      {loading ? children : children}
    </button>
  );
};

export default ReusableButton;
