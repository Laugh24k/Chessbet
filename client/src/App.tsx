import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PrivyWrapper } from "@/hooks/use-auth";
import { queryClient } from "./lib/queryClient";
import Home from "@/pages/home";
import Game from "@/pages/game";
import ProfileSetup from "@/pages/profile-setup";
import Terms from "@/pages/terms";
import Checkout from "@/pages/checkout";
import Tournaments from "@/pages/tournaments";
import Wallet from "@/pages/wallet";
import Leaderboard from "@/pages/leaderboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/game/:id" component={Game} />
      <Route path="/profile-setup" component={ProfileSetup} />
      <Route path="/terms" component={Terms} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/tournaments" component={Tournaments} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivyWrapper>
        <TooltipProvider>
          <div className="min-h-screen bg-dark-900 text-white">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </PrivyWrapper>
    </QueryClientProvider>
  );
}

export default App;
