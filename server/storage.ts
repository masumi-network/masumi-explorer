import { users, agents, transactions, networkConfigs, type User, type InsertUser, type Agent, type InsertAgent, type Transaction, type InsertTransaction, type NetworkConfig, type InsertNetworkConfig } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Agent methods
  getAgent(id: number): Promise<Agent | undefined>;
  listAgents(): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;

  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  listTransactions(network?: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Network Config methods
  getNetworkConfig(name: string): Promise<NetworkConfig | undefined>;
  listNetworkConfigs(): Promise<NetworkConfig[]>;
  createNetworkConfig(config: InsertNetworkConfig): Promise<NetworkConfig>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Agent methods
  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async listAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db.insert(agents).values(insertAgent).returning();
    return agent;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async listTransactions(network?: string): Promise<Transaction[]> {
    if (network) {
      return await db.select().from(transactions).where(eq(transactions.network, network));
    }
    return await db.select().from(transactions);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  // Network Config methods
  async getNetworkConfig(name: string): Promise<NetworkConfig | undefined> {
    const [config] = await db.select().from(networkConfigs).where(eq(networkConfigs.name, name));
    return config;
  }

  async listNetworkConfigs(): Promise<NetworkConfig[]> {
    return await db.select().from(networkConfigs);
  }

  async createNetworkConfig(insertConfig: InsertNetworkConfig): Promise<NetworkConfig> {
    const [config] = await db.insert(networkConfigs).values(insertConfig).returning();
    return config;
  }
}

export const storage = new DatabaseStorage();