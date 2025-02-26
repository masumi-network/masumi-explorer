import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
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

  app.get("/api/transactions", async (_req, res) => {
    try {
      const transactions = await storage.listTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Add some sample data
  app.post("/api/sample-data", async (_req, res) => {
    try {
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

      // Create sample transactions
      const sampleTransactions = [
        {
          transactionId: "tx_001",
          transactionType: "API_CALL"
        },
        {
          transactionId: "tx_002",
          transactionType: "IMAGE_GENERATION"
        },
        {
          transactionId: "tx_003",
          transactionType: "COMPLETION"
        }
      ];

      for (const agent of sampleAgents) {
        await storage.createAgent(agent);
      }

      for (const transaction of sampleTransactions) {
        await storage.createTransaction(transaction);
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