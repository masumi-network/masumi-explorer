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
      return decoded.replace(/\0/g, '');
    } catch (error) {
      console.error(`Error decoding asset name: ${assetNameHex}`, error);
      return `Asset ${assetNameHex.slice(0, 8)}`;
    }
  }

  private async processAsset(asset: any) {
    try {
      console.log('\n[BlockfrostService] Processing asset:', {
        asset_id: asset.asset,
        quantity: asset.quantity
      });

      // Step 1: Get detailed asset information
      const assetInfo = await this.client.assetsById(asset.asset);
      console.log('[BlockfrostService] Asset details:', {
        initial_mint_tx_hash: assetInfo.initial_mint_tx_hash,
        onchain_metadata: assetInfo.onchain_metadata,
        metadata: assetInfo.metadata
      });

      // Step 2: Get mint transaction details
      if (!assetInfo.initial_mint_tx_hash) {
        console.error('[BlockfrostService] No mint transaction hash found for asset:', asset.asset);
        return null;
      }

      const txInfo = await this.client.txs(assetInfo.initial_mint_tx_hash);
      if (!txInfo.block_time) {
        console.error('[BlockfrostService] No block time found for transaction:', assetInfo.initial_mint_tx_hash);
        return null;
      }

      const mintDate = new Date(txInfo.block_time * 1000);
      console.log('[BlockfrostService] Mint transaction details:', {
        hash: txInfo.hash,
        block_time: txInfo.block_time,
        mint_date: mintDate.toISOString(),
        mint_date_obj: mintDate
      });

      // Step 3: Process asset name
      const assetNameHex = asset.asset.slice(this.policyId.length);
      const agentName = this.decodeAssetName(assetNameHex);

      // Step 4: Create agent object with explicit date handling
      const insertData = {
        name: Array.isArray(assetInfo.onchain_metadata?.name) 
          ? assetInfo.onchain_metadata.name[0] 
          : agentName,
        description: Array.isArray(assetInfo.onchain_metadata?.description) 
          ? assetInfo.onchain_metadata.description[0] 
          : (assetInfo.onchain_metadata?.description || `Asset ${asset.asset.slice(0, 8)}`),
        creatorName: Array.isArray(assetInfo.onchain_metadata?.author?.name)
          ? assetInfo.onchain_metadata.author.name[0]
          : "Blockchain",
        metadata: {
          assetId: asset.asset,
          quantity: asset.quantity,
          onchainMetadata: assetInfo.onchain_metadata || {},
          mintTransaction: assetInfo.initial_mint_tx_hash,
          capabilities: ["blockchain_interaction"],
          originalMintDate: mintDate.toISOString() // Store original mint date in metadata
        },
        createdAt: mintDate
      };

      console.log('[BlockfrostService] Insert data:', {
        name: insertData.name,
        createdAt: insertData.createdAt.toISOString(),
        metadata: insertData.metadata.originalMintDate
      });

      const agent = insertAgentSchema.parse(insertData);

      console.log('[BlockfrostService] Parsed agent:', {
        name: agent.name,
        createdAt: agent.createdAt.toISOString(),
        description: agent.description
      });

      return agent;
    } catch (error) {
      console.error(`[BlockfrostService] Error processing asset ${asset.asset}:`, error);
      console.error(error);
      return null;
    }
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
          const existing = await storage.getAgentByAssetId(asset.asset);
          if (!existing) {
            const agent = await this.processAsset(asset);
            if (agent) {
              await storage.createAgent(agent);
              console.log(`[BlockfrostService] Created new agent with name: ${agent.name} and date: ${agent.createdAt.toISOString()}`);
            }
          }
        } catch (error) {
          console.error(`[BlockfrostService] Error handling asset ${asset.asset}:`, error);
        }
      }

      if (assets.length === 100) {
        await this.fetchLatestAssets(page + 1);
      }
    } catch (error) {
      console.error('[BlockfrostService] Error fetching assets:', error);
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
              timestamp: new Date(tx.block_time * 1000).toISOString()
            });
            await storage.createTransaction(transaction);
            console.log(`[BlockfrostService] Created new transaction: ${tx.tx_hash}`);
          }
        } catch (error) {
          console.error(`[BlockfrostService] Error processing transaction ${tx.tx_hash}:`, error);
        }
      }

      if (transactions.length === 100) {
        await this.fetchLatestTransactions(page + 1);
      }
    } catch (error) {
      console.error('[BlockfrostService] Error fetching transactions:', error);
    }
  }
}