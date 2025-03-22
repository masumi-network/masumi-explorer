import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema, insertTransactionSchema, insertNetworkConfigSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Network Config endpoints
  app.get("/api/network-configs", async (_req, res) => {
    try {
      const configs = await storage.listNetworkConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/network-configs/:name", async (req, res) => {
    try {
      const config = await storage.getNetworkConfig(req.params.name);
      if (!config) {
        res.status(404).json({ error: "Network config not found" });
        return;
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Agents endpoints
  app.post("/api/agents", async (req, res) => {
    try {
      const agent = insertAgentSchema.parse(req.body);
      const created = await storage.createAgent(agent);
      res.json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/agents", async (req, res) => {
    try {
      const network = req.query.network as string | undefined;
      const agents = await storage.listAgents(network);
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Transactions endpoints
  app.post("/api/transactions", async (req, res) => {
    try {
      const transaction = insertTransactionSchema.parse(req.body);
      const created = await storage.createTransaction(transaction);
      res.json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/transactions", async (req, res) => {
    try {
      const network = req.query.network as string | undefined;
      const transactions = await storage.listTransactions(network);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update the sample data creation route
  app.post("/api/sample-data", async (_req, res) => {
    try {
      // Create network configs
      const networkConfigs = [
        {
          name: "Preprod",
          smartContractAddress: "addr_test1wp7je4555s7cdqvlcgdnkj34rrpryy8wsst9yvz7e74p2ugy69qgn",
          policyId: "e6c57104dfa95943ffab95eafe1f12ed9a8da791678bfbf765b05649",
        },
        {
          name: "Mainnet",
          smartContractAddress: "addr1wy6r27mhqc754xelkw294dd20g4989r3r6ah23328w327gst5e23p",
          policyId: "05f6641139953b326b3f10c7df2bfa5bd6399e401e4256ccae0e8d0e",
        },
      ];

      // Create sample transactions
      const sampleTransactions = [
        {
          transactionId: "tx_preprod_001",
          transactionType: "blockchain_tx",
          network: "Preprod",
          timestamp: new Date('2025-02-25').toISOString()
        },
        {
          transactionId: "tx_preprod_002",
          transactionType: "blockchain_tx",
          network: "Preprod",
          timestamp: new Date('2025-02-26').toISOString()
        }
      ];

      // Create sample agents
      const sampleAgents = [
        {
          name: "Preprod Agent 1",
          description: "Test agent for preprod network",
          creatorName: "Test Creator",
          createdAt: new Date('2025-02-25'),
          metadata: {
            capabilities: ["blockchain_interaction"],
            network: "Preprod"
          }
        },
        {
          name: "Preprod Agent 2",
          description: "Another test agent for preprod network",
          creatorName: "Test Creator",
          createdAt: new Date('2025-02-26'),
          metadata: {
            capabilities: ["blockchain_interaction"],
            network: "Preprod"
          }
        }
      ];

      // Insert network configs
      for (const config of networkConfigs) {
        const existing = await storage.getNetworkConfig(config.name);
        if (!existing) {
          await storage.createNetworkConfig(config);
        }
      }

      // Insert sample transactions
      for (const transaction of sampleTransactions) {
        const existing = await storage.getTransactionByHash(transaction.transactionId);
        if (!existing) {
          await storage.createTransaction(transaction);
        }
      }

      // Insert sample agents
      for (const agent of sampleAgents) {
        await storage.createAgent(agent);
      }

      res.json({ message: "Sample data created successfully" });
    } catch (error) {
      console.error("Error creating sample data:", error);
      res.status(500).json({ error: "Failed to create sample data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}