import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { ELO_RANGES } from "@/lib/constants";

interface SkillMismatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userElo: number;
  opponentElo: number;
}

function SkillMismatchModal({ isOpen, onClose, onConfirm, userElo, opponentElo }: SkillMismatchModalProps) {
  if (!isOpen) return null;

  const eloDifference = Math.abs(userElo - opponentElo);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4 bg-dark-700 border-dark-600 p-8 animate-slide-up">
        <div className="text-center mb-6">
          <i className="fas fa-exclamation-triangle text-4xl text-yellow-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Skill Level Mismatch</h2>
          <p className="text-gray-400">There's a significant ELO difference between you and your opponent</p>
        </div>
        
        <div className="bg-dark-600 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <div className="text-center">
              <div className="font-semibold">Your ELO</div>
              <div className="text-2xl font-bold text-secondary">{userElo}</div>
            </div>
            <div className="text-gray-400">vs</div>
            <div className="text-center">
              <div className="font-semibold">Opponent ELO</div>
              <div className="text-2xl font-bold text-red-400">{opponentElo}</div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-400">
            ELO difference: {eloDifference} points
          </div>
        </div>
        
        <p className="text-sm text-gray-400 mb-6 text-center">
          Playing against a {opponentElo > userElo ? 'significantly higher' : 'significantly lower'}-rated opponent may result in a challenging match. Are you sure you want to continue?
        </p>
        
        <div className="flex space-x-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={onConfirm}>
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function AvailableGames() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEloFilter, setSelectedEloFilter] = useState("all");
  const [skillMismatchModal, setSkillMismatchModal] = useState<{
    isOpen: boolean;
    gameId?: string;
    opponentElo?: number;
  }>({ isOpen: false });

  const { data: gamesData, isLoading } = useQuery({
    queryKey: ["/api/games"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const joinGameMutation = useMutation({
    mutationFn: async (gameId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const response = await apiRequest("POST", `/api/games/${gameId}/join`, {
        opponentId: user.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Game Joined",
        description: "Joining game...",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      setLocation(`/game/${data.game.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join game",
        variant: "destructive",
      });
    },
  });

  const handleJoinGame = (gameId: string, opponentElo: number) => {
    if (!user) return;

    const eloDifference = Math.abs(user.elo - opponentElo);
    
    // Show confirmation if ELO difference is significant (>300 points)
    if (eloDifference > 300) {
      setSkillMismatchModal({
        isOpen: true,
        gameId,
        opponentElo,
      });
    } else {
      joinGameMutation.mutate(gameId);
    }
  };

  const confirmJoinGame = () => {
    if (skillMismatchModal.gameId) {
      joinGameMutation.mutate(skillMismatchModal.gameId);
    }
    setSkillMismatchModal({ isOpen: false });
  };

  const getEloRangeForPlayer = (elo: number) => {
    for (const range of ELO_RANGES) {
      const [min, max] = range.range.split('-').map(r => parseInt(r.replace('+', '')) || 3000);
      if (elo >= min && (max === 3000 || elo <= max)) {
        return range;
      }
    }
    return ELO_RANGES[0]; // Default to beginner
  };

  const getEloColor = (elo: number) => {
    if (elo < 800) return "bg-gray-500";
    if (elo < 1200) return "bg-green-500";
    if (elo < 1600) return "bg-blue-500";
    if (elo < 2000) return "bg-orange-500";
    return "bg-red-500";
  };

  const filteredGames = gamesData?.games?.filter((gameData: any) => {
    if (selectedEloFilter === "all") return true;
    
    const creatorElo = gameData.creator?.elo || 0;
    const eloRange = getEloRangeForPlayer(creatorElo);
    return eloRange.value === selectedEloFilter;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <i className="fas fa-chess-board mr-3 text-primary" />
        Available Games
      </h2>

      {/* ELO Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={selectedEloFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedEloFilter("all")}
          className={selectedEloFilter === "all" ? "bg-primary" : "bg-dark-700 hover:bg-dark-600"}
        >
          All
        </Button>
        {ELO_RANGES.map((range) => (
          <Button
            key={range.value}
            variant={selectedEloFilter === range.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedEloFilter(range.value)}
            className={selectedEloFilter === range.value ? "bg-primary" : "bg-dark-700 hover:bg-dark-600"}
          >
            {range.label}
          </Button>
        ))}
      </div>

      {/* Games List */}
      <div className="space-y-4">
        {filteredGames.length === 0 ? (
          <Card className="bg-dark-700 border-dark-600 p-8 text-center">
            <i className="fas fa-chess text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Games Available</h3>
            <p className="text-gray-400">Be the first to create a game!</p>
          </Card>
        ) : (
          filteredGames.map((gameData: any) => {
            const game = gameData.game;
            const creator = gameData.creator;
            const isOwnGame = user?.id === creator?.id;

            return (
              <Card
                key={game.id}
                className="bg-dark-700 border-dark-600 p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={creator?.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"}
                      alt="Player avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{creator?.username}</span>
                        <span className={`text-sm text-white px-2 py-1 rounded ${getEloColor(creator?.elo)}`}>
                          {creator?.elo}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        <span>{game.timeControl}</span> • 
                        <span className="ml-1">{game.betAmount} SOL</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Waiting for opponent</div>
                      <div className="text-xs text-green-400">🟢 Online</div>
                    </div>
                    <Button
                      onClick={() => handleJoinGame(game.id, creator?.elo)}
                      disabled={isOwnGame || joinGameMutation.isPending}
                      className="bg-primary hover:bg-blue-600"
                    >
                      {isOwnGame ? "Your Game" : "Join"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <SkillMismatchModal
        isOpen={skillMismatchModal.isOpen}
        onClose={() => setSkillMismatchModal({ isOpen: false })}
        onConfirm={confirmJoinGame}
        userElo={user?.elo || 1200}
        opponentElo={skillMismatchModal.opponentElo || 1200}
      />
    </div>
  );
}
