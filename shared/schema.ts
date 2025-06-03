import { pgTable, text, serial, integer, boolean, timestamp, decimal, uuid, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  privyId: text("privy_id").unique(),
  username: text("username").notNull().unique(),
  email: text("email"),
  profilePicture: text("profile_picture"),
  elo: integer("elo").default(1200),
  gamesPlayed: integer("games_played").default(0),
  gamesWon: integer("games_won").default(0),
  totalEarnings: decimal("total_earnings", { precision: 18, scale: 8 }).default("0"),
  balance: decimal("balance", { precision: 18, scale: 8 }).default("0"),
  walletAddress: text("wallet_address"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  chessComUsername: text("chess_com_username"),
  chessComElo: integer("chess_com_elo"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: integer("creator_id").references(() => users.id),
  opponentId: integer("opponent_id").references(() => users.id),
  betAmount: decimal("bet_amount", { precision: 18, scale: 8 }).notNull(),
  timeControl: text("time_control").notNull(), // "5+3", "10+0", etc.
  status: text("status").notNull().default("waiting"), // waiting, active, completed, cancelled
  winnerId: integer("winner_id").references(() => users.id),
  gameData: jsonb("game_data"), // Chess moves, board state, etc.
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deposits = pgTable("deposits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  currency: text("currency").notNull(), // "SOL", "USD"
  method: text("method").notNull(), // "wallet", "card"
  transactionHash: text("transaction_hash"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  walletAddress: text("wallet_address").notNull(),
  transactionHash: text("transaction_hash"),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  gameId: uuid("game_id").references(() => games.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tournaments = pgTable("tournaments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  entryFee: decimal("entry_fee", { precision: 18, scale: 8 }).notNull(),
  maxParticipants: integer("max_participants").notNull(),
  currentParticipants: integer("current_participants").default(0),
  prizePool: decimal("prize_pool", { precision: 18, scale: 8 }).default("0"),
  timeControl: text("time_control").notNull(),
  status: text("status").notNull().default("open"), // open, active, completed, cancelled
  winnerId: integer("winner_id").references(() => users.id),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tournamentParticipants = pgTable("tournament_participants", {
  id: serial("id").primaryKey(),
  tournamentId: uuid("tournament_id").references(() => tournaments.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  placement: integer("placement"), // Final ranking in tournament
  eliminated: boolean("eliminated").default(false),
});

export const tournamentGames = pgTable("tournament_games", {
  id: uuid("id").primaryKey().defaultRandom(),
  tournamentId: uuid("tournament_id").references(() => tournaments.id).notNull(),
  gameId: uuid("game_id").references(() => games.id).notNull(),
  round: integer("round").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdGames: many(games, { relationName: "creator" }),
  playedGames: many(games, { relationName: "opponent" }),
  wonGames: many(games, { relationName: "winner" }),
  deposits: many(deposits),
  withdrawals: many(withdrawals),
  chatMessages: many(chatMessages),
  tournamentParticipations: many(tournamentParticipants),
  wonTournaments: many(tournaments, { relationName: "winner" }),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  creator: one(users, {
    fields: [games.creatorId],
    references: [users.id],
    relationName: "creator",
  }),
  opponent: one(users, {
    fields: [games.opponentId],
    references: [users.id],
    relationName: "opponent",
  }),
  winner: one(users, {
    fields: [games.winnerId],
    references: [users.id],
    relationName: "winner",
  }),
  chatMessages: many(chatMessages),
  tournamentGames: many(tournamentGames),
}));

export const depositsRelations = relations(deposits, ({ one }) => ({
  user: one(users, {
    fields: [deposits.userId],
    references: [users.id],
  }),
}));

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  user: one(users, {
    fields: [withdrawals.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  game: one(games, {
    fields: [chatMessages.gameId],
    references: [games.id],
  }),
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const tournamentsRelations = relations(tournaments, ({ one, many }) => ({
  winner: one(users, {
    fields: [tournaments.winnerId],
    references: [users.id],
    relationName: "winner"
  }),
  participants: many(tournamentParticipants),
  games: many(tournamentGames),
}));

export const tournamentParticipantsRelations = relations(tournamentParticipants, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [tournamentParticipants.tournamentId],
    references: [tournaments.id],
  }),
  user: one(users, {
    fields: [tournamentParticipants.userId],
    references: [users.id],
  }),
}));

export const tournamentGamesRelations = relations(tournamentGames, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [tournamentGames.tournamentId],
    references: [tournaments.id],
  }),
  game: one(games, {
    fields: [tournamentGames.gameId],
    references: [games.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

export const insertDepositSchema = createInsertSchema(deposits).omit({
  id: true,
  createdAt: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  currentParticipants: true,
  prizePool: true,
});

export const insertTournamentParticipantSchema = createInsertSchema(tournamentParticipants).omit({
  id: true,
  joinedAt: true,
});

export const insertTournamentGameSchema = createInsertSchema(tournamentGames).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Deposit = typeof deposits.$inferSelect;
export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type TournamentParticipant = typeof tournamentParticipants.$inferSelect;
export type InsertTournamentParticipant = z.infer<typeof insertTournamentParticipantSchema>;
export type TournamentGame = typeof tournamentGames.$inferSelect;
export type InsertTournamentGame = z.infer<typeof insertTournamentGameSchema>;
