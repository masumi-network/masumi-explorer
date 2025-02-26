import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { storage } from "../storage";
import { insertTransactionSchema, insertAgentSchema } from "@shared/schema";

interface BlockfrostConfig {
  projectId: string;
  network: "preprod" | "mainnet";
}

const PREPROD_CONFIG: BlockfrostConfig = {
  projectId: "preprodyAaq0Es1UnScwBp5vxdBH7ks2IbBaRro",
  network: "preprod"
};

export class BlockfrostService {
  private client: BlockFrostAPI;
  private readonly config: BlockfrostConfig;
  private readonly watchedAddress: string;
  private readonly policyId: string;

  constructor(network: "preprod" | "mainnet") {
    this.config = network === "preprod" ? PREPROD_CONFIG : null!;
    this.client = new BlockFrostAPI({
      projectId: this.config.projectId,
      network: this.config.network === "preprod" ? "preprod" : "mainnet",
    });
    this.watchedAddress = network === "preprod" 
      ? "addr_test1wzlwhustapq9ck0zdz8dahhwd350nzlpg785nz7hs0tqjtgdy4230"
      : "";
    this.policyId = network === "preprod"
      ? "0520e542b4704586b7899e8af207501fd1cfb4d12fc419ede7986de8"
      : "";
  }

  async fetchLatestTransactions(page = 1): Promise<void> {
    try {
      console.log(`Fetching transactions for ${this.config.network}, page ${page}`);
      const transactions = await this.client.addressesTransactions(this.watchedAddress, {
        page,
        count: 100,
        order: 'desc'
      });

      for (const tx of transactions) {
        try {
          // Check if transaction already exists
          const existing = await storage.getTransactionByHash(tx.tx_hash);
          if (!existing) {
            const transaction = insertTransactionSchema.parse({
              transactionId: tx.tx_hash,
              transactionType: 'blockchain_tx',
              network: this.config.network,
            });
            await storage.createTransaction(transaction);
            console.log(`Created new transaction: ${tx.tx_hash}`);
          }
        } catch (error) {
          console.error(`Error processing transaction ${tx.tx_hash}:`, error);
        }
      }

      // If we got a full page, check the next page
      if (transactions.length === 100) {
        await this.fetchLatestTransactions(page + 1);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }

  async fetchLatestAssets(page = 1): Promise<void> {
    try {
      console.log(`Fetching assets for policy ${this.policyId}, page ${page}`);
      const assets = await this.client.assetsPolicyById(this.policyId, {
        page,
        count: 100,
        order: 'desc'
      });

      for (const asset of assets) {
        try {
          // Create or update agent based on the asset
          const agentName = Buffer.from(asset.asset.slice(56), 'hex').toString('utf8');
          const agent = insertAgentSchema.parse({
            name: agentName,
            description: `Agent from policy ${this.policyId}`,
            creatorName: "Blockchain",
            metadata: {
              assetId: asset.asset,
              quantity: asset.quantity,
              capabilities: ["blockchain_interaction"]
            }
          });
          await storage.createAgent(agent);
          console.log(`Processed agent asset: ${agentName}`);
        } catch (error) {
          console.error(`Error processing asset ${asset.asset}:`, error);
        }
      }

      // If we got a full page, check the next page
      if (assets.length === 100) {
        await this.fetchLatestAssets(page + 1);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  }
}