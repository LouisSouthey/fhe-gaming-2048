"use client";

export default function HowToPlayPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-4 pt-24">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">How to Play</h1>

        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Game Rules</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Use arrow keys or buttons to move tiles</li>
              <li>• When two tiles with the same number touch, they merge into one</li>
              <li>• The goal is to create a tile with the number 2048</li>
              <li>• You can continue playing after reaching 2048</li>
              <li>• The game ends when no more moves are possible</li>
            </ul>
          </div>

          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Privacy Features</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Your scores are encrypted on-chain using FHEVM</li>
              <li>• Only you can decrypt and view your personal scores</li>
              <li>• Other players cannot see your individual scores</li>
              <li>• Global statistics are computed on encrypted data</li>
              <li>• Aggregate analytics preserve individual privacy</li>
            </ul>
          </div>

          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Scoring System</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Each time you merge tiles, the value of the resulting tile is added to your score.
            </p>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>• 2 + 2 = 4 → adds 4 points</p>
              <p>• 4 + 4 = 8 → adds 8 points</p>
              <p>• 8 + 8 = 16 → adds 16 points</p>
              <p>• And so on...</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">FAQ</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">What is FHE?</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Fully Homomorphic Encryption (FHE) allows computation on encrypted data without decryption.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Why are scores encrypted?</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  To protect your privacy while still enabling global statistics and fair competition.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">How are averages calculated?</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  The smart contract computes averages directly on encrypted scores without revealing individual values.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

