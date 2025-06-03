// ELO rating ranges
export const ELO_RANGES = [
  {
    label: "Beginner",
    range: "0-800",
    value: "beginner",
    color: "bg-gray-500",
    description: "Learning the basics",
  },
  {
    label: "Novice",
    range: "800-1200",
    value: "novice",
    color: "bg-green-500",
    description: "Understanding fundamentals",
  },
  {
    label: "Intermediate",
    range: "1200-1600",
    value: "intermediate",
    color: "bg-blue-500",
    description: "Developing strategy",
  },
  {
    label: "Advanced",
    range: "1600-2000",
    value: "advanced",
    color: "bg-orange-500",
    description: "Strong tactical play",
  },
  {
    label: "Expert",
    range: "2000+",
    value: "expert",
    color: "bg-red-500",
    description: "Master level play",
  },
];

// Time control categories
export const TIME_CONTROL_CATEGORIES = {
  BULLET: "Bullet",
  BLITZ: "Blitz", 
  RAPID: "Rapid",
  CLASSICAL: "Classical",
};

// Minimum bet amounts (in SOL)
export const MIN_BET_AMOUNT = 0.01;
export const MAX_BET_AMOUNT = 100;

// Game status constants
export const GAME_STATUS = {
  WAITING: "waiting",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

// Payment method types
export const PAYMENT_METHODS = {
  WALLET: "wallet",
  CARD: "card",
} as const;

// Transaction status
export const TRANSACTION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

// WebSocket message types
export const WS_MESSAGE_TYPES = {
  AUTH: "auth",
  JOIN_GAME: "join_game",
  CHAT_MESSAGE: "chat_message",
  GAME_MOVE: "game_move",
  GAME_UPDATE: "game_update",
  USER_DISCONNECT: "user_disconnect",
} as const;

// Chess piece values for material calculation
export const PIECE_VALUES = {
  p: 1, // pawn
  n: 3, // knight
  b: 3, // bishop
  r: 5, // rook
  q: 9, // queen
  k: 0, // king
} as const;

// Default ELO rating for new players
export const DEFAULT_ELO = 1200;

// ELO K-factors for rating calculation
export const ELO_K_FACTORS = {
  BEGINNER: 40, // First 30 games
  INTERMEDIATE: 20, // Rating < 2400
  EXPERT: 10, // Rating >= 2400
} as const;

// Maximum ELO difference for automatic game matching
export const MAX_ELO_DIFFERENCE = 300;

// Notification durations (in milliseconds)
export const NOTIFICATION_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
} as const;

// Chess board configuration
export const BOARD_CONFIG = {
  SQUARE_SIZE: 64,
  LIGHT_SQUARE_COLOR: "#f0d9b5",
  DARK_SQUARE_COLOR: "#b58863",
  HIGHLIGHT_COLOR: "#ffffcc",
  SELECTED_COLOR: "#ffff99",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: "/api/auth/register",
  USER: "/api/auth/user",
  
  // Games
  GAMES: "/api/games",
  JOIN_GAME: "/api/games/:id/join",
  GAME_CHAT: "/api/games/:id/chat",
  
  // Payments
  DEPOSITS: "/api/deposits",
  WITHDRAWALS: "/api/withdrawals",
  CREATE_PAYMENT_INTENT: "/api/create-payment-intent",
  
  // Chess.com integration
  CHESS_COM: "/api/chess-com/:username",
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: "chesswager-theme",
  USER_PREFERENCES: "chesswager-preferences",
  GAME_HISTORY: "chesswager-game-history",
} as const;

// Developer mode
export const DEV_MODE = {
  SECRET_CODE: "081809",
  BOT_USER_ID: -1,
} as const;

// Environment variables
export const ENV = {
  PRIVY_APP_ID: import.meta.env.VITE_PRIVY_APP_ID,
  STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "",
} as const;

// Validation rules
export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  BET_AMOUNT: {
    MIN: MIN_BET_AMOUNT,
    MAX: MAX_BET_AMOUNT,
    DECIMAL_PLACES: 8,
  },
  CHAT_MESSAGE: {
    MAX_LENGTH: 200,
  },
} as const;

// Chess.com rating mapping
export const CHESS_COM_RATINGS = {
  RAPID: "chess_rapid",
  BLITZ: "chess_blitz", 
  BULLET: "chess_bullet",
  DAILY: "chess_daily",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  AUTHENTICATION_FAILED: "Authentication failed. Please try again.",
  INSUFFICIENT_BALANCE: "Insufficient balance to create this game.",
  GAME_NOT_FOUND: "Game not found.",
  INVALID_MOVE: "Invalid chess move.",
  USERNAME_TAKEN: "Username is already taken.",
  INVALID_USERNAME: "Username must be 3-20 characters and contain only letters, numbers, and underscores.",
  PAYMENT_FAILED: "Payment processing failed. Please try again.",
  WEBSOCKET_ERROR: "Connection error. Some features may not work properly.",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: "Profile updated successfully!",
  GAME_CREATED: "Game created successfully!",
  GAME_JOINED: "Successfully joined the game!",
  PAYMENT_COMPLETED: "Payment completed successfully!",
  WITHDRAWAL_INITIATED: "Withdrawal request submitted successfully!",
  SETTINGS_SAVED: "Settings saved successfully!",
} as const;
