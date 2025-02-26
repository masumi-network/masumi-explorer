import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { storage } from "../storage";
import { insertTransactionSchema } from "@shared/schema";

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

  constructor(network: "preprod" | "mainnet") {
    this.config = network === "preprod" ? PREPROD_CONFIG : null!;
    this.client = new BlockFrostAPI({
      projectId: this.config.projectId,
      network: this.config.network === "preprod" ? "preprod" : "mainnet",
    });
    this.watchedAddress = network === "preprod" 
      ? "addr_test1wzlwhustapq9ck0zdz8dahhwd350nzlpg785nz7hs0tqjtgdy4230"
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
}