import React from "react";
import InfoCard from "./InfoCard";
import { ethers } from "ethers";

interface WillDetailsProps {
  details: {
    willId: string | number | bigint;
    beneficiary: string;
    lastCheckIn: bigint | string | number;
    inactivityPeriod: bigint | string | number;
    amount: bigint | string | number;
    claimed: boolean;
  };
  onClaim: () => void;
  onHeartbeat?: () => void;
  claimable: boolean;
  wallet: string;
  loading?: boolean;
  owner?: string;
}

const formatAddress = (address: string) =>
  address ? address.slice(0, 6) + "..." + address.slice(-4) : "-";

const WillDetails: React.FC<WillDetailsProps> = ({
  details,
  onClaim,
  onHeartbeat,
  claimable,
  wallet,
  loading,
  owner,
}) => {
  if (!details) return null;

  const isBeneficiary =
    wallet &&
    details.beneficiary &&
    wallet.toLowerCase() === details.beneficiary.toLowerCase();

  const isOwner =
    wallet && owner && wallet.toLowerCase() === owner.toLowerCase();
  const canClaim = claimable && isBeneficiary && !details.claimed;
  const canSendHeartbeat = isOwner && !details.claimed && onHeartbeat;

  const items = [
    {
      label: "Will ID",
      value: details.willId.toString(),
    },
    {
      label: "Beneficiary",
      value: formatAddress(details.beneficiary),
    },
    {
      label: "Last Check In",
      value: new Date(Number(details.lastCheckIn) * 1000).toLocaleString(),
    },
    {
      label: "Inactivity Period",
      value: `${Number(details.inactivityPeriod)} seconds`,
    },
    {
      label: "Amount",
      value: `${ethers.formatEther(details.amount)} ETH`,
    },
    {
      label: "Status",
      value: details.claimed ? "Claimed" : "Active",
    },
  ];

  return (
    <InfoCard
      title={`Will #${details.willId}`}
      items={items}
      style={{ minWidth: 320, marginBottom: 16 }}
    >
      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {/* Claim Button - only for beneficiaries */}
        <button
          onClick={onClaim}
          disabled={!canClaim || loading}
          style={{
            padding: "0.5rem 1.5rem",
            borderRadius: 8,
            background: canClaim
              ? "linear-gradient(90deg,#667eea,#764ba2)"
              : "#444",
            color: "#fff",
            border: "none",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: canClaim && !loading ? "pointer" : "not-allowed",
            opacity: loading ? 0.7 : 1,
            transition: "background 0.2s, opacity 0.2s",
            position: "relative",
          }}
          title={
            !isBeneficiary
              ? "Only the beneficiary can claim this will."
              : !claimable
              ? "Will is not yet claimable."
              : details.claimed
              ? "Will already claimed."
              : "Claim this will."
          }
        >
          {loading ? "Claiming..." : "Claim Will"}
        </button>

        {/* Heartbeat Button - only for owners */}
        {canSendHeartbeat && (
          <button
            onClick={onHeartbeat}
            disabled={loading}
            style={{
              padding: "0.5rem 1.5rem",
              borderRadius: 8,
              background: "linear-gradient(90deg,#10b981,#059669)",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "background 0.2s, opacity 0.2s",
            }}
            title="Send heartbeat to keep this will active"
          >
            {loading ? "Sending..." : "💗 Heartbeat"}
          </button>
        )}
      </div>

      {/* Status indicators */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "center",
          gap: 16,
          fontSize: "0.875rem",
        }}
      >
        {claimable && !details.claimed && (
          <span style={{ color: "#dc2626", fontWeight: 500 }}>
            🚨 Claimable
          </span>
        )}
        {details.claimed && (
          <span style={{ color: "#6b7280", fontWeight: 500 }}>✅ Claimed</span>
        )}
        {!details.claimed && !claimable && (
          <span style={{ color: "#10b981", fontWeight: 500 }}>✅ Active</span>
        )}
      </div>
    </InfoCard>
  );
};

export default WillDetails;
