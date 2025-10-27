"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 pt-8">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
            FHE 2048
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Privacy-Preserving Blockchain Game
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your scores are encrypted on-chain using FHEVM technology
            </p>
          </div>
          
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">On-Chain Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">
              View aggregate statistics without revealing individual data
            </p>
          </div>
          
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold mb-2">Classic Fun</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Enjoy the classic 2048 puzzle game you love
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/play"
            className="inline-block px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Play Now
          </Link>
        </div>

        {/* How It Works */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          
          <div className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">1. Connect Your Wallet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect your MetaMask or compatible Web3 wallet to get started.
              </p>
            </div>
            
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">2. Play the Game</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Use arrow keys or swipe to merge tiles and reach 2048.
              </p>
            </div>
            
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">3. Submit Your Score</h3>
              <p className="text-gray-600 dark:text-gray-400">
                When game ends, your score is encrypted and submitted to the blockchain.
              </p>
            </div>
            
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">4. View Statistics</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check global averages and your personal stats while maintaining privacy.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 text-center text-gray-500 text-sm">
          <p>Powered by FHEVM • Built with Next.js</p>
        </footer>
      </div>
    </main>
  );
}

