import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeControlSelector } from "@/components/ui/time-control-selector";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { ELO_RANGES } from "@/lib/constants";

const createGameSchema = z.object({
  betAmount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Bet amount must be a positive number"),
  timeControl: z.string().min(1, "Please select a time control"),
  eloRange: z.string().optional(),
});

type CreateGameForm = z.infer<typeof createGameSchema>;

export function CreateGame() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTimeControl, setSelectedTimeControl] = useState("5+3");

  const form = useForm<CreateGameForm>({
    resolver: zodResolver(createGameSchema),
    defaultValues: {
      betAmount: "0.1",
      timeControl: "5+3",
      eloRange: "all",
    },
  });

  const createGameMutation = useMutation({
    mutationFn: async (data: CreateGameForm) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const response = await apiRequest("POST", "/api/games", {
        creatorId: user.id,
        betAmount: data.betAmount,
        timeControl: data.timeControl,
        status: "waiting",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Game Created",
        description: "Your game has been created and is waiting for an opponent!",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create game",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateGameForm) => {
    // Check if user has sufficient balance
    const betAmount = parseFloat(data.betAmount);
    const userBalance = parseFloat(user?.balance || "0");
    
    if (betAmount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough SOL to create this game. Please deposit more funds.",
        variant: "destructive",
      });
      return;
    }

    createGameMutation.mutate({
      ...data,
      timeControl: selectedTimeControl,
    });
  };

  return (
    <div className="gradient-border">
      <Card className="bg-dark-700 border-none">
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-plus-circle mr-3 text-primary" />
            Create Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Bet Amount */}
            <div>
              <Label htmlFor="betAmount">Bet Amount (SOL)</Label>
              <div className="relative">
                <i className="fab fa-solana absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" />
                <Input
                  id="betAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.1"
                  className="bg-dark-600 border-dark-500 pl-10"
                  {...form.register("betAmount")}
                />
              </div>
              {form.formState.errors.betAmount && (
                <p className="text-sm text-red-400 mt-1">
                  {form.formState.errors.betAmount.message}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Available: {parseFloat(user?.balance || "0").toFixed(2)} SOL
              </p>
            </div>

            {/* Time Control */}
            <div>
              <Label>Time Control</Label>
              <TimeControlSelector
                value={selectedTimeControl}
                onValueChange={setSelectedTimeControl}
              />
            </div>

            {/* ELO Range */}
            <div>
              <Label htmlFor="eloRange">ELO Range</Label>
              <Select defaultValue="all" onValueChange={(value) => form.setValue("eloRange", value)}>
                <SelectTrigger className="bg-dark-600 border-dark-500">
                  <SelectValue placeholder="Select ELO range" />
                </SelectTrigger>
                <SelectContent className="bg-dark-600 border-dark-500">
                  <SelectItem value="all">All Players</SelectItem>
                  {ELO_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label} ({range.range})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-blue-600 hover:to-purple-600"
              disabled={createGameMutation.isPending}
            >
              {createGameMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Creating...
                </>
              ) : (
                "Create Game"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
