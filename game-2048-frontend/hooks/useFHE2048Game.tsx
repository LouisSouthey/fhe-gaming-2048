"use client";

import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import type { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FHE2048GameABI } from "@/abi/FHE2048GameABI";
import { FHE2048GameAddresses } from "@/abi/FHE2048GameAddresses";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringLocalStorage } from "@/fhevm/GenericStringStorage";

export function useFHE2048Game(params: {
  instance: FhevmInstance | undefined;
  signer: ethers.JsonRpcSigner | undefined;
  chainId: number | undefined;
}) {
  const { instance, signer, chainId } = params;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentGameId, setCurrentGameId] = useState<number | null>(null);
  const [contractAddress, setContractAddress] = useState<string | undefined>();

  // Get contract address based on chainId
  useEffect(() => {
    if (!chainId) return;
    
    const addresses = FHE2048GameAddresses as Record<string, { address: string; chainId: number; chainName: string }>;
    const addr = addresses[chainId.toString()]?.address;
    
    if (addr && addr !== ethers.ZeroAddress) {
      setContractAddress(addr);
    } else {
      setContractAddress(undefined);
    }
  }, [chainId]);

  const getContract = useCallback(() => {
    if (!signer || !contractAddress) return null;
    return new ethers.Contract(contractAddress, FHE2048GameABI.abi, signer);
  }, [signer, contractAddress]);

  const startGame = useCallback(async () => {
    const contract = getContract();
    if (!contract) {
      setError("Wallet not connected or contract not deployed");
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.startGame();
      const receipt = await tx.wait();
      
      // Get game ID from event or transaction
      const gameId = Number(await contract.gameIdCounter()) - 1;
      setCurrentGameId(gameId);
      
      console.log(`Game started with ID: ${gameId}`);
      return gameId;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to start game";
      setError(errorMsg);
      console.error("Start game error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  const submitScore = useCallback(async (gameId: number, score: number, moves: number) => {
    const contract = getContract();
    if (!instance || !contract || !signer) {
      setError("Not ready to submit score");
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userAddress = await signer.getAddress();
      
      // Create encrypted input for score
      const scoreInput = instance.createEncryptedInput(contractAddress!, userAddress);
      scoreInput.add32(score);
      const encryptedScore = await scoreInput.encrypt();
      
      // Create encrypted input for moves
      const movesInput = instance.createEncryptedInput(contractAddress!, userAddress);
      movesInput.add32(moves);
      const encryptedMoves = await movesInput.encrypt();
      
      console.log("Submitting encrypted score and moves...", { score, moves });
      
      // Submit to contract
      const tx = await contract.submitScore(
        gameId,
        encryptedScore.handles[0],
        encryptedScore.inputProof,
        encryptedMoves.handles[0],
        encryptedMoves.inputProof
      );
      
      await tx.wait();
      
      console.log(`Score and moves submitted successfully for game ${gameId}`);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to submit score";
      setError(errorMsg);
      console.error("Submit score error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [instance, getContract, signer, contractAddress]);

  const getPlayerStats = useCallback(async (playerAddress: string) => {
    const contract = getContract();
    if (!contract) {
      setError("Contract not available");
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const stats = await contract.getPlayerStats(playerAddress);
      
      return {
        gameIds: stats[0],
        gamesPlayed: Number(stats[1]),
        bestScore: stats[2], // This is encrypted
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to get player stats";
      setError(errorMsg);
      console.error("Get player stats error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Get total statistics (totalGames and totalPlayers)
  const getTotalStats = useCallback(async () => {
    const contract = getContract();
    if (!contract) {
      setError("Contract not available");
      return null;
    }

    try {
      const totalGames = await contract.totalGames();
      const totalPlayers = await contract.totalPlayers();
      
      return {
        totalGames: Number(totalGames),
        totalPlayers: Number(totalPlayers),
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to get total stats";
      setError(errorMsg);
      console.error("Get total stats error:", err);
      return null;
    }
  }, [getContract]);

  // Decrypt encrypted value using FHEVM instance
  const decryptValue = useCallback(async (encryptedHandle: bigint): Promise<number | null> => {
    if (!instance || !signer || !contractAddress) {
      setError("FHEVM instance, signer, or contract not available");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Create a storage instance for decryption signatures
      const storage = new GenericStringLocalStorage(window.localStorage);

      // Get or create decryption signature
      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance,
        [contractAddress as `0x${string}`],
        signer,
        storage
      );

      if (!sig) {
        setError("Unable to build FHEVM decryption signature");
        return null;
      }

      // Convert bigint handle to string for userDecrypt
      const handleString = encryptedHandle.toString();
      
      console.log("Decrypting value...", {
        handle: handleString,
        contractAddress,
      });

      // Decrypt the value
      const res = await instance.userDecrypt(
        [{ handle: handleString, contractAddress: contractAddress as `0x${string}` }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );

      const decryptedValue = res[handleString];
      console.log("Decrypted value:", decryptedValue);

      return Number(decryptedValue);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to decrypt value";
      setError(errorMsg);
      console.error("Decryption error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [instance, signer, contractAddress]);

  const getGlobalAverages = useCallback(async () => {
    const contract = getContract();
    if (!instance || !contract || !signer) {
      setError("Not ready to get global averages");
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log("🔄 Step 1/4: Refreshing global averages...");
      
      // Step 1: Call refreshGlobalAverages() to compute latest averages
      const refreshTx = await contract.refreshGlobalAverages();
      await refreshTx.wait();
      
      console.log("✅ Step 2/4: Granting decryption permission...");
      
      // Step 2: Call allowGlobalAveragesDecryption() to grant permission
      const allowTx = await contract.allowGlobalAveragesDecryption();
      await allowTx.wait();
      
      console.log("📦 Step 3/4: Fetching encrypted averages...");
      
      // Step 3: Call getGlobalAverages() to get encrypted handles
      const result = await contract.getGlobalAverages();
      
      console.log("Received encrypted averages:", {
        avgScore: result[0].toString(),
        avgMoves: result[1].toString(),
      });
      
      // Decrypt the returned encrypted values
      const avgScoreHandle = result[0]; // euint32
      const avgMovesHandle = result[1]; // euint32
      
      console.log("🔓 Step 4/4: Decrypting values...");
      
      // Step 4: Decrypt both values
      const decryptedScore = await decryptValue(avgScoreHandle);
      const decryptedMoves = await decryptValue(avgMovesHandle);
      
      if (decryptedScore === null || decryptedMoves === null) {
        throw new Error("Failed to decrypt one or more values");
      }
      
      console.log("✅ Global averages ready:", {
        avgScore: decryptedScore,
        avgMoves: decryptedMoves,
      });
      
      return {
        avgScore: decryptedScore,
        avgMoves: decryptedMoves,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to get global averages";
      setError(errorMsg);
      console.error("❌ Get global averages error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [instance, getContract, signer, decryptValue]);

  // Get game session details
  const getGameSession = useCallback(async (gameId: bigint) => {
    const contract = getContract();
    if (!contract) {
      setError("Contract not available");
      return null;
    }

    try {
      const session = await contract.getGameSession(gameId);
      
      return {
        player: session[0],
        score: session[1],       // euint32
        moves: session[2],       // euint32
        startTime: Number(session[3]),
        endTime: Number(session[4]),
        completed: session[5],
        won: session[6],         // ebool
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to get game session";
      setError(errorMsg);
      console.error("Get game session error:", err);
      return null;
    }
  }, [getContract]);

  // Get players list for leaderboard
  const getPlayers = useCallback(async (start: number, count: number) => {
    const contract = getContract();
    if (!contract) {
      setError("Contract not available");
      return null;
    }

    try {
      const playerAddresses = await contract.getPlayers(start, count);
      return playerAddresses as string[];
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to get players";
      setError(errorMsg);
      console.error("Get players error:", err);
      return null;
    }
  }, [getContract]);

  // Get total players count
  const getPlayersCount = useCallback(async () => {
    const contract = getContract();
    if (!contract) {
      setError("Contract not available");
      return 0;
    }

    try {
      const count = await contract.getPlayersCount();
      return Number(count);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to get players count";
      setError(errorMsg);
      console.error("Get players count error:", err);
      return 0;
    }
  }, [getContract]);

  return {
    startGame,
    submitScore,
    getPlayerStats,
    getTotalStats,
    getGlobalAverages,
    getGameSession,
    getPlayers,
    getPlayersCount,
    decryptValue,
    loading,
    error,
    currentGameId,
    contractAddress,
    isReady: !!contractAddress && !!signer && !!instance,
    isWalletConnected: !!signer && !!contractAddress,
  };
}
