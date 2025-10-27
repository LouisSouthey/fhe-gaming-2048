"use client";

import { useGame2048Logic } from "@/hooks/useGame2048Logic";
import { useFHE2048Game } from "@/hooks/useFHE2048Game";
import { useAppContext } from "@/app/providers";
import { designTokens } from "@/design-tokens";
import { useState } from "react";

export default function PlayPage() {
  const { signer, chainId, instance } = useAppContext();
  const {
    grid,
    score,
    moves,
    gameOver,
    won,
    isAnimating,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    reset,
    isLoaded,
  } = useGame2048Logic();

  const {
    startGame,
    submitScore,
    loading,
    error,
    currentGameId,
    contractAddress,
    isReady,
    isWalletConnected,
  } = useFHE2048Game({ instance, signer, chainId });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const getTileColor = (value: number) => {
    const colors = designTokens.tileColors.light;
    return colors[value as keyof typeof colors] || colors[2048];
  };

  const getTileTextColor = (value: number) => {
    return value <= 4 ? "#475569" : "#F8FAFC";
  };

  const handleStartNewBlockchainGame = async () => {
    if (!isWalletConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    const gameId = await startGame();
    if (gameId !== null) {
      setSubmitSuccess(false); // Reset submit status
      
      // If called from game over modal, auto-submit the score
      if (gameOver || won) {
        setIsSubmitting(true);
        const success = await submitScore(gameId, score, moves);
        setIsSubmitting(false);
        
        if (success) {
          setSubmitSuccess(true);
        }
      } else {
        reset(); // Only reset if starting a fresh game
        alert(`Game started on blockchain! Game ID: ${gameId}`);
      }
    }
  };

  const handleLocalReset = () => {
    reset();
    setSubmitSuccess(false);
  };

  const handleSubmitScore = async () => {
    if (!isWalletConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    if (currentGameId === null) {
      // No blockchain game started, shouldn't happen in modal
      return;
    }
    
    // Submit to existing game
    setIsSubmitting(true);
    const success = await submitScore(currentGameId, score, moves);
    setIsSubmitting(false);
    
    if (success) {
      setSubmitSuccess(true);
    }
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-4 pt-20">
        <div className="container mx-auto max-w-2xl">
          <div className="glass rounded-lg p-8 text-center">
            <div className="text-xl text-slate-600 dark:text-slate-400">
              Loading game...
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-4 pt-20">
      <div className="container mx-auto max-w-6xl">
        {/* Score Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <div className="glass rounded-lg px-6 py-3">
              <div className="text-sm text-gray-500">Score</div>
              <div className="text-2xl font-bold">{score}</div>
            </div>
            <div className="glass rounded-lg px-6 py-3">
              <div className="text-sm text-gray-500">Moves</div>
              <div className="text-2xl font-bold">{moves}</div>
            </div>
          </div>
          {contractAddress && (
            <div className="text-xs text-gray-500">
              {currentGameId !== null ? `Game #${currentGameId}` : "No active game"}
            </div>
          )}
        </div>

        {/* Connection Status */}
        {!isWalletConnected && (
          <div className="glass rounded-xl p-4 mb-6 text-center bg-yellow-50/50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Connect your wallet to submit scores on-chain
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="glass rounded-xl p-4 mb-6 text-center bg-red-50/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              ❌ {error}
            </p>
          </div>
        )}

        {/* Horizontal Layout: Game + Controls */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Left: Game Grid */}
          <div>
            <div className="glass rounded-2xl p-4">
              <div
                className="grid grid-cols-4 gap-3"
                style={{
                  aspectRatio: "1",
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((value, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="rounded-lg flex items-center justify-center font-bold text-2xl transition-all duration-150"
                      style={{
                        background: getTileColor(value),
                        color: getTileTextColor(value),
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {value !== 0 && value}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Instructions below game */}
            <div className="glass rounded-xl p-4 mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Use <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">↑ ↓ ← →</kbd> or <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">W A S D</kbd> keys to move tiles.
                <br />
                Merge tiles with same numbers to reach 2048!
              </p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex flex-col gap-6">
            {/* Control Buttons */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">
                Game Controls
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div></div>
                <button
                  onClick={moveUp}
                  disabled={isAnimating || gameOver}
                  className="glass rounded-lg p-4 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors disabled:opacity-50 text-2xl"
                >
                  ↑
                </button>
                <div></div>
                
                <button
                  onClick={moveLeft}
                  disabled={isAnimating || gameOver}
                  className="glass rounded-lg p-4 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors disabled:opacity-50 text-2xl"
                >
                  ←
                </button>
                <button
                  onClick={handleLocalReset}
                  className="glass rounded-lg p-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-semibold hover:shadow-lg transition-all"
                >
                  New Game
                </button>
                <button
                  onClick={moveRight}
                  disabled={isAnimating || gameOver}
                  className="glass rounded-lg p-4 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors disabled:opacity-50 text-2xl"
                >
                  →
                </button>
                
                <div></div>
                <button
                  onClick={moveDown}
                  disabled={isAnimating || gameOver}
                  className="glass rounded-lg p-4 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors disabled:opacity-50 text-2xl"
                >
                  ↓
                </button>
                <div></div>
              </div>
            </div>

            {/* Submit Score Section */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">
                🔐 Submit Score to Blockchain
              </h3>
              
              {!isWalletConnected ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    ⚠️ Connect your wallet to submit scores
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Your score will be encrypted and stored securely using FHEVM
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Current Status */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Current Score:</span>
                    <span className="font-bold text-xl text-teal-600 dark:text-teal-400">{score}</span>
                  </div>
                  
                  {currentGameId !== null && (
                    <div className="text-xs text-center text-gray-500 bg-gray-100 dark:bg-gray-800 rounded px-3 py-2">
                      Active Blockchain Game ID: <span className="font-mono font-bold">#{currentGameId}</span>
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex gap-3 flex-wrap justify-center">
                    {currentGameId === null ? (
                      <button
                        onClick={handleStartNewBlockchainGame}
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-semibold text-sm"
                      >
                        {loading ? "Starting..." : "🎮 Start Blockchain Game"}
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitScore}
                        disabled={isSubmitting || submitSuccess || score === 0}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-semibold text-sm relative overflow-hidden"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Submitting...
                          </span>
                        ) : submitSuccess ? (
                          "✓ Submitted!"
                        ) : (
                          `🔒 Submit (${score})`
                        )}
                      </button>
                    )}
                  </div>

                  {submitSuccess && (
                    <div className="text-center text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded px-2 py-2">
                      ✅ Score submitted to blockchain!
                    </div>
                  )}

                  {score === 0 && currentGameId !== null && (
                    <div className="text-center text-xs text-gray-500">
                      Play the game to earn a score
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Over Modal */}
        {(gameOver || won) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl p-8 max-w-md w-full text-center animate-scale-in bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/40 border-2 border-purple-200 dark:border-purple-800 shadow-2xl">
              {/* Title */}
              <div className="mb-6">
                <div className="text-6xl mb-4">
                  {won ? "🎉" : "💫"}
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  {won ? "Congratulations!" : "Game Over"}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {won ? "You reached 2048!" : "No more moves available"}
                </p>
              </div>
              
              {/* Final Score */}
              <div className="mb-6 p-6 glass rounded-xl">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Final Score</div>
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500 mb-2">
                  {score}
                </div>
                <div className="text-sm text-gray-500">Moves: {moves}</div>
              </div>

              {/* Submit Score Section */}
              {isWalletConnected && (
                <div className="mb-6">
                  {!submitSuccess ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          🔐 Save your score on blockchain
                        </p>
                      </div>
                      
                      {currentGameId === null ? (
                        <button
                          onClick={handleStartNewBlockchainGame}
                          disabled={loading}
                          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-semibold"
                        >
                          {loading ? "Starting..." : "🎮 Start Blockchain Game & Submit"}
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmitScore}
                          disabled={isSubmitting}
                          className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-semibold"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              Submitting...
                            </span>
                          ) : (
                            `🔒 Submit Score (${score})`
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="text-2xl mb-2">✅</div>
                      <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                        Score Submitted!
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                        Your encrypted score is now on the blockchain
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleLocalReset}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-xl transition-all font-semibold"
                >
                  🎮 Play Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
