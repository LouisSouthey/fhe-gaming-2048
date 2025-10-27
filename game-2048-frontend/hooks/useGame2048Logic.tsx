"use client";

import { useState, useCallback, useEffect } from "react";
import {
  GameState,
  Direction,
  initializeGame,
  move as gameMove,
} from "@/lib/game2048";

export function useGame2048Logic() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize game only on client side to avoid hydration mismatch
  useEffect(() => {
    setGameState(initializeGame());
  }, []);

  const reset = useCallback(() => {
    setGameState(initializeGame());
  }, []);

  const move = useCallback((direction: Direction) => {
    if (!gameState || isAnimating || gameState.gameOver) return;
    
    setIsAnimating(true);
    const newState = gameMove(gameState, direction);
    setGameState(newState);
    
    setTimeout(() => setIsAnimating(false), 150);
  }, [gameState, isAnimating]);

  const moveUp = useCallback(() => move('up'), [move]);
  const moveDown = useCallback(() => move('down'), [move]);
  const moveLeft = useCallback(() => move('left'), [move]);
  const moveRight = useCallback(() => move('right'), [move]);

  // Keyboard controls (Arrow keys + WASD)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (key === 'arrowup' || key === 'w') {
        e.preventDefault();
        moveUp();
      } else if (key === 'arrowdown' || key === 's') {
        e.preventDefault();
        moveDown();
      } else if (key === 'arrowleft' || key === 'a') {
        e.preventDefault();
        moveLeft();
      } else if (key === 'arrowright' || key === 'd') {
        e.preventDefault();
        moveRight();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveUp, moveDown, moveLeft, moveRight]);

  return {
    grid: gameState?.grid || [],
    score: gameState?.score || 0,
    moves: gameState?.moves || 0,
    gameOver: gameState?.gameOver || false,
    won: gameState?.won || false,
    isAnimating,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    reset,
    isLoaded: gameState !== null,
  };
}

