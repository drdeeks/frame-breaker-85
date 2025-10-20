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

// The contract address is loaded from an environment variable.
// You must create a .env file and set the VITE_CONTRACT_ADDRESS value.
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export const CONTRACT_ABI = [{"type":"constructor","inputs":[{"name":"_initialSubmissionFee","type":"uint256","internalType":"uint256"},{"name":"_maxLeaderboardSize","type":"uint256","internalType":"uint256"}],"stateMutability":"nonpayable"},{"type":"receive","stateMutability":"payable"},{"type":"function","name":"MAX_LEADERBOARD_SIZE","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"MAX_NAME_LENGTH","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"MIN_SCORE","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"getLeaderboard","inputs":[{"name":"_topN","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"tuple[]","internalType":"struct FrameBreaker.Score[]","components":[{"name":"playerName","type":"string","internalType":"string"},{"name":"score","type":"uint256","internalType":"uint256"},{"name":"timestamp","type":"uint256","internalType":"uint256"},{"name":"player","type":"address","internalType":"address"}]}],"stateMutability":"view"},{"type":"function","name":"getLeaderboardSize","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"getStats","inputs":[],"outputs":[{"name":"_totalSubmissions","type":"uint256","internalType":"uint256"},{"name":"_submissionFee","type":"uint256","internalType":"uint256"},{"name":"_contractBalance","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},{"type":"function","name":"pause","inputs":[],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"paused","inputs":[],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"renounceOwnership","inputs":[],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"setSubmissionFee","inputs":[{"name":"_newFee","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"submissionFee","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"submitScore","inputs":[{"name":"_playerName","type":"string","internalType":"string"},{"name":"_score","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"payable"},{"type":"function","name":"totalSubmissions","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"transferOwnership","inputs":[{"name":"newOwner","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"unpause","inputs":[],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"upgradeContract","inputs":[{"name":"_newContract","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"version","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"pure"},{"type":"function","name":"withdrawFees","inputs":[{"name":"_to","type":"address","internalType":"address payable"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"event","name":"ContractUpgraded","inputs":[{"name":"newContract","type":"address","indexed":true,"internalType":"address"}],"anonymous":false},{"type":"event","name":"FeesWithdrawn","inputs":[{"name":"to","type":"address","indexed":true,"internalType":"address"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":"event","name":"OwnershipTransferred","inputs":[{"name":"previousOwner","type":"address","indexed":true,"internalType":"address"},{"name":"newOwner","type":"address","indexed":true,"internalType":"address"}],"anonymous":false},{"type":"event","name":"Paused","inputs":[{"name":"account","type":"address","indexed":false,"internalType":"address"}],"anonymous":false},{"type":"event","name":"ScoreSubmitted","inputs":[{"name":"player","type":"address","indexed":true,"internalType":"address"},{"name":"playerName","type":"string","indexed":false,"internalType":"string"},{"name":"score","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"timestamp","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":"event","name":"SubmissionFeeUpdated","inputs":[{"name":"newFee","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":"event","name":"Unpaused","inputs":[{"name":"account","type":"address","indexed":false,"internalType":"address"}],"anonymous":false},{"type":"error","name":"InsufficientFee","inputs":[{"name":"required","type":"uint256","internalType":"uint256"},{"name":"sent","type":"uint256","internalType":"uint256"}]},{"type":"error","name":"InvalidLeaderboardRequest","inputs":[{"name":"topN","type":"uint256","internalType":"uint256"}]},{"type":"error","name":"InvalidName","inputs":[{"name":"name","type":"string","internalType":"string"}]},{"type":"error","name":"InvalidNewContractAddress","inputs":[{"name":"addr","type":"address","internalType":"address"}]},{"type":"error","name":"InvalidScore","inputs":[{"name":"score","type":"uint256","internalType":"uint256"}]},{"type":"error","name":"NoFeesToWithdraw","inputs":[]},{"type":"error","name":"RefundFailed","inputs":[]},{"type":"error","name":"WithdrawFailed","inputs":[]}];