import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

export default function Leaderboard() {
  // Get leaderboard data
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['/api/leaderboard']
  });

  const { data: topEarners } = useQuery({
    queryKey: ['/api/leaderboard/earnings']
  });

  const { data: topPlayers } = useQuery({
    queryKey: ['/api/leaderboard/players']
  });

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboards</h1>
          <p className="text-gray-400">Top players and highest earners</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Players by ELO */}
          <Card className="bg-dark-700 border-dark-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <i className="fas fa-trophy text-yellow-400" />
                Top Players by ELO
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-dark-600 rounded-lg animate-pulse">
                      <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-600 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-600 rounded w-16"></div>
                      </div>
                      <div className="h-4 bg-gray-600 rounded w-12"></div>
                    </div>
                  ))}
                </div>
              ) : leaderboardData?.players?.length > 0 ? (
                <div className="space-y-3">
                  {leaderboardData.players.map((player: any, index: number) => (
                    <div key={player.id} className="flex items-center gap-3 p-3 bg-dark-600 rounded-lg hover:bg-dark-500 transition-colors">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{player.username}</div>
                        <div className="text-gray-400 text-sm">
                          {player.gamesPlayed} games played • {player.winRate}% win rate
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{player.elo}</div>
                        <div className="text-gray-400 text-sm">ELO</div>
                      </div>
                      {index < 3 && (
                        <i className={`fas fa-medal ${
                          index === 0 ? 'text-yellow-400' : 
                          index === 1 ? 'text-gray-300' : 
                          'text-amber-600'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-chess text-gray-600 text-4xl mb-4" />
                  <p className="text-gray-400">No players yet</p>
                  <p className="text-gray-500 text-sm">Start playing to appear on the leaderboard</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Earners */}
          <Card className="bg-dark-700 border-dark-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <i className="fas fa-coins text-green-400" />
                Top Earners
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-dark-600 rounded-lg animate-pulse">
                      <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-600 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-600 rounded w-16"></div>
                      </div>
                      <div className="h-4 bg-gray-600 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : topEarners?.players?.length > 0 ? (
                <div className="space-y-3">
                  {topEarners.players.map((player: any, index: number) => (
                    <div key={player.id} className="flex items-center gap-3 p-3 bg-dark-600 rounded-lg hover:bg-dark-500 transition-colors">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{player.username}</div>
                        <div className="text-gray-400 text-sm">
                          {player.totalWinnings > 0 ? `${player.winStreak} win streak` : 'No wins yet'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">{player.totalWinnings} SOL</div>
                        <div className="text-gray-400 text-sm">earned</div>
                      </div>
                      {index < 3 && (
                        <i className={`fas fa-trophy ${
                          index === 0 ? 'text-yellow-400' : 
                          index === 1 ? 'text-gray-300' : 
                          'text-amber-600'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-chart-line text-gray-600 text-4xl mb-4" />
                  <p className="text-gray-400">No earnings yet</p>
                  <p className="text-gray-500 text-sm">Play games to start earning SOL</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-dark-700 border-dark-600">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {leaderboardData?.stats?.totalPlayers || 0}
              </div>
              <div className="text-gray-400 text-sm">Total Players</div>
            </CardContent>
          </Card>

          <Card className="bg-dark-700 border-dark-600">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {leaderboardData?.stats?.totalGames || 0}
              </div>
              <div className="text-gray-400 text-sm">Games Played</div>
            </CardContent>
          </Card>

          <Card className="bg-dark-700 border-dark-600">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {leaderboardData?.stats?.totalPrizePool || '0.00'} SOL
              </div>
              <div className="text-gray-400 text-sm">Total Prize Pool</div>
            </CardContent>
          </Card>

          <Card className="bg-dark-700 border-dark-600">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {leaderboardData?.stats?.activeTournaments || 0}
              </div>
              <div className="text-gray-400 text-sm">Active Tournaments</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tournament Winners */}
        <Card className="bg-dark-700 border-dark-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <i className="fas fa-crown text-purple-400" />
              Recent Tournament Winners
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboardData?.recentWinners?.length > 0 ? (
              <div className="space-y-3">
                {leaderboardData.recentWinners.map((winner: any) => (
                  <div key={winner.id} className="flex items-center justify-between p-4 bg-dark-600 rounded-lg">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-trophy text-yellow-400" />
                      <div>
                        <div className="text-white font-medium">{winner.username}</div>
                        <div className="text-gray-400 text-sm">{winner.tournamentName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">{winner.prizeAmount} SOL</div>
                      <div className="text-gray-400 text-sm">{new Date(winner.completedAt).toLocaleDateString()}</div>
                    </div>
                    <Badge variant="outline" className="border-purple-400 text-purple-400">
                      Tournament Winner
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-trophy text-gray-600 text-4xl mb-4" />
                <p className="text-gray-400">No tournament winners yet</p>
                <p className="text-gray-500 text-sm">Join a tournament to compete for prizes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}