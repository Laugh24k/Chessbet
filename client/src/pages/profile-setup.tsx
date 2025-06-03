import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

const profileSetupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters"),
  profilePicture: z.string().url().optional(),
  elo: z.number().min(0).max(3000),
  chessComUsername: z.string().optional(),
});

type ProfileSetupForm = z.infer<typeof profileSetupSchema>;

const ELO_RANGES = [
  { label: "Beginner", range: "0-800", value: 600 },
  { label: "Novice", range: "800-1200", value: 1000 },
  { label: "Intermediate", range: "1200-1600", value: 1400 },
  { label: "Advanced", range: "1600-2000", value: 1800 },
  { label: "Expert", range: "2000+", value: 2200 },
];

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [selectedElo, setSelectedElo] = useState<number>(1200);
  const [chessComData, setChessComData] = useState<any>(null);
  const [isLinkingChessCom, setIsLinkingChessCom] = useState(false);
  const [chessComUsername, setChessComUsername] = useState("");
  const [showChessComHelp, setShowChessComHelp] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const form = useForm<ProfileSetupForm>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      username: "",
      elo: selectedElo,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileSetupForm) => {
      if (!user?.id) throw new Error("User not found");
      
      const response = await apiRequest("PUT", `/api/auth/user/${user.id}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully set up!",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const linkChessComMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest("GET", `/api/chess-com/${username}`);
      return response.json();
    },
    onSuccess: (data) => {
      setChessComData(data);
      form.setValue("chessComUsername", data.username);
      
      // Use the highest rating available
      const bestRating = Math.max(
        data.ratings.rapid || 0,
        data.ratings.blitz || 0,
        data.ratings.bullet || 0
      );
      
      if (bestRating > 0) {
        setSelectedElo(bestRating);
        form.setValue("elo", bestRating);
      }
      
      setIsLinkingChessCom(false);
      toast({
        title: "Chess.com Account Linked",
        description: `Successfully linked to ${data.username}`,
      });
    },
    onError: (error: any) => {
      setIsLinkingChessCom(false);
      toast({
        title: "Error",
        description: "Chess.com username not found",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileSetupForm) => {
    updateProfileMutation.mutate({
      ...data,
      elo: selectedElo,
    });
  };

  const handleChessComLink = () => {
    if (chessComUsername.trim()) {
      setIsLinkingChessCom(true);
      linkChessComMutation.mutate(chessComUsername.trim());
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-dark-700 border-dark-600">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <i className="fas fa-chess-knight text-4xl text-primary" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <p className="text-gray-400">Set up your chess profile to get started</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture */}
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&fit=crop&crop=face"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-image-upload"
                />
                <label htmlFor="profile-image-upload">
                  <Button
                    type="button"
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full p-2 bg-blue-600 hover:bg-blue-700"
                    asChild
                  >
                    <span className="cursor-pointer">
                      <i className="fas fa-camera text-sm" />
                    </span>
                  </Button>
                </label>
              </div>
              <p className="text-sm text-gray-400">Click camera icon to upload profile picture</p>
            </div>

            {/* Username */}
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...form.register("username")}
                placeholder="Choose a unique username"
                className="bg-dark-600 border-dark-500"
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-400 mt-1">
                  {form.formState.errors.username.message}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">Must be unique across the platform</p>
            </div>

            {/* ELO Selection */}
            <div>
              <Label>Select Your Chess Level</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {ELO_RANGES.map((range) => (
                  <Button
                    key={range.value}
                    type="button"
                    variant={selectedElo === range.value ? "default" : "outline"}
                    className={`p-3 text-left ${
                      selectedElo === range.value
                        ? "bg-primary border-primary"
                        : "bg-dark-600 border-dark-500 hover:border-primary"
                    }`}
                    onClick={() => {
                      setSelectedElo(range.value);
                      form.setValue("elo", range.value);
                    }}
                  >
                    <div>
                      <div className="font-semibold">{range.label}</div>
                      <div className="text-sm text-gray-400">{range.range}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Chess.com Integration */}
            <div className="bg-dark-600 border border-dark-500 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-medium">Chess.com Username</span>
                <button
                  type="button"
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowChessComHelp(!showChessComHelp)}
                >
                  <i className="fas fa-question-circle" />
                </button>
              </div>
              
              {showChessComHelp && (
                <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-3 mb-3">
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-2">How to find your Chess.com username:</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-200">
                      <li>Go to Chess.com and log in to your account</li>
                      <li>Click on your profile picture or username</li>
                      <li>Your username is displayed at the top of your profile</li>
                      <li>Enter it exactly as shown (case sensitive)</li>
                    </ol>
                  </div>
                </div>
              )}

              {chessComData ? (
                <div className="bg-green-600/20 border border-green-600 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-green-400">
                        {chessComData.username}
                      </div>
                      <div className="text-sm text-gray-400">
                        Best Rating: {Math.max(
                          chessComData.ratings.rapid || 0,
                          chessComData.ratings.blitz || 0,
                          chessComData.ratings.bullet || 0
                        )}
                      </div>
                    </div>
                    <i className="fas fa-check-circle text-green-400" />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter your Chess.com username"
                      value={chessComUsername}
                      onChange={(e) => setChessComUsername(e.target.value)}
                      className="flex-1 bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button
                      type="button"
                      onClick={handleChessComLink}
                      disabled={isLinkingChessCom || !chessComUsername.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLinkingChessCom ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400">
                    We'll import your ratings to help match you with players of similar skill
                  </p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-blue-600 hover:to-purple-600"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Setting up...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
