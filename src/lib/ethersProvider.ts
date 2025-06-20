import { ethers } from "ethers";

let provider: ethers.Provider;

if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  // Client-side
  provider = new ethers.BrowserProvider(window.ethereum);
} else {
  // Server-side
  const infuraUrl = process.env.INFURA_URL || "";
  provider = new ethers.JsonRpcProvider(infuraUrl);
}

export const getProvider = () => provider;

export const getSigner = async () => {
  if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    return (provider as ethers.BrowserProvider).getSigner();
  }
  throw new Error(
    "No signer available (not in browser or MetaMask not installed)"
  );
};
