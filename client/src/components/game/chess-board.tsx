import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { useWebSocket } from '@/hooks/use-websocket';
import { useAuth } from '@/hooks/use-auth';

interface ChessBoardProps {
  gameId: string;
  playerColor: 'white' | 'black';
}

export function ChessBoard({ gameId, playerColor }: ChessBoardProps) {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [highlightedSquares, setHighlightedSquares] = useState<string[]>([]);
  const { user } = useAuth();
  const { sendMessage, lastMessage } = useWebSocket(user?.id);

  useEffect(() => {
    if (lastMessage?.type === 'game_move') {
      const newGame = new Chess(game.fen());
      try {
        newGame.move(lastMessage.data);
        setGame(newGame);
      } catch (error) {
        console.error('Invalid move received:', error);
      }
    }
  }, [lastMessage, game]);

  useEffect(() => {
    // Join the game room
    if (user?.id) {
      sendMessage({
        type: 'join_game',
        gameId,
      });
    }
  }, [gameId, user, sendMessage]);

  const handleSquareClick = (square: string) => {
    if (selectedSquare) {
      // Try to make a move
      try {
        const move = game.move({
          from: selectedSquare,
          to: square,
          promotion: 'q', // Always promote to queen for simplicity
        });

        if (move) {
          setGame(new Chess(game.fen()));
          
          // Send move to opponent
          sendMessage({
            type: 'game_move',
            move: move,
          });
        }
      } catch (error) {
        // Invalid move, clear selection
      }
      
      setSelectedSquare(null);
      setHighlightedSquares([]);
    } else {
      // Select a piece
      const piece = game.get(square as any);
      if (piece && 
          ((playerColor === 'white' && piece.color === 'w') || 
           (playerColor === 'black' && piece.color === 'b'))) {
        setSelectedSquare(square);
        
        // Highlight possible moves
        const moves = game.moves({ square: square as any, verbose: true });
        setHighlightedSquares(moves.map(move => move.to));
      }
    }
  };

  const renderSquare = (square: string, piece: any) => {
    const file = square.charCodeAt(0) - 97; // a-h to 0-7
    const rank = parseInt(square[1]) - 1; // 1-8 to 0-7
    const isLight = (file + rank) % 2 === 0;
    const isSelected = selectedSquare === square;
    const isHighlighted = highlightedSquares.includes(square);

    let squareClass = `chess-square ${isLight ? 'light' : 'dark'}`;
    if (isSelected) squareClass += ' selected';
    if (isHighlighted) squareClass += ' highlighted';

    const pieceSymbols: { [key: string]: string } = {
      'wk': '♔', 'wq': '♕', 'wr': '♖', 'wb': '♗', 'wn': '♘', 'wp': '♙',
      'bk': '♚', 'bq': '♛', 'br': '♜', 'bb': '♝', 'bn': '♞', 'bp': '♟',
    };

    const pieceSymbol = piece ? pieceSymbols[piece.color + piece.type] : '';

    return (
      <div
        key={square}
        className={squareClass}
        onClick={() => handleSquareClick(square)}
      >
        {pieceSymbol}
      </div>
    );
  };

  const renderBoard = () => {
    const board = game.board();
    const squares = [];

    for (let rank = 7; rank >= 0; rank--) {
      for (let file = 0; file < 8; file++) {
        const square = String.fromCharCode(97 + file) + (rank + 1);
        const piece = board[rank][file];
        squares.push(renderSquare(square, piece));
      }
    }

    // Flip board for black player
    if (playerColor === 'black') {
      squares.reverse();
    }

    return squares;
  };

  return (
    <div className="chess-board w-full max-w-lg mx-auto">
      {renderBoard()}
    </div>
  );
}
