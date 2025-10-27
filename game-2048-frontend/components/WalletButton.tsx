"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

export function WalletButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if already connected
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((result) => {
          const accounts = result as string[];
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            return window.ethereum!.request({ method: "eth_chainId" });
          }
        })
        .then((chainIdHex) => {
          if (chainIdHex) {
            setChainId(parseInt(chainIdHex as string, 16));
          }
        })
        .catch(console.error);

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setAddress(accounts.length > 0 ? accounts[0] : null);
      });

      // Listen for chain changes
      window.ethereum.on("chainChanged", (chainIdHex: string) => {
        setChainId(parseInt(chainIdHex, 16));
      });
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    setIsConnecting(true);
    try {
      const accountsResult = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const accounts = accountsResult as string[];
      setAddress(accounts[0]);

      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      });
      setChainId(parseInt(chainIdHex as string, 16));
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setChainId(null);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkName = (id: number) => {
    switch (id) {
      case 1:
        return "Ethereum";
      case 11155111:
        return "Sepolia";
      case 31337:
        return "Localhost";
      default:
        return `Chain ${id}`;
    }
  };

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <div className="glass rounded-lg px-3 py-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">
              {chainId && getNetworkName(chainId)}
            </span>
          </div>
        </div>
        <button
          onClick={disconnectWallet}
          className="glass rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
        >
          {formatAddress(address)}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}

