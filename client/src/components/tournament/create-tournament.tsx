import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { insertTournamentSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

const createTournamentSchema = insertTournamentSchema.extend({
  entryFee: z.string().min(1, "Entry fee is required"),
  maxParticipants: z.string().min(1, "Max participants is required"),
});

type CreateTournamentForm = z.infer<typeof createTournamentSchema>;

interface CreateTournamentProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTournament({ onClose, onSuccess }: CreateTournamentProps) {
  const { toast } = useToast();

  const form = useForm<CreateTournamentForm>({
    resolver: zodResolver(createTournamentSchema),
    defaultValues: {
      name: "",
      description: "",
      entryFee: "",
      maxParticipants: "",
      timeControl: "5+0",
    },
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (data: CreateTournamentForm) => {
      return apiRequest("POST", "/api/tournaments", {
        ...data,
        entryFee: parseFloat(data.entryFee).toString(),
        maxParticipants: parseInt(data.maxParticipants),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tournament created successfully!",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tournament",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateTournamentForm) => {
    createTournamentMutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={onClose} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tournaments
        </Button>
        <h1 className="text-3xl font-bold">Create Tournament</h1>
        <p className="text-muted-foreground">
          Set up a new winner-takes-all chess tournament
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tournament Details</CardTitle>
          <CardDescription>
            Configure your tournament settings. All entry fees go to the winner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tournament Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Friday Night Blitz Championship" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A competitive blitz tournament for all skill levels..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe what makes your tournament special
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="entryFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entry Fee (SOL)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.1"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Winner takes all entry fees
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Participants</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="2"
                          max="64"
                          placeholder="16"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        2-64 players allowed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="timeControl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Control</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time control" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1+0">Bullet (1+0)</SelectItem>
                        <SelectItem value="2+1">Bullet (2+1)</SelectItem>
                        <SelectItem value="3+0">Blitz (3+0)</SelectItem>
                        <SelectItem value="3+2">Blitz (3+2)</SelectItem>
                        <SelectItem value="5+0">Blitz (5+0)</SelectItem>
                        <SelectItem value="5+3">Blitz (5+3)</SelectItem>
                        <SelectItem value="10+0">Rapid (10+0)</SelectItem>
                        <SelectItem value="15+10">Rapid (15+10)</SelectItem>
                        <SelectItem value="30+0">Classical (30+0)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Time format: minutes + increment seconds
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTournamentMutation.isPending}
                  className="flex-1"
                >
                  {createTournamentMutation.isPending ? "Creating..." : "Create Tournament"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}