import { usePrivy } from '@privy-io/react-auth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function AuthModal() {
  const { login } = usePrivy();
  const { toast } = useToast();

  const handleLogin = (method: 'google' | 'email' | 'wallet') => {
    try {
      login({
        loginMethod: method,
      });
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to authenticate",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4 bg-dark-700 border-dark-600 animate-slide-up">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <i className="fas fa-chess-knight text-4xl text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to ChessWager</CardTitle>
          <p className="text-gray-400">Connect your account to start playing</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              className="w-full bg-white text-black hover:bg-gray-100"
              onClick={() => handleLogin('google')}
            >
              <i className="fab fa-google mr-3" />
              Continue with Google
            </Button>
            <Button
              variant="outline"
              className="w-full bg-dark-600 hover:bg-dark-500 border-dark-500"
              onClick={() => handleLogin('email')}
            >
              <i className="fas fa-envelope mr-3" />
              Continue with Email
            </Button>
            <Button
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-blue-600 hover:to-purple-600"
              onClick={() => handleLogin('wallet')}
            >
              <i className="fas fa-wallet mr-3" />
              Connect Wallet
            </Button>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
