# Encrypted 2048 Game - Requirements Document

## Project Overview

**Project Name**: Encrypted 2048 (FHE2048)

**Description**: A fully homomorphic encryption (FHE) powered 2048 puzzle game on blockchain where players' scores and moves remain private while enabling aggregate analytics across all players.

**Target Network**: Sepolia Testnet (primary), Localhost (development)

**Frontend Directory**: `game-2048-frontend`

## Core Features

### 1. Game Mechanics
- Classic 2048 gameplay (4x4 grid)
- Swipe controls (up/down/left/right)
- Tile merging rules: 2+2=4, 4+4=8, ..., 1024+1024=2048
- Game ends when no valid moves remain
- Win condition: reaching 2048 tile (can continue playing)

### 2. FHE Privacy Layer
- **Encrypted Data**:
  - Individual player scores (euint32)
  - Move counts per game (euint32)
  - Game session IDs (euint64)
  - Player best scores (euint32)
  
- **Public Data**:
  - Player wallet addresses
  - Number of games played (uint32)
  - Timestamp of last game
  
- **Aggregate Analytics** (computed on-chain):
  - Global average score (computed from encrypted scores)
  - Global average moves (computed from encrypted move counts)
  - Total games played (public counter)
  - Active players count

### 3. Privacy Guarantees
- Individual scores visible only to the owner (via FHE.allow)
- Other players cannot see your score/moves
- Aggregate statistics computed without revealing individual data
- Decryption requires player signature

## UI Modules

### Module 1: Welcome Page
**Route**: `/`

**Components**:
- Hero section with game title and tagline
- Feature highlights (Privacy-Preserving, On-Chain Analytics, Competitive Fun)
- "Play Now" CTA button
- "How It Works" section
- Footer with links

**UI Elements**:
- Animated 2048 tile background
- Responsive layout (mobile/tablet/desktop)
- Dark mode support

### Module 2: Navigation Bar
**Persistent across all pages**

**Elements**:
- Logo + Game Title (left)
- Navigation Links:
  - Play
  - Leaderboard
  - My Stats
  - How to Play
- Wallet Connection Button (right)
  - Shows connected address (truncated)
  - Disconnect option
  - Network indicator

**States**:
- Disconnected: "Connect Wallet" button
- Connecting: Loading spinner
- Connected: Address badge + dropdown menu

### Module 3: Wallet Connection
**Integration**: EIP-6963 (multi-wallet support)

**Features**:
- Auto-reconnect on page refresh (silent via `eth_accounts`)
- Persistent connection state (localStorage)
- Account change detection
- Network validation (must be Sepolia or Localhost:31337)
- Switch network prompt if wrong chain

**Storage Keys**:
```
wallet.connected: boolean
wallet.lastConnectorId: string
wallet.lastAccounts: string[]
wallet.lastChainId: number
fhevm.decryptionSignature.<address>: string
```

**User Flow**:
1. Click "Connect Wallet"
2. Select provider (MetaMask, Coinbase Wallet, etc.)
3. Approve connection in wallet
4. System checks network
5. If wrong network, prompt to switch
6. On successful connection, redirect to game

### Module 4: Game Main View
**Route**: `/play`

**Layout**:
```
┌─────────────────────────────────────┐
│  Score: [Encrypted]  Moves: [Enc]   │
│  Best: [Encrypted]                   │
├─────────────────────────────────────┤
│                                      │
│         ┌───┬───┬───┬───┐           │
│         │ 2 │   │ 4 │   │           │
│         ├───┼───┼───┼───┤           │
│         │   │ 8 │   │ 2 │           │
│         ├───┼───┼───┼───┤   Game    │
│         │ 4 │   │ 2 │   │   Grid    │
│         ├───┼───┼───┼───┤           │
│         │   │ 2 │   │ 4 │           │
│         └───┴───┴───┴───┘           │
│                                      │
│  [New Game]  [View My Score]        │
├─────────────────────────────────────┤
│  Global Stats:                       │
│  Avg Score: 1234  Avg Moves: 89     │
│  Total Games: 5678                   │
└─────────────────────────────────────┘
```

**Game States**:
- **Playing**: Grid active, accept inputs
- **Game Over**: Show final score modal, "Submit Score" button
- **Submitting**: Loading state while transaction confirms
- **Completed**: Score submitted, show success message

**Controls**:
- Keyboard: Arrow keys
- Touch: Swipe gestures
- Mouse: Button controls (up/down/left/right)

**Actions**:
- Start New Game
- Submit Score (when game over)
- Decrypt My Score (requires signature)
- Return to Menu

### Module 5: Personal Stats
**Route**: `/stats`

**Sections**:

#### 5.1 Overview Card
- Total Games Played (public)
- Best Score (encrypted, decrypt button)
- Average Score (encrypted, decrypt button)
- Total Moves (encrypted, decrypt button)
- Win Rate (if 2048 reached)

#### 5.2 Game History Table
| Game ID | Date | Score | Moves | Status | Actions |
|---------|------|-------|-------|--------|---------|
| #123 | 2025-10-20 | [Decrypt] | [Decrypt] | Completed | View |
| #122 | 2025-10-19 | [Decrypt] | [Decrypt] | Completed | View |

**Features**:
- Pagination (10 games per page)
- Filter: All / Won / Lost
- Sort: Date / Score (decrypted only)
- Batch decrypt (decrypt all visible)

#### 5.3 Personal Achievements
- First 2048 Tile (badge)
- 10 Games Played (badge)
- 100 Games Played (badge)
- High Scorer (top 10) (badge)

### Module 6: Leaderboard
**Route**: `/leaderboard`

**Tabs**:

#### 6.1 Global Rankings (Public Metrics)
| Rank | Player | Games Played | Last Played |
|------|--------|--------------|-------------|
| 1 | 0x1234...5678 | 156 | 2 hours ago |
| 2 | 0xabcd...ef01 | 143 | 5 hours ago |

**Sorting Options**:
- Most Games Played
- Most Recent Activity
- Longest Streak

#### 6.2 Aggregate Statistics
- Global Average Score: [computed on-chain]
- Global Average Moves: [computed on-chain]
- Total Players: [count]
- Total Games: [count]
- Average Games per Player: [calculated]

**Note**: Individual scores are NOT shown in leaderboard to preserve privacy. Only aggregate metrics and public counters.

### Module 7: How to Play
**Route**: `/how-to-play`

**Sections**:

1. **Game Rules**
   - Move tiles with arrow keys/swipe
   - Tiles merge when same numbers collide
   - Reach 2048 to win
   
2. **Privacy Features**
   - Your score is encrypted on-chain
   - Only you can decrypt your score
   - Aggregate stats computed without revealing individual data
   
3. **Scoring System**
   - Each merge adds tile value to score
   - Example: 2+2=4 adds 4 points
   
4. **FAQ**
   - What is FHE?
   - Why are scores encrypted?
   - How are global averages calculated?
   - Can others see my score?

## Smart Contract Design

### Contract Name: `FHE2048Game`

### State Variables

```solidity
// Game sessions
struct GameSession {
    address player;
    euint32 score;          // Encrypted score
    euint32 moves;          // Encrypted move count
    uint64 startTime;
    uint64 endTime;
    bool completed;
    ebool reached2048;      // Encrypted win status
}

mapping(uint256 => GameSession) public gameSessions;
mapping(address => uint256[]) public playerGames;
mapping(address => euint32) public playerBestScore;

// Public statistics
uint256 public totalGames;
uint256 public totalPlayers;
mapping(address => uint32) public playerGameCount;

// Aggregate encrypted data
euint64 public totalEncryptedScores;   // Sum of all scores
euint64 public totalEncryptedMoves;    // Sum of all moves
```

### Core Functions

#### 1. Start Game
```solidity
function startGame() external returns (uint256 gameId);
```
- Creates new game session
- Increments player game count
- Returns unique game ID

#### 2. Submit Score
```solidity
function submitScore(
    uint256 gameId,
    inEuint32 calldata encryptedScore,
    inEuint32 calldata encryptedMoves,
    inEbool calldata reached2048
) external;
```
- Accepts encrypted score and moves from frontend
- Validates game ownership
- Updates aggregate statistics
- Updates best score if higher
- Marks game as completed

#### 3. Get Player Stats
```solidity
function getPlayerStats(address player) 
    external 
    view 
    returns (
        uint256[] memory gameIds,
        uint32 gamesPlayed,
        euint32 bestScore
    );
```
- Returns player's game IDs
- Returns public game count
- Returns encrypted best score (requires allowance)

#### 4. Get Global Averages
```solidity
function getGlobalAverages() 
    external 
    view 
    returns (
        euint32 avgScore,
        euint32 avgMoves
    );
```
- Computes: totalEncryptedScores / totalGames
- Computes: totalEncryptedMoves / totalGames
- Returns encrypted averages (can be decrypted by anyone for demo)

#### 5. Allow Score Decryption
```solidity
function allowScoreDecryption(uint256 gameId) external;
```
- Calls `FHE.allow(gameSessions[gameId].score, msg.sender)`
- Only game owner can call
- Enables frontend decryption

### Access Control

- Game scores: `FHE.allow(score, player)` - only owner
- Global averages: `FHE.allowTransient(avgScore, anyone)` - public for demo
- Best scores: `FHE.allow(bestScore, player)` - only owner

## Frontend Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + design-tokens.ts
- **Blockchain**: ethers.js v6
- **FHE SDK**: 
  - `@zama-fhe/relayer-sdk` (Sepolia)
  - `@fhevm/mock-utils` (Localhost)
- **State**: React Context + Hooks

### Directory Structure

```
game-2048-frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Welcome page
│   ├── play/
│   │   └── page.tsx          # Game main view
│   ├── stats/
│   │   └── page.tsx          # Personal stats
│   ├── leaderboard/
│   │   └── page.tsx          # Leaderboard
│   ├── how-to-play/
│   │   └── page.tsx          # Instructions
│   ├── providers.tsx         # FHEVM + Wallet providers
│   └── globals.css
├── components/
│   ├── Navbar.tsx            # Navigation bar
│   ├── WalletButton.tsx      # Wallet connection
│   ├── GameGrid.tsx          # 2048 game grid
│   ├── GameControls.tsx      # Control buttons
│   ├── ScoreDisplay.tsx      # Encrypted score display
│   ├── DecryptButton.tsx     # Generic decrypt button
│   ├── GlobalStats.tsx       # Aggregate statistics
│   ├── PlayerStatsCard.tsx   # Personal stats card
│   ├── GameHistoryTable.tsx  # Game history
│   └── LeaderboardTable.tsx  # Leaderboard display
├── hooks/
│   ├── useFHE2048Game.tsx    # Contract interaction
│   ├── useGame2048Logic.tsx  # Game logic (local state)
│   ├── useDecryption.tsx     # FHE decryption
│   └── useWallet.tsx         # Wallet management
├── fhevm/
│   ├── fhevm.ts              # FHEVM instance
│   ├── loader.ts             # SDK loader
│   └── constants.ts          # Network configs
├── abi/
│   ├── FHE2048GameABI.ts
│   └── FHE2048GameAddresses.ts
├── lib/
│   ├── game2048.ts           # 2048 game engine
│   └── encryption.ts         # Encryption helpers
├── scripts/
│   ├── genabi.mjs
│   └── check-node.mjs
├── design-tokens.ts          # Design system
└── package.json
```

### Key Hooks

#### useFHE2048Game
```typescript
const {
  startGame,
  submitScore,
  getPlayerStats,
  getGlobalAverages,
  decryptScore,
  decryptMoves,
  loading,
  error
} = useFHE2048Game();
```

#### useGame2048Logic
```typescript
const {
  grid,              // 4x4 tile grid
  score,             // Current score (plaintext, local)
  moves,             // Move count (plaintext, local)
  gameOver,
  won,
  moveUp,
  moveDown,
  moveLeft,
  moveRight,
  reset,
} = useGame2048Logic();
```

## User Flows

### Flow 1: First Time Player

1. Visit welcome page
2. Read "How It Works"
3. Click "Play Now"
4. Prompt to connect wallet
5. Select MetaMask, approve connection
6. Check network → Switch to Sepolia if needed
7. Redirect to game page
8. Auto-start new game session (call `startGame()`)
9. Play game locally
10. On game over, submit encrypted score
11. Transaction confirms → Show success message
12. Option to view stats or play again

### Flow 2: Returning Player (Auto-Reconnect)

1. Visit site (any page)
2. System detects `wallet.connected=true`
3. Silently call `eth_accounts` to restore connection
4. Restore signer and FHEVM instance
5. Navigate to desired page
6. No "Connect Wallet" prompt needed

### Flow 3: View Personal Stats

1. Click "My Stats" in navbar
2. Navigate to `/stats`
3. See public stats (games played, etc.)
4. See encrypted stats with "Decrypt" buttons
5. Click "Decrypt My Best Score"
6. Prompt wallet signature (FHE decryption)
7. Display decrypted score
8. Cache signature for session

### Flow 4: View Leaderboard

1. Click "Leaderboard" in navbar
2. See global rankings (public metrics only)
3. See aggregate statistics:
   - Global average score (call `getGlobalAverages()`)
   - Click "Decrypt Average" to see value
   - Anyone can decrypt global stats (demo purpose)
4. Cannot see individual player scores (privacy preserved)

## Design System

### Seed Calculation
```
seed = sha256("FHE2048" + "sepolia" + "202510" + "FHE2048Game.sol")
```

### Selected Design (Deterministic)
- **Design System**: Glassmorphism (透明玻璃效果)
- **Color Scheme**: Group F (Teal/Green/Cyan) - Fresh & Natural
- **Typography**: Sans-Serif (Inter) - 1.25 scale
- **Layout**: Grid (12-column responsive)
- **Border Radius**: lg (12px)
- **Shadows**: md (0 4px 6px)
- **Transitions**: 200ms

### 2048 Tile Colors (Glassmorphic Style)
- **Empty**: `rgba(255, 255, 255, 0.1)` + backdrop-blur
- **2**: `rgba(20, 184, 166, 0.3)` (Teal)
- **4**: `rgba(16, 185, 129, 0.4)` (Green)
- **8**: `rgba(6, 182, 212, 0.5)` (Cyan)
- **16-2048**: Gradient intensities

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Security & Privacy

### Privacy Guarantees
1. **Score Privacy**: Only owner can decrypt their score
2. **Move Privacy**: Move counts encrypted per game
3. **Aggregate Analytics**: Computed on encrypted data
4. **No Leakage**: Contract does not emit plaintext events

### Access Control Matrix
| Data | Owner | Other Players | Contract | Relayer |
|------|-------|---------------|----------|---------|
| Individual Score | Decrypt ✅ | No ❌ | Encrypted ✅ | No ❌ |
| Individual Moves | Decrypt ✅ | No ❌ | Encrypted ✅ | No ❌ |
| Best Score | Decrypt ✅ | No ❌ | Encrypted ✅ | No ❌ |
| Global Avg Score | Decrypt ✅ | Decrypt ✅ | Encrypted ✅ | No ❌ |
| Games Played | View ✅ | View ✅ | Public ✅ | View ✅ |

### Signature Requirements
- **Start Game**: Transaction signature (gas fee)
- **Submit Score**: Transaction signature (gas fee)
- **Decrypt Own Score**: EIP-712 signature (no gas)
- **Decrypt Global Avg**: EIP-712 signature (no gas)

## Testing Requirements

### Smart Contract Tests
```bash
cd fhevm-hardhat-template
npx hardhat test
```

**Test Cases**:
1. ✅ Start game creates session
2. ✅ Submit score updates encrypted values
3. ✅ Global averages computed correctly
4. ✅ Best score updates when higher
5. ✅ Access control: only owner can allow decryption
6. ✅ Cannot submit score twice for same game
7. ✅ Cannot submit score for non-existent game

### Frontend Tests
```bash
cd game-2048-frontend
npm run test
```

**Test Cases**:
1. ✅ Game logic: tiles merge correctly
2. ✅ Game logic: score calculated correctly
3. ✅ Game logic: no more moves detection
4. ✅ Wallet auto-reconnect on refresh
5. ✅ Encryption/decryption flow
6. ✅ Contract interaction success

## Deployment Plan

### Phase 1: Contract Deployment (Localhost)
```bash
# Terminal 1: Start local node
cd fhevm-hardhat-template
npx hardhat node

# Terminal 2: Deploy contract
npx hardhat deploy --network localhost
```

### Phase 2: Frontend Setup
```bash
cd game-2048-frontend
npm install
npm run dev:mock
```

### Phase 3: Testing
- Manual testing on localhost
- Verify encryption/decryption
- Test all user flows
- Check responsive design

### Phase 4: Testnet Deployment (Sepolia)
```bash
# Set environment variables
# SEPOLIA_PRIVATE_KEY=0x...
# INFURA_API_KEY=...

cd fhevm-hardhat-template
npx hardhat deploy --network sepolia
```

### Phase 5: Production Frontend
```bash
cd game-2048-frontend
npm run build
npm run dev  # Use real Relayer SDK
```

## Success Metrics

### Technical
- ✅ Contract compiles without errors
- ✅ All tests pass
- ✅ Frontend builds successfully
- ✅ Encryption/decryption works end-to-end
- ✅ Wallet auto-reconnect functions
- ✅ Responsive on mobile/tablet/desktop

### User Experience
- ✅ Game playable and smooth (60fps)
- ✅ Score submission < 10 seconds
- ✅ Decryption < 3 seconds
- ✅ No flash of disconnected state on refresh
- ✅ Clear error messages

### Privacy
- ✅ Individual scores cannot be viewed by others
- ✅ Aggregate stats computed correctly
- ✅ No plaintext score in blockchain events
- ✅ Decryption requires owner signature

## Out of Scope (Future Enhancements)

- Multiplayer competitive mode
- NFT achievements
- Token rewards
- Mobile app (React Native)
- Different grid sizes (3x3, 5x5)
- Custom themes
- Sound effects
- Animations

## Dependencies

### Smart Contract
```json
{
  "@fhevm/solidity": "^0.8.x",
  "hardhat": "^2.x",
  "hardhat-deploy": "^0.x"
}
```

### Frontend
```json
{
  "next": "^14.x",
  "react": "^18.x",
  "ethers": "^6.x",
  "@zama-fhe/relayer-sdk": "latest",
  "@fhevm/mock-utils": "latest",
  "tailwindcss": "^3.x"
}
```

## Glossary

- **FHE**: Fully Homomorphic Encryption
- **euintXX**: Encrypted unsigned integer type in FHEVM
- **Relayer**: Zama's service for handling FHE operations
- **Mock Utils**: Local development FHE simulator
- **EIP-6963**: Ethereum standard for multi-wallet support
- **Decrypt Signature**: EIP-712 signature required to decrypt FHE data

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-21  
**Author**: Galaxy  
**Status**: Ready for Implementation

