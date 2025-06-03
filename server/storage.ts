import { users, games, deposits, withdrawals, chatMessages, tournaments, tournamentParticipants, tournamentGames, type User, type InsertUser, type Game, type InsertGame, type Deposit, type InsertDeposit, type Withdrawal, type InsertWithdrawal, type ChatMessage, type InsertChatMessage, type Tournament, type InsertTournament, type TournamentParticipant, type InsertTournamentParticipant, type TournamentGame, type InsertTournamentGame } from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByPrivyId(privyId: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateUserBalance(id: number, amount: string): Promise<User>;
  
  // Game methods
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: string): Promise<Game | undefined>;
  getGameWithPlayers(id: string): Promise<any>;
  getAvailableGames(): Promise<any[]>;
  getGamesByUser(userId: number): Promise<Game[]>;
  updateGame(id: string, updates: Partial<Game>): Promise<Game>;
  joinGame(gameId: string, opponentId: number): Promise<Game>;
  
  // Deposit methods
  createDeposit(deposit: InsertDeposit): Promise<Deposit>;
  getDeposit(id: number): Promise<Deposit | undefined>;
  updateDeposit(id: number, updates: Partial<Deposit>): Promise<Deposit>;
  getDepositsByUser(userId: number): Promise<Deposit[]>;
  
  // Withdrawal methods
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getWithdrawal(id: number): Promise<Withdrawal | undefined>;
  updateWithdrawal(id: number, updates: Partial<Withdrawal>): Promise<Withdrawal>;
  getWithdrawalsByUser(userId: number): Promise<Withdrawal[]>;
  
  // Chat methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(gameId: string): Promise<any[]>;
  
  // Tournament methods
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  getTournament(id: string): Promise<Tournament | undefined>;
  getTournamentWithParticipants(id: string): Promise<any>;
  getAvailableTournaments(): Promise<any[]>;
  getTournamentsByUser(userId: number): Promise<Tournament[]>;
  updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament>;
  joinTournament(tournamentId: string, userId: number): Promise<TournamentParticipant>;
  
  // Tournament participant methods
  getTournamentParticipants(tournamentId: string): Promise<any[]>;
  updateTournamentParticipant(id: number, updates: Partial<TournamentParticipant>): Promise<TournamentParticipant>;
  
  // Tournament game methods
  createTournamentGame(tournamentGame: InsertTournamentGame): Promise<TournamentGame>;
  getTournamentGames(tournamentId: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByPrivyId(privyId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.privyId, privyId));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserBalance(id: number, amount: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        balance: amount,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Game methods
  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db
      .insert(games)
      .values(insertGame)
      .returning();
    return game;
  }

  async getGame(id: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async getGameWithPlayers(id: string): Promise<any> {
    const result = await db
      .select({
        game: games,
        creator: users,
        opponent: {
          id: users.id,
          username: users.username,
          elo: users.elo,
          profilePicture: users.profilePicture,
        },
      })
      .from(games)
      .leftJoin(users, eq(games.creatorId, users.id))
      .where(eq(games.id, id));
    
    return result[0] || undefined;
  }

  async getAvailableGames(): Promise<any[]> {
    const result = await db
      .select({
        game: games,
        creator: {
          id: users.id,
          username: users.username,
          elo: users.elo,
          profilePicture: users.profilePicture,
        },
      })
      .from(games)
      .leftJoin(users, eq(games.creatorId, users.id))
      .where(eq(games.status, "waiting"))
      .orderBy(desc(games.createdAt));
    
    return result;
  }

  async getGamesByUser(userId: number): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .where(or(eq(games.creatorId, userId), eq(games.opponentId, userId)))
      .orderBy(desc(games.createdAt));
  }

  async updateGame(id: string, updates: Partial<Game>): Promise<Game> {
    const [game] = await db
      .update(games)
      .set(updates)
      .where(eq(games.id, id))
      .returning();
    return game;
  }

  async joinGame(gameId: string, opponentId: number): Promise<Game> {
    const [game] = await db
      .update(games)
      .set({
        opponentId,
        status: "active",
        startedAt: new Date(),
      })
      .where(eq(games.id, gameId))
      .returning();
    return game;
  }

  // Deposit methods
  async createDeposit(insertDeposit: InsertDeposit): Promise<Deposit> {
    const [deposit] = await db
      .insert(deposits)
      .values(insertDeposit)
      .returning();
    return deposit;
  }

  async getDeposit(id: number): Promise<Deposit | undefined> {
    const [deposit] = await db.select().from(deposits).where(eq(deposits.id, id));
    return deposit || undefined;
  }

  async updateDeposit(id: number, updates: Partial<Deposit>): Promise<Deposit> {
    const [deposit] = await db
      .update(deposits)
      .set(updates)
      .where(eq(deposits.id, id))
      .returning();
    return deposit;
  }

  async getDepositsByUser(userId: number): Promise<Deposit[]> {
    return await db
      .select()
      .from(deposits)
      .where(eq(deposits.userId, userId))
      .orderBy(desc(deposits.createdAt));
  }

  // Withdrawal methods
  async createWithdrawal(insertWithdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const [withdrawal] = await db
      .insert(withdrawals)
      .values(insertWithdrawal)
      .returning();
    return withdrawal;
  }

  async getWithdrawal(id: number): Promise<Withdrawal | undefined> {
    const [withdrawal] = await db.select().from(withdrawals).where(eq(withdrawals.id, id));
    return withdrawal || undefined;
  }

  async updateWithdrawal(id: number, updates: Partial<Withdrawal>): Promise<Withdrawal> {
    const [withdrawal] = await db
      .update(withdrawals)
      .set(updates)
      .where(eq(withdrawals.id, id))
      .returning();
    return withdrawal;
  }

  async getWithdrawalsByUser(userId: number): Promise<Withdrawal[]> {
    return await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, userId))
      .orderBy(desc(withdrawals.createdAt));
  }

  // Chat methods
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getChatMessages(gameId: string): Promise<any[]> {
    const result = await db
      .select({
        message: chatMessages,
        user: {
          id: users.id,
          username: users.username,
          profilePicture: users.profilePicture,
        },
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.gameId, gameId))
      .orderBy(asc(chatMessages.createdAt));
    
    return result;
  }

  // Tournament methods
  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const [tournament] = await db
      .insert(tournaments)
      .values(insertTournament)
      .returning();
    return tournament;
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament || undefined;
  }

  async getTournamentWithParticipants(id: string): Promise<any> {
    const [tournamentData] = await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
        description: tournaments.description,
        entryFee: tournaments.entryFee,
        maxParticipants: tournaments.maxParticipants,
        currentParticipants: tournaments.currentParticipants,
        prizePool: tournaments.prizePool,
        timeControl: tournaments.timeControl,
        status: tournaments.status,
        winnerId: tournaments.winnerId,
        startTime: tournaments.startTime,
        endTime: tournaments.endTime,
        createdAt: tournaments.createdAt,
        winner: {
          id: users.id,
          username: users.username,
        },
      })
      .from(tournaments)
      .leftJoin(users, eq(tournaments.winnerId, users.id))
      .where(eq(tournaments.id, id));

    if (!tournamentData) return undefined;

    const participants = await this.getTournamentParticipants(id);
    
    return {
      ...tournamentData,
      participants,
    };
  }

  async getAvailableTournaments(): Promise<any[]> {
    const availableTournaments = await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
        description: tournaments.description,
        entryFee: tournaments.entryFee,
        maxParticipants: tournaments.maxParticipants,
        currentParticipants: tournaments.currentParticipants,
        prizePool: tournaments.prizePool,
        timeControl: tournaments.timeControl,
        status: tournaments.status,
        startTime: tournaments.startTime,
        createdAt: tournaments.createdAt,
      })
      .from(tournaments)
      .where(eq(tournaments.status, "open"))
      .orderBy(desc(tournaments.createdAt));
    
    return availableTournaments;
  }

  async getTournamentsByUser(userId: number): Promise<Tournament[]> {
    const userTournaments = await db
      .select()
      .from(tournaments)
      .innerJoin(tournamentParticipants, eq(tournaments.id, tournamentParticipants.tournamentId))
      .where(eq(tournamentParticipants.userId, userId))
      .orderBy(desc(tournaments.createdAt));
    
    return userTournaments.map(row => row.tournaments);
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament> {
    const [tournament] = await db
      .update(tournaments)
      .set(updates)
      .where(eq(tournaments.id, id))
      .returning();
    return tournament;
  }

  async joinTournament(tournamentId: string, userId: number): Promise<TournamentParticipant> {
    // First check if user is already in tournament
    const [existing] = await db
      .select()
      .from(tournamentParticipants)
      .where(and(
        eq(tournamentParticipants.tournamentId, tournamentId),
        eq(tournamentParticipants.userId, userId)
      ));

    if (existing) {
      throw new Error("User already joined this tournament");
    }

    // Join tournament
    const [participant] = await db
      .insert(tournamentParticipants)
      .values({ tournamentId, userId })
      .returning();

    // Update participant count and prize pool
    const tournament = await this.getTournament(tournamentId);
    if (tournament) {
      const newCount = (tournament.currentParticipants || 0) + 1;
      const newPrizePool = (parseFloat(tournament.prizePool || "0") + parseFloat(tournament.entryFee)).toString();
      
      await this.updateTournament(tournamentId, {
        currentParticipants: newCount,
        prizePool: newPrizePool,
      });
    }

    return participant;
  }

  // Tournament participant methods
  async getTournamentParticipants(tournamentId: string): Promise<any[]> {
    const participants = await db
      .select({
        id: tournamentParticipants.id,
        userId: tournamentParticipants.userId,
        joinedAt: tournamentParticipants.joinedAt,
        placement: tournamentParticipants.placement,
        eliminated: tournamentParticipants.eliminated,
        user: {
          id: users.id,
          username: users.username,
          elo: users.elo,
        },
      })
      .from(tournamentParticipants)
      .innerJoin(users, eq(tournamentParticipants.userId, users.id))
      .where(eq(tournamentParticipants.tournamentId, tournamentId))
      .orderBy(asc(tournamentParticipants.joinedAt));
    
    return participants;
  }

  async updateTournamentParticipant(id: number, updates: Partial<TournamentParticipant>): Promise<TournamentParticipant> {
    const [participant] = await db
      .update(tournamentParticipants)
      .set(updates)
      .where(eq(tournamentParticipants.id, id))
      .returning();
    return participant;
  }

  // Tournament game methods
  async createTournamentGame(insertTournamentGame: InsertTournamentGame): Promise<TournamentGame> {
    const [tournamentGame] = await db
      .insert(tournamentGames)
      .values(insertTournamentGame)
      .returning();
    return tournamentGame;
  }

  async getTournamentGames(tournamentId: string): Promise<any[]> {
    const tournamentGamesList = await db
      .select({
        id: tournamentGames.id,
        tournamentId: tournamentGames.tournamentId,
        gameId: tournamentGames.gameId,
        round: tournamentGames.round,
        createdAt: tournamentGames.createdAt,
        game: {
          id: games.id,
          creatorId: games.creatorId,
          opponentId: games.opponentId,
          winnerId: games.winnerId,
          status: games.status,
          betAmount: games.betAmount,
          timeControl: games.timeControl,
        },
      })
      .from(tournamentGames)
      .innerJoin(games, eq(tournamentGames.gameId, games.id))
      .where(eq(tournamentGames.tournamentId, tournamentId))
      .orderBy(asc(tournamentGames.round), asc(tournamentGames.createdAt));
    
    return tournamentGamesList;
  }
}

export const storage = new DatabaseStorage();
