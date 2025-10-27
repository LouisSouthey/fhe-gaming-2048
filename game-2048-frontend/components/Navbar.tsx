"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  walletButton?: React.ReactNode;
}

export function Navbar({ walletButton }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="glass border-b border-gray-200/20 dark:border-gray-700/20 sticky top-0 z-50 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              FHE 2048
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive("/")
                  ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
              }`}
            >
              Home
            </Link>
            <Link
              href="/play"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive("/play")
                  ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
              }`}
            >
              Play
            </Link>
            <Link
              href="/stats"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive("/stats")
                  ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
              }`}
            >
              My Stats
            </Link>
            <Link
              href="/leaderboard"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive("/leaderboard")
                  ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
              }`}
            >
              Leaderboard
            </Link>
            <Link
              href="/how-to-play"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive("/how-to-play")
                  ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
              }`}
            >
              How to Play
            </Link>
          </div>

          {/* Wallet Button */}
          <div className="flex items-center">
            {walletButton}
          </div>
        </div>
      </div>

      {/* Mobile Menu - Simple version */}
      <div className="md:hidden px-4 pb-4 space-y-1">
        <Link
          href="/"
          className={`block px-4 py-2 rounded-lg transition-colors ${
            isActive("/")
              ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
              : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
          }`}
        >
          Home
        </Link>
        <Link
          href="/play"
          className={`block px-4 py-2 rounded-lg transition-colors ${
            isActive("/play")
              ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
              : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
          }`}
        >
          Play
        </Link>
        <Link
          href="/stats"
          className={`block px-4 py-2 rounded-lg transition-colors ${
            isActive("/stats")
              ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
              : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
          }`}
        >
          My Stats
        </Link>
        <Link
          href="/leaderboard"
          className={`block px-4 py-2 rounded-lg transition-colors ${
            isActive("/leaderboard")
              ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
              : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
          }`}
        >
          Leaderboard
        </Link>
        <Link
          href="/how-to-play"
          className={`block px-4 py-2 rounded-lg transition-colors ${
            isActive("/how-to-play")
              ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
              : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
          }`}
        >
          How to Play
        </Link>
      </div>
    </nav>
  );
}

