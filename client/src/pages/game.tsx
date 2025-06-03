import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/ui/header";
import { ChessBoard } from "@/components/game/chess-board";
import { GameChat } from "@/components/game/game-chat";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";

export default function Game() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendMessage } = useWebSocket(user?.id);

  const { data: gameData, isLoading } = useQuery({
    queryKey: [`/api/games/${id}`],
    enabled: !!id,
  });

  const handleResign = () => {
    if (window.confirm("Are you sure you want to resign?")) {
      // TODO: Implement resignation logic
      toast({
        title: "Game Resigned",
        description: "You have resigned from the game.",
        variant: "destructive",
      });
    }
  };

  const handleOfferDraw = () => {
    // TODO: Implement draw offer logic
    toast({
      title: "Draw Offered",
      description: "Draw offer sent to your opponent.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const game = gameData?.game;
  if (!game) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
          <p className="text-gray-400">The requested game could not be found.</p>
        </div>
      </div>
    );
  }

  const isCreator = user?.id === game.game.creatorId;
  const opponent = isCreator ? game.opponent : game.creator;
  const playerColor = isCreator ? "white" : "black";

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Chess Board Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            {/* Game Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <img 
                  src={opponent?.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"} 
                  alt="Opponent" 
                  className="w-10 h-10 rounded-full" 
                />
                <div>
                  <div className="font-semibold">
                    {opponent?.username} ({opponent?.elo})
                  </div>
                  <div className="text-sm text-gray-400">10:00</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Bet Amount</div>
                <div className="text-lg font-bold text-secondary">
                  {game.game.betAmount} SOL
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="destructive" onClick={handleResign}>
                  Resign
                </Button>
              </div>
            </div>

            {/* Chess Board */}
            <ChessBoard gameId={game.game.id} playerColor={playerColor} />

            {/* Your Player Info */}
            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center space-x-4">
                <img 
                  src={user?.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"} 
                  alt="You" 
                  className="w-10 h-10 rounded-full" 
                />
                <div>
                  <div className="font-semibold">
                    {user?.username} ({user?.elo})
                  </div>
                  <div className="text-sm text-gray-400">10:00</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleOfferDraw}>
                  <i className="fas fa-handshake mr-2" />
                  Draw
                </Button>
                <Button variant="outline">
                  <i className="fas fa-flag mr-2" />
                  Flag
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <GameChat gameId={game.game.id} />
      </div>
    </div>
  );
}
