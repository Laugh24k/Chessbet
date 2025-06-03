import { Header } from "@/components/ui/header";
import { GameLobby } from "@/components/game/game-lobby";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/auth/auth-modal";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Chess Betting on Solana
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Challenge players worldwide in skill-based chess matches with real SOL stakes
          </p>
        </div>

        <GameLobby />

        {/* Stats Section */}
        {user && (
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-dark-700 border border-dark-600 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{user.gamesPlayed}</div>
              <div className="text-gray-400">Games Played</div>
            </div>
            <div className="bg-dark-700 border border-dark-600 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0}%
              </div>
              <div className="text-gray-400">Win Rate</div>
            </div>
            <div className="bg-dark-700 border border-dark-600 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-secondary mb-2">{user.elo}</div>
              <div className="text-gray-400">Current ELO</div>
            </div>
            <div className="bg-dark-700 border border-dark-600 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                +{parseFloat(user.totalEarnings || "0").toFixed(1)}
              </div>
              <div className="text-gray-400">Total Earnings (SOL)</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
