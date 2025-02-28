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

  app.get("/api/agents", async (_req, res) => {
    try {
      const agents = await storage.listAgents();
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

  // Add some sample data
  app.post("/api/sample-data", async (_req, res) => {
    try {
      // Create network configs
      const networkConfigs = [
        {
          name: "Preprod",
          smartContractAddress: "addr_test1wzlwhustapq9ck0zdz8dahhwd350nzlpg785nz7hs0tqjtgdy4230",
          policyId: "0520e542b4704586b7899e8af207501fd1cfb4d12fc419ede7986de8",
        },
        {
          name: "Mainnet",
          smartContractAddress: "addr1qx9xn6sz8r2z6kmwx5k8zxuvc2jh03n6wej6f8d",
          policyId: "policy_mainnet_987654321",
        },
      ];

      // Create sample transactions
      const sampleTransactions = [
        {
          transactionId: "tx_preprod_001",
          transactionType: "API_CALL",
          network: "Preprod"
        },
        {
          transactionId: "tx_mainnet_001",
          transactionType: "ASSET_TRANSFER",
          network: "Mainnet"
        }
      ];

      // Create sample agents
      const sampleAgents = [
        {
          name: "GPT-4 Assistant",
          description: "Advanced language model for complex tasks",
          creatorName: "OpenAI",
          metadata: {
            capabilities: ["text generation", "code analysis", "problem solving"],
            version: "4.0",
            language: "en"
          }
        },
        {
          name: "Image Generator",
          description: "AI model for creating images from text descriptions",
          creatorName: "Midjourney",
          metadata: {
            capabilities: ["image generation", "style transfer"],
            version: "3.0",
            supported_formats: ["png", "jpg"]
          }
        }
      ];

      // Insert network configs if they don't exist
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

      //Insert sample agents
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