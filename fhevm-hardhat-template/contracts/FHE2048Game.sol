// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, euint64, ebool, externalEuint32, externalEbool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE2048Game - Encrypted 2048 Game with Privacy-Preserving Scores
/// @notice This contract manages 2048 game sessions with encrypted scores and moves
/// @dev Uses FHEVM for homomorphic encryption of game data
contract FHE2048Game is SepoliaConfig {
    /// @notice Represents a single game session
    struct GameSession {
        address player;
        euint32 score;          // Encrypted score
        euint32 moves;          // Encrypted move count
        uint64 startTime;
        uint64 endTime;
        bool completed;
        ebool reached2048;      // Encrypted win status
    }

    /// @notice Counter for generating unique game IDs
    uint256 public gameIdCounter;

    /// @notice Mapping from game ID to game session
    mapping(uint256 => GameSession) public gameSessions;

    /// @notice Mapping from player address to their game IDs
    mapping(address => uint256[]) public playerGames;

    /// @notice Mapping from player address to their best encrypted score
    mapping(address => euint32) public playerBestScore;

    /// @notice Mapping to track if player has initialized best score
    mapping(address => bool) public playerHasBestScore;

    /// @notice Total number of completed games
    uint256 public totalGames;

    /// @notice Total number of unique players
    uint256 public totalPlayers;
    
    /// @notice Array of all player addresses (for leaderboard)
    address[] public players;

    /// @notice Mapping from player address to their game count
    mapping(address => uint32) public playerGameCount;

    /// @notice Sum of all encrypted scores (for computing averages)
    euint64 public totalEncryptedScores;

    /// @notice Sum of all encrypted moves (for computing averages)
    euint64 public totalEncryptedMoves;

    /// @notice Flag to track if aggregates are initialized
    bool public aggregatesInitialized;
    
    /// @notice Cached global average score (updated when refreshed)
    euint32 public cachedAvgScore;
    
    /// @notice Cached global average moves (updated when refreshed)
    euint32 public cachedAvgMoves;
    
    /// @notice Flag to indicate if cached averages are available
    bool public averagesComputed;

    /// @notice Events
    event GameStarted(uint256 indexed gameId, address indexed player, uint64 startTime);
    event ScoreSubmitted(uint256 indexed gameId, address indexed player, uint64 endTime);

    /// @notice Custom errors
    error GameNotFound();
    error GameAlreadyCompleted();
    error UnauthorizedAccess();
    error GameNotCompleted();
    error NoGamesPlayed();

    /// @notice Starts a new game session
    /// @return gameId The unique identifier for the new game
    function startGame() external returns (uint256 gameId) {
        gameId = gameIdCounter++;
        
        GameSession storage session = gameSessions[gameId];
        session.player = msg.sender;
        session.startTime = uint64(block.timestamp);
        session.completed = false;
        
        playerGames[msg.sender].push(gameId);
        
        // Track if this is a new player
        if (playerGameCount[msg.sender] == 0) {
            totalPlayers++;
            players.push(msg.sender);
        }
        
        emit GameStarted(gameId, msg.sender, session.startTime);
        
        return gameId;
    }

    /// @notice Submits encrypted score for a completed game
    /// @param gameId The game session ID
    /// @param encryptedScore Encrypted final score
    /// @param inputProofScore Proof for the encrypted score
    /// @param encryptedMoves Encrypted move count
    /// @param inputProofMoves Proof for the encrypted moves
    function submitScore(
        uint256 gameId,
        externalEuint32 encryptedScore,
        bytes calldata inputProofScore,
        externalEuint32 encryptedMoves,
        bytes calldata inputProofMoves
    ) external {
        GameSession storage session = gameSessions[gameId];
        
        if (session.player == address(0)) revert GameNotFound();
        if (session.player != msg.sender) revert UnauthorizedAccess();
        if (session.completed) revert GameAlreadyCompleted();
        
        // Convert encrypted inputs to euint32
        euint32 score = FHE.fromExternal(encryptedScore, inputProofScore);
        euint32 moves = FHE.fromExternal(encryptedMoves, inputProofMoves);
        
        // Check if won (score >= 2048)
        euint32 winThreshold = FHE.asEuint32(2048);
        ebool won = FHE.ge(score, winThreshold);
        
        // Allow contract to use values
        FHE.allowThis(moves);
        FHE.allowThis(won);
        
        // Store encrypted values
        session.score = score;
        session.moves = moves;
        session.reached2048 = won;
        session.endTime = uint64(block.timestamp);
        session.completed = true;
        
        // Allow player to decrypt their own score, moves, and win status
        FHE.allow(score, msg.sender);
        FHE.allow(moves, msg.sender);
        FHE.allow(won, msg.sender);
        
        // Update player best score
        if (!playerHasBestScore[msg.sender]) {
            playerBestScore[msg.sender] = score;
            playerHasBestScore[msg.sender] = true;
            FHE.allowThis(playerBestScore[msg.sender]);
            FHE.allow(playerBestScore[msg.sender], msg.sender);
        } else {
            // Update if new score is higher
            FHE.allowThis(score);  // Allow contract to use score in comparison
            FHE.allowThis(playerBestScore[msg.sender]);  // Allow contract to use best score
            ebool isHigher = FHE.gt(score, playerBestScore[msg.sender]);
            FHE.allowThis(isHigher);  // Allow contract to use comparison result
            playerBestScore[msg.sender] = FHE.select(isHigher, score, playerBestScore[msg.sender]);
            FHE.allowThis(playerBestScore[msg.sender]);
            FHE.allow(playerBestScore[msg.sender], msg.sender);
        }
        
        // Initialize aggregates if needed
        if (!aggregatesInitialized) {
            totalEncryptedScores = FHE.asEuint64(score);
            totalEncryptedMoves = FHE.asEuint64(moves);
            FHE.allowThis(totalEncryptedScores);
            FHE.allowThis(totalEncryptedMoves);
            aggregatesInitialized = true;
        } else {
            // Add to totals for computing averages
            FHE.allowThis(score);
            FHE.allowThis(moves);
            FHE.allowThis(totalEncryptedScores);
            FHE.allowThis(totalEncryptedMoves);
            totalEncryptedScores = FHE.add(totalEncryptedScores, FHE.asEuint64(score));
            totalEncryptedMoves = FHE.add(totalEncryptedMoves, FHE.asEuint64(moves));
            FHE.allowThis(totalEncryptedScores);
            FHE.allowThis(totalEncryptedMoves);
        }
        
        // Update public statistics
        totalGames++;
        playerGameCount[msg.sender]++;
        
        emit ScoreSubmitted(gameId, msg.sender, session.endTime);
    }

    /// @notice Gets player statistics
    /// @param player The player address
    /// @return gameIds Array of player's game IDs
    /// @return gamesPlayed Total number of games played
    /// @return bestScore Encrypted best score (requires allowance to decrypt)
    function getPlayerStats(address player) 
        external 
        view 
        returns (
            uint256[] memory gameIds,
            uint32 gamesPlayed,
            euint32 bestScore
        ) 
    {
        return (
            playerGames[player],
            playerGameCount[player],
            playerBestScore[player]
        );
    }

    /// @notice Refreshes cached global averages (call this to update statistics)
    function refreshGlobalAverages() external {
        if (totalGames == 0) revert NoGamesPlayed();
        
        // Compute averages using plaintext divisor
        euint64 avgScoreEuint64 = FHE.div(totalEncryptedScores, uint64(totalGames));
        euint64 avgMovesEuint64 = FHE.div(totalEncryptedMoves, uint64(totalGames));
        
        // Cast to euint32 and cache
        cachedAvgScore = FHE.asEuint32(avgScoreEuint64);
        cachedAvgMoves = FHE.asEuint32(avgMovesEuint64);
        
        // Allow contract to access cached values
        FHE.allowThis(cachedAvgScore);
        FHE.allowThis(cachedAvgMoves);
        
        averagesComputed = true;
    }
    
    /// @notice Grants caller permission to decrypt cached global averages
    /// @dev Call this before attempting to decrypt the averages
    function allowGlobalAveragesDecryption() external {
        if (!averagesComputed) revert NoGamesPlayed();
        
        // Grant caller permission to decrypt (permanent for demo purposes)
        FHE.allow(cachedAvgScore, msg.sender);
        FHE.allow(cachedAvgMoves, msg.sender);
    }
    
    /// @notice Gets cached global averages (call allowGlobalAveragesDecryption first)
    /// @return avgScore Encrypted average score
    /// @return avgMoves Encrypted average moves
    /// @dev Must call refreshGlobalAverages() first to compute values, then allowGlobalAveragesDecryption() to grant permission
    function getGlobalAverages() 
        external 
        view
        returns (
            euint32 avgScore,
            euint32 avgMoves
        ) 
    {
        if (!averagesComputed) revert NoGamesPlayed();
        return (cachedAvgScore, cachedAvgMoves);
    }

    /// @notice Gets game session details
    /// @param gameId The game session ID
    /// @return player Player address
    /// @return score Encrypted score
    /// @return moves Encrypted moves
    /// @return startTime Start timestamp
    /// @return endTime End timestamp
    /// @return completed Completion status
    /// @return won Encrypted win status
    function getGameSession(uint256 gameId)
        external
        view
        returns (
            address player,
            euint32 score,
            euint32 moves,
            uint64 startTime,
            uint64 endTime,
            bool completed,
            ebool won
        )
    {
        GameSession storage session = gameSessions[gameId];
        if (session.player == address(0)) revert GameNotFound();
        
        return (
            session.player,
            session.score,
            session.moves,
            session.startTime,
            session.endTime,
            session.completed,
            session.reached2048
        );
    }

    /// @notice Allows owner to decrypt their game score
    /// @param gameId The game session ID
    /// @dev The allow calls are redundant since we already allow in submitScore,
    ///      but keeping this function for explicit re-authorization if needed
    function allowScoreDecryption(uint256 gameId) external view {
        GameSession storage session = gameSessions[gameId];
        
        if (session.player == address(0)) revert GameNotFound();
        if (session.player != msg.sender) revert UnauthorizedAccess();
        if (!session.completed) revert GameNotCompleted();
        
        // Note: Allow was already called in submitScore, so this is a no-op
        // Keeping this function for API consistency
    }

    /// @notice Gets total number of games for a player
    /// @param player The player address
    /// @return count Total games played
    function getPlayerGameCount(address player) external view returns (uint32) {
        return playerGameCount[player];
    }

    /// @notice Gets all player game IDs
    /// @param player The player address
    /// @return gameIds Array of game IDs
    function getPlayerGameIds(address player) external view returns (uint256[] memory) {
        return playerGames[player];
    }
    
    /// @notice Gets total number of players
    /// @return count Total number of unique players
    function getPlayersCount() external view returns (uint256) {
        return players.length;
    }
    
    /// @notice Gets a batch of player addresses
    /// @param start Start index
    /// @param count Number of players to return
    /// @return playerAddresses Array of player addresses
    function getPlayers(uint256 start, uint256 count) 
        external 
        view 
        returns (address[] memory playerAddresses) 
    {
        uint256 end = start + count;
        if (end > players.length) {
            end = players.length;
        }
        
        uint256 resultLength = end - start;
        playerAddresses = new address[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            playerAddresses[i] = players[start + i];
        }
        
        return playerAddresses;
    }
}

