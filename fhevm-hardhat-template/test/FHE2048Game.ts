import { expect } from "chai";
import { ethers, fhevm, deployments } from "hardhat";
import { FHE2048Game, FHE2048Game__factory } from "../types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

type Signers = {
  deployer: HardhatEthersSigner;
  player1: HardhatEthersSigner;
  player2: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("FHE2048Game")) as FHE2048Game__factory;
  const contract = (await factory.deploy()) as FHE2048Game;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("FHE2048Game", function () {
  let signers: Signers;
  let contract: FHE2048Game;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], player1: ethSigners[1], player2: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }
    
    const deployment = await deployFixture();
    contract = deployment.contract;
    contractAddress = deployment.contractAddress;
  });

  describe("Game Session Management", function () {
    it("should start a new game session", async function () {
      const tx = await contract.connect(signers.player1).startGame();
      const receipt = await tx.wait();
      
      expect(receipt?.status).to.equal(1);
      
      const gameIdCounter = await contract.gameIdCounter();
      expect(gameIdCounter).to.equal(1);
      
      const totalPlayers = await contract.totalPlayers();
      expect(totalPlayers).to.equal(1);
    });

    it("should track multiple games for same player", async function () {
      await contract.connect(signers.player1).startGame();
      await contract.connect(signers.player1).startGame();
      
      const gameIds = await contract.getPlayerGameIds(signers.player1.address);
      expect(gameIds.length).to.equal(2);
    });

    it("should track multiple players", async function () {
      await contract.connect(signers.player1).startGame();
      await contract.connect(signers.player2).startGame();
      
      const totalPlayers = await contract.totalPlayers();
      expect(totalPlayers).to.equal(2);
    });
  });

  describe("Score Submission", function () {
    it("should submit encrypted score successfully", async function () {
      const startTx = await contract.connect(signers.player1).startGame();
      await startTx.wait();
      
      const gameId = 0;
      
      const encryptedScore = await fhevm
        .createEncryptedInput(contractAddress, signers.player1.address)
        .add32(1000)
        .encrypt();
      
      const submitTx = await contract.connect(signers.player1).submitScore(
        gameId,
        encryptedScore.handles[0],
        encryptedScore.inputProof
      );
      
      await submitTx.wait();
      
      const totalGames = await contract.totalGames();
      expect(totalGames).to.equal(1);
      
      const playerGameCount = await contract.playerGameCount(signers.player1.address);
      expect(playerGameCount).to.equal(1);
    });

    it("should reject double submission", async function () {
      const startTx = await contract.connect(signers.player1).startGame();
      await startTx.wait();
      
      const gameId = 0;
      
      const encryptedScore = await fhevm
        .createEncryptedInput(contractAddress, signers.player1.address)
        .add32(1000)
        .encrypt();
      
      const submitTx = await contract.connect(signers.player1).submitScore(
        gameId,
        encryptedScore.handles[0],
        encryptedScore.inputProof
      );
      await submitTx.wait();
      
      const encryptedScore2 = await fhevm
        .createEncryptedInput(contractAddress, signers.player1.address)
        .add32(2000)
        .encrypt();
      
      await expect(
        contract.connect(signers.player1).submitScore(
          gameId,
          encryptedScore2.handles[0],
          encryptedScore2.inputProof
        )
      ).to.be.revertedWithCustomError(contract, "GameAlreadyCompleted");
    });

    it("should reject unauthorized score submission", async function () {
      const startTx = await contract.connect(signers.player1).startGame();
      await startTx.wait();
      
      const gameId = 0;
      
      const encryptedScore = await fhevm
        .createEncryptedInput(contractAddress, signers.player2.address)
        .add32(1000)
        .encrypt();
      
      await expect(
        contract.connect(signers.player2).submitScore(
          gameId,
          encryptedScore.handles[0],
          encryptedScore.inputProof
        )
      ).to.be.revertedWithCustomError(contract, "UnauthorizedAccess");
    });
  });

  describe("Player Statistics", function () {
    it("should return player stats", async function () {
      const startTx = await contract.connect(signers.player1).startGame();
      await startTx.wait();
      
      const encryptedScore = await fhevm
        .createEncryptedInput(contractAddress, signers.player1.address)
        .add32(1000)
        .encrypt();
      
      const submitTx = await contract.connect(signers.player1).submitScore(
        0,
        encryptedScore.handles[0],
        encryptedScore.inputProof
      );
      await submitTx.wait();
      
      const [gameIds, gamesPlayed, bestScore] = await contract.getPlayerStats(signers.player1.address);
      
      expect(gameIds.length).to.equal(1);
      expect(gamesPlayed).to.equal(1);
      expect(bestScore).to.not.equal(0n);
    });

    it("should update best score correctly", async function () {
      let startTx = await contract.connect(signers.player1).startGame();
      await startTx.wait();
      
      let encryptedScore = await fhevm
        .createEncryptedInput(contractAddress, signers.player1.address)
        .add32(1000)
        .encrypt();
      
      let submitTx = await contract.connect(signers.player1).submitScore(
        0,
        encryptedScore.handles[0],
        encryptedScore.inputProof
      );
      await submitTx.wait();
      
      const bestScore1 = (await contract.getPlayerStats(signers.player1.address))[2];
      
      startTx = await contract.connect(signers.player1).startGame();
      await startTx.wait();
      
      encryptedScore = await fhevm
        .createEncryptedInput(contractAddress, signers.player1.address)
        .add32(2000)
        .encrypt();
      
      submitTx = await contract.connect(signers.player1).submitScore(
        1,
        encryptedScore.handles[0],
        encryptedScore.inputProof
      );
      await submitTx.wait();
      
      const bestScore2 = (await contract.getPlayerStats(signers.player1.address))[2];
      
      expect(bestScore1).to.not.equal(bestScore2);
    });
  });

  describe("Global Averages", function () {
    it("should compute global averages after multiple games", async function () {
      let startTx = await contract.connect(signers.player1).startGame();
      await startTx.wait();
      
      let encryptedScore = await fhevm
        .createEncryptedInput(contractAddress, signers.player1.address)
        .add32(1000)
        .encrypt();
      
      let submitTx = await contract.connect(signers.player1).submitScore(
        0,
        encryptedScore.handles[0],
        encryptedScore.inputProof
      );
      await submitTx.wait();
      
      startTx = await contract.connect(signers.player2).startGame();
      await startTx.wait();
      
      encryptedScore = await fhevm
        .createEncryptedInput(contractAddress, signers.player2.address)
        .add32(2000)
        .encrypt();
      
      submitTx = await contract.connect(signers.player2).submitScore(
        1,
        encryptedScore.handles[0],
        encryptedScore.inputProof
      );
      await submitTx.wait();
      
      const tx = await contract.getGlobalAverages();
      await tx.wait();
      
      expect(tx).to.not.be.reverted;
    });

    it("should revert if no games played", async function () {
      await expect(
        contract.getGlobalAverages()
      ).to.be.revertedWithCustomError(contract, "NoGamesPlayed");
    });
  });

  describe("Access Control", function () {
    it("should allow score decryption only by owner", async function () {
      const startTx = await contract.connect(signers.player1).startGame();
      await startTx.wait();
      
      const encryptedScore = await fhevm
        .createEncryptedInput(contractAddress, signers.player1.address)
        .add32(1000)
        .encrypt();
      
      const submitTx = await contract.connect(signers.player1).submitScore(
        0,
        encryptedScore.handles[0],
        encryptedScore.inputProof
      );
      await submitTx.wait();
      
      // Allow score decryption (this is now a view function, so no transaction)
      await expect(
        contract.connect(signers.player1).allowScoreDecryption(0)
      ).to.not.be.reverted;
      
      await expect(
        contract.connect(signers.player2).allowScoreDecryption(0)
      ).to.be.revertedWithCustomError(contract, "UnauthorizedAccess");
    });
  });
});
