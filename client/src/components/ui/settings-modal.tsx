import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

const profileUpdateSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email().optional(),
});

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDevMode: () => void;
  devModeActive: boolean;
}

export function SettingsModal({ isOpen, onClose, onOpenDevMode, devModeActive }: SettingsModalProps) {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateForm) => {
      if (!user?.id) throw new Error("User not found");
      
      const response = await apiRequest("PUT", `/api/auth/user/${user.id}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileUpdateForm) => {
    updateProfileMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-700 border border-dark-600 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="flex">
          {/* Settings Sidebar */}
          <div className="w-64 bg-dark-800 border-r border-dark-600 p-6">
            <h2 className="text-xl font-bold mb-6">Settings</h2>
            <nav className="space-y-2">
              <button
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "profile" ? "bg-primary text-white" : "hover:bg-dark-600"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "account" ? "bg-primary text-white" : "hover:bg-dark-600"
                }`}
                onClick={() => setActiveTab("account")}
              >
                Account
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "payments" ? "bg-primary text-white" : "hover:bg-dark-600"
                }`}
                onClick={() => setActiveTab("payments")}
              >
                Payments
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "notifications" ? "bg-primary text-white" : "hover:bg-dark-600"
                }`}
                onClick={() => setActiveTab("notifications")}
              >
                Notifications
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "privacy" ? "bg-primary text-white" : "hover:bg-dark-600"
                }`}
                onClick={() => setActiveTab("privacy")}
              >
                Privacy
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "game" ? "bg-primary text-white" : "hover:bg-dark-600"
                }`}
                onClick={() => setActiveTab("game")}
              >
                Game Settings
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors text-yellow-400 ${
                  devModeActive ? "bg-yellow-400/20" : "hover:bg-dark-600"
                }`}
                onClick={onOpenDevMode}
              >
                {devModeActive ? "✓ Dev Mode" : "Dev Mode"}
              </button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">
                {activeTab === "profile" && "Profile Settings"}
                {activeTab === "account" && "Account Settings"}
                {activeTab === "payments" && "Payment Methods"}
                {activeTab === "notifications" && "Notification Preferences"}
                {activeTab === "privacy" && "Privacy Settings"}
                {activeTab === "game" && "Game Settings"}
              </h3>
              <button
                className="text-gray-400 hover:text-white text-xl"
                onClick={onClose}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        {...form.register("username")}
                        className="bg-dark-600 border-dark-500"
                      />
                      {form.formState.errors.username && (
                        <p className="text-sm text-red-400 mt-1">
                          {form.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register("email")}
                        className="bg-dark-600 border-dark-500"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-400 mt-1">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Current ELO */}
                  <div>
                    <Label>Current ELO</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-2xl font-bold text-secondary">{user?.elo}</span>
                      <span className="text-sm text-gray-400">
                        {user?.elo && user.elo < 800 && "Beginner Level"}
                        {user?.elo && user.elo >= 800 && user.elo < 1200 && "Novice Level"}
                        {user?.elo && user.elo >= 1200 && user.elo < 1600 && "Intermediate Level"}
                        {user?.elo && user.elo >= 1600 && user.elo < 2000 && "Advanced Level"}
                        {user?.elo && user.elo >= 2000 && "Expert Level"}
                      </span>
                    </div>
                  </div>

                  {/* Linked Accounts */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Linked Accounts</h4>
                    <div className="space-y-3">
                      <Card className="bg-dark-600 border-dark-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <i className="fab fa-google text-xl" />
                              <div>
                                <div className="font-medium">Google Account</div>
                                <div className="text-sm text-gray-400">{user?.email}</div>
                              </div>
                            </div>
                            <span className="text-green-400">Connected</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {user?.chessComUsername ? (
                        <Card className="bg-dark-600 border-dark-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <i className="fas fa-chess-knight text-xl text-green-400" />
                                <div>
                                  <div className="font-medium">Chess.com</div>
                                  <div className="text-sm text-gray-400">
                                    {user.chessComUsername} - ELO: {user.chessComElo}
                                  </div>
                                </div>
                              </div>
                              <span className="text-green-400">Connected</span>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="bg-dark-600 border-dark-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <i className="fas fa-chess-knight text-xl text-gray-400" />
                                <div>
                                  <div className="font-medium">Chess.com</div>
                                  <div className="text-sm text-gray-400">Not connected</div>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                Connect
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-primary to-secondary hover:from-blue-600 hover:to-purple-600"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* Account Settings */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <Card className="bg-dark-600 border-dark-500">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold mb-4">Account Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Account Created</div>
                        <div>{new Date(user?.createdAt || "").toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Last Updated</div>
                        <div>{new Date(user?.updatedAt || "").toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Games Played</div>
                        <div>{user?.gamesPlayed}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Win Rate</div>
                        <div>
                          {user?.gamesPlayed && user.gamesPlayed > 0
                            ? Math.round((user.gamesWon / user.gamesPlayed) * 100)
                            : 0}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Payment Methods */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Payment Methods</h4>
                  <div className="space-y-3">
                    {user?.walletAddress && (
                      <Card className="bg-dark-600 border-dark-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <i className="fab fa-solana text-xl text-secondary" />
                              <div>
                                <div className="font-medium">Solana Wallet</div>
                                <div className="text-sm text-gray-400">
                                  {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                                </div>
                              </div>
                            </div>
                            <span className="text-green-400">Connected</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    <Card className="bg-dark-600 border-dark-500 border-dashed">
                      <CardContent className="p-4">
                        <Button variant="ghost" className="w-full">
                          <i className="fas fa-plus mr-2" />
                          Add Payment Method
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Balance & Transactions</h4>
                  <Card className="bg-dark-600 border-dark-500">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-secondary mb-2">
                          {parseFloat(user?.balance || "0").toFixed(4)} SOL
                        </div>
                        <div className="text-gray-400 mb-4">Current Balance</div>
                        <div className="flex space-x-4">
                          <Button className="flex-1 bg-green-600 hover:bg-green-700">
                            Deposit
                          </Button>
                          <Button variant="outline" className="flex-1">
                            Withdraw
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Other tabs content can be added here */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <p className="text-gray-400">Notification preferences coming soon...</p>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6">
                <p className="text-gray-400">Privacy settings coming soon...</p>
              </div>
            )}

            {activeTab === "game" && (
              <div className="space-y-6">
                <p className="text-gray-400">Game settings coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
