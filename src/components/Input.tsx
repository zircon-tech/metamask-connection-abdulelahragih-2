import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = (props) => (
  <input
    {...props}
    style={{
      border: "none",
      borderRadius: 12,
      padding: "0.75rem 1rem",
      marginBottom: "0.75rem",
      width: "100%",
      boxSizing: "border-box",
      background: "rgba(255,255,255,0.08)",
      color: "#f3f4f6",
      boxShadow: "0 2px 8px 0 rgba(31, 38, 135, 0.10), 0 1.5px 4px 0 #232526",
      outline: "none",
      transition: "background 0.2s, box-shadow 0.2s",
      ...props.style,
    }}
    placeholder={props.placeholder}
  />
);

export default Input;
