# FHE Gaming 2048 🎮🔐

A fully homomorphic encrypted blockchain game demonstrating privacy-preserving gaming on Ethereum Sepolia testnet using [Zama's FHEVM](https://docs.zama.ai/fhevm).

## 🌟 Overview

**FHE Gaming 2048** is a blockchain-based 2048 game where scores and move counts are **fully encrypted on-chain**. Players can submit encrypted game data while the contract computes global aggregate statistics (average score, average moves) across all participants without ever decrypting individual scores.

### Key Features

- 🔐 **Full Encryption**: Game scores and moves encrypted with FHEVM before submission
- 📊 **Privacy-Preserving Analytics**: Compute global averages without revealing individual data
- 🎯 **Player Statistics**: Personal game history with encrypted best scores
- 🏆 **Leaderboard**: View all players while maintaining score privacy
- 🔓 **Selective Decryption**: Only players can decrypt their own scores
- 🌐 **Testnet Ready**: Deployed and tested on Sepolia testnet

## 🏗️ Architecture

```
fhe-gaming-2048/
├── fhevm-hardhat-template/      # Smart contracts (Solidity + FHEVM)
│   ├── contracts/
│   │   └── FHE2048Game.sol       # Main game contract with FHE operations
│   ├── deploy/                    # Deployment scripts
│   ├── test/                      # Contract tests
│   └── hardhat.config.ts          # Hardhat configuration
├── game-2048-frontend/           # Next.js frontend application
│   ├── app/                       # Pages (play, stats, leaderboard)
│   ├── components/                 # React components
│   ├── hooks/                      # Custom hooks (game logic, FHEVM integration)
│   ├── fhevm/                      # FHEVM wrapper and mock utils
│   └── lib/                        # Game 2048 logic
├── frontend/                       # Reference implementation (read-only)
└── Fhevm0.8_Reference.md          # FHEVM API reference
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask wallet extension
- Hardhat node (for local development)
- Sepolia ETH (for testnet deployment)

### Local Development

#### 1. Install Dependencies

```bash
# Install contract dependencies
cd fhevm-hardhat-template
npm install

# Install frontend dependencies
cd ../game-2048-frontend
npm install
```

#### 2. Start Local Hardhat Node

```bash
cd fhevm-hardhat-template
npx hardhat node
```

Keep this terminal running. The node will provide accounts with test ETH.

#### 3. Deploy Contracts Locally

In a new terminal:

```bash
cd fhevm-hardhat-template
npx hardhat deploy --network localhost
```

This deploys the `FHE2048Game` contract to your local network and outputs the contract address.

#### 4. Generate Frontend ABI Files

```bash
cd game-2048-frontend
npm run genabi
```

This script reads the deployed contract addresses and generates TypeScript-safe ABI files.

#### 5. Start Frontend Development Server

```bash
cd game-2048-frontend
npm run dev:mock
```

The app will open at `http://localhost:3000`.

**Note**: The `dev:mock` script automatically:
- Detects if Hardhat node is running
- Generates ABI files
- Uses FHEVM mock utils for local encryption/decryption

### Playing the Game

1. **Connect Wallet**: Click "Connect Wallet" and select an account from your local Hardhat node
2. **Start Game**: Click "Start New Game" to begin a 2048 session on the blockchain
3. **Play**: Use arrow keys or WASD to merge tiles
4. **Submit Score**: When the game ends, submit your encrypted score and moves
5. **View Stats**: Check your personal statistics and decrypt your best score
6. **Leaderboard**: View all players and decrypt your own scores

## 🌐 Sepolia Testnet Deployment

The contract is already deployed to Sepolia testnet:

- **Contract Address**: `0x9c03fAe8A23038731Aef83F7342F16811673a1cd`
- **Network**: Sepolia (Chain ID: 11155111)
- **Explorer**: https://sepolia.etherscan.io/address/0x9c03fAe8A23038731Aef83F7342F16811673a1cd

### Deploy to Sepolia (Optional)

```bash
cd fhevm-hardhat-template

# Configure your variables
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY

# Deploy
npx hardhat deploy --network sepolia
```

### Run on Sepolia

The frontend automatically detects the network:

```bash
cd game-2048-frontend
npm run dev
```

**Note**: On Sepolia, you'll need to connect to the real Zama FHEVM Relayer (requires registration).

## 🔐 FHEVM Integration

This project demonstrates several FHEVM concepts:

### 1. Encrypted Input Submission

```typescript
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add32(score);
input.add32(moves);
const encrypted = await input.encrypt();

// Submit to contract
await contract.submitScore(
  gameId,
  encrypted.handles[0],
  encrypted.inputProof,
  encrypted.handles[1],
  encrypted.inputProof
);
```

### 2. Homomorphic Operations

```solidity
// Contract can compute on encrypted data
euint64 totalScores = totalEncryptedScores;
euint64 avgScore = FHE.div(totalScores, uint64(totalGames));
```

### 3. Selective Decryption

```typescript
// Only the owner can decrypt their scores
const decrypted = await decryptValue(encryptedHandle);
```

### 4. Access Control

```solidity
// Grant decryption permission to the player
FHE.allow(score, msg.sender);
FHE.allow(moves, msg.sender);
```

## 📚 Contract Functions

### FHE2048Game.sol

#### Player Functions
- `startGame()` - Start a new game session
- `submitScore(gameId, encryptedScore, encryptedMoves)` - Submit encrypted score and moves
- `getPlayerStats(player)` - Get player's game count and best score
- `getPlayerGameIds(player)` - Get all game IDs for a player
- `getGameSession(gameId)` - Get full game session details

#### Global Statistics
- `refreshGlobalAverages()` - Compute global average score and moves (transaction)
- `allowGlobalAveragesDecryption()` - Grant permission to decrypt averages
- `getGlobalAverages()` - Fetch pre-computed averages (view)
- `getTotalStats()` - Get total games and players

#### Leaderboard
- `getPlayers(start, count)` - Paginate all player addresses
- `getPlayersCount()` - Total unique players

## 🧪 Testing

Run contract tests:

```bash
cd fhevm-hardhat-template
npx hardhat test
```

Run frontend tests:

```bash
cd game-2048-frontend
npm test
```

## 🎨 Technology Stack

### Smart Contracts
- **Solidity** 0.8.27
- **Hardhat** - Development framework
- **@fhevm/hardhat-plugin** - FHEVM integration
- **TypeScript** - Type safety

### Frontend
- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **ethers.js v6** - Blockchain interaction
- **FHEVM SDKs**:
  - `@zama-fhe/relayer-sdk` - Sepolia testnet
  - `@fhevm/mock-utils` - Local development

## 🔒 Security & Privacy

### What is Encrypted?
- ✅ Game scores (euint32)
- ✅ Move counts (euint32)
- ✅ Win status (ebool)
- ✅ Best score per player

### What is Public?
- ✅ Player addresses
- ✅ Game IDs
- ✅ Timestamps
- ✅ Game completion status
- ✅ Encrypted values (can't be read without authorization)

### Privacy Guarantees
- No one can see your actual score unless you decrypt it yourself
- The contract can compute aggregates without decrypting individual scores
- Zero-knowledge proof system ensures data authenticity

## 📖 Documentation

- [FHEVM 0.8 Reference](./Fhevm0.8_Reference.md) - FHEVM API documentation
- [Zama FHEVM Docs](https://docs.zama.ai/fhevm) - Official documentation
- [Ethers.js v6 Docs](https://docs.ethers.org/v6/) - Ethereum library

## 🛠️ Development Scripts

### Contracts (`fhevm-hardhat-template/`)

```bash
npx hardhat compile          # Compile contracts
npx hardhat test             # Run tests
npx hardhat deploy --network localhost  # Deploy to local node
npx hardhat node             # Start local Hardhat node
```

### Frontend (`game-2048-frontend/`)

```bash
npm run dev:mock            # Development with mock FHEVM
npm run dev                 # Development with real FHEVM (Sepolia)
npm run build               # Production build
npm run genabi              # Generate ABI files from deployments
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License

## 🙏 Acknowledgments

- [Zama](https://www.zama.ai/) - FHEVM technology
- [Hardhat](https://hardhat.org/) - Development framework
- [Next.js](https://nextjs.org/) - React framework

## 📧 Contact

Project maintained by [@LouisSouthey](https://github.com/LouisSouthey)

---

**Built with ❤️ and 🔐 using FHEVM**

