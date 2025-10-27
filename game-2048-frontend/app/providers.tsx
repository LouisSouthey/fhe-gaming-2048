"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ethers } from "ethers";
import type { FhevmInstance } from "@/fhevm/fhevmTypes";

interface AppContextType {
  signer: ethers.JsonRpcSigner | undefined;
  provider: ethers.BrowserProvider | undefined;
  address: string | undefined;
  chainId: number | undefined;
  instance: FhevmInstance | undefined;
}

const AppContext = createContext<AppContextType>({
  signer: undefined,
  provider: undefined,
  address: undefined,
  chainId: undefined,
  instance: undefined,
});

export function useAppContext() {
  return useContext(AppContext);
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider>();
  const [signer, setSigner] = useState<ethers.JsonRpcSigner>();
  const [address, setAddress] = useState<string>();
  const [chainId, setChainId] = useState<number>();
  const [instance, setInstance] = useState<FhevmInstance>();

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);

      // Listen for account changes
      window.ethereum.on("accountsChanged", async (accounts: string[]) => {
        if (accounts.length > 0) {
          const newSigner = await browserProvider.getSigner();
          setSigner(newSigner);
          setAddress(accounts[0]);
        } else {
          setSigner(undefined);
          setAddress(undefined);
        }
      });

      // Listen for chain changes
      window.ethereum.on("chainChanged", (chainIdHex: string) => {
        setChainId(parseInt(chainIdHex, 16));
        window.location.reload(); // Recommended by MetaMask
      });

      // Check if already connected
      window.ethereum
        .request({ method: "eth_accounts" })
        .then(async (result) => {
          const accounts = result as string[];
          if (accounts.length > 0) {
            const newSigner = await browserProvider.getSigner();
            setSigner(newSigner);
            setAddress(accounts[0]);
            
            const network = await browserProvider.getNetwork();
            setChainId(Number(network.chainId));
          }
        })
        .catch(console.error);
    }
  }, []);

  // Initialize FHEVM instance based on chainId
  useEffect(() => {
    const initFhevm = async () => {
      if (!chainId || typeof window === 'undefined' || !window.ethereum) {
        setInstance(undefined);
        return;
      }

      try {
        console.log('🔧 Initializing FHEVM instance for chainId:', chainId);
        
        const { createFhevmInstance } = await import('@/fhevm/internal/fhevm');
        
        const abortController = new AbortController();
        
        const mockChains = {
          31337: 'http://localhost:8545',
          1337: 'http://localhost:8545',
        };
        
        // Use window.ethereum directly as it's an EIP-1193 provider
        const fhevmInstance = await createFhevmInstance({
          provider: window.ethereum,
          mockChains,
          signal: abortController.signal,
          onStatusChange: (status) => {
            console.log('FHEVM status:', status);
          },
        });
        
        setInstance(fhevmInstance as any);
        console.log('✅ FHEVM instance initialized successfully');
      } catch (error) {
        console.error('Failed to initialize FHEVM instance:', error);
        setInstance(undefined);
      }
    };

    initFhevm();
  }, [chainId]);

  return (
    <AppContext.Provider
      value={{
        provider,
        signer,
        address,
        chainId,
        instance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

