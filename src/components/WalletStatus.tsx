type WalletStatusProps = {
  wallet: string;
  pinned: boolean;
  loading: boolean;
  onPinToggle: () => void;
  onConnect: () => void;
};

export default function WalletStatus({
  wallet,
  pinned,
  loading,
  onPinToggle,
  onConnect,
}: WalletStatusProps) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: "1rem",
      }}
    >
      {wallet ? (
        <>
          <span
            style={{
              fontWeight: 500,
              fontSize: "1rem",
              background: pinned ? "#764ba2" : "rgba(255,255,255,0.08)",
              color: pinned ? "#fff" : undefined,
              borderRadius: 8,
              padding: "0.25rem 0.75rem",
            }}
          >
            {wallet.slice(0, 6)}...{wallet.slice(-4)}
          </span>
          <button
            aria-label={pinned ? "Unpin wallet" : "Pin wallet"}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "1.5rem",
              marginLeft: 2,
              padding: 0,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "none",
              position: "relative",
              bottom: 2,
            }}
            onClick={onPinToggle}
            title={
              pinned
                ? "Unpin wallet (allow changes)"
                : "Pin wallet (lock this address)"
            }
          >
            {pinned ? "🔒" : "🔓"}
          </button>
        </>
      ) : (
        <button
          style={{ width: "100%", marginTop: "1rem" }}
          onClick={onConnect}
          disabled={loading}
        >
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}
