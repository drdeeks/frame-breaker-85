// --- GAME CONFIGURATION ---
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const PADDLE_WIDTH_DEFAULT = 120;
export const PADDLE_HEIGHT = 22;
export const PADDLE_Y = CANVAS_HEIGHT - 40;
export const BALL_RADIUS = 11;
export const BRICK_COLS = 18;
export const BRICK_ROWS = 10;
export const BRICK_HEIGHT = 18;
export const BRICK_GAP = 3;
export const BRICK_WIDTH = (CANVAS_WIDTH - BRICK_GAP * (BRICK_COLS + 1)) / BRICK_COLS;
export const INITIAL_LIVES = 3;
export const POWER_UP_CHANCE = 0.35;
export const POWER_UP_SIZE = 15;
export const POWER_UP_SPEED = 2;
export const PADDLE_SMOOTHING = 0.15;
export const SHRINK_PADDLE_DURATION = 20000; // 20 seconds

// --- COLOR PALETTE ---
export const COLORS = {
  PADDLE: '#00ffff',
  BALL: '#f21170',
  BRICK: ['#ff00ff', '#70ff00', '#f89a1d', '#3d25b5'],
  TEXT: '#ffffff',
  BORDER: '#00ffff',
  SHADOW: '#f21170',
  POWER_UP: {
    'sticky': '#f89a1d',
    'paint': '#ff00ff',
    'invincible': '#70ff00',
  },
  POWER_DOWN: {
    'add-bricks': '#3d25b5',
    'shrink-paddle': '#f21170'
  },
  BRICK_DAMAGED: '#999999',
};

export const POWER_UP_TYPES = {
  STICKY: 'sticky',
  PAINT: 'paint',
  INVINCIBLE: 'invincible',
};

export const POWER_DOWN_TYPES = {
  ADD_BRICKS: 'add-bricks',
  SHRINK_PADDLE: 'shrink-paddle',
};

export const ALL_POWER_TYPES = [...Object.values(POWER_UP_TYPES), ...Object.values(POWER_DOWN_TYPES)];

// --- BASE CHAIN CONFIGURATION ---
export const BASE_CHAIN_ID = 8453; // Base mainnet
export const BASE_RPC_URL = 'https://mainnet.base.org';
export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // IMPORTANT: Placeholder - replace with your deployed contract address
export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "playerName", "type": "string" },
      { "internalType": "uint256", "name": "score", "type": "uint256" }
    ],
    "name": "submitScore",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_topN", "type": "uint256" }
    ],
    "name": "getLeaderboard",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "playerName", "type": "string" },
          { "internalType": "uint256", "name": "score", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "address", "name": "player", "type": "address" }
        ],
        "internalType": "struct FrameBreaker.Score[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];