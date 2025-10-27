"use client";

import { useAppContext } from "@/app/providers";
import { useFHE2048Game } from "@/hooks/useFHE2048Game";
import { useState, useEffect } from "react";

interface PlayerInfo {
  address: string;
  gamesPlayed: number;
  encryptedBestScore: bigint | null;
  decryptedBestScore: number | null;
}

export default function LeaderboardPage() {
  const { signer, chainId, instance } = useAppContext();
  const { 
    isReady, 
    isWalletConnected, 
    getGlobalAverages, 
    getTotalStats, 
    getPlayers,
    getPlayerStats,
    decryptValue 
  } = useFHE2048Game({ instance, signer, chainId });
  
  const [globalStats, setGlobalStats] = useState<{
    avgScore: number | null;
    avgMoves: number | null;
    totalGames: number;
    totalPlayers: number;
  }>({
    avgScore: null,
    avgMoves: null,
    totalGames: 0,
    totalPlayers: 0,
  });

  const [isLoadingGlobalStats, setIsLoadingGlobalStats] = useState(false);
  const [isLoadingTotalStats, setIsLoadingTotalStats] = useState(false);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [decryptingAddress, setDecryptingAddress] = useState<string | null>(null);

  // Fetch total games and total players from contract
  useEffect(() => {
    const fetchTotalStats = async () => {
      if (!isWalletConnected || !getTotalStats) return;

      try {
        setIsLoadingTotalStats(true);
        const stats = await getTotalStats();
        
        if (stats) {
          setGlobalStats(prev => ({
            ...prev,
            totalGames: stats.totalGames,
            totalPlayers: stats.totalPlayers,
          }));
          console.log('Total stats loaded:', stats);
        }
      } catch (error) {
        console.error('Failed to fetch total stats:', error);
      } finally {
        setIsLoadingTotalStats(false);
      }
    };

    fetchTotalStats();
  }, [isWalletConnected, getTotalStats]);

  // Fetch players list
  useEffect(() => {
    const fetchPlayers = async () => {
      if (!isWalletConnected || !getPlayers || !getPlayerStats) return;

      try {
        setIsLoadingPlayers(true);
        
        // Get first 50 players
        const playerAddresses = await getPlayers(0, 50);
        
        if (playerAddresses && playerAddresses.length > 0) {
          // Fetch stats for each player
          const playersData = await Promise.all(
            playerAddresses.map(async (address) => {
              const stats = await getPlayerStats(address);
              return {
                address,
                gamesPlayed: stats?.gamesPlayed || 0,
                encryptedBestScore: stats?.bestScore || null,
                decryptedBestScore: null,
              };
            })
          );
          
          setPlayers(playersData);
          console.log('Players loaded:', playersData.length);
        }
      } catch (error) {
        console.error('Failed to fetch players:', error);
      } finally {
        setIsLoadingPlayers(false);
      }
    };

    fetchPlayers();
  }, [isWalletConnected, getPlayers, getPlayerStats]);

  const handleDecryptPlayerScore = async (address: string) => {
    const player = players.find(p => p.address === address);
    if (!player || !player.encryptedBestScore || !decryptValue) {
      alert("Cannot decrypt this player's score");
      return;
    }

    // Only allow decrypting your own score
    const currentAddress = await signer?.getAddress();
    if (currentAddress?.toLowerCase() !== address.toLowerCase()) {
      alert("You can only decrypt your own score!");
      return;
    }

    setDecryptingAddress(address);

    try {
      console.log(`🔓 Decrypting score for ${address}...`);
      
      const decrypted = await decryptValue(player.encryptedBestScore);
      
      if (decrypted !== null) {
        setPlayers(prev => prev.map(p =>
          p.address === address
            ? { ...p, decryptedBestScore: decrypted }
            : p
        ));
        console.log(`✅ Decrypted score: ${decrypted}`);
      } else {
        throw new Error("Decryption returned null");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Decryption failed";
      console.error(`❌ Failed to decrypt:`, error);
      alert(`Failed to decrypt: ${errorMsg}`);
    } finally {
      setDecryptingAddress(null);
    }
  };

  const handleLoadGlobalAverages = async () => {
    if (!getGlobalAverages) {
      alert("Global averages function not available yet");
      return;
    }

    setIsLoadingGlobalStats(true);
    try {
      const result = await getGlobalAverages();
      if (result) {
        setGlobalStats(prev => ({
          ...prev,
          avgScore: result.avgScore,
          avgMoves: result.avgMoves,
        }));
      }
    } catch (error) {
      console.error("Failed to load global averages:", error);
      alert("Failed to load global averages. Make sure there are completed games.");
    } finally {
      setIsLoadingGlobalStats(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-4 pt-24">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-teal-600 dark:text-teal-400">
          Global Leaderboard
        </h1>

        {/* Global Statistics */}
        {!isWalletConnected ? (
          <div className="glass rounded-xl p-8 text-center mb-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              ⚠️ Connect your wallet to view global statistics
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-600 dark:text-gray-400">
                Total Games Played
              </h2>
              {isLoadingTotalStats ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-500">Loading...</span>
                </div>
              ) : (
                <div className="text-4xl font-bold text-teal-600 dark:text-teal-400">
                  {globalStats.totalGames}
                </div>
              )}
            </div>

            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-600 dark:text-gray-400">
                Total Players
              </h2>
              {isLoadingTotalStats ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-500">Loading...</span>
                </div>
              ) : (
                <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                  {globalStats.totalPlayers}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Encrypted Global Averages */}
        <div className="glass rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            🔒 Encrypted Global Averages
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Average Score</div>
              {globalStats.avgScore !== null ? (
                <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                  {globalStats.avgScore}
                </div>
              ) : (
                <div className="text-gray-400 dark:text-gray-500">Not loaded</div>
              )}
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Average Moves</div>
              {globalStats.avgMoves !== null ? (
                <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                  {globalStats.avgMoves}
                </div>
              ) : (
                <div className="text-gray-400 dark:text-gray-500">Not loaded</div>
              )}
            </div>
          </div>

          {isReady && (
            <button
              onClick={handleLoadGlobalAverages}
              disabled={isLoadingGlobalStats}
              className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-semibold"
            >
              {isLoadingGlobalStats ? "Loading & Decrypting..." : "Load Global Averages"}
            </button>
          )}

          {!isReady && (
            <div className="text-center text-gray-500 dark:text-gray-400">
              ⚠️ Connect your wallet to view global averages
            </div>
          )}
        </div>

        {/* Privacy Info */}
        <div className="glass rounded-xl p-6 bg-teal-50/50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 mb-8">
          <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">
            🔒 How Privacy Works
          </h3>
          <ul className="text-sm text-teal-700 dark:text-teal-300 space-y-2">
            <li>• Individual scores are encrypted on-chain using FHEVM</li>
            <li>• Only you can decrypt your own scores</li>
            <li>• Global averages are computed on encrypted data</li>
            <li>• No individual scores are revealed in the process</li>
            <li>• This demonstrates privacy-preserving aggregate analytics</li>
          </ul>
        </div>

        {/* Players List */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              All Players
            </h2>
            {players.length > 0 && (
              <span className="text-sm text-gray-500">
                {players.length} {players.length === 1 ? 'player' : 'players'}
              </span>
            )}
          </div>

          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>🔒 Privacy Note:</strong> All scores are encrypted on-chain. 
              You can only decrypt your own score. Ranking encrypted data is not possible 
              without revealing the plaintext values.
            </div>
          </div>

          {isLoadingPlayers ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading players...
              </p>
            </div>
          ) : players.length > 0 ? (
            <div className="space-y-3">
              {players.map((player, index) => {
                const isCurrentUser = signer?.getAddress().then(addr => 
                  addr.toLowerCase() === player.address.toLowerCase()
                );
                const isDecrypting = decryptingAddress === player.address;

                return (
                  <div
                    key={player.address}
                    className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-mono text-sm text-gray-700 dark:text-gray-300 break-all">
                              {player.address.slice(0, 6)}...{player.address.slice(-4)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {player.gamesPlayed} {player.gamesPlayed === 1 ? 'game' : 'games'} played
                            </div>
                          </div>
                        </div>

                        {player.encryptedBestScore && player.encryptedBestScore > BigInt(0) ? (
                          player.decryptedBestScore !== null ? (
                            <div className="mt-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                              <div className="text-xs text-gray-500 mb-1">Best Score</div>
                              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                                {player.decryptedBestScore}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                              <div className="text-xs text-purple-700 dark:text-purple-300 mb-1">
                                🔒 Best Score (Encrypted)
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
                                {player.encryptedBestScore.toString().slice(0, 20)}...
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="mt-3 text-xs text-gray-500">
                            No completed games yet
                          </div>
                        )}
                      </div>

                      {player.encryptedBestScore && 
                       player.encryptedBestScore > BigInt(0) && 
                       player.decryptedBestScore === null && (
                        <button
                          onClick={() => handleDecryptPlayerScore(player.address)}
                          disabled={isDecrypting || !isReady}
                          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
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
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎮</div>
              <div className="text-gray-500 dark:text-gray-400 mb-2">
                No players yet
              </div>
              <p className="text-sm text-gray-400">
                Be the first to play and submit a score!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
