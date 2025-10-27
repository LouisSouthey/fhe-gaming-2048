"use client";

import { useAppContext } from "@/app/providers";
import { useFHE2048Game } from "@/hooks/useFHE2048Game";
import { useState, useEffect } from "react";

interface GameDetails {
  score: number | null;
  moves: number | null;
  won: boolean | null;
}

export default function StatsPage() {
  const { signer, chainId, instance } = useAppContext();
  const { isReady, isWalletConnected, getPlayerStats, getGameSession, decryptValue } = useFHE2048Game({ instance, signer, chainId });
  
  const [gamesPlayed, setGamesPlayed] = useState<number | null>(null);
  const [gameIds, setGameIds] = useState<bigint[]>([]);
  const [encryptedBestScore, setEncryptedBestScore] = useState<bigint | null>(null);
  const [decryptedBestScore, setDecryptedBestScore] = useState<number | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  
  // Store decrypted game details
  const [gameDetails, setGameDetails] = useState<Record<string, GameDetails>>({});
  const [decryptingGameId, setDecryptingGameId] = useState<string | null>(null);

  // Fetch player stats from contract
  useEffect(() => {
    const fetchStats = async () => {
      if (!isWalletConnected || !signer || !getPlayerStats) {
        setGamesPlayed(null);
        setGameIds([]);
        setEncryptedBestScore(null);
        return;
      }

      try {
        setIsLoading(true);
        const address = await signer.getAddress();
        const stats = await getPlayerStats(address);
        
        if (stats) {
          setGamesPlayed(stats.gamesPlayed);
          setGameIds(stats.gameIds);
          setEncryptedBestScore(stats.bestScore);
          console.log('Player stats:', stats);
        }
      } catch (error) {
        console.error('Failed to fetch player stats:', error);
        setGamesPlayed(0);
        setGameIds([]);
        setEncryptedBestScore(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isWalletConnected, signer, getPlayerStats]);

  const handleDecryptBestScore = async () => {
    if (!instance || !signer || !encryptedBestScore || !decryptValue) {
      setDecryptError("Missing required components for decryption");
      return;
    }
    
    setIsDecrypting(true);
    setDecryptError(null);
    
    try {
      console.log('🔓 Starting decryption of best score...', {
        encryptedBestScore: encryptedBestScore.toString(),
      });
      
      // Call the decryptValue function from the hook
      const decrypted = await decryptValue(encryptedBestScore);
      
      if (decrypted !== null) {
        setDecryptedBestScore(decrypted);
        console.log('✅ Decryption successful:', decrypted);
      } else {
        setDecryptError("Decryption returned null");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to decrypt best score";
      setDecryptError(errorMsg);
      console.error("❌ Decryption error:", error);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleDecryptGame = async (gameId: bigint) => {
    if (!getGameSession || !decryptValue) {
      alert("Decryption not available");
      return;
    }

    const gameIdStr = gameId.toString();
    setDecryptingGameId(gameIdStr);

    try {
      console.log(`🔓 Decrypting game #${gameIdStr}...`);

      // Get game session details
      const session = await getGameSession(gameId);
      if (!session) {
        throw new Error("Failed to get game session");
      }

      console.log("📦 Got encrypted game data:", {
        score: session.score.toString(),
        moves: session.moves.toString(),
      });

      // Decrypt score and moves
      const [decryptedScore, decryptedMoves] = await Promise.all([
        decryptValue(session.score),
        decryptValue(session.moves),
      ]);

      if (decryptedScore === null || decryptedMoves === null) {
        throw new Error("Decryption returned null");
      }

      // Try to decrypt won status (ebool)
      let won: boolean | null = null;
      try {
        const wonValue = await decryptValue(session.won);
        won = wonValue === 1;
      } catch (err) {
        console.warn("Could not decrypt won status:", err);
      }

      console.log(`✅ Game #${gameIdStr} decrypted:`, {
        score: decryptedScore,
        moves: decryptedMoves,
        won,
      });

      // Store decrypted data
      setGameDetails(prev => ({
        ...prev,
        [gameIdStr]: {
          score: decryptedScore,
          moves: decryptedMoves,
          won,
        },
      }));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Decryption failed";
      console.error(`❌ Failed to decrypt game #${gameIdStr}:`, error);
      alert(`Failed to decrypt game: ${errorMsg}`);
    } finally {
      setDecryptingGameId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-4 pt-24">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-teal-600 dark:text-teal-400">
          My Statistics
        </h1>

        {!isWalletConnected ? (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              ⚠️ Please connect your wallet to view your statistics
            </p>
          </div>
        ) : isLoading ? (
          <div className="glass rounded-xl p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading your statistics...
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Games Played */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Games Played
              </h2>
              <div className="text-4xl font-bold text-teal-600 dark:text-teal-400">
                {gamesPlayed !== null ? gamesPlayed : "0"}
              </div>
              {gamesPlayed === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Start your first blockchain game to see stats here!
                </p>
              )}
            </div>

            {/* Best Score */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Best Score (Encrypted)
              </h2>
              {encryptedBestScore && encryptedBestScore > BigInt(0) ? (
                <div>
                  {decryptedBestScore !== null ? (
                    <div>
                      <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
                        {decryptedBestScore}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <span>✅</span>
                        <span>Successfully decrypted!</span>
                      </div>
                      <button
                        onClick={() => setDecryptedBestScore(null)}
                        className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        🔒 Hide decrypted value
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg mb-4">
                        <div className="text-sm text-purple-800 dark:text-purple-200 mb-1">
                          🔒 Encrypted on-chain
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
                          Handle: {encryptedBestScore.toString()}
                        </div>
                      </div>
                      
                      {decryptError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                          <div className="text-sm text-red-800 dark:text-red-200">
                            ⚠️ {decryptError}
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={handleDecryptBestScore}
                        disabled={isDecrypting || !isReady}
                        className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      >
                        {isDecrypting ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Decrypting...
                          </span>
                        ) : !isReady ? (
                          "⏳ Initializing FHEVM..."
                        ) : (
                          "🔓 Decrypt Best Score"
                        )}
                      </button>
                      
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="text-xs text-blue-800 dark:text-blue-200">
                          💡 <strong>Note:</strong> Decryption requires signing a message with your wallet. 
                          This signature is used to prove you have permission to decrypt your own data.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎮</div>
                  <div className="text-gray-500 dark:text-gray-400 mb-2">
                    No games completed yet
                  </div>
                  <p className="text-sm text-gray-400">
                    Submit a score to see your encrypted best score here
                  </p>
                </div>
              )}
            </div>

            {/* Privacy Notice */}
            <div className="glass rounded-xl p-6 bg-teal-50/50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
              <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">
                🔒 Privacy Notice
              </h3>
              <p className="text-sm text-teal-700 dark:text-teal-300">
                Your best score is stored encrypted on-chain using FHEVM. Only you can decrypt and view your actual score.
                Other players cannot see your individual scores, ensuring complete privacy while still allowing global statistics.
              </p>
            </div>

            {/* Recent Games */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Recent Games
              </h2>
              {gameIds.length > 0 ? (
                <div className="space-y-3">
                  {gameIds.slice().reverse().slice(0, 10).map((gameId, index) => {
                    const gameIdStr = gameId.toString();
                    const details = gameDetails[gameIdStr];
                    const isDecrypting = decryptingGameId === gameIdStr;

                    return (
                      <div
                        key={gameIdStr}
                        className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Game #{gameIdStr}
                              </div>
                              <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded text-xs font-medium">
                                Completed
                              </span>
                              {details?.won && (
                                <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium">
                                  🏆 Won
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {index === 0 ? "Most recent" : `${index + 1} games ago`}
                            </div>

                            {details ? (
                              <div className="mt-3 grid grid-cols-2 gap-3">
                                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-2">
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
                                  <div className="text-lg font-bold text-teal-600 dark:text-teal-400">
                                    {details.score}
                                  </div>
                                </div>
                                <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-2">
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Moves</div>
                                  <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                                    {details.moves}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                🔒 Encrypted on-chain
                              </div>
                            )}
                          </div>

                          {!details && (
                            <button
                              onClick={() => handleDecryptGame(gameId)}
                              disabled={isDecrypting || !isReady}
                              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                              {isDecrypting ? (
                                <span className="flex items-center gap-2">
                                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  Decrypting...
                                </span>
                              ) : (
                                "🔓 Decrypt"
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {gameIds.length > 10 && (
                    <div className="text-center text-sm text-gray-500 mt-4">
                      Showing latest 10 of {gameIds.length} games
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎮</div>
                  <div className="text-gray-500 dark:text-gray-400 mb-2">
                    No games played yet
                  </div>
                  <p className="text-sm text-gray-400">
                    Start a blockchain game to see your history here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
