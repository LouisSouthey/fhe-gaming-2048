/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const FHE2048GameABI = {
  "abi": [
    {
      "inputs": [],
      "name": "GameAlreadyCompleted",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "GameNotCompleted",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "GameNotFound",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoGamesPlayed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnauthorizedAccess",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "gameId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "startTime",
          "type": "uint64"
        }
      ],
      "name": "GameStarted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "gameId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "endTime",
          "type": "uint64"
        }
      ],
      "name": "ScoreSubmitted",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "aggregatesInitialized",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "allowGlobalAveragesDecryption",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "gameId",
          "type": "uint256"
        }
      ],
      "name": "allowScoreDecryption",
      "outputs": [],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "averagesComputed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "cachedAvgMoves",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "cachedAvgScore",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "gameIdCounter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "gameSessions",
      "outputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "internalType": "euint32",
          "name": "score",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "moves",
          "type": "bytes32"
        },
        {
          "internalType": "uint64",
          "name": "startTime",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "endTime",
          "type": "uint64"
        },
        {
          "internalType": "bool",
          "name": "completed",
          "type": "bool"
        },
        {
          "internalType": "ebool",
          "name": "reached2048",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "gameId",
          "type": "uint256"
        }
      ],
      "name": "getGameSession",
      "outputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "internalType": "euint32",
          "name": "score",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "moves",
          "type": "bytes32"
        },
        {
          "internalType": "uint64",
          "name": "startTime",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "endTime",
          "type": "uint64"
        },
        {
          "internalType": "bool",
          "name": "completed",
          "type": "bool"
        },
        {
          "internalType": "ebool",
          "name": "won",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getGlobalAverages",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "avgScore",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "avgMoves",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "getPlayerGameCount",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "getPlayerGameIds",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "getPlayerStats",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "gameIds",
          "type": "uint256[]"
        },
        {
          "internalType": "uint32",
          "name": "gamesPlayed",
          "type": "uint32"
        },
        {
          "internalType": "euint32",
          "name": "bestScore",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "start",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "count",
          "type": "uint256"
        }
      ],
      "name": "getPlayers",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "playerAddresses",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getPlayersCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "playerBestScore",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "playerGameCount",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "playerGames",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "playerHasBestScore",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "players",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "refreshGlobalAverages",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "startGame",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "gameId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "gameId",
          "type": "uint256"
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedScore",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "inputProofScore",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedMoves",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "inputProofMoves",
          "type": "bytes"
        }
      ],
      "name": "submitScore",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalEncryptedMoves",
      "outputs": [
        {
          "internalType": "euint64",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalEncryptedScores",
      "outputs": [
        {
          "internalType": "euint64",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalGames",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalPlayers",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
} as const;

