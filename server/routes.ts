import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import { storage } from "./storage";
import { db } from "./db";
import { insertUserSchema, insertGameSchema, insertDepositSchema, insertWithdrawalSchema, insertChatMessageSchema, insertTournamentSchema, insertTournamentParticipantSchema, users, games, tournaments } from "@shared/schema";
import { z } from "zod";
import { eq, ne, desc, sql, and } from "drizzle-orm";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not found, Stripe functionality will be disabled');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
}) : null;

interface WebSocketClient extends WebSocket {
  userId?: number;
  gameId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<number, WebSocketClient>();

  wss.on('connection', (ws: WebSocketClient, req) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'auth':
            ws.userId = message.userId;
            clients.set(message.userId, ws);
            break;
            
          case 'join_game':
            ws.gameId = message.gameId;
            break;
            
          case 'chat_message':
            if (ws.userId && ws.gameId) {
              const chatMessage = await storage.createChatMessage({
                gameId: ws.gameId,
                userId: ws.userId,
                message: message.content,
              });
              
              // Broadcast to all clients in the same game
              const fullMessage = await storage.getChatMessages(ws.gameId);
              const latestMessage = fullMessage[fullMessage.length - 1];
              
              wss.clients.forEach((client: WebSocketClient) => {
                if (client.gameId === ws.gameId && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'chat_message',
                    data: latestMessage,
                  }));
                }
              });
            }
            break;
            
          case 'game_move':
            if (ws.gameId) {
              // Broadcast move to opponent
              wss.clients.forEach((client: WebSocketClient) => {
                if (client.gameId === ws.gameId && client.userId !== ws.userId && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'game_move',
                    data: message.move,
                  }));
                }
              });
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        clients.delete(ws.userId);
      }
    });
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists by Privy ID first
      if (userData.privyId) {
        const existingPrivyUser = await storage.getUserByPrivyId(userData.privyId);
        if (existingPrivyUser) {
          return res.json({ user: existingPrivyUser });
        }
      }
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Check if email is already registered (only if email is provided)
      if (userData.email) {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already registered" });
        }
      }
      
      const user = await storage.createUser(userData);
      res.json({ user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auth/user/:privyId", async (req, res) => {
    try {
      const user = await storage.getUserByPrivyId(req.params.privyId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/auth/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      const user = await storage.updateUser(userId, updates);
      res.json({ user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Game routes
  app.post("/api/games", async (req, res) => {
    try {
      const gameData = insertGameSchema.parse(req.body);
      const game = await storage.createGame(gameData);
      res.json({ game });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getAvailableGames();
      res.json({ games });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    try {
      const game = await storage.getGameWithPlayers(req.params.id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json({ game });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/games/:id/join", async (req, res) => {
    try {
      const { opponentId } = req.body;
      const game = await storage.joinGame(req.params.id, opponentId);
      res.json({ game });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/games/:id", async (req, res) => {
    try {
      const updates = req.body;
      const game = await storage.updateGame(req.params.id, updates);
      res.json({ game });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/games/:id/chat", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.id);
      res.json({ messages });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User game history
  app.get("/api/users/:id/games", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const games = await storage.getGamesByUser(userId);
      res.json({ games });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Deposit routes
  app.post("/api/deposits", async (req, res) => {
    try {
      const depositData = insertDepositSchema.parse(req.body);
      const deposit = await storage.createDeposit(depositData);
      res.json({ deposit });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/deposits", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const deposits = await storage.getDepositsByUser(userId);
      res.json({ deposits });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Withdrawal routes
  app.post("/api/withdrawals", async (req, res) => {
    try {
      const withdrawalData = insertWithdrawalSchema.parse(req.body);
      const withdrawal = await storage.createWithdrawal(withdrawalData);
      
      // TODO: Implement actual Solana withdrawal logic
      // For now, mark as completed immediately (this should be handled by a background job)
      setTimeout(async () => {
        await storage.updateWithdrawal(withdrawal.id, {
          status: "completed",
          transactionHash: "mock_tx_" + Date.now(),
        });
      }, 1000);
      
      res.json({ withdrawal });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/withdrawals", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const withdrawals = await storage.getWithdrawalsByUser(userId);
      res.json({ withdrawals });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe payment routes (only if Stripe is configured)
  if (stripe) {
    app.post("/api/create-payment-intent", async (req, res) => {
      try {
        const { amount } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        res.status(500).json({ message: "Error creating payment intent: " + error.message });
      }
    });
  }

  // Chess.com integration route
  app.get("/api/chess-com/:username", async (req, res) => {
    try {
      const { username } = req.params;
      
      // Fetch chess.com profile
      const profileResponse = await fetch(`https://api.chess.com/pub/player/${username}`);
      if (!profileResponse.ok) {
        return res.status(404).json({ message: "Chess.com user not found" });
      }
      
      // Fetch chess.com stats
      const statsResponse = await fetch(`https://api.chess.com/pub/player/${username}/stats`);
      if (!statsResponse.ok) {
        return res.status(404).json({ message: "Chess.com stats not found" });
      }
      
      const profile = await profileResponse.json();
      const stats = await statsResponse.json();
      
      // Extract relevant ELO ratings
      const ratings = {
        rapid: stats.chess_rapid?.last?.rating || null,
        blitz: stats.chess_blitz?.last?.rating || null,
        bullet: stats.chess_bullet?.last?.rating || null,
      };
      
      res.json({
        username: profile.username,
        profileUrl: profile.url,
        ratings,
        verified: profile.verified,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching Chess.com data: " + error.message });
    }
  });

  // Balance update route
  app.put("/api/users/:id/balance", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { balance } = req.body;
      const user = await storage.updateUserBalance(userId, balance);
      res.json({ user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Tournament routes
  app.get("/api/tournaments", async (req, res) => {
    try {
      const tournaments = await storage.getAvailableTournaments();
      res.json(tournaments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tournaments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const validatedData = insertTournamentSchema.parse(req.body);
      const tournament = await storage.createTournament(validatedData);
      res.json(tournament);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const tournament = await storage.getTournamentWithParticipants(req.params.id);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tournaments/:id/join", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const tournamentId = req.params.id;
      const tournament = await storage.getTournament(tournamentId);
      
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }

      if (tournament.status !== "open") {
        return res.status(400).json({ error: "Tournament is not open for registration" });
      }

      if ((tournament.currentParticipants || 0) >= tournament.maxParticipants) {
        return res.status(400).json({ error: "Tournament is full" });
      }

      // Check if user has enough balance for entry fee
      if (parseFloat(req.user.balance) < parseFloat(tournament.entryFee)) {
        return res.status(400).json({ error: "Insufficient balance for entry fee" });
      }

      // Deduct entry fee from user balance
      await storage.updateUserBalance(req.user.id, 
        (parseFloat(req.user.balance) - parseFloat(tournament.entryFee)).toString()
      );

      const participant = await storage.joinTournament(tournamentId, req.user.id);
      
      // Broadcast tournament update to all clients
      wss.clients.forEach((client: WebSocketClient) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'tournament_updated',
            data: { tournamentId },
          }));
        }
      });

      res.json(participant);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/tournaments/:id/participants", async (req, res) => {
    try {
      const participants = await storage.getTournamentParticipants(req.params.id);
      res.json(participants);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Wallet endpoints
  app.get("/api/user/balance", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const user = await storage.getUser(req.user.id);
      res.json({ balance: user?.balance || '0.00' });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching balance: " + error.message });
    }
  });

  app.get("/api/user/transactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const deposits = await storage.getDepositsByUser(req.user.id);
      const withdrawals = await storage.getWithdrawalsByUser(req.user.id);
      
      const transactions = [
        ...deposits.map(d => ({ ...d, type: 'deposit' })),
        ...withdrawals.map(w => ({ ...w, type: 'withdrawal' }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json({ transactions });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching transactions: " + error.message });
    }
  });

  app.post("/api/deposits", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { amount, type } = req.body;
      
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid deposit amount" });
      }

      const deposit = await storage.createDeposit({
        userId: req.user.id,
        amount: amount,
        method: type || 'solana_wallet',
        status: 'completed'
      });

      const user = await storage.getUser(req.user.id);
      const newBalance = (parseFloat(user?.balance || '0') + parseFloat(amount)).toString();
      await storage.updateUserBalance(req.user.id, newBalance);

      res.json({ deposit });
    } catch (error: any) {
      res.status(500).json({ message: "Error processing deposit: " + error.message });
    }
  });

  app.post("/api/withdrawals", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { amount, address } = req.body;
      
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid withdrawal amount" });
      }

      if (!address || !address.trim()) {
        return res.status(400).json({ message: "Invalid Solana address" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user || parseFloat(user.balance) < parseFloat(amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const withdrawal = await storage.createWithdrawal({
        userId: req.user.id,
        amount: amount,
        address: address,
        status: 'completed'
      });

      const newBalance = (parseFloat(user.balance) - parseFloat(amount)).toString();
      await storage.updateUserBalance(req.user.id, newBalance);

      res.json({ withdrawal });
    } catch (error: any) {
      res.status(500).json({ message: "Error processing withdrawal: " + error.message });
    }
  });

  // Leaderboard endpoints
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const topPlayers = await db.select({
        id: users.id,
        username: users.username,
        elo: users.elo,
        gamesPlayed: users.gamesPlayed,
        gamesWon: users.gamesWon
      })
      .from(users)
      .where(ne(users.username, ''))
      .orderBy(desc(users.elo))
      .limit(50);

      const playersWithStats = topPlayers.map(player => ({
        ...player,
        winRate: player.gamesPlayed > 0 ? Math.round((player.gamesWon / player.gamesPlayed) * 100) : 0
      }));

      const totalPlayersResult = await db.select({ count: sql<number>`count(*)` }).from(users).where(ne(users.username, ''));
      const totalGamesResult = await db.select({ count: sql<number>`count(*)` }).from(games);
      const totalPrizePoolResult = await db.select({ sum: sql<string>`sum(${games.betAmount})` }).from(games).where(eq(games.status, 'completed'));
      const activeTournamentsResult = await db.select({ count: sql<number>`count(*)` }).from(tournaments).where(eq(tournaments.status, 'active'));

      const recentWinners = await db.select({
        id: tournaments.id,
        username: users.username,
        tournamentName: tournaments.name,
        prizeAmount: tournaments.prizePool,
        completedAt: tournaments.updatedAt
      })
      .from(tournaments)
      .innerJoin(users, eq(tournaments.winnerId, users.id))
      .where(eq(tournaments.status, 'completed'))
      .orderBy(desc(tournaments.updatedAt))
      .limit(10);

      res.json({
        players: playersWithStats,
        stats: {
          totalPlayers: totalPlayersResult[0]?.count || 0,
          totalGames: totalGamesResult[0]?.count || 0,
          totalPrizePool: totalPrizePoolResult[0]?.sum || '0.00',
          activeTournaments: activeTournamentsResult[0]?.count || 0
        },
        recentWinners
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching leaderboard: " + error.message });
    }
  });

  app.get("/api/leaderboard/earnings", async (req, res) => {
    try {
      const topEarners = await db.select({
        id: users.id,
        username: users.username,
        totalWinnings: sql<number>`coalesce(sum(${games.betAmount} * 2), 0)`,
        winStreak: users.winStreak
      })
      .from(users)
      .leftJoin(games, and(eq(games.winnerId, users.id), eq(games.status, 'completed')))
      .where(ne(users.username, ''))
      .groupBy(users.id, users.username, users.winStreak)
      .orderBy(desc(sql`coalesce(sum(${games.betAmount} * 2), 0)`))
      .limit(50);

      res.json({ players: topEarners });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching top earners: " + error.message });
    }
  });

  return httpServer;
}
