import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  children: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({ loading, children, ...props }) => (
  <button
    style={{
      border: "none",
      borderRadius: 12,
      padding: "0.75rem 1.5rem",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#fff",
      fontWeight: 600,
      cursor: props.disabled ? "not-allowed" : "pointer",
      boxShadow: "0 2px 8px 0 rgba(31, 38, 135, 0.10), 0 1.5px 4px 0 #232526",
      transition: "background 0.2s, box-shadow 0.2s",
      opacity: props.disabled ? 0.6 : 1,
      width: props.style?.width,
      marginTop: props.style?.marginTop,
    }}
    {...props}
    disabled={props.disabled || loading}
  >
    {loading ? "Processing..." : children}
  </button>
);

export default Button;
