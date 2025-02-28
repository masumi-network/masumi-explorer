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

  private decodeAssetName(assetNameHex: string): string {
    try {
      const decoded = Buffer.from(assetNameHex, 'hex').toString('utf8');
      // Remove any null characters that might cause database issues
      return decoded.replace(/\0/g, '');
    } catch (error) {
      console.error(`Error decoding asset name: ${assetNameHex}`, error);
      return `Asset ${assetNameHex.slice(0, 8)}`;
    }
  }

  async fetchLatestTransactions(page = 1): Promise<void> {
    try {
      console.log(`[BlockfrostService] Fetching transactions for ${this.config.network}, page ${page}`);
      const transactions = await this.client.addressesTransactions(this.watchedAddress, {
        page,
        count: 100,
        order: 'desc'
      });

      for (const tx of transactions) {
        try {
          const existing = await storage.getTransactionByHash(tx.tx_hash);
          if (!existing) {
            const transaction = insertTransactionSchema.parse({
              transactionId: tx.tx_hash,
              transactionType: 'blockchain_tx',
              network: this.config.network,
            });
            await storage.createTransaction(transaction);
            console.log(`[BlockfrostService] Created new transaction: ${tx.tx_hash}`);
          }
        } catch (error) {
          console.error(`[BlockfrostService] Error processing transaction ${tx.tx_hash}:`, error);
        }
      }

      // If we got a full page, check the next page
      if (transactions.length === 100) {
        await this.fetchLatestTransactions(page + 1);
      }
    } catch (error) {
      console.error('[BlockfrostService] Error fetching transactions:', error);
    }
  }

  private async getAssetMintDate(assetId: string): Promise<Date | undefined> {
    try {
      const assetInfo = await this.client.assetsById(assetId);
      if (assetInfo.initial_mint_tx_hash) {
        const txInfo = await this.client.txs(assetInfo.initial_mint_tx_hash);
        if (txInfo.block_time) {
          return new Date(txInfo.block_time * 1000); // Convert Unix timestamp to JavaScript Date
        }
      }
    } catch (error) {
      console.error(`[BlockfrostService] Error getting mint date for asset ${assetId}:`, error);
    }
    return undefined;
  }

  async fetchLatestAssets(page = 1): Promise<void> {
    try {
      console.log(`[BlockfrostService] Fetching assets for policy ${this.policyId}, page ${page}`);
      const assets = await this.client.assetsPolicyById(this.policyId, {
        page,
        count: 100,
        order: 'desc'
      });

      console.log(`[BlockfrostService] Found ${assets.length} assets`);

      for (const asset of assets) {
        try {
          // Check if agent already exists
          const existing = await storage.getAgentByAssetId(asset.asset);
          if (!existing) {
            // Get detailed asset information and mint date
            const assetInfo = await this.client.assetsById(asset.asset);
            const mintDate = await this.getAssetMintDate(asset.asset);
            console.log(`[BlockfrostService] Asset info for ${asset.asset}:`, assetInfo);

            // Get the asset name part (after the policy ID)
            const assetNameHex = asset.asset.slice(this.policyId.length);
            const agentName = this.decodeAssetName(assetNameHex);

            const agent = insertAgentSchema.parse({
              name: agentName,
              description: assetInfo.metadata?.description || `Asset ${asset.asset.slice(0, 8)}`,
              creatorName: assetInfo.metadata?.creator || "Blockchain",
              metadata: {
                assetId: asset.asset,
                quantity: asset.quantity,
                onchainMetadata: assetInfo.onchain_metadata || {},
                mintTransaction: assetInfo.initial_mint_tx_hash,
                capabilities: ["blockchain_interaction"]
              },
              createdAt: mintDate || new Date() // Use mint date if available, otherwise current date
            });

            console.log(`[BlockfrostService] Creating new agent:`, agent);
            await storage.createAgent(agent);
            console.log(`[BlockfrostService] Created new agent: ${agentName}`);
          }
        } catch (error) {
          console.error(`[BlockfrostService] Error processing asset ${asset.asset}:`, error);
          console.error(error);
        }
      }

      // If we got a full page, check the next page
      if (assets.length === 100) {
        await this.fetchLatestAssets(page + 1);
      }
    } catch (error) {
      console.error('[BlockfrostService] Error fetching assets:', error);
      console.error(error);
    }
  }
}