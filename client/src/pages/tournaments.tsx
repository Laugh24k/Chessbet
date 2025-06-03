import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Clock, DollarSign, Plus } from "lucide-react";
import { CreateTournament } from "@/components/tournament/create-tournament";
import { TournamentDetails } from "@/components/tournament/tournament-details";
import { useState } from "react";

export default function Tournaments() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [showCreateTournament, setShowCreateTournament] = useState(false);

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ["/api/tournaments"],
    enabled: true,
  });

  const joinTournamentMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      const response = await fetch(`/api/tournaments/${tournamentId}/join`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to join tournament");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully joined tournament!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleJoinTournament = (tournamentId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join tournaments",
        variant: "destructive",
      });
      return;
    }
    joinTournamentMutation.mutate(tournamentId);
  };

  if (selectedTournament) {
    return (
      <TournamentDetails
        tournamentId={selectedTournament}
        onBack={() => setSelectedTournament(null)}
      />
    );
  }

  if (showCreateTournament) {
    return (
      <CreateTournament
        onClose={() => setShowCreateTournament(false)}
        onSuccess={() => {
          setShowCreateTournament(false);
          queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
        }}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Chess Tournaments</h1>
          <p className="text-muted-foreground">
            Join winner-takes-all tournaments with SOL prizes
          </p>
        </div>
        {isAuthenticated && (
          <Button onClick={() => setShowCreateTournament(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Tournament
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tournaments?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Tournaments Available</h3>
            <p className="text-muted-foreground text-center mb-4">
              Be the first to create a tournament and start competing!
            </p>
            {isAuthenticated && (
              <Button onClick={() => setShowCreateTournament(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Tournament
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments?.map((tournament: any) => (
            <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{tournament.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {tournament.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {tournament.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span>Entry: {tournament.entryFee} SOL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    <span>Prize: {tournament.prizePool} SOL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>
                      {tournament.currentParticipants}/{tournament.maxParticipants}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>{tournament.timeControl}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTournament(tournament.id)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  {isAuthenticated && tournament.status === "open" && (
                    <Button
                      size="sm"
                      onClick={() => handleJoinTournament(tournament.id)}
                      disabled={joinTournamentMutation.isPending}
                      className="flex-1"
                    >
                      {joinTournamentMutation.isPending ? "Joining..." : "Join"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}