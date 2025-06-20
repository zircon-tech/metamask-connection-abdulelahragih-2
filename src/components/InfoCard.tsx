import React from "react";

type InfoCardProps = {
  title?: string;
  items?: Array<{
    label: string;
    value: string | number;
  }>;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  items,
  children,
  style,
}) => (
  <div
    className="info-card"
    style={{
      background: "rgba(255,255,255,0.08)",
      borderRadius: 12,
      padding: "1.5rem",
      marginBottom: "1rem",
      ...style,
    }}
  >
    {title && (
      <h3
        style={{
          fontSize: "1.2rem",
          fontWeight: 600,
          marginBottom: "1rem",
          color: "#f3f4f6",
        }}
      >
        {title}
      </h3>
    )}
    {items && (
      <div>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
              color: "#f3f4f6",
            }}
          >
            <span style={{ fontWeight: 500 }}>{item.label}:</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    )}
    {children}
  </div>
);

export default InfoCard;
