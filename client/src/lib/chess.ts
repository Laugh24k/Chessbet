import { Chess, Square, PieceSymbol, Color } from 'chess.js';

export interface ChessMove {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
}

export interface ChessGameState {
  fen: string;
  pgn: string;
  isGameOver: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  turn: Color;
  history: string[];
  capturedPieces: {
    white: PieceSymbol[];
    black: PieceSymbol[];
  };
}

export class ChessGame {
  private game: Chess;
  private moveHistory: ChessMove[] = [];

  constructor(fen?: string) {
    this.game = new Chess(fen);
  }

  // Get current game state
  getGameState(): ChessGameState {
    const history = this.game.history({ verbose: true });
    const capturedPieces = this.getCapturedPieces();

    return {
      fen: this.game.fen(),
      pgn: this.game.pgn(),
      isGameOver: this.game.isGameOver(),
      isCheck: this.game.isCheck(),
      isCheckmate: this.game.isCheckmate(),
      isStalemate: this.game.isStalemate(),
      isDraw: this.game.isDraw(),
      turn: this.game.turn(),
      history: this.game.history(),
      capturedPieces,
    };
  }

  // Make a move
  makeMove(move: ChessMove | string): boolean {
    try {
      const result = this.game.move(move);
      if (result) {
        if (typeof move === 'object') {
          this.moveHistory.push(move);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Invalid move:', error);
      return false;
    }
  }

  // Get valid moves for a square
  getValidMoves(square: Square): Square[] {
    try {
      const moves = this.game.moves({ square, verbose: true });
      return moves.map(move => move.to);
    } catch {
      return [];
    }
  }

  // Get all valid moves
  getAllValidMoves(): string[] {
    return this.game.moves();
  }

  // Check if a move is valid
  isValidMove(move: ChessMove | string): boolean {
    try {
      const chess = new Chess(this.game.fen());
      const result = chess.move(move);
      return !!result;
    } catch {
      return false;
    }
  }

  // Get piece at square
  getPiece(square: Square) {
    return this.game.get(square);
  }

  // Get board position
  getBoard() {
    return this.game.board();
  }

  // Undo last move
  undoMove() {
    const move = this.game.undo();
    if (move && this.moveHistory.length > 0) {
      this.moveHistory.pop();
    }
    return move;
  }

  // Reset game
  reset() {
    this.game.reset();
    this.moveHistory = [];
  }

  // Load game from FEN
  loadFen(fen: string): boolean {
    try {
      this.game.load(fen);
      return true;
    } catch {
      return false;
    }
  }

  // Load game from PGN
  loadPgn(pgn: string): boolean {
    try {
      this.game.loadPgn(pgn);
      return true;
    } catch {
      return false;
    }
  }

  // Get captured pieces
  private getCapturedPieces(): { white: PieceSymbol[]; black: PieceSymbol[] } {
    const captured = { white: [] as PieceSymbol[], black: [] as PieceSymbol[] };
    const history = this.game.history({ verbose: true });

    for (const move of history) {
      if (move.captured) {
        if (move.color === 'w') {
          captured.black.push(move.captured as PieceSymbol);
        } else {
          captured.white.push(move.captured as PieceSymbol);
        }
      }
    }

    return captured;
  }

  // Calculate material advantage
  getMaterialBalance(): number {
    const pieceValues = {
      p: 1, // pawn
      n: 3, // knight
      b: 3, // bishop
      r: 5, // rook
      q: 9, // queen
      k: 0, // king
    };

    let whiteValue = 0;
    let blackValue = 0;

    const board = this.game.board();
    for (const row of board) {
      for (const square of row) {
        if (square) {
          const value = pieceValues[square.type];
          if (square.color === 'w') {
            whiteValue += value;
          } else {
            blackValue += value;
          }
        }
      }
    }

    return whiteValue - blackValue;
  }

  // Get game status
  getGameStatus(): string {
    if (this.game.isCheckmate()) {
      return this.game.turn() === 'w' ? 'Black wins by checkmate' : 'White wins by checkmate';
    }
    if (this.game.isStalemate()) {
      return 'Draw by stalemate';
    }
    if (this.game.isDraw()) {
      return 'Draw';
    }
    if (this.game.isCheck()) {
      return `${this.game.turn() === 'w' ? 'White' : 'Black'} is in check`;
    }
    return `${this.game.turn() === 'w' ? 'White' : 'Black'} to move`;
  }

  // Export game data for saving
  exportGame() {
    return {
      fen: this.game.fen(),
      pgn: this.game.pgn(),
      moveHistory: this.moveHistory,
      gameState: this.getGameState(),
    };
  }

  // Import game data
  importGame(gameData: any) {
    if (gameData.fen) {
      this.loadFen(gameData.fen);
    } else if (gameData.pgn) {
      this.loadPgn(gameData.pgn);
    }
    
    if (gameData.moveHistory) {
      this.moveHistory = gameData.moveHistory;
    }
  }
}

// Utility functions
export function isSquareLight(square: Square): boolean {
  const file = square.charCodeAt(0) - 97; // a-h to 0-7
  const rank = parseInt(square[1]) - 1; // 1-8 to 0-7
  return (file + rank) % 2 === 0;
}

export function squareToCoordinates(square: Square): [number, number] {
  const file = square.charCodeAt(0) - 97; // a-h to 0-7
  const rank = parseInt(square[1]) - 1; // 1-8 to 0-7
  return [file, rank];
}

export function coordinatesToSquare(file: number, rank: number): Square {
  return (String.fromCharCode(97 + file) + (rank + 1)) as Square;
}

export function flipSquare(square: Square): Square {
  const [file, rank] = squareToCoordinates(square);
  return coordinatesToSquare(7 - file, 7 - rank);
}

// Chess piece symbols for display
export const PIECE_SYMBOLS = {
  wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
};

// ELO calculation utilities
export function calculateEloChange(playerRating: number, opponentRating: number, score: number, kFactor: number = 32): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  return Math.round(kFactor * (score - expectedScore));
}

export function getKFactor(rating: number, gamesPlayed: number): number {
  if (gamesPlayed < 30) return 40;
  if (rating < 2400) return 20;
  return 10;
}
