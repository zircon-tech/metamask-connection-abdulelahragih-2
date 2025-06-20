"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getSigner } from "../lib/ethersProvider";
import DecentralizedWillArtifact from "../../artifacts/contracts/DecentralizedWill.sol/DecentralizedWill.json";
import Button from "../components/Button";
import Input from "../components/Input";
import InfoCard from "../components/InfoCard";
import WillDetails from "../components/WillDetails";
import WalletStatus from "@/components/WalletStatus";

const contractABI = DecentralizedWillArtifact.abi;
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

// Define proper types for MetaMask
interface MetaMaskEthereum {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (accounts: string[]) => void) => void;
  removeListener: (
    event: string,
    handler: (accounts: string[]) => void
  ) => void;
  send: (method: string, params: unknown[]) => Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: MetaMaskEthereum;
  }
}

// Updated interface to include willId
interface WillDetail {
  willId: string | number | bigint;
  beneficiary: string;
  lastCheckIn: string | number | bigint;
  inactivityPeriod: string | number | bigint;
  amount: string | number | bigint;
  claimed: boolean;
}

export default function Home() {
  const [beneficiary, setBeneficiary] = useState("");
  const [inactivityPeriod, setInactivityPeriod] = useState("");
  const [amount, setAmount] = useState("");
  const [allWills, setAllWills] = useState<WillDetail[]>([]);
  const [claimableStatus, setClaimableStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [pinned, setPinned] = useState(false);
  const [willOwner, setWillOwner] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (!pinned) {
          if (accounts.length > 0) {
            setWallet(accounts[0]);
            setAlert({ type: "success", message: "Wallet changed!" });
          } else {
            setWallet("");
            setAlert({ type: "error", message: "Wallet disconnected." });
          }
        }
      };
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        window.ethereum?.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, [pinned]);

  const connectWallet = async () => {
    try {
      setLoading(true);
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setWallet(accounts[0] as string);
        setAlert({ type: "success", message: "Wallet connected!" });
      } else {
        setAlert({ type: "error", message: "MetaMask not detected." });
      }
    } catch {
      setAlert({ type: "error", message: "Failed to connect wallet." });
    } finally {
      setLoading(false);
    }
  };

  const createWill = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const tx = await contract.setWill(beneficiary, inactivityPeriod, {
        value: ethers.parseEther(amount),
      });
      await tx.wait();
      setAlert({ type: "success", message: "Will created successfully!" });
      setBeneficiary("");
      setInactivityPeriod("");
      setAmount("");
      // Refresh the list of wills
      await loadAllWills();
    } catch (error) {
      setAlert({
        type: "error",
        message: `Error creating will ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setLoading(false);
    }
  };

  const getActiveOwner = async () => {
    if (willOwner && willOwner.trim() !== "") {
      return willOwner.trim();
    }
    const signer = await getSigner();
    return await signer.getAddress();
  };

  const loadAllWills = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const owner = await getActiveOwner();
      const wills = await contract.getAllWills(owner);

      // Convert the contract response to our WillDetail interface
      const willDetails: WillDetail[] = wills.map((will: WillDetail) => ({
        willId: will.willId,
        beneficiary: will.beneficiary,
        lastCheckIn: will.lastCheckIn,
        inactivityPeriod: will.inactivityPeriod,
        amount: will.amount,
        claimed: will.claimed,
      }));

      setAllWills(willDetails);

      // Check claimable status for each will
      const claimableStatuses: { [key: string]: boolean } = {};
      for (const will of willDetails) {
        try {
          const isClaimable = await contract.isClaimable(owner, will.willId);
          claimableStatuses[will.willId.toString()] = isClaimable;
        } catch {
          claimableStatuses[will.willId.toString()] = false;
        }
      }
      setClaimableStatus(claimableStatuses);
    } catch (error) {
      setAlert({
        type: "error",
        message: `Error loading wills: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePinToggle = async () => {
    if (pinned) {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts && Array.isArray(accounts) && accounts.length > 0) {
          setWallet(accounts[0] as string);
          setAlert({ type: "success", message: "Switched to active wallet." });
        }
      }
    }
    setPinned((p) => !p);
  };

  const claimWill = async (willId: string | number | bigint) => {
    setLoading(true);
    setAlert(null);
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const owner = await getActiveOwner();
      await contract.claim(owner, willId);
      setAlert({ type: "success", message: "Will claimed successfully!" });
      // Refresh wills after claim
      await loadAllWills();
    } catch (error) {
      setAlert({
        type: "error",
        message: `Error claiming will: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setLoading(false);
    }
  };

  const sendHeartbeat = async (willId: string | number | bigint) => {
    setLoading(true);
    setAlert(null);
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      await contract.heartbeat(willId);
      setAlert({ type: "success", message: "Heartbeat sent successfully!" });
      // Refresh wills after heartbeat
      await loadAllWills();
    } catch (error) {
      setAlert({
        type: "error",
        message: `Error sending heartbeat: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          Decentralized Will
        </h1>
        <WalletStatus
          wallet={wallet}
          pinned={pinned}
          loading={loading}
          onPinToggle={handlePinToggle}
          onConnect={connectWallet}
        />
        {alert && (
          <div
            style={{
              color: alert.type === "success" ? "#15803d" : "#dc2626",
              background: alert.type === "success" ? "#bbf7d0" : "#fee2e2",
              padding: "0.5rem",
              borderRadius: 6,
              textAlign: "center",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              marginTop: "1rem",
            }}
          >
            {alert.message}
          </div>
        )}

        {/* Create New Will Section */}
        <div style={{ marginTop: "1rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            Create New Will
          </h2>
          <Input
            type="text"
            placeholder="Beneficiary Address"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Inactivity Period (seconds)"
            value={inactivityPeriod}
            onChange={(e) => setInactivityPeriod(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Amount (ETH)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Will Owner Address (defaults to your wallet)"
            value={willOwner}
            onChange={(e) => setWillOwner(e.target.value)}
          />
          <Button
            style={{ width: "100%", marginTop: "1rem" }}
            onClick={createWill}
            loading={loading}
            disabled={loading}
          >
            Create Will
          </Button>
        </div>

        {/* Load Wills Button */}
        <div style={{ marginTop: "1rem" }}>
          <Button
            style={{ width: "100%" }}
            onClick={loadAllWills}
            disabled={loading}
          >
            Load All Wills
          </Button>
        </div>

        {/* Display All Wills */}
        {allWills.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                marginBottom: "1rem",
              }}
            >
              Your Wills ({allWills.length})
            </h2>
            {allWills.map((will) => (
              <WillDetails
                key={will.willId.toString()}
                details={will}
                onClaim={() => claimWill(will.willId)}
                onHeartbeat={() => sendHeartbeat(will.willId)}
                claimable={claimableStatus[will.willId.toString()] || false}
                wallet={wallet}
                loading={loading}
                owner={willOwner || wallet}
              />
            ))}
          </div>
        )}

        {allWills.length === 0 && (
          <InfoCard>
            <h2
              style={{
                fontSize: "1.2rem",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              No Wills Found
            </h2>
            <p
              style={{
                textAlign: "center",
                marginTop: "1rem",
              }}
            >
              Click &quot;Load All Wills&quot; to check for existing wills, or
              create a new one above.
            </p>
          </InfoCard>
        )}
      </div>
    </div>
  );
}
