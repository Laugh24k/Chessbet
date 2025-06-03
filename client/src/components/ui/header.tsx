import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { SettingsModal } from "@/components/ui/settings-modal";
import { usePrivy } from '@privy-io/react-auth';
import { useToast } from "@/hooks/use-toast";

interface DevModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function DevModeModal({ isOpen, onClose, onSuccess }: DevModeModalProps) {
  const [code, setCode] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === "081809") {
      onSuccess();
      setCode("");
      toast({
        title: "Developer Mode Activated",
        description: "Bot testing enabled.",
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter the correct access code.",
        variant: "destructive",
      });
      setCode("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-700 border border-dark-600 rounded-lg p-8 max-w-md w-full mx-4 animate-slide-up">
        <div className="text-center mb-6">
          <i className="fas fa-code text-4xl text-yellow-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Developer Mode</h2>
          <p className="text-gray-400">Enter the secret code to access developer features</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Access Code</label>
            <input
              type="password"
              placeholder="Enter secret code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-dark-600 border border-dark-500 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-center tracking-widest"
              autoComplete="off"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              Access
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Header() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { logout } = usePrivy();
  const { toast } = useToast();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDevMode, setShowDevMode] = useState(false);
  const [devModeActive, setDevModeActive] = useState(false);

  const handleDisconnect = async () => {
    try {
      await logout();
      toast({
        title: "Disconnected",
        description: "You have been successfully disconnected.",
      });
      setShowUserMenu(false);
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to disconnect properly.",
        variant: "destructive",
      });
    }
  };

  const handleDevModeAccess = () => {
    setDevModeActive(true);
    setShowDevMode(false);
    setShowSettings(false);
  };

  return (
    <>
      <header className="bg-dark-800 border-b border-dark-600 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <i className="fas fa-chess-knight text-2xl text-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ChessWager
                </span>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-white hover:text-primary transition-colors">
                  Games
                </Link>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  Leaderboard
                </a>
                <Link href="/tournaments" className="text-gray-400 hover:text-primary transition-colors">
                  Tournaments
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Balance Display */}
              {user && (
                <div className="hidden sm:flex items-center space-x-2 bg-dark-700 px-4 py-2 rounded-lg">
                  <i className="fab fa-solana text-secondary" />
                  <span className="font-medium">
                    {parseFloat(user.balance || "0").toFixed(2)} SOL
                  </span>
                </div>
              )}
              
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <i className="fas fa-bell text-lg" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Button>
              
              {/* User Menu */}
              {user && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 bg-dark-700 hover:bg-dark-600"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <img
                      src={user.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face"}
                      alt="User avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium">{user.username}</span>
                    <i className="fas fa-chevron-down text-sm" />
                  </Button>
                  
                  {/* Dropdown menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-dark-700 border border-dark-600 rounded-lg shadow-xl z-50">
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 hover:bg-dark-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <i className="fas fa-user mr-3 text-gray-400" />
                          Profile
                        </Link>
                        <button
                          className="flex items-center w-full px-4 py-2 hover:bg-dark-600 transition-colors"
                          onClick={() => {
                            setShowSettings(true);
                            setShowUserMenu(false);
                          }}
                        >
                          <i className="fas fa-cog mr-3 text-gray-400" />
                          Settings
                        </button>
                        <Link
                          href="/checkout"
                          className="flex items-center px-4 py-2 hover:bg-dark-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <i className="fas fa-wallet mr-3 text-gray-400" />
                          Deposit
                        </Link>
                        <hr className="border-dark-600 my-2" />
                        <button
                          className="flex items-center w-full px-4 py-2 hover:bg-dark-600 transition-colors text-red-400"
                          onClick={handleDisconnect}
                        >
                          <i className="fas fa-sign-out-alt mr-3" />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onOpenDevMode={() => setShowDevMode(true)}
        devModeActive={devModeActive}
      />
      
      <DevModeModal
        isOpen={showDevMode}
        onClose={() => setShowDevMode(false)}
        onSuccess={handleDevModeAccess}
      />
    </>
  );
}
